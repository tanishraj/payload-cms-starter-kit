import { expect, test } from '@playwright/test'
import { seedTestUser, testUser } from '../helpers/seedUser'
import { login } from '../helpers/login'

test('native custom form authoring, publication, public submission and safe preview', async ({
  page,
  browser,
}, testInfo) => {
  testInfo.setTimeout(240_000)
  page.setDefaultTimeout(20_000)
  await seedTestUser()
  await login({ page, user: testUser })
  await page.goto('/admin/collections/forms/create')
  await page.locator('#field-title').fill('Generic enquiry acceptance')
  const addField = page.getByRole('button', { name: 'Add Field', exact: true })
  await addField.click()
  await page.locator('#field-fields__0__name').fill('visitor_name')
  await page.locator('#field-fields__0__label').fill('Your name')
  await addField.click()
  await page.locator('#field-fields__1__name').fill('preferred_department')
  await page.locator('#field-fields__1__label').fill('Which department can help?')
  await page.locator('#field-fields__1__type').getByRole('combobox').click()
  await page.getByRole('option', { name: 'Select', exact: true }).click()
  await page.getByRole('button', { name: 'Add Option', exact: true }).click()
  await page.locator('#field-fields__1__options__0__label').fill('Admissions')
  await page.locator('#field-fields__1__options__0__value').fill('admissions')
  await page.locator('input[name="fields.1.required"]').check()
  await addField.click()
  await page.locator('#field-fields__2__name').fill('contact_permission')
  await page.locator('#field-fields__2__label').fill('You may contact me')
  await page.locator('#field-fields__2__type').getByRole('combobox').click()
  await page.getByRole('option', { name: 'Checkbox', exact: true }).click()
  const formResponsePromise = page.waitForResponse(
    (r) => new URL(r.url()).pathname === '/api/forms' && r.request().method() === 'POST',
  )
  await page.getByRole('button', { name: 'Publish changes', exact: true }).click()
  const formResponse = await formResponsePromise
  expect(formResponse.ok()).toBe(true)
  const { doc: form } = await formResponse.json()
  const authHeaders = { Origin: new URL(page.url()).origin, Referer: page.url() }
  const pageResponse = await page.request.post('/api/pages', {
    headers: authHeaders,
    data: {
      title: 'Generic form acceptance',
      slug: 'generic-form-acceptance',
      _status: 'draft',
      layout: [],
    },
  })
  expect(pageResponse.ok()).toBe(true)
  const { doc: document } = await pageResponse.json()
  try {
    await page.goto(`/admin/collections/pages/${document.id}`)
    await page
      .getByRole('button', { name: /Add (Layout|Block)/ })
      .first()
      .click()
    await page
      .getByRole('button', { name: /Generic Form custom questions preview Generic Form/ })
      .click()
    await page.getByRole('button', { name: 'Show All', exact: true }).click()
    await page.locator('#field-layout__0__heading').fill('Ask our team')
    await page.locator('#field-layout__0__form').getByRole('combobox').click()
    await page.getByRole('option', { name: 'Generic enquiry acceptance', exact: true }).click()
    const publishPromise = page.waitForResponse(
      (r) =>
        new URL(r.url()).pathname === `/api/pages/${document.id}` &&
        r.request().method() === 'PATCH',
    )
    await page.getByRole('button', { name: 'Publish changes', exact: true }).click()
    expect((await publishPromise).ok()).toBe(true)

    const visitor = await browser.newPage()
    try {
      await visitor.goto('/generic-form-acceptance')
      await expect(visitor.getByRole('heading', { name: 'Ask our team' })).toBeVisible()
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
      await visitor.getByRole('button', { name: 'Submit', exact: true }).click()
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
      expect(docs[0].answers).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'preferred_department',
            label: 'Which department can help?',
            displayValue: 'Admissions',
          }),
          expect.objectContaining({ name: 'contact_permission', value: { raw: true } }),
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
      await visitor.reload()
      await expect(visitor.getByText('Which department can help?', { exact: false })).toBeVisible()
      await expect(visitor.getByText('Draft-only question', { exact: true })).toHaveCount(0)
      await page.goto(`/preview/page/${document.id}`)
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
})
