import { expect, test, type Locator, type Page } from '@playwright/test'
import { seedTestUser, testUser } from '../helpers/seedUser'
import { login } from '../helpers/login'

/** Await the editor's own debounced server-state response rather than a fixed delay. */
async function editNativeForm(
  page: Page,
  change: () => Promise<unknown>,
  fieldPath: string,
  value?: string | boolean,
) {
  const route = new URL(page.url()).pathname
  const response = page.waitForResponse(async (response) => {
    const request = response.request()
    if (
      new URL(response.url()).pathname !== route ||
      request.method() !== 'POST' ||
      !request.headers()['next-action']
    )
      return false
    if (value !== undefined) {
      const body = (request.postData() ?? '').replace(/\\+"/g, '"')
      if (!body.includes(fieldPath) || !body.includes(`"value":${JSON.stringify(value)}`))
        return false
    }
    return (await response.text()).includes(fieldPath)
  })
  const [result] = await Promise.all([response, change()])
  expect(result.ok()).toBe(true)
}

async function addNativeRow(page: Page, button: Locator, fieldPath: string) {
  await editNativeForm(page, () => button.click(), fieldPath)
}

async function fillNativeField(page: Page, fieldPath: string, value: string) {
  const field = page.locator(`#field-${fieldPath.replaceAll('.', '__')}`)
  await editNativeForm(
    page,
    () => field.fill(value),
    fieldPath,
    fieldPath.endsWith('Length') ? undefined : value,
  )
  await expect(field).toHaveValue(value)
}

async function chooseNativeType(page: Page, index: number, label: 'Select' | 'Checkbox') {
  const fieldPath = `fields.${index}.type`
  const field = page.locator(`#field-fields__${index}__type`)
  await field.getByRole('combobox').click()
  await editNativeForm(
    page,
    () => page.getByRole('option', { name: label, exact: true }).click(),
    fieldPath,
    label.toLowerCase(),
  )
  await expect(field.getByText(label, { exact: true })).toBeVisible()
}

for (const block of [
  { slug: 'genericForm', picker: /Generic Form custom questions preview Generic Form/ },
  { slug: 'contact6', picker: /Contact cards and reusable questions preview Contact Cards & Form/ },
]) {
  test(
    block.slug + ': native custom form authoring, publication, public submission and safe preview',
    async ({ page, browser }, testInfo) => {
      testInfo.setTimeout(240_000)
      page.setDefaultTimeout(20_000)
      const formTitle = `Generic enquiry acceptance ${block.slug} ${testInfo.retry}`
      await seedTestUser()
      await login({ page, user: testUser })
      await page.goto('/admin/collections/forms/create', { waitUntil: 'domcontentloaded' })
      await expect(page.locator('form[data-form-ready="true"]')).toBeVisible()
      await fillNativeField(page, 'title', formTitle)
      const addField = page.getByRole('button', { name: 'Add Field', exact: true })
      await addNativeRow(page, addField, 'fields.0.name')
      await fillNativeField(page, 'fields.0.name', 'visitor_name')
      await fillNativeField(page, 'fields.0.label', 'Your name')
      await fillNativeField(page, 'fields.0.helpText', 'Use 3–40 characters.')
      await fillNativeField(page, 'fields.0.defaultValue', 'Campus visitor')
      await fillNativeField(page, 'fields.0.minLength', '3')
      await fillNativeField(page, 'fields.0.maxLength', '40')
      await addNativeRow(page, addField, 'fields.1.name')
      await chooseNativeType(page, 1, 'Select')
      await fillNativeField(page, 'fields.1.name', 'preferred_department')
      await fillNativeField(page, 'fields.1.label', 'Which department can help?')
      await addNativeRow(
        page,
        page.getByRole('button', { name: 'Add Option', exact: true }),
        'fields.1.options.0.label',
      )
      await fillNativeField(page, 'fields.1.options.0.label', 'Admissions')
      await fillNativeField(page, 'fields.1.options.0.value', 'admissions')
      await editNativeForm(
        page,
        () => page.locator('input[name="fields.1.required"]').check(),
        'fields.1.required',
        true,
      )
      await addNativeRow(page, addField, 'fields.2.name')
      await chooseNativeType(page, 2, 'Checkbox')
      await fillNativeField(page, 'fields.2.name', 'contact_permission')
      await fillNativeField(page, 'fields.2.label', 'You may contact me')

      const formResponsePromise = page.waitForResponse(
        (r) => new URL(r.url()).pathname === '/api/forms' && r.request().method() === 'POST',
      )
      await page.getByRole('button', { name: 'Publish changes', exact: true }).click()
      const formResponse = await formResponsePromise
      expect(
        formResponse.ok(),
        `Form publication ${formResponse.status()}: ${await formResponse.text()}`,
      ).toBe(true)
      const { doc: form } = await formResponse.json()
      const authHeaders = { Origin: new URL(page.url()).origin, Referer: page.url() }
      const pageResponse = await page.request.post('/api/pages', {
        headers: authHeaders,
        data: {
          title: 'Generic form acceptance',
          slug: `native-${block.slug}-acceptance-${testInfo.retry}`,
          _status: 'draft',
          layout: [],
        },
      })
      expect(pageResponse.ok()).toBe(true)
      const { doc: document } = await pageResponse.json()
      try {
        await page.goto(`/admin/collections/pages/${document.id}`, {
          waitUntil: 'domcontentloaded',
        })
        await expect(page.locator('form[data-form-ready="true"]')).toBeVisible()
        await page
          .getByRole('button', { name: /Add (Layout|Block)/ })
          .first()
          .click()
        await addNativeRow(
          page,
          page.getByRole('button', { name: block.picker }),
          'layout.0.heading',
        )
        await page.getByRole('button', { name: 'Show All', exact: true }).click()
        await fillNativeField(page, 'layout.0.heading', 'Ask our team')
        await page.locator('#field-layout__0__form').getByRole('combobox').click()
        await page.getByRole('option', { name: formTitle, exact: true }).click()
        const publishPromise = page.waitForResponse(
          (r) =>
            new URL(r.url()).pathname === `/api/pages/${document.id}` &&
            r.request().method() === 'PATCH',
        )
        await page.getByRole('button', { name: 'Publish changes', exact: true }).click()
        expect((await publishPromise).ok()).toBe(true)

        const visitor = await browser.newPage()
        try {
          await visitor.goto('/' + document.slug, {
            waitUntil: 'domcontentloaded',
          })
          await expect(visitor.getByRole('heading', { name: 'Ask our team' })).toBeVisible()
          await expect(visitor.getByLabel('Your name', { exact: true })).toHaveValue(
            'Campus visitor',
          )
          await expect(
            visitor.getByLabel('Your name', { exact: true }),
          ).toHaveAccessibleDescription('Use 3–40 characters.')
          await expect(visitor.getByLabel('Your name', { exact: true })).toHaveAttribute(
            'maxlength',
            '40',
          )
          await visitor.getByRole('button', { name: 'Submit', exact: true }).click()
          await expect(
            visitor.getByText('Which department can help? is required.', { exact: true }),
          ).toBeVisible()
          await visitor.getByLabel('Your name', { exact: true }).fill('Visitor')
          await visitor.getByRole('combobox').click()
          const menu = visitor.getByRole('listbox')
          await expect(menu).toBeVisible()
          expect(await menu.evaluate((element) => !!element.closest('section'))).toBe(true)
          await visitor.getByRole('option', { name: 'Admissions', exact: true }).click()
          await visitor.getByRole('checkbox', { name: 'You may contact me', exact: true }).check()
          // Publish after the visitor has loaded and answered the old revision.
          const changed = await page.request.patch(`/api/forms/${form.id}`, {
            headers: authHeaders,
            data: {
              _status: 'published',
              fields: form.fields.map((field: { name: string }) =>
                field.name === 'visitor_name'
                  ? {
                      ...field,
                      name: 'visitor_full_name',
                      label: 'Full name',
                      maxLength: 6,
                      defaultValue: 'Guest',
                      helpText: 'Use 3–6 characters.',
                    }
                  : field.name === 'contact_permission'
                    ? { ...field, type: 'text', label: 'Contact preference' }
                    : field,
              ),
            },
          })
          expect(changed.ok()).toBe(true)
          const stalePromise = visitor.waitForResponse(
            (response) =>
              new URL(response.url()).pathname === `/api/forms/${form.slug}/submit` &&
              response.request().method() === 'POST',
            { timeout: 120_000 },
          )
          await visitor.getByRole('button', { name: 'Submit', exact: true }).click()
          const staleResponse = await stalePromise
          expect(staleResponse.status()).toBe(409)
          const stale = await staleResponse.json()
          expect(stale.code).toBe('FORM_CHANGED')
          expect(JSON.stringify(stale)).not.toContain('notificationRecipients')
          await expect(
            visitor.getByRole('status').filter({ hasText: 'The questions have changed.' }),
          ).toBeFocused()
          await expect(visitor.getByLabel('Full name', { exact: true })).toHaveValue('')
          await expect(
            visitor.getByLabel('Full name', { exact: true }),
          ).toHaveAccessibleDescription('Use 3–6 characters.')
          await visitor.getByLabel('Full name', { exact: true }).fill('Taylor')
          await expect(visitor.getByRole('combobox')).toHaveText('Admissions')
          await expect(visitor.getByLabel('Contact preference', { exact: true })).toHaveValue('')
          await expect(
            visitor.getByText(
              /These answers were cleared because their questions changed: Your name, You may contact me/,
            ),
          ).toBeVisible()
          expect(
            await page.request
              .get(`/api/form-submissions?where[form][equals]=${form.id}&depth=0`, {
                headers: authHeaders,
              })
              .then((r) => r.json())
              .then((body) => body.totalDocs),
          ).toBe(0)
          await visitor.getByLabel('Contact preference', { exact: true }).fill('Email is best')
          // The server commits, but the visitor loses the first confirmation.
          const endpoint = `**/api/forms/${form.slug}/submit`
          let acceptedBody: unknown
          await visitor.route(endpoint, async (route) => {
            acceptedBody = route.request().postDataJSON()
            const stored = await route.fetch()
            expect(stored.ok()).toBe(true)
            await route.abort('failed')
            await visitor.unroute(endpoint)
          })
          await visitor.getByRole('button', { name: 'Submit', exact: true }).click()
          await expect(visitor.getByText(/We couldn’t confirm your submission/)).toBeVisible()
          expect(
            await page.request
              .get(`/api/form-submissions?where[form][equals]=${form.id}&depth=0`, {
                headers: authHeaders,
              })
              .then((r) => r.json())
              .then((body) => body.totalDocs),
          ).toBe(1)
          const intakePromise = visitor.waitForResponse(
            (response) =>
              new URL(response.url()).pathname === `/api/forms/${form.slug}/submit` &&
              response.request().method() === 'POST',
            { timeout: 120_000 },
          )
          await visitor.getByRole('button', { name: 'Submit', exact: true }).click()
          const intake = await intakePromise
          expect(intake.ok(), `Intake ${intake.status()}: ${await intake.text()}`).toBe(true)
          expect(await intake.json()).toMatchObject({ message: form.successMessage })
          expect(intake.request().postDataJSON()).toEqual(acceptedBody)
          await expect(
            visitor
              .getByRole('status')
              .filter({ hasText: 'Thanks. Your submission has been received.' }),
          ).toBeVisible()
          const submissions = await page.request.get(
            `/api/form-submissions?where[form][equals]=${form.id}&depth=0`,
            { headers: authHeaders },
          )
          expect(submissions.ok()).toBe(true)
          const { docs } = await submissions.json()
          expect(docs).toHaveLength(1)
          expect(docs[0].formRevision).toBe(stale.form.revision)
          expect(docs[0].formSnapshot.fields[0]).toMatchObject({
            maxLength: 6,
            defaultValue: 'Guest',
            helpText: 'Use 3–6 characters.',
          })
          expect(docs[0].answers).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                name: 'preferred_department',
                label: 'Which department can help?',
                displayValue: 'Admissions',
              }),
              expect.objectContaining({ name: 'visitor_full_name', value: { raw: 'Taylor' } }),
              expect.objectContaining({
                name: 'contact_permission',
                value: { raw: 'Email is best' },
              }),
            ]),
          )

          const draftEdit = await page.request.patch(`/api/forms/${form.id}?draft=true`, {
            headers: authHeaders,
            data: {
              _status: 'draft',
              fields: form.fields.map((field: { name: string }) =>
                field.name === 'preferred_department'
                  ? { ...field, label: 'Draft-only question' }
                  : field,
              ),
            },
          })
          expect(draftEdit.ok()).toBe(true)
          await visitor.reload({ waitUntil: 'domcontentloaded' })
          await expect(
            visitor.getByText('Which department can help?', { exact: false }),
          ).toBeVisible()
          await expect(visitor.getByText('Draft-only question', { exact: true })).toHaveCount(0)
          await page.goto(`/preview/page/${document.id}`, {
            waitUntil: 'domcontentloaded',
            timeout: 120_000, // The complete preview renderer compiles cold on the CI dev server.
          })
          await expect(page.getByText(/Preview only — submissions are disabled/)).toBeVisible()
          await expect(page.getByRole('button', { name: 'Submit', exact: true })).toBeDisabled()
          expect(
            await page.request
              .get(`/api/form-submissions?where[form][equals]=${form.id}&depth=0`, {
                headers: authHeaders,
              })
              .then((r) => r.json())
              .then((b) => b.totalDocs),
          ).toBe(1)
        } finally {
          await visitor.close()
        }
      } finally {
        // Fixture records only, on the required loopback *_test database.
        await page.request.delete(`/api/form-submissions?where[form][equals]=${form.id}`, {
          headers: authHeaders,
        })
        await page.request.delete(`/api/pages/${document.id}`, { headers: authHeaders })
        await page.request.delete(`/api/forms/${form.id}`, { headers: authHeaders })
      }
    },
  )
}
