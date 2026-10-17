import { expect, test } from '@playwright/test'
import {
  cleanupGovernanceFixtures,
  seedGovernanceBase,
  type GovernanceFixture,
} from '../helpers/governanceBrowserFixtures'

test.describe.configure({ timeout: 90_000 })

let fixture: GovernanceFixture | undefined
test.beforeAll(async () => {
  fixture = await seedGovernanceBase()
})
test.afterAll(async () => {
  await cleanupGovernanceFixtures(fixture)
})

const email = 'reader@example.test'
const errorMessage = 'Password reset could not be requested. Try again or ask your website Admin.'
const endpoint = '**/api/users/forgot-password'

test('a rejected request preserves the email and retry action instead of claiming email was sent', async ({
  page,
}) => {
  let attempts = 0
  await page.route(endpoint, async (route) => {
    expect(route.request().method()).toBe('POST')
    const body = await new Request(route.request().url(), {
      method: 'POST',
      headers: route.request().headers(),
      body: route.request().postData(),
    }).formData()
    expect(JSON.parse(String(body.get('_payload')))).toMatchObject({ email })
    attempts++
    await route.fulfill(
      attempts === 1
        ? {
            status: 503,
            contentType: 'application/json',
            body: JSON.stringify({ errors: [{ message: errorMessage }] }),
          }
        : {
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Success' }),
          },
    )
  })
  await page.goto('/admin/forgot')
  await page.locator('#field-email').fill(email)
  await page.getByRole('button', { name: 'Submit', exact: true }).click()
  await expect(page.getByText(errorMessage, { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Email Sent', exact: true })).toHaveCount(0)
  await expect(page.locator('#field-email')).toHaveValue(email)
  await expect(page.getByRole('button', { name: 'Submit', exact: true })).toBeEnabled()
  expect(
    await page.evaluate(() => sessionStorage.getItem('payload-forgot-password:users')),
  ).toBeNull()
  await page.getByRole('button', { name: 'Submit', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Email Sent', exact: true })).toBeVisible()
  await expect(page.getByText(/If the email address is associated with an account/)).toBeVisible()
  expect(attempts).toBe(2)
})

for (const status of [502, 200]) {
  test(`an unreadable ${status} response shows a generic error and keeps the form usable`, async ({
    page,
  }) => {
    await page.route(endpoint, (route) =>
      route.fulfill({
        status,
        contentType: 'text/html',
        body: '<h1>Gateway unavailable: private diagnostic</h1>',
      }),
    )
    await page.goto('/admin/forgot')
    await page.locator('#field-email').fill(email)
    await page.getByRole('button', { name: 'Submit', exact: true }).click()
    await expect(
      page.getByText(status === 502 ? 'Bad Gateway' : 'An unknown error has occurred.', {
        exact: true,
      }),
    ).toBeVisible()
    await expect(page.locator('body')).not.toContainText('private diagnostic')
    await expect(page.getByRole('heading', { name: 'Email Sent', exact: true })).toHaveCount(0)
    await expect(page.locator('#field-email')).toHaveValue(email)
    await expect(page.getByRole('button', { name: 'Submit', exact: true })).toBeEnabled()
  })
}

test('a failed resend does not renew the prior successful request cooldown', async ({ page }) => {
  await page.clock.install()
  let attempts = 0
  await page.route(endpoint, async (route) => {
    attempts++
    await route.fulfill(
      attempts === 1
        ? {
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Success' }),
          }
        : {
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ errors: [{ message: errorMessage }] }),
          },
    )
  })
  await page.goto('/admin/forgot')
  await page.locator('#field-email').fill(email)
  await page.getByRole('button', { name: 'Submit', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Email Sent', exact: true })).toBeVisible()
  const stored = await page.evaluate(() => sessionStorage.getItem('payload-forgot-password:users'))
  expect(stored).not.toBeNull()
  await page.clock.fastForward(16_000)
  const resend = page.getByRole('button', { name: 'Resend', exact: true })
  await expect(resend).toBeEnabled()
  await resend.click()
  await expect(page.getByText(errorMessage, { exact: true })).toBeVisible()
  await expect(resend).toBeEnabled()
  expect(await page.evaluate(() => sessionStorage.getItem('payload-forgot-password:users'))).toBe(
    stored,
  )
  expect(attempts).toBe(2)
})
