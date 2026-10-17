// @vitest-environment node
import { getPayload, handleEndpoints, type Payload, type SendEmailOptions } from 'payload'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import type { User } from '@/payload-types'
import { requirePasswordRecoveryEmail } from '@/hooks/requirePasswordRecoveryEmail'
import { PASSWORD_RECOVERY_UNAVAILABLE } from '@/lib/accountRecovery'
import { createTestMongoServer } from '../helpers/mongoMemoryServer'

vi.mock('next/cache', () => ({ revalidateTag: vi.fn(), revalidatePath: vi.fn() }))
let payload: Payload, stop: (() => Promise<void>) | undefined, admin: User
let sequence = 0
const password = 'Recovery-test-initial-password-123!'
const changedPassword = 'Recovery-test-client-password-456!'
const messages: SendEmailOptions[] = []
const dispatch = (route: string, body: object, headers: Record<string, string> = {}) =>
  handleEndpoints({
    config: payload.config,
    request: new Request(`http://localhost:3011/api/${route}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    }),
  })
const account = () =>
  payload.create({
    collection: 'users',
    user: admin,
    overrideAccess: false,
    data: {
      email: `recovery-${++sequence}@example.test`,
      password,
      role: 'siteManager',
      features: { reviews: true },
    },
  })
const requestReset = (email: string) => dispatch('users/forgot-password', { email })
const tokenFrom = (message: SendEmailOptions) => {
  const href = String(message.html).match(/href="([^"]+)"/)?.[1]
  if (!href) throw new Error('Missing captured test reset link')
  const url = new URL(href)
  expect(url.origin).toBe('http://localhost:3011')
  expect(url.pathname).toMatch(/^\/admin\/reset\/[a-f0-9]+$/)
  return url.pathname.split('/').at(-1)!
}
const reset = (token: string) =>
  dispatch('users/reset-password', { token, password: changedPassword })

describe('client account recovery through native Payload operations', () => {
  beforeAll(async () => {
    const mongo = await createTestMongoServer()
    stop = mongo.stop
    process.env.MONGODB_URI = mongo.uri
    process.env.PAYLOAD_SECRET = 'account-recovery-test-only-secret-32-characters'
    process.env.NEXT_PUBLIC_SERVER_URL = 'http://localhost:3011'
    process.env.EMAIL_PROVIDER = 'resend'
    process.env.RESEND_API_KEY = 'test-only-captured-email-key'
    process.env.RESEND_FROM_EMAIL = 'site@example.test'
    process.env.RESEND_OVERRIDE_TO_EMAIL = ''
    process.env.MEDIA_PROVIDER = 'localDisk'
    const { default: incoming } = await import('@/payload.config')
    const config = await incoming
    config.email = () => ({
      name: 'test-capture',
      defaultFromAddress: 'site@example.test',
      defaultFromName: 'Test site',
      sendEmail: async (message) => {
        messages.push(message)
      },
    })
    payload = await getPayload({ config })
    await Promise.all(Object.values(payload.db.collections).map((model) => model.init()))
    admin = await payload.create({
      collection: 'users',
      data: { role: 'admin', email: 'recovery-admin@example.test', password },
    })
  }, 120_000)
  afterAll(async () => {
    await payload?.destroy()
    await stop?.()
  }, 30_000)

  it('delivers a native reset link, preserves grants, revokes old sessions and consumes the token once', async () => {
    const user = await account()
    const login = await dispatch('users/login', { email: user.email, password })
    const cookie = login.headers
      .getSetCookie()
      .find((v) => v.startsWith('payload-token='))
      ?.split(';')[0]
    expect(cookie).toBeTruthy()
    const before = messages.length
    const requested = await requestReset(user.email)
    expect(requested.status).toBe(200)
    expect(messages).toHaveLength(before + 1)
    expect(messages.at(-1)?.to).toBe(user.email)
    const token = tokenFrom(messages.at(-1)!)
    expect(await requested.text()).not.toContain(token)
    const response = await reset(token)
    expect(response.status).toBe(200)
    const result = await response.json()
    expect(result.token).toBeUndefined()
    expect(result.user.role).toBe('siteManager')
    expect(result.user.features.reviews).toBe(true)
    expect((await reset(token)).status).toBe(403)
    const oldSession = await handleEndpoints({
      config: payload.config,
      request: new Request('http://localhost:3011/api/users/me', {
        headers: { Cookie: cookie!, 'Sec-Fetch-Site': 'same-origin' },
      }),
    })
    expect((await oldSession.json()).user).toBeNull()
    expect((await dispatch('users/login', { email: user.email, password })).status).toBe(401)
    expect(
      (await dispatch('users/login', { email: user.email, password: changedPassword })).status,
    ).toBe(200)
  })

  it('does not disclose unknown accounts or send them reset messages', async () => {
    const known = await account()
    const expectedResponse = await requestReset(known.email)
    const expectedBody = await expectedResponse.json()
    const before = messages.length
    const response = await requestReset('not-an-account@example.test')
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(expectedBody)
    expect(messages).toHaveLength(before)
  })

  it('retains native resend throttling and invalidates an older link on a later request', async () => {
    const user = await account()
    const before = messages.length
    expect((await requestReset(user.email)).status).toBe(200)
    const first = tokenFrom(messages.at(-1)!)
    expect((await requestReset(user.email)).status).toBe(200)
    expect(messages).toHaveLength(before + 1)
    await payload.db.updateOne({
      collection: 'users',
      id: user.id,
      data: { resetPasswordRequestedAt: new Date(Date.now() - 60_000).toISOString() },
    })
    expect((await requestReset(user.email)).status).toBe(200)
    const second = tokenFrom(messages.at(-1)!)
    expect(second).not.toBe(first)
    expect((await reset(first)).status).toBe(403)
    expect((await reset(second)).status).toBe(200)
  })

  it('rejects expired links and keeps the existing password usable', async () => {
    const user = await account()
    await requestReset(user.email)
    const token = tokenFrom(messages.at(-1)!)
    await payload.db.updateOne({
      collection: 'users',
      id: user.id,
      data: { resetPasswordExpiration: new Date(Date.now() - 60_000).toISOString() },
    })
    expect((await reset(token)).status).toBe(403)
    expect((await dispatch('users/login', { email: user.email, password })).status).toBe(200)
  })

  it('blocks disabled or redirected delivery before creating a token for known and unknown accounts', async () => {
    const user = await account()
    const hooks = payload.collections.users.config.hooks.beforeOperation
    const before = messages.length
    try {
      for (const email of [
        {
          provider: 'none' as const,
          apiKey: null,
          fromAddress: null,
          fromName: 'Test',
          overrideRecipientAddress: null,
        },
        {
          provider: 'resend' as const,
          apiKey: 'test',
          fromAddress: 'site@example.test',
          fromName: 'Test',
          overrideRecipientAddress: 'qa@example.test',
        },
      ]) {
        payload.collections.users.config.hooks.beforeOperation = [
          requirePasswordRecoveryEmail(email),
        ]
        for (const target of [user.email, 'missing@example.test']) {
          const response = await requestReset(target)
          expect(response.status).toBe(503)
          expect(await response.text()).toContain(PASSWORD_RECOVERY_UNAVAILABLE)
        }
      }
      const stored = await payload.db.findOne<User>({
        collection: 'users',
        where: { id: { equals: user.id } },
      })
      expect(stored?.resetPasswordToken).toBeFalsy()
      expect(stored?.resetPasswordRequestedAt).toBeFalsy()
      expect(messages).toHaveLength(before)
    } finally {
      payload.collections.users.config.hooks.beforeOperation = hooks
    }
  })

  it('allows Admin-assisted password recovery and a subsequent self-service password change without changing grants', async () => {
    const user = await account()
    const other = await account()
    await expect(
      payload.update({
        collection: 'users',
        id: user.id,
        user: other,
        overrideAccess: false,
        data: { password: changedPassword },
      }),
    ).rejects.toThrow()
    await payload.update({
      collection: 'users',
      id: user.id,
      user: admin,
      overrideAccess: false,
      data: { password: changedPassword },
    })
    expect(
      (await dispatch('users/login', { email: user.email, password: changedPassword })).status,
    ).toBe(200)
    await payload.update({
      collection: 'users',
      id: user.id,
      user,
      overrideAccess: false,
      data: { password: 'Recovery-test-client-final-password-789!' },
    })
    expect(
      (await dispatch('users/login', { email: user.email, password: changedPassword })).status,
    ).toBe(401)
    const signedIn = await dispatch('users/login', {
      email: user.email,
      password: 'Recovery-test-client-final-password-789!',
    })
    expect(signedIn.status).toBe(200)
    expect((await signedIn.json()).user.features.reviews).toBe(true)
  })
})
