import axe from 'axe-core'
import { writeFile } from 'node:fs/promises'
import { expect, test, request as standaloneRequest, type Page } from '@playwright/test'

import {
  accessManager,
  cleanupGovernanceFixtures,
  governanceSecondAdmin,
  seedGovernanceBase,
  type GovernanceFixture,
} from '../helpers/governanceBrowserFixtures'
import { login } from '../helpers/login'

async function checkPageGuideAccessibility(page: Page, name: string) {
  await page.mouse.move(0, 0)
  await page.locator('.admin-onboarding').evaluate(async (element) => {
    await Promise.all(
      element
        .getAnimations({ subtree: true })
        .map((animation) => animation.finished.catch(() => {})),
    )
  })
  await page.addScriptTag({ content: axe.source })
  const result = await page.evaluate(async () => {
    if (!('axe' in window)) throw new Error('Accessibility engine did not load.')
    const engine = window.axe as typeof import('axe-core')
    const results = await engine.run('.admin-onboarding', {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    })
    return {
      geometry: Array.from(
        document.querySelectorAll('.admin-onboarding a, .admin-onboarding button'),
      ).map((element) => {
        const box = element.getBoundingClientRect()
        const style = getComputedStyle(element)
        return {
          tag: element.tagName,
          box: { x: box.x, y: box.y, width: box.width, height: box.height },
          background: style.backgroundColor,
          color: style.color,
          opacity: style.opacity,
          stack: document
            .elementsFromPoint(box.x + box.width / 2, box.y + box.height / 2)
            .slice(0, 6)
            .map((node) => ({ tag: node.tagName, class: node.getAttribute('class') })),
        }
      }),
      violations: results.violations.map(({ id, nodes }) => ({
        id,
        targets: nodes.map(({ target }) => target),
      })),
      incomplete: results.incomplete.map(({ id, nodes }) => ({
        id,
        nodes: nodes.map(({ target, any, all, none }) => ({
          target,
          checks: [...any, ...all, ...none].map(({ id, message, data }) => ({ id, message, data })),
        })),
      })),
    }
  })
  const reportPath = test.info().outputPath(name)
  await writeFile(reportPath, JSON.stringify(result, null, 2))
  await test.info().attach(name, { path: reportPath, contentType: 'application/json' })
  expect(result.violations).toEqual([])
  expect(result.incomplete).toEqual([])
}

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
  const toggle = group.locator('button.collapsible__toggle')
  if ((await toggle.getAttribute('class'))?.includes('collapsible__toggle--collapsed')) {
    await toggle.click()
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

  test('password help explains Admin-assisted recovery when outgoing email is unavailable', async ({
    page,
  }) => {
    await page.goto('/admin/forgot')
    await expect(page).toHaveURL(/\/admin\/login$/)
    const message =
      'Email password recovery is unavailable. Ask the website Admin who created your account for help.'
    await expect(page.getByText(message, { exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Forgot password?' })).toHaveCount(0)
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Log in', exact: true })).toBeVisible()
    for (const email of [fixture!.admin.email, 'not-an-account@example.test']) {
      const response = await page.request.post('/api/users/forgot-password', { data: { email } })
      expect(response.status()).toBe(503)
      expect(await response.text()).toContain(message)
    }
    for (const [width, colorScheme] of [
      [1280, 'light'],
      [390, 'dark'],
    ] as const) {
      await page.setViewportSize({ width, height: 844 })
      await page.emulateMedia({ colorScheme })
      await page
        .context()
        .addCookies([
          { name: 'payload-theme', value: colorScheme, url: new URL(page.url()).origin },
        ])
      await page.reload()
      await expect(page.locator('html')).toHaveAttribute('data-theme', colorScheme)
      await expect(page.getByText(message, { exact: true })).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
      await page.screenshot({
        path: test.info().outputPath(`account-help-${width}-${colorScheme}.png`),
        fullPage: true,
      })
    }
  })

  test('Admin grants and revokes a Site Manager feature', async ({ browser, page }) => {
    if (!fixture) throw new Error('Expected governance fixture.')
    const currentFixture = fixture

    await test.step('log in as the governance Admin', async () => {
      await login({ page, user: currentFixture.admin })
    })

    const teamGuide = page.getByRole('region', { name: 'Team setup', exact: true })
    const createdAdmin = await test.step('create and read back a second Admin', async () => {
      await page.goto('/admin/collections/users/create')
      await fillNewUserCredentials(page, governanceSecondAdmin)
      await expect(
        teamGuide.getByRole('heading', { name: 'Choose what this Site Manager can manage' }),
      ).toBeVisible()

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
      await expect(
        teamGuide.getByRole('heading', { name: 'Admin gives full access to the website' }),
      ).toBeVisible()
      await expect(teamGuide).toContainText('do not limit an Admin')

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

    const sectionPages: Array<{ id: string; title: string }> = []
    for (const title of ['Governance assigned section', 'Governance other section']) {
      const response = await page.request.post('/api/pages', {
        headers: await getPayloadAuthHeaders(page),
        data: { title, layout: [], _status: 'draft' },
      })
      expect(response.status()).toBe(201)
      const sectionPage = (await response.json()).doc
      currentFixture.pageIDs.push(sectionPage.id)
      sectionPages.push(sectionPage)
    }

    const createdManager = await test.step('create a Pages Site Manager', async () => {
      await page.goto('/admin/collections/users/create')
      await fillNewUserCredentials(page, accessManager)
      await chooseSelectOption({ fieldID: '#field-role', label: 'Site Manager', page })
      await expandContentGrants(page)
      const pagesGrant = page.locator('input[name="features.pages"]')
      await expect(pagesGrant).toBeVisible()
      await pagesGrant.check()
      await expect(
        teamGuide.getByRole('heading', { name: 'Assign website sections for scoped work' }),
      ).toBeVisible()
      await teamGuide.getByRole('link', { name: 'Choose website sections' }).click()
      await page.locator('#field-sectionRoots').getByRole('combobox').click()
      await page.getByRole('option', { name: sectionPages[0].title, exact: true }).click()
      await expect(teamGuide).toContainText(
        'Pages across 1 selected section, including descendants',
      )
      await expect(teamGuide).toContainText('not confirmed until Save succeeds')

      const manager = await saveNewUser(page)
      expect(manager).toMatchObject({
        email: accessManager.email,
        role: 'siteManager',
      })
      expect((manager.features as Record<string, unknown>).pages).toBe(true)
      expect(manager.sectionRoots).toEqual([sectionPages[0].id])
      expect(manager.id).toBeDefined()
      await expect(page).toHaveURL(
        (url) => url.pathname === `/admin/collections/users/${String(manager.id)}`,
      )
      return manager
    })

    await expect(
      teamGuide.getByRole('heading', { name: 'Review this account’s access selections' }),
    ).toBeVisible()
    await teamGuide.scrollIntoViewIfNeeded()
    await checkPageGuideAccessibility(page, 'team-setup-light-a11y.json')
    await page.screenshot({ path: test.info().outputPath('team-setup-desktop.png') })
    await page.setViewportSize({ width: 390, height: 844 })
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'))
    await checkPageGuideAccessibility(page, 'team-setup-dark-a11y.json')
    await page.screenshot({ path: test.info().outputPath('team-setup-mobile.png') })
    await teamGuide.getByRole('button', { name: 'Hide guide' }).click()
    await expect(teamGuide.getByRole('button', { name: 'Team setup', exact: true })).toBeFocused()
    await page.reload({ waitUntil: 'domcontentloaded' })
    await teamGuide.getByRole('button', { name: 'Team setup', exact: true }).click()
    await expect(teamGuide.getByRole('button', { name: 'Hide guide' })).toBeFocused()
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'))

    const managerContext = await browser.newContext()
    try {
      await managerContext.route('https://www.gravatar.com/**', (route) => route.abort())
      const managerPage = await managerContext.newPage()
      await test.step('verify initial Pages-only access', async () => {
        await login({ page: managerPage, user: accessManager })
        await expect(
          managerPage.getByRole('region', { name: 'Team setup', exact: true }),
        ).toHaveCount(0)

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

      await test.step('create a Page within the assigned section and deny the other section', async () => {
        await managerPage.goto('/admin', { waitUntil: 'domcontentloaded' })
        await managerPage.getByRole('link', { name: '+ New Page', exact: true }).click()
        await managerPage
          .getByRole('link', { name: 'Use the native Page editor', exact: true })
          .click()
        await expect(managerPage.locator('form[data-form-ready="true"]')).toBeVisible()
        await managerPage.locator('#field-title').fill('Manager-created scoped Page')
        await managerPage.locator('#field-parent').getByRole('combobox').click()
        await expect(
          managerPage.getByRole('option', { name: sectionPages[1].title, exact: true }),
        ).toHaveCount(0)
        await managerPage.getByRole('option', { name: sectionPages[0].title, exact: true }).click()
        await expect(
          managerPage.getByRole('region', { name: 'Getting started', exact: true }),
        ).toContainText('Parent in an assigned section')
        const createResponsePromise = managerPage.waitForResponse(
          (response) =>
            new URL(response.url()).pathname === '/api/pages' &&
            response.request().method() === 'POST' &&
            response.request().headers()['content-type']?.startsWith('multipart/form-data'),
        )
        await managerPage.getByRole('button', { name: 'Save Draft', exact: true }).click()
        const createResponse = await createResponsePromise
        const created = await createResponse.json()
        expect(createResponse.status(), JSON.stringify(created)).toBe(201)
        const currentID = created.doc.id as string
        // Register the saved record before navigation assertions, so a cold route or
        // later failure cannot leave an orphan that collides with the next attempt.
        currentFixture.pageIDs.push(currentID)
        sectionPages.push({ id: currentID, title: created.doc.title })
        expect(created.doc).toMatchObject({
          title: 'Manager-created scoped Page',
          slug: 'manager-created-scoped-page',
          parent: sectionPages[0].id,
          _status: 'draft',
        })
        const editPath = `/admin/collections/pages/${currentID}`
        await managerPage.waitForURL((url) => url.pathname === editPath, {
          waitUntil: 'domcontentloaded',
        })
        await expect(managerPage).toHaveURL((url) => url.pathname === editPath)
        await expect(managerPage.locator('#field-title')).toHaveValue(created.doc.title)
        const headers = await getPayloadAuthHeaders(managerPage)
        const saved = await managerPage.request.get(`/api/pages/${currentID}?depth=0&draft=true`, {
          headers,
        })
        expect(saved.status()).toBe(200)
        const record = await saved.json()
        expect(record.parent).toBe(sectionPages[0].id)
        expect(
          (
            await managerPage.request.get(`/api/pages/${sectionPages[1].id}?draft=true`, {
              headers,
            })
          ).status(),
        ).not.toBe(200)
        expect(
          (
            await managerPage.request.patch(`/api/pages/${currentID}`, {
              headers,
              data: { parent: sectionPages[1].id },
            })
          ).status(),
        ).not.toBe(200)
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

  test('optional onboarding resumes permitted work and recovers from removed assignments', async ({
    browser,
    page,
  }) => {
    if (!fixture) throw new Error('Expected governance fixture.')
    const currentFixture = fixture
    await login({ page, user: currentFixture.admin })

    await test.step('hide and reopen optional guidance with confirmed account persistence', async () => {
      const guide = page.getByRole('region', { name: 'Getting started', exact: true })
      const hide = guide.getByRole('button', { name: 'Hide guide', exact: true })
      await expect(hide).toBeVisible()
      await page.screenshot({ path: test.info().outputPath('onboarding-admin-desktop.png') })
      await expect(hide).toBeEnabled()
      await hide.focus()
      await page.keyboard.press('Enter')
      await expect(
        guide.getByRole('button', { name: 'Getting started', exact: true }),
      ).toBeFocused()
      await page.reload({ waitUntil: 'domcontentloaded' })
      await expect(
        guide.getByRole('button', { name: 'Getting started', exact: true }),
      ).toBeVisible()
      await expect(guide.getByRole('button', { name: 'Hide guide' })).toHaveCount(0)
      await expect(
        guide.getByRole('button', { name: 'Getting started', exact: true }),
      ).toBeEnabled()
      await guide.getByRole('button', { name: 'Getting started', exact: true }).focus()
      await page.keyboard.press('Enter')
      await expect(guide.getByRole('button', { name: 'Hide guide', exact: true })).toBeFocused()
      await page.reload({ waitUntil: 'domcontentloaded' })
      await expect(guide.getByRole('button', { name: 'Hide guide', exact: true })).toBeVisible()
    })

    const sectionPages: Array<{ id: string; title: string }> = []
    for (const title of ['Onboarding assigned section', 'Onboarding other section']) {
      const response = await page.request.post('/api/pages', {
        headers: await getPayloadAuthHeaders(page),
        data: { title, layout: [], _status: 'draft' },
      })
      const result = await response.json()
      expect(response.status(), JSON.stringify(result)).toBe(201)
      currentFixture.pageIDs.push(result.doc.id)
      sectionPages.push(result.doc)
    }
    const managerResponse = await page.request.post('/api/users', {
      headers: await getPayloadAuthHeaders(page),
      data: { ...accessManager, features: { pages: true }, sectionRoots: [sectionPages[0].id] },
    })
    expect(managerResponse.status()).toBe(201)
    const createdManager = (await managerResponse.json()).doc
    const managerContext = await browser.newContext()
    try {
      await managerContext.route('https://www.gravatar.com/**', (route) => route.abort())
      const managerPage = await managerContext.newPage()
      await login({ page: managerPage, user: accessManager })
      const guide = managerPage.getByRole('region', { name: 'Getting started', exact: true })
      await expect(guide).toContainText(sectionPages[0].title)
      await expect(guide).not.toContainText(sectionPages[1].title)
      // The Admin created a draft section root. Resume it through the real guide.
      await guide.getByRole('link', { name: 'Continue draft', exact: true }).click()
      await expect(managerPage.locator('#field-title')).toHaveValue(sectionPages[0].title)
      await managerPage.goto('/admin', { waitUntil: 'domcontentloaded' })
      await managerPage.setViewportSize({ width: 390, height: 844 })
      await managerPage.screenshot({
        path: test.info().outputPath('onboarding-manager-mobile.png'),
        fullPage: true,
      })
      await managerPage.setViewportSize({ width: 1280, height: 720 })
      await test.step('explain missing section access without a dead Page action', async () => {
        const response = await page.request.patch(`/api/users/${createdManager.id}`, {
          headers: await getPayloadAuthHeaders(page),
          data: { features: { pages: true, reviews: false }, sectionRoots: [] },
        })
        expect(response.ok()).toBe(true)
        expect((await response.json()).doc).toMatchObject({
          sectionRoots: [],
          features: { pages: true, reviews: false },
        })
        await login({ page: managerPage, user: accessManager })
        const guide = managerPage.getByRole('region', { name: 'Getting started', exact: true })
        await expect(
          guide.getByRole('heading', { name: 'No website sections assigned' }),
        ).toBeVisible()
        await expect(
          managerPage.getByRole('link', { name: '+ New Page', exact: true }),
        ).toHaveCount(0)
        await expect(guide.getByRole('button', { name: 'Hide guide' })).toHaveCount(0)
        await guide.getByRole('link', { name: 'Check access again' }).click()
        await expect(
          guide.getByRole('heading', { name: 'No website sections assigned' }),
        ).toBeVisible()
        await expect(guide).not.toContainText(sectionPages[0].title)
      })
    } finally {
      await managerContext.close()
    }
  })

  test('Site Manager chooses a scoped recipe, recovers loading and opens the saved native draft', async ({
    page,
    browser,
  }) => {
    if (!fixture) throw new Error('Expected governance fixture.')
    const currentFixture = fixture
    await login({ page, user: currentFixture.admin })
    const roots: Array<{ id: string; title: string; slug: string }> = []
    for (const title of ['Recipe Admissions', 'Recipe Campus', 'Recipe Other']) {
      const result = await page.request.post('/api/pages', {
        headers: await getPayloadAuthHeaders(page),
        data: { title, layout: [], _status: 'draft' },
      })
      expect(result.status()).toBe(201)
      const root = (await result.json()).doc
      currentFixture.pageIDs.push(root.id)
      roots.push(root)
    }
    const manager = await page.request.post('/api/users', {
      headers: await getPayloadAuthHeaders(page),
      data: {
        ...accessManager,
        role: 'siteManager',
        features: { pages: true },
        sectionRoots: [roots[0].id, roots[1].id],
      },
    })
    expect(manager.status()).toBe(201)
    const managerContext = await browser.newContext()
    const editor = await managerContext.newPage()
    try {
      await managerContext.route('https://www.gravatar.com/**', (route) => route.abort())
      await login({ page: editor, user: accessManager })
      const sectionsRoute = (url: URL) =>
        url.pathname === '/api/pages' && url.searchParams.get('where[parent][exists]') === 'false'
      await editor.route(sectionsRoute, (route) =>
        route.fulfill({ status: 500, contentType: 'application/json', body: '{}' }),
      )
      await editor.goto('/admin/collections/pages/create')
      await expect(
        editor.getByText('Website sections could not be loaded.', { exact: false }),
      ).toBeVisible()
      const title = 'A scoped Campus landing'
      await editor.getByRole('textbox', { name: 'Page title', exact: true }).fill(title)
      await editor.getByText('Landing Page', { exact: true }).click()
      await expect(editor.getByRole('button', { name: 'Create draft', exact: true })).toBeDisabled()
      await editor.unroute(sectionsRoute)
      const loaded = editor.waitForResponse(
        (response) => sectionsRoute(new URL(response.url())) && response.status() === 200,
      )
      await editor.getByRole('button', { name: 'Try loading sections again', exact: true }).click()
      expect(
        (await (await loaded).json()).docs.map((doc: { id: string }) => doc.id).sort(),
      ).toEqual([roots[0].id, roots[1].id].sort())
      await expect(editor.getByRole('textbox', { name: 'Page title', exact: true })).toHaveValue(
        title,
      )
      await expect(editor.getByRole('radio', { name: /Landing Page/ })).toBeChecked()
      const createButton = editor.getByRole('button', { name: 'Create draft', exact: true })
      await expect(createButton).toBeEnabled()
      await createButton.click()
      await expect(editor.getByText('Choose a website section.', { exact: true })).toBeVisible()
      const select = editor.getByRole('combobox', { name: 'Website section', exact: true })
      await select.focus()
      await select.press('Enter')
      await expect(editor.getByRole('option', { name: new RegExp(roots[2].title) })).toHaveCount(0)
      await editor
        .getByRole('option', { name: `${roots[1].title} (/${roots[1].slug})`, exact: true })
        .click()
      await editor.addScriptTag({ content: axe.source })
      const check = async () => {
        await editor.mouse.move(0, 0)
        await editor.locator('.page-recipe-setup').evaluate(async (element) => {
          await Promise.all(
            element
              .getAnimations({ subtree: true })
              .map((animation) => animation.finished.catch(() => {})),
          )
        })
        const violations = await editor.evaluate(async () => {
          const result = await (window as unknown as { axe: typeof import('axe-core') }).axe.run(
            '.page-recipe-setup',
            { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } },
          )
          return result.violations.map(({ id, nodes }) => ({
            id,
            targets: nodes.map(({ target }) => target),
          }))
        })
        expect(violations).toEqual([])
      }
      await check()
      await editor.screenshot({
        path: test.info().outputPath('scoped-recipes-desktop.png'),
        fullPage: true,
      })
      await editor.setViewportSize({ width: 390, height: 844 })
      await editor.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'))
      await check()
      await editor.screenshot({
        path: test.info().outputPath('scoped-recipes-mobile.png'),
        fullPage: true,
      })
      await editor.setViewportSize({ width: 1280, height: 720 })
      const created = editor.waitForResponse(
        (response) =>
          new URL(response.url()).pathname === '/api/pages/create-from-recipe' &&
          response.request().method() === 'POST',
      )
      await createButton.click()
      const response = await created
      expect(response.status()).toBe(201)
      const { id } = await response.json()
      currentFixture.pageIDs.push(id)
      await editor.waitForURL((url) => url.pathname === `/admin/collections/pages/${id}`, {
        waitUntil: 'domcontentloaded',
      })
      await expect(editor.locator('#field-title')).toHaveValue(title)
      const record = await (
        await editor.request.get(`/api/pages/${id}?draft=true&depth=0`, {
          headers: await getPayloadAuthHeaders(editor),
        })
      ).json()
      expect(record).toMatchObject({ title, parent: roots[1].id, _status: 'draft' })
      expect(record.layout.map((block: { blockType: string }) => block.blockType)).toEqual([
        'pageHeader',
        'breadcrumb',
      ])
      const anonymous = await standaloneRequest.newContext({
        baseURL: new URL(editor.url()).origin,
      })
      try {
        expect((await anonymous.get(`/api/pages/${id}`)).status()).not.toBe(200)
      } finally {
        await anonymous.dispose()
      }
      const denied = await editor.request.post('/api/pages/create-from-recipe', {
        headers: await getPayloadAuthHeaders(editor),
        data: { title: 'Forbidden recipe', recipe: 'blank', parent: roots[2].id },
      })
      expect(denied.status()).toBe(403)
    } catch (error) {
      await editor.screenshot({ path: test.info().outputPath('scoped-recipes-failure.png') })
      await writeFile(
        test.info().outputPath('scoped-recipes-failure.txt'),
        `${editor.url()}\n${await editor.locator('body').innerText()}`,
      )
      throw error
    } finally {
      await managerContext.close()
    }
  })

  test('Page History restores a published version as a draft until explicit publication', async ({
    page,
  }) => {
    if (!fixture) throw new Error('Expected governance fixture.')
    const currentFixture = fixture
    await login({ page, user: currentFixture.admin })
    const title = `History baseline ${Date.now()}`
    const create = await page.request.post('/api/pages', {
      headers: await getPayloadAuthHeaders(page),
      data: { title, layout: [], _status: 'published' },
    })
    expect(create.status()).toBe(201)
    const doc = (await create.json()).doc
    currentFixture.pageIDs.push(doc.id)
    const versions = await page.request.get(
      `/api/pages/versions?where[parent][equals]=${doc.id}&limit=10&sort=createdAt`,
      { headers: await getPayloadAuthHeaders(page) },
    )
    expect(versions.status()).toBe(200)
    const version = (await versions.json()).docs.find(
      (entry: { version: { title: string; _status: string } }) =>
        entry.version.title === title && entry.version._status === 'published',
    )
    expect(version?.id).toBeDefined()
    const liveTitle = `${title} current live`
    const update = await page.request.patch(`/api/pages/${doc.id}`, {
      headers: await getPayloadAuthHeaders(page),
      data: { title: liveTitle, _status: 'published' },
    })
    expect(update.status()).toBe(200)
    const anonymous = await standaloneRequest.newContext({ baseURL: new URL(page.url()).origin })
    try {
      await test.step('save a linked published Page revision privately before restoring History', async () => {
        await page.goto(`/admin/collections/pages/${doc.id}`)
        await expect(page.locator('form[data-form-ready="true"]')).toBeVisible()
        await page.locator('#field-title').fill(`${title} private revision`)
        const saved = page.waitForResponse(
          (response) =>
            new URL(response.url()).pathname === `/api/pages/${doc.id}` &&
            response.request().method() === 'PATCH',
        )
        await page.getByRole('button', { name: 'Save Draft', exact: true }).click()
        const response = await saved
        expect(response.status()).toBe(200)
        expect(new URL(response.url()).searchParams.get('draft')).toBe('true')
        expect(await response.json()).toMatchObject({
          doc: { title: `${title} private revision`, _status: 'draft' },
        })
        await expect(page.getByRole('button', { name: 'Save Draft', exact: true })).toBeDisabled()
        expect((await (await anonymous.get(`/api/pages/${doc.id}?depth=0`)).json()).title).toBe(
          liveTitle,
        )
      })
      await page.goto(`/admin/collections/pages/${doc.id}/versions/${version.id}`)
      const restore = page.getByRole('button', { name: 'Restore this version', exact: true })
      await expect(restore).toBeVisible()
      await restore.click()
      const modal = page.getByRole('dialog', { name: 'restore-version', exact: true })
      await expect(
        modal.getByRole('heading', { name: 'Confirm Version Restoration', exact: true }),
      ).toBeVisible()
      const restored = page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname === `/api/pages/versions/${version.id}` &&
          response.request().method() === 'POST',
      )
      await modal.getByRole('button', { name: 'Confirm', exact: true }).click()
      const response = await restored
      expect(response.status()).toBe(200)
      // The primary native button requests draft=false. Server policy remains safe.
      expect(new URL(response.url()).searchParams.get('draft')).toBe('false')
      expect(await response.json()).toMatchObject({ id: doc.id, title, _status: 'draft' })
      await page.waitForURL((url) => url.pathname === `/admin/collections/pages/${doc.id}`, {
        waitUntil: 'domcontentloaded',
      })
      await expect(page.locator('#field-title')).toHaveValue(title)
      expect((await (await anonymous.get(`/api/pages/${doc.id}?depth=0`)).json()).title).toBe(
        liveTitle,
      )
      const auditResponse = await page.request.get(
        `/api/operational-audit-events?where[and][0][entityId][equals]=${doc.id}&where[and][1][action][equals]=restore_version_as_draft`,
        { headers: await getPayloadAuthHeaders(page) },
      )
      expect(auditResponse.status()).toBe(200)
      const events = (await auditResponse.json()).docs
      expect(events).toHaveLength(1)
      expect(events[0].summary).toContain(version.id)
      const published = page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname === `/api/pages/${doc.id}` &&
          response.request().method() === 'PATCH',
      )
      await page.getByRole('button', { name: /^Publish(?: changes)?$/i }).click()
      expect((await published).ok()).toBe(true)
      expect((await (await anonymous.get(`/api/pages/${doc.id}?depth=0`)).json()).title).toBe(title)
    } finally {
      await anonymous.dispose()
    }
  })

  test('Page guide follows a real blank draft through blocks, save and authenticated preview', async ({
    page,
    browser,
  }) => {
    if (!fixture) throw new Error('Expected governance fixture.')
    const currentFixture = fixture
    await login({ page, user: currentFixture.admin })
    await page.goto('/admin/collections/pages/create')
    await page
      .getByRole('textbox', { name: 'Page title', exact: true })
      .fill(`First draft ${Date.now()}`)
    const created = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === '/api/pages/create-from-recipe' &&
        response.request().method() === 'POST',
    )
    await page.getByRole('button', { name: 'Create draft', exact: true }).click()
    const response = await created
    const result = await response.json()
    expect(response.status()).toBe(201)
    currentFixture.pageIDs.push(result.id)
    await page.waitForURL((url) => url.pathname === `/admin/collections/pages/${result.id}`, {
      waitUntil: 'commit',
    })
    await expect(page.locator('form[data-form-ready="true"]')).toBeVisible()
    const guide = page.getByRole('region', { name: 'Getting started', exact: true })
    await expect(guide.getByRole('heading', { name: 'Add your first block' })).toBeVisible()
    await guide.getByRole('link', { name: 'Go to page blocks' }).click()
    await page.getByRole('button', { name: 'Add Block', exact: true }).first().click()
    // ADD_ROW creates a placeholder before Payload's debounced server state arrives.
    // Expanding it early can be overwritten by that response on slower CI workers.
    const editorPath = new URL(page.url()).pathname
    const blockState = page.waitForResponse(async (response) => {
      const request = response.request()
      return (
        new URL(response.url()).pathname === editorPath &&
        request.method() === 'POST' &&
        Boolean(request.headers()['next-action']) &&
        (await response.text()).includes('layout.0.title')
      )
    })
    await page.getByRole('button', { name: /Page Header/ }).click()
    expect((await blockState).ok()).toBe(true)
    const block = page.locator('#layout-row-0')
    await expect(block.locator('.blocks-field__block-pill-pageHeader')).toBeVisible()
    const toggle = block.locator('button.collapsible__toggle').first()
    if ((await toggle.getAttribute('class'))?.includes('collapsible__toggle--collapsed')) {
      await toggle.click()
    }
    const heading = page.locator('#field-layout__0__title')
    await expect(heading).toBeVisible()
    await heading.fill('A first draft worth previewing')
    await expect(
      guide.getByRole('heading', { name: 'Save your changes before previewing' }),
    ).toBeVisible()
    const saved = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === `/api/pages/${result.id}` &&
        response.request().method() === 'PATCH',
    )
    await page.getByRole('button', { name: 'Save Draft', exact: true }).click()
    const saveResponse = await saved
    expect(saveResponse.ok()).toBe(true)
    expect((await saveResponse.json()).doc).toMatchObject({
      _status: 'draft',
      layout: [{ blockType: 'pageHeader', title: 'A first draft worth previewing' }],
    })
    await expect(guide.getByRole('heading', { name: 'Check your saved page' })).toBeVisible()
    await heading.fill('Unsaved work stays in the editor')
    await expect(
      guide.getByRole('heading', { name: 'Save your changes before previewing' }),
    ).toBeVisible()
    const previewOpened = page.waitForEvent('popup')
    await guide.getByRole('link', { name: /Preview saved page/ }).click()
    const preview = await previewOpened
    try {
      await expect(
        preview.getByRole('heading', { name: 'A first draft worth previewing', exact: true }),
      ).toBeVisible({ timeout: 120_000 })
      expect(new URL(preview.url()).pathname).toBe(`/preview/page/${result.id}`)
      await expect(page.locator('#field-layout__0__title')).toHaveValue(
        'Unsaved work stays in the editor',
      )
      await guide.scrollIntoViewIfNeeded()
      await checkPageGuideAccessibility(page, 'page-guide-light-a11y.json')
      await page.screenshot({ path: test.info().outputPath('page-guide-saved-desktop.png') })
      await page.setViewportSize({ width: 390, height: 844 })
      await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'))
      await guide.scrollIntoViewIfNeeded()
      await checkPageGuideAccessibility(page, 'page-guide-dark-a11y.json')
      await page.screenshot({ path: test.info().outputPath('page-guide-saved-mobile.png') })
    } finally {
      await preview.close()
    }
    const savedAgain = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === `/api/pages/${result.id}` &&
        response.request().method() === 'PATCH',
    )
    await page.getByRole('button', { name: 'Save Draft', exact: true }).click()
    expect((await savedAgain).ok()).toBe(true)
    await expect(guide.getByRole('heading', { name: 'Check your saved page' })).toBeVisible()
    const visitor = await browser.newContext()
    try {
      const denied = await visitor.request.get(`/preview/page/${result.id}`)
      expect(denied.status()).not.toBe(200)
    } finally {
      await visitor.close()
    }
    await guide.getByRole('button', { name: 'Hide guide' }).click()
    await expect(guide.getByRole('button', { name: 'Getting started', exact: true })).toBeVisible()
    await page.reload({ waitUntil: 'domcontentloaded' })
    await expect(guide.getByRole('button', { name: 'Getting started', exact: true })).toBeVisible()
    await guide.getByRole('button', { name: 'Getting started', exact: true }).click()
    await expect(guide.getByRole('heading', { name: 'Check your saved page' })).toBeVisible()
    const current = await page.request.get(`/api/pages/${result.id}?draft=true`, {
      headers: await getPayloadAuthHeaders(page),
    })
    expect((await current.json())._status).toBe('draft')
  })

  test('Site setup uses native drafts, keeps public settings and shares optional help across globals', async ({
    page,
    browser,
  }) => {
    if (!fixture) throw new Error('Expected governance fixture.')
    await login({ page, user: fixture.admin })
    const headers = await getPayloadAuthHeaders(page)
    const globalURL = (slug: string) => `/api/globals/${slug}`
    const read = async (slug: string, draft: boolean) => {
      const response = await page.request.get(
        `${globalURL(slug)}?depth=0${draft ? '&draft=true' : ''}`,
        { headers, timeout: 20_000 },
      )
      expect(response.ok()).toBe(true)
      return response.json()
    }
    const identity = await read('site-settings', true)
    const appearance = await read('theme-settings', true)
    const visitor = await browser.newContext()
    const publicIdentity = await visitor.request
      .get(globalURL('site-settings'))
      .then((r) => r.json())
    const publicAppearance = await visitor.request
      .get(globalURL('theme-settings'))
      .then((r) => r.json())
    try {
      await page.getByRole('link', { name: 'Review site settings', exact: true }).click()
      await expect(page.locator('form[data-form-ready="true"]')).toBeVisible()
      const guide = page.getByRole('region', { name: 'Site setup', exact: true })
      await expect(guide.getByRole('heading', { name: 'Review your site identity' })).toBeVisible()
      await expect(page.locator('#field-siteName')).toHaveValue(identity.siteName ?? '')
      const name = `Site setup acceptance ${Date.now()}`
      await page.locator('#field-siteName').fill(name)
      await expect(guide.getByRole('button', { name: 'Review website appearance' })).toBeDisabled()
      await page.getByRole('button', { name: 'Regional', exact: true }).click()
      const zone = identity.timeZone === 'Asia/Dubai' ? 'UTC' : 'Asia/Dubai'
      await chooseSelectOption({ fieldID: '#field-timeZone', label: zone, page })
      const savingIdentity = page.waitForResponse(
        (r) =>
          new URL(r.url()).pathname === globalURL('site-settings') &&
          r.request().method() === 'POST',
      )
      await page.getByRole('button', { name: 'Save Draft', exact: true }).click()
      const savedIdentity = await savingIdentity
      expect(savedIdentity.ok()).toBe(true)
      expect((await savedIdentity.json()).result).toMatchObject({
        siteName: name,
        timeZone: zone,
        _status: 'draft',
      })
      await expect(guide.getByRole('link', { name: 'Review website appearance' })).toBeVisible()
      expect(
        (await visitor.request.get(globalURL('site-settings')).then((r) => r.json())).siteName,
      ).toBe(publicIdentity.siteName)
      await guide.getByRole('link', { name: 'Review website appearance' }).click()
      await expect(page.locator('form[data-form-ready="true"]')).toBeVisible()
      await expect(
        guide.getByRole('heading', { name: 'Review your website appearance' }),
      ).toBeVisible()
      const theme = appearance.themeColor === 'snmih-green' ? 'SNMIH-Blue' : 'SNMIH-Green'
      await chooseSelectOption({ fieldID: '#field-themeColor', label: theme, page })
      await expect(guide.getByRole('button', { name: 'Return to Dashboard' })).toBeDisabled()
      const savingAppearance = page.waitForResponse(
        (r) =>
          new URL(r.url()).pathname === globalURL('theme-settings') &&
          r.request().method() === 'POST',
      )
      await page.getByRole('button', { name: 'Save Draft', exact: true }).click()
      const savedAppearance = await savingAppearance
      expect(savedAppearance.ok()).toBe(true)
      expect((await savedAppearance.json()).result).toMatchObject({
        themeColor: theme === 'SNMIH-Blue' ? 'snmih-blue' : 'snmih-green',
        _status: 'draft',
      })
      await expect(guide.getByRole('link', { name: 'Return to Dashboard' })).toBeVisible()
      expect(
        (await visitor.request.get(globalURL('theme-settings')).then((r) => r.json())).themeColor,
      ).toBe(publicAppearance.themeColor)
      await guide.scrollIntoViewIfNeeded()
      await checkPageGuideAccessibility(page, 'site-setup-light-a11y.json')
      await page.screenshot({ path: test.info().outputPath('site-setup-desktop.png') })
      await page.setViewportSize({ width: 390, height: 844 })
      await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'))
      await checkPageGuideAccessibility(page, 'site-setup-dark-a11y.json')
      await page.screenshot({ path: test.info().outputPath('site-setup-mobile.png') })
      await guide.getByRole('button', { name: 'Hide guide' }).click()
      await expect(guide.getByRole('button', { name: 'Site setup', exact: true })).toBeVisible()
      await page.goto('/admin/globals/site-settings')
      await expect(guide.getByRole('button', { name: 'Site setup', exact: true })).toBeVisible()
      await guide.getByRole('button', { name: 'Site setup', exact: true }).click()
      await expect(guide.getByRole('heading', { name: 'Review your site identity' })).toBeVisible()
      await page.goto('/admin')
      await expect(page.getByRole('region', { name: 'Getting started', exact: true })).toBeVisible()
    } finally {
      await visitor.close()
      // Restore only touched test-global fields, even if the browser fixture has closed.
      const restore = await standaloneRequest.newContext({
        baseURL: headers.Origin,
        extraHTTPHeaders: headers,
        timeout: 10_000,
      })
      try {
        const restoredIdentity = await restore.post(`${globalURL('site-settings')}?draft=true`, {
          data: {
            siteName: identity.siteName ?? '',
            timeZone: identity.timeZone ?? 'Asia/Kolkata',
            _status: 'draft',
          },
        })
        expect(restoredIdentity.ok()).toBe(true)
        const restoredAppearance = await restore.post(`${globalURL('theme-settings')}?draft=true`, {
          data: {
            themeColor: appearance.themeColor ?? 'snmih-blue',
            colorScheme: appearance.colorScheme ?? 'system',
            _status: 'draft',
          },
        })
        expect(restoredAppearance.ok()).toBe(true)
      } finally {
        await restore.dispose()
      }
    }
  })

  test('Published Page guidance connects permitted homepage setup without changing public settings on draft save', async ({
    page,
    browser,
  }) => {
    if (!fixture) throw new Error('Expected governance fixture.')
    await login({ page, user: fixture.admin })
    const headers = await getPayloadAuthHeaders(page)
    const globalURL = '/api/globals/page-settings'
    const originalResponse = await page.request.get(`${globalURL}?draft=true&depth=0`, { headers })
    expect(originalResponse.ok()).toBe(true)
    const original = await originalResponse.json()
    const visitor = await browser.newContext()
    const manager = await browser.newContext()
    const relationshipID = (value: unknown) =>
      value && typeof value === 'object' && 'id' in value ? value.id : (value ?? null)
    let touchedLayout = false
    try {
      const publicBeforeResponse = await visitor.request.get(`${globalURL}?depth=0`)
      expect(publicBeforeResponse.ok()).toBe(true)
      const publicBefore = await publicBeforeResponse.json()
      const title = `Homepage guidance ${Date.now()}`
      const created = await page.request.post('/api/pages', {
        headers,
        data: {
          title,
          slug: `homepage-guidance-${Date.now()}`,
          _status: 'draft',
          layout: [{ blockType: 'pageHeader', title }],
        },
      })
      expect(created.ok()).toBe(true)
      const { doc } = await created.json()
      fixture.pageIDs.push(doc.id)
      await page.goto(`/admin/collections/pages/${doc.id}`, { waitUntil: 'domcontentloaded' })
      const pageGuide = page.getByRole('region', { name: 'Getting started', exact: true })
      await expect(pageGuide.getByRole('heading', { name: 'Check your saved page' })).toBeVisible()
      await expect(
        pageGuide.getByRole('link', { name: 'Review homepage and navigation' }),
      ).toHaveCount(0)
      const publishing = page.waitForResponse(
        (r) =>
          new URL(r.url()).pathname === `/api/pages/${doc.id}` && r.request().method() === 'PATCH',
      )
      await page.getByRole('button', { name: 'Publish changes', exact: true }).click()
      const published = await publishing
      expect(published.ok()).toBe(true)
      expect((await published.json()).doc._status).toBe('published')
      await expect(
        pageGuide.getByRole('heading', { name: 'Help visitors find your published page' }),
      ).toBeVisible()
      // Publishing the Page alone must not select the homepage or replace menus.
      const afterPagePublish = await visitor.request
        .get(`${globalURL}?depth=0`)
        .then((r) => r.json())
      for (const field of ['homepage', 'activeHeader', 'activeFooter'])
        expect(relationshipID(afterPagePublish[field])).toBe(relationshipID(publicBefore[field]))
      await pageGuide.getByRole('link', { name: 'Review homepage and navigation' }).click()
      await expect(page.locator('form[data-form-ready="true"]')).toBeVisible()
      const guide = page.getByRole('region', { name: 'Homepage and navigation', exact: true })
      await expect(guide).toContainText(
        'Publishing a page does not make it the homepage or add a menu item',
      )
      const homepage = page.locator('#field-homepage').getByRole('combobox')
      await homepage.fill(title)
      await page.getByRole('option', { name: title, exact: true }).click()
      await expect(guide.getByRole('button', { name: 'Open Headers' })).toBeDisabled()
      const saving = page.waitForResponse(
        (r) => new URL(r.url()).pathname === globalURL && r.request().method() === 'POST',
      )
      touchedLayout = true
      await page.getByRole('button', { name: 'Save Draft', exact: true }).click()
      const saved = await saving
      expect(saved.ok()).toBe(true)
      const savedResult = (await saved.json()).result
      expect(savedResult._status).toBe('draft')
      expect(relationshipID(savedResult.homepage)).toBe(doc.id)
      await expect(guide.getByRole('link', { name: 'Open Headers' })).toBeVisible()
      const publicAfter = await visitor.request.get(`${globalURL}?depth=0`).then((r) => r.json())
      for (const field of ['homepage', 'activeHeader', 'activeFooter'])
        expect(relationshipID(publicAfter[field])).toBe(relationshipID(publicBefore[field]))
      await guide.scrollIntoViewIfNeeded()
      await checkPageGuideAccessibility(page, 'homepage-light-a11y.json')
      await page.screenshot({ path: test.info().outputPath('homepage-desktop.png') })
      await page.setViewportSize({ width: 390, height: 844 })
      await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'))
      await checkPageGuideAccessibility(page, 'homepage-dark-a11y.json')
      await page.screenshot({ path: test.info().outputPath('homepage-mobile.png') })
      await guide.getByRole('button', { name: 'Hide guide' }).click()
      await expect(
        guide.getByRole('button', { name: 'Homepage and navigation', exact: true }),
      ).toBeVisible()
      await page.reload({ waitUntil: 'domcontentloaded' })
      await guide.getByRole('button', { name: 'Homepage and navigation', exact: true }).click()
      await expect(guide.getByRole('link', { name: 'Open Headers' })).toBeVisible()
      await guide.getByRole('link', { name: 'Open Headers' }).click()
      await page.waitForURL((url) => url.pathname === '/admin/collections/headers')
      await expect(
        page.getByText(
          'Edit menu items in a Header Layout, publish the Header, then select it in Layout Defaults. Pages may override the default Header.',
          { exact: true },
        ),
      ).toBeVisible()
      // A Page-only Manager retains scoped publishing but cannot manage site-wide defaults.
      const users = await page.request.get(
        `/api/users?where[email][equals]=${encodeURIComponent(fixture.reviewManager.email)}&depth=0`,
        { headers },
      )
      expect(users.ok()).toBe(true)
      const managerID = (await users.json()).docs[0].id
      const assigned = await page.request.patch(`/api/users/${managerID}`, {
        headers,
        data: { features: { pages: true, reviews: false }, sectionRoots: [doc.id] },
      })
      expect(assigned.ok()).toBe(true)
      const managerPage = await manager.newPage()
      await login({ page: managerPage, user: fixture.reviewManager })
      await expect(
        managerPage.getByRole('link', { name: 'Review homepage and navigation', exact: true }),
      ).toHaveCount(0)
      await managerPage.goto(`/admin/collections/pages/${doc.id}`, {
        waitUntil: 'domcontentloaded',
      })
      await expect(
        managerPage.getByRole('region', { name: 'Getting started', exact: true }),
      ).toContainText('Ask an Admin')
      await expect(
        managerPage.getByRole('link', { name: 'Review homepage and navigation', exact: true }),
      ).toHaveCount(0)
      const denied = await managerPage.request.post(`${globalURL}?draft=true`, {
        headers: await getPayloadAuthHeaders(managerPage),
        data: { homepage: doc.id },
      })
      expect(denied.status()).toBe(403)
    } finally {
      await visitor.close()
      await manager.close()
      if (touchedLayout) {
        const restore = await standaloneRequest.newContext({
          baseURL: headers.Origin,
          extraHTTPHeaders: headers,
          timeout: 10_000,
        })
        try {
          const result = await restore.post(`${globalURL}?draft=true`, {
            data: { homepage: relationshipID(original.homepage), _status: 'draft' },
          })
          expect(result.ok()).toBe(true)
        } finally {
          await restore.dispose()
        }
      }
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
