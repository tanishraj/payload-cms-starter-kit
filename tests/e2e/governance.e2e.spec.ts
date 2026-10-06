import { expect, test, type Page } from '@playwright/test'

import {
  accessManager,
  cleanupGovernanceFixtures,
  governanceSecondAdmin,
  seedGovernanceBase,
  type GovernanceFixture,
} from '../helpers/governanceFixtures'
import { login } from '../helpers/login'

const reviewBody = 'A deterministic submitted Review awaiting moderation.'

async function chooseSelectOption({
  fieldID,
  label,
  page,
}: {
  fieldID: string
  label: string
  page: Page
}): Promise<void> {
  const field = page.locator(fieldID)
  await expect(field).toHaveCount(1)

  const combobox = field.getByRole('combobox')
  await expect(combobox).toHaveCount(1)
  await expect(combobox).toBeVisible()
  await expect(combobox).toBeEnabled()
  await combobox.focus()
  await combobox.click()

  const option = page.getByRole('option', { name: label, exact: true })
  await expect(option).toHaveCount(1)
  await expect(option).toBeVisible()
  await option.click()
  await expect(field.getByText(label, { exact: true })).toHaveCount(1)
  await expect(field.getByText(label, { exact: true })).toBeVisible()
}

async function fillNewUserCredentials(
  page: Page,
  account: { email: string; password: string },
): Promise<void> {
  const email = page.locator('#field-email')
  const password = page.locator('#field-password')
  const confirmPassword = page.locator('#field-confirm-password')

  await expect(email).toHaveCount(1)
  await expect(password).toHaveCount(1)
  await expect(confirmPassword).toHaveCount(1)
  await email.fill(account.email)
  await password.fill(account.password)
  await confirmPassword.fill(account.password)
}

async function expandContentGrants(page: Page): Promise<void> {
  const group = page.locator('.collapsible').filter({
    has: page.getByText(/^Content \(\d+\)$/),
  })
  await expect(group).toHaveCount(1)
  const pagesGrant = group.locator('input[name="features.pages"]')
  if (!(await pagesGrant.isVisible())) {
    await group.locator('button.collapsible__toggle').click()
  }
  await expect(pagesGrant).toBeVisible()
  await expect(pagesGrant).toBeEnabled()
}

async function saveNewUser(page: Page): Promise<Record<string, unknown>> {
  const createResponsePromise = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/api/users' && response.request().method() === 'POST',
  )
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  const createResponse = await createResponsePromise

  expect(createResponse.ok()).toBe(true)
  const response = (await createResponse.json()) as { doc: Record<string, unknown> }
  return response.doc
}

async function getPayloadAuthHeaders(
  page: Page,
): Promise<{ Cookie: string; Origin: string; Referer: string }> {
  const pageURL = new URL(page.url())
  const payloadCookies = (await page.context().cookies(pageURL.origin)).filter(
    (cookie) => cookie.name === 'payload-token',
  )

  if (payloadCookies.length !== 1) {
    throw new Error(`Expected exactly one payload-token cookie; found ${payloadCookies.length}.`)
  }

  const payloadCookie = payloadCookies[0]
  return {
    Cookie: `${payloadCookie.name}=${payloadCookie.value}`,
    Origin: pageURL.origin,
    Referer: pageURL.href,
  }
}

async function expectDeniedCollectionRoute(page: Page, path: string): Promise<void> {
  const response = await page.goto(path)

  expect(response?.status()).toBe(404)
  expect(new URL(page.url()).pathname).toBe(path)
  await expect(page.getByRole('heading', { name: 'Nothing found', exact: true })).toBeVisible()
}

test.describe('governance browser journeys', () => {
  let fixture: GovernanceFixture | undefined
  let reviewPublishedForCleanup = false

  test.beforeEach(async ({ context }, testInfo) => {
    testInfo.setTimeout(180_000)
    await context.route('https://www.gravatar.com/**', (route) => route.abort())
    reviewPublishedForCleanup = false
    fixture = await seedGovernanceBase()
  })

  test.afterEach(async ({ page }, testInfo) => {
    testInfo.setTimeout(180_000)
    try {
      if (fixture && reviewPublishedForCleanup) {
        const demotionResponse = await page.request.patch(
          `/api/reviews/${fixture.pendingReview.id}?depth=0`,
          {
            data: { _status: 'draft', moderationStatus: 'rejected' },
            headers: await getPayloadAuthHeaders(page),
          },
        )

        if (!demotionResponse.ok()) {
          throw new Error(
            `Could not demote the published governance Review for cleanup (status ${demotionResponse.status()}).`,
          )
        }
      }
    } finally {
      await cleanupGovernanceFixtures(fixture)
      fixture = undefined
      reviewPublishedForCleanup = false
    }
  })

  test('Admin grants and revokes a Site Manager feature', async ({ browser, page }) => {
    if (!fixture) throw new Error('Expected governance fixture.')
    const currentFixture = fixture

    await test.step('log in as the governance Admin', async () => {
      await login({ page, user: currentFixture.admin })
    })

    const createdAdmin = await test.step('create and read back a second Admin', async () => {
      await page.goto('/admin/collections/users/create')
      await fillNewUserCredentials(page, governanceSecondAdmin)

      const roleField = page.locator('#field-role')
      await expect(roleField).toHaveCount(1)
      const roleCombobox = roleField.getByRole('combobox')
      await expect(roleCombobox).toHaveCount(1)
      await roleCombobox.focus()
      await roleCombobox.click()
      const adminOption = page.getByRole('option', { name: 'Admin', exact: true })
      await expect(adminOption).toHaveCount(1)
      await expect(adminOption).toBeVisible()
      await adminOption.click()
      await expect(roleField.getByText('Admin', { exact: true })).toHaveCount(1)
      await expect(roleField.getByText('Admin', { exact: true })).toBeVisible()

      const admin = await saveNewUser(page)
      expect(admin.email).toBe(governanceSecondAdmin.email)
      expect(admin.role).toBe('admin')
      expect(admin.id).toBeDefined()
      await expect(page).toHaveURL(
        (url) => url.pathname === `/admin/collections/users/${String(admin.id)}`,
      )
      const readBack = await page.request.get(`/api/users/${String(admin.id)}?depth=0`, {
        headers: await getPayloadAuthHeaders(page),
      })
      expect(readBack.status()).toBe(200)
      expect(await readBack.json()).toMatchObject({
        email: governanceSecondAdmin.email,
        role: 'admin',
      })
      return admin
    })
    expect(createdAdmin.id).toBeDefined()

    const createdManager = await test.step('create a Pages Site Manager', async () => {
      await page.goto('/admin/collections/users/create')
      await fillNewUserCredentials(page, accessManager)
      await chooseSelectOption({ fieldID: '#field-role', label: 'Site Manager', page })
      await expandContentGrants(page)
      const pagesGrant = page.locator('input[name="features.pages"]')
      await expect(pagesGrant).toBeVisible()
      await pagesGrant.check()

      const manager = await saveNewUser(page)
      expect(manager).toMatchObject({
        email: accessManager.email,
        role: 'siteManager',
      })
      expect((manager.features as Record<string, unknown>).pages).toBe(true)
      expect(manager.id).toBeDefined()
      await expect(page).toHaveURL(
        (url) => url.pathname === `/admin/collections/users/${String(manager.id)}`,
      )
      return manager
    })

    const managerContext = await browser.newContext()
    try {
      await managerContext.route('https://www.gravatar.com/**', (route) => route.abort())
      const managerPage = await managerContext.newPage()
      await test.step('verify initial Pages-only access', async () => {
        await login({ page: managerPage, user: accessManager })

        await expect(managerPage.getByRole('link', { name: 'Pages', exact: true })).toBeVisible()
        await expect(managerPage.getByRole('link', { name: 'Articles', exact: true })).toHaveCount(
          0,
        )
        await expectDeniedCollectionRoute(managerPage, '/admin/collections/articles')
        expect(
          (
            await managerPage.request.get('/api/articles?limit=1', {
              headers: await getPayloadAuthHeaders(managerPage),
            })
          ).status(),
        ).toBe(403)
      })

      await test.step('replace the Pages grant with Reviews', async () => {
        await page.goto(`/admin/collections/users/${String(createdManager.id)}`)
        await expandContentGrants(page)
        const currentPagesGrant = page.locator('input[name="features.pages"]')
        const reviewsGrant = page.locator('input[name="features.reviews"]')
        await expect(currentPagesGrant).toBeChecked()
        await currentPagesGrant.uncheck()
        await reviewsGrant.check()

        const updateResponsePromise = page.waitForResponse(
          (response) =>
            new URL(response.url()).pathname === `/api/users/${String(createdManager.id)}` &&
            response.request().method() === 'PATCH',
        )
        await page.getByRole('button', { name: 'Save', exact: true }).click()
        const updateResponse = await updateResponsePromise
        expect(updateResponse.ok()).toBe(true)
        const updatedManager = ((await updateResponse.json()) as { doc: Record<string, unknown> })
          .doc
        expect(updatedManager).toMatchObject({ email: accessManager.email, role: 'siteManager' })
        expect(updatedManager.features).toMatchObject({ pages: false, reviews: true })
      })

      await test.step('verify session invalidation and Reviews-only access', async () => {
        await managerPage.goto('/admin')
        await managerPage.waitForURL((url) => url.pathname === '/admin/login')
        await login({ page: managerPage, user: accessManager })

        await expect(managerPage.getByRole('link', { name: 'Reviews', exact: true })).toBeVisible()
        await expect(managerPage.getByRole('link', { name: 'Pages', exact: true })).toHaveCount(0)
        await expectDeniedCollectionRoute(managerPage, '/admin/collections/pages')
        expect(
          (
            await managerPage.request.get('/api/pages?limit=1', {
              headers: await getPayloadAuthHeaders(managerPage),
            })
          ).status(),
        ).toBe(403)
        const reviewQuery = new URLSearchParams({
          depth: '0',
          draft: 'true',
          limit: '1',
          'where[slug][equals]': currentFixture.pendingReview.slug,
        })
        const reviewsResponse = await managerPage.request.get(`/api/reviews?${reviewQuery}`, {
          headers: await getPayloadAuthHeaders(managerPage),
        })
        expect(reviewsResponse.status()).toBe(200)
        const reviewsPayload = (await reviewsResponse.json()) as {
          docs: Array<Record<string, unknown>>
          totalDocs: number
        }
        expect(Array.isArray(reviewsPayload.docs)).toBe(true)
        expect(reviewsPayload).toMatchObject({
          docs: [
            {
              _status: 'draft',
              id: currentFixture.pendingReview.id,
              moderationStatus: 'pending',
              slug: currentFixture.pendingReview.slug,
              title: currentFixture.pendingReview.title,
            },
          ],
          totalDocs: 1,
        })
      })
    } finally {
      await managerContext.close()
    }
  })

  test('Reviews Site Manager approves a submitted Review', async ({ browser, page }) => {
    if (!fixture) throw new Error('Expected governance fixture.')
    const currentFixture = fixture

    await test.step('verify the Review is unavailable anonymously', async () => {
      const unpublishedResponse = await page.goto(`/reviews/${currentFixture.pendingReview.slug}`)
      expect(unpublishedResponse?.status()).toBe(404)
    })

    await test.step('log in and open the pending Review', async () => {
      await login({ page, user: currentFixture.reviewManager })
      await expect(page.getByRole('link', { name: 'Reviews', exact: true })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Users', exact: true })).toHaveCount(0)

      await page.goto(`/admin/collections/reviews/${currentFixture.pendingReview.id}`)
    })

    const moderationField = page.locator('#field-moderationStatus')
    const publishButton = page.getByRole('button', { name: 'Publish changes', exact: true })

    await test.step('verify the moderation controls are ready', async () => {
      await expect(moderationField).toHaveCount(1)
      const moderationCombobox = moderationField.getByRole('combobox')
      await expect(moderationCombobox).toHaveCount(1)
      await expect(moderationCombobox).toBeVisible()
      await expect(moderationCombobox).toBeEnabled()
      await expect(publishButton).toHaveCount(1)
      await expect(publishButton).toBeVisible()
      await expect(publishButton).toBeEnabled()
    })

    await test.step('select Approved moderation status', async () => {
      await chooseSelectOption({ fieldID: '#field-moderationStatus', label: 'Approved', page })
      await expect(moderationField.getByText('Approved', { exact: true })).toBeVisible()
    })

    const saveResponse = await test.step('submit the approval PATCH', async () => {
      const saveResponsePromise = page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname === `/api/reviews/${currentFixture.pendingReview.id}` &&
          response.request().method() === 'PATCH',
      )
      await publishButton.click()
      return saveResponsePromise
    })

    await test.step('verify the Review is published after save', async () => {
      expect(saveResponse.ok()).toBe(true)
      reviewPublishedForCleanup = true
      expect(((await saveResponse.json()) as { doc: Record<string, unknown> }).doc).toMatchObject({
        _status: 'published',
        moderationStatus: 'approved',
      })

      const publishedStatus = page.getByRole('main').getByText('Published', { exact: true })
      await expect(publishedStatus).toHaveCount(1)
      await expect(publishedStatus).toBeVisible()
    })

    await test.step('read back the persisted approval', async () => {
      const readBack = await page.request.get(
        `/api/reviews/${currentFixture.pendingReview.id}?depth=0`,
        { headers: await getPayloadAuthHeaders(page) },
      )
      expect(readBack.status()).toBe(200)
      expect(await readBack.json()).toMatchObject({
        _status: 'published',
        moderationStatus: 'approved',
      })
    })

    await test.step('verify the published Review is available anonymously', async () => {
      const anonymousContext = await browser.newContext()
      try {
        const anonymousPage = await anonymousContext.newPage()
        const publishedResponse = await anonymousPage.goto(
          `/reviews/${currentFixture.pendingReview.slug}`,
        )

        expect(publishedResponse?.status()).toBe(200)
        await expect(
          anonymousPage.getByRole('heading', { name: currentFixture.pendingReview.title }),
        ).toBeVisible()
        await expect(anonymousPage.getByText(reviewBody, { exact: true })).toBeVisible()
      } finally {
        await anonymousContext.close()
      }
    })
  })
})
