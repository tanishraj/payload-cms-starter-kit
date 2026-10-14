import { expect, test, type Locator, type Page } from '@playwright/test'
import { seedTestUser, testUser } from '../helpers/seedUser'
import { login } from '../helpers/login'

/** Await the editor's own debounced server-state response rather than a fixed delay. */
async function editNativeForm(
  page: Page,
  change: () => Promise<unknown>,
  fieldPath: string,
  value?: string | boolean | number,
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

async function fillNativeField(page: Page, fieldPath: string, value: string, numeric = false) {
  const field = page.locator(`#field-${fieldPath.replaceAll('.', '__')}`)
  await editNativeForm(page, () => field.fill(value), fieldPath, numeric ? Number(value) : value)
  await expect(field).toHaveValue(value)
}

async function chooseNativeType(
  page: Page,
  index: number,
  label:
    | 'Select'
    | 'Checkbox'
    | 'URL'
    | 'Number'
    | 'Radio'
    | 'Checkbox group'
    | 'Multi-select'
    | 'Switch'
    | 'Date'
    | 'Time'
    | 'File',
) {
  const fieldPath = `fields.${index}.type`
  const field = page.locator(`#field-fields__${index}__type`)
  await field.getByRole('combobox').click()
  await editNativeForm(
    page,
    () => page.getByRole('option', { name: label, exact: true }).click(),
    fieldPath,
    (
      { 'Checkbox group': 'checkboxGroup', 'Multi-select': 'multiSelect' } as Record<string, string>
    )[label] ?? label.toLowerCase(),
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
      testInfo.setTimeout(420_000)
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
      await fillNativeField(page, 'fields.0.minLength', '3', true)
      await fillNativeField(page, 'fields.0.maxLength', '40', true)
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
      await addNativeRow(page, addField, 'fields.3.name')
      await chooseNativeType(page, 3, 'URL')
      await fillNativeField(page, 'fields.3.name', 'reference_link')
      await fillNativeField(page, 'fields.3.label', 'Reference link')
      await fillNativeField(page, 'fields.3.helpText', 'Include https:// or http://.')
      await addNativeRow(page, addField, 'fields.4.name')
      await chooseNativeType(page, 4, 'Number')
      await fillNativeField(page, 'fields.4.name', 'email')
      await fillNativeField(page, 'fields.4.label', 'Visit duration')
      await fillNativeField(page, 'fields.4.defaultValue', '1.5')
      await fillNativeField(page, 'fields.4.minValue', '0.5', true)
      await fillNativeField(page, 'fields.4.maxValue', '4', true)
      await fillNativeField(page, 'fields.4.step', '0.5', true)

      for (const [index, type, name, label] of [
        [5, 'Radio', 'submitterEmail', 'Enquiry route'],
        [6, 'Checkbox group', 'topics', 'Areas of interest'],
        [7, 'Multi-select', 'services', 'Services'],
      ] as const) {
        await addNativeRow(page, addField, `fields.${index}.name`)
        await chooseNativeType(page, index, type)
        await fillNativeField(page, `fields.${index}.name`, name)
        await fillNativeField(page, `fields.${index}.label`, label)
        for (const [option, title, value] of [
          [0, 'Admissions', 'admissions'],
          [1, 'Library', 'library'],
        ] as const) {
          await addNativeRow(
            page,
            page.getByRole('button', { name: 'Add Option', exact: true }).last(),
            `fields.${index}.options.${option}.label`,
          )
          await fillNativeField(page, `fields.${index}.options.${option}.label`, title)
          await fillNativeField(page, `fields.${index}.options.${option}.value`, value)
        }
        if (index === 5)
          await editNativeForm(
            page,
            () => page.locator(`input[name="fields.${index}.required"]`).check(),
            `fields.${index}.required`,
            true,
          )
        else {
          await fillNativeField(page, `fields.${index}.minSelections`, '1', true)
          await fillNativeField(page, `fields.${index}.maxSelections`, '2', true)
        }
        if (index === 7) {
          await addNativeRow(
            page,
            page.getByRole('button', { name: 'Add Selection', exact: true }).last(),
            'fields.7.defaultSelections.0.value',
          )
          await fillNativeField(page, 'fields.7.defaultSelections.0.value', 'admissions')
        }
      }

      for (const [index, type, name, label] of [
        [8, 'Date', 'visit_day', 'Visit date'],
        [9, 'Time', 'phone', 'Visit time'],
        [10, 'Switch', 'reminder', 'Send me a reminder'],
      ] as const) {
        await addNativeRow(page, addField, `fields.${index}.name`)
        await chooseNativeType(page, index, type)
        await fillNativeField(page, `fields.${index}.name`, name)
        await fillNativeField(page, `fields.${index}.label`, label)
        if (index === 8) {
          await fillNativeField(page, 'fields.8.minDate', '2026-10-20')
          await fillNativeField(page, 'fields.8.maxDate', '2026-10-31')
          await fillNativeField(page, 'fields.8.defaultValue', '2026-10-22')
        } else if (index === 9) {
          await fillNativeField(page, 'fields.9.minTime', '09:00')
          await fillNativeField(page, 'fields.9.maxTime', '17:00')
          await fillNativeField(page, 'fields.9.defaultValue', '10:30')
        } else {
          await editNativeForm(
            page,
            () => page.locator('input[name="fields.10.defaultChecked"]').check(),
            'fields.10.defaultChecked',
            true,
          )
        }
        if (index !== 10)
          await editNativeForm(
            page,
            () => page.locator(`input[name="fields.${index}.required"]`).check(),
            `fields.${index}.required`,
            true,
          )
      }

      await addNativeRow(page, addField, 'fields.11.name')
      await chooseNativeType(page, 11, 'File')
      await fillNativeField(page, 'fields.11.name', 'supporting_documents')
      await fillNativeField(page, 'fields.11.label', 'Supporting documents')
      await fillNativeField(page, 'fields.11.maxFiles', '2', true)
      await fillNativeField(page, 'fields.11.maxFileSizeMB', '1', true)
      await editNativeForm(
        page,
        () => page.locator('input[name="fields.11.required"]').check(),
        'fields.11.required',
        true,
      )

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
      for (const invalid of [
        { step: 0 },
        { defaultValue: '1.25' },
        { type: 'unsupported-control' },
      ]) {
        const rejected = await page.request.patch(`/api/forms/${form.id}`, {
          headers: authHeaders,
          data: {
            _status: 'published',
            fields: form.fields.map((field: { name: string }) =>
              field.name === 'email' ? { ...field, ...invalid } : field,
            ),
          },
        })
        expect(rejected.status(), 'Invalid controls/rules/defaults must not publish').toBe(400)
      }

      for (const [name, invalid] of [
        ['visit_day', { minDate: '2026-02-30' }],
        ['visit_day', { defaultValue: '2026-10-19' }],
        ['phone', { minTime: '22:00', maxTime: '02:00' }],
        ['reminder', { required: true, defaultChecked: true }],
        ['supporting_documents', { maxFileSizeMB: 4 }],
        ['supporting_documents', { maxFiles: 6 }],
      ] as const) {
        const rejected = await page.request.patch(`/api/forms/${form.id}`, {
          headers: authHeaders,
          data: {
            _status: 'published',
            fields: form.fields.map((field: { name: string }) =>
              field.name === name ? { ...field, ...invalid } : field,
            ),
          },
        })
        expect(rejected.status(), 'Invalid temporal/switch rules must not publish').toBe(400)
      }

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
        visitor.setDefaultTimeout(20_000)
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
          await expect(visitor.getByLabel('Visit duration', { exact: true })).toHaveValue('1.5')
          await expect(visitor.getByLabel('Visit duration', { exact: true })).toHaveAttribute(
            'inputmode',
            'decimal',
          )
          await visitor.getByLabel('Reference link', { exact: true }).fill('example.com')
          await visitor.getByLabel('Visit duration', { exact: true }).fill('1.25')
          await visitor
            .getByRole('combobox', { name: 'Which department can help?', exact: true })
            .click()
          const menu = visitor.getByRole('listbox')
          await expect(menu).toBeVisible()
          expect(await menu.evaluate((element) => !!element.closest('section'))).toBe(true)
          await visitor.getByRole('option', { name: 'Admissions', exact: true }).click()
          await visitor.getByRole('checkbox', { name: 'You may contact me', exact: true }).check()
          await visitor.getByRole('button', { name: 'Submit', exact: true }).click()
          await expect(visitor.getByText(/Reference link must be a full/)).toBeVisible()
          await expect(
            visitor.getByText('Visit duration must use increments of 0.5 starting from 0.5.'),
          ).toBeVisible()
          await visitor
            .getByLabel('Reference link', { exact: true })
            .fill('https://example.com/visit')
          await visitor.getByLabel('Visit duration', { exact: true }).fill('1.50')
          await visitor
            .getByRole('radiogroup', { name: 'Enquiry route', exact: true })
            .getByRole('radio', { name: 'Admissions', exact: true })
            .check()
          const topics = visitor.getByRole('group', { name: 'Areas of interest', exact: true })
          await topics.getByRole('checkbox', { name: 'Admissions', exact: true }).check()
          await topics.getByRole('checkbox', { name: 'Library', exact: true }).check()
          const services = visitor.getByRole('combobox', { name: 'Services', exact: true })
          await expect(services).toHaveText('1 option selected')
          await services.click()
          await expect(visitor.getByRole('dialog', { name: 'Services' })).toBeVisible()
          expect(
            await visitor
              .getByRole('dialog', { name: 'Services' })
              .evaluate((element) => !!element.closest('section')),
          ).toBe(true)
          await visitor.getByRole('option', { name: 'Library, not selected', exact: true }).click()
          await visitor.keyboard.press('Escape')
          await expect(services).toHaveText('2 options selected')
          const consent = visitor.getByRole('dialog', { name: 'Cookie consent', exact: true })
          if (await consent.isVisible()) {
            await consent.getByRole('button', { name: /Reject/ }).click()
            await expect(consent).toBeHidden()
          }
          const uploadPromise = visitor.waitForResponse(
            (response) =>
              new URL(response.url()).pathname === `/api/forms/${form.slug}/attachments` &&
              response.request().method() === 'POST',
          )
          const fileBytes = Buffer.from('%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF')
          await visitor
            .getByLabel(/Supporting documents/)
            .setInputFiles({ name: 'résumé.pdf', mimeType: 'application/pdf', buffer: fileBytes })
          const uploaded = await uploadPromise
          expect(uploaded.ok(), `Upload ${uploaded.status()}: ${await uploaded.text()}`).toBe(true)
          const { file: uploadedFile } = await uploaded.json()
          await expect(visitor.getByText('Uploaded — ready to send')).toBeVisible()
          expect(
            await visitor.request
              .get(`/api/form-attachments?where[token][equals]=${uploadedFile.token}`)
              .then((response) => response.status()),
          ).toBe(403)
          const visitDate = visitor.getByLabel(/Visit date/)
          const visitTime = visitor.getByLabel(/Visit time/)
          const reminder = visitor.getByRole('switch', { name: 'Send me a reminder', exact: true })
          await expect(visitDate).toHaveValue('2026-10-22')
          await expect(visitDate).toHaveAttribute('min', '2026-10-20')
          await expect(visitTime).toHaveValue('10:30')
          await expect(visitTime).toHaveAttribute('max', '17:00')
          await expect(reminder).toBeChecked()
          await visitDate.fill('2026-10-19')
          await visitTime.fill('18:00')
          await reminder.uncheck()
          await visitor.getByRole('button', { name: 'Submit', exact: true }).click()
          await expect(
            visitor.getByText('Visit date must be 2026-10-20 or later.', { exact: true }),
          ).toBeVisible()
          await expect(
            visitor.getByText('Visit time must be 17:00 or earlier.', { exact: true }),
          ).toBeVisible()
          await expect(visitDate).toBeFocused()
          await visitDate.fill('2026-10-22')
          await visitTime.fill('10:30')
          // Publish after the visitor has loaded and answered the old revision.
          const changed = await page.request.patch(`/api/forms/${form.id}`, {
            headers: authHeaders,
            data: {
              _status: 'published',
              fields: form.fields.map((field: { name: string; options?: { value: string }[] }) =>
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
                    : field.name === 'email'
                      ? { ...field, step: 2, defaultValue: '2.5' }
                      : ['topics', 'services'].includes(field.name)
                        ? {
                            ...field,
                            maxSelections: 1,
                            options: field.options?.filter((option) => option.value !== 'library'),
                          }
                        : field.name === 'phone'
                          ? { ...field, minTime: '11:00', defaultValue: '12:00' }
                          : field.name === 'reminder'
                            ? { ...field, required: true, defaultChecked: false }
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
          await expect(visitor.getByLabel('Reference link', { exact: true })).toHaveValue(
            'https://example.com/visit',
          )
          await expect(visitor.getByLabel('Visit duration', { exact: true })).toHaveValue('')
          await visitor.getByLabel('Visit duration', { exact: true }).fill('2.50')
          await expect(
            visitor.getByRole('combobox', { name: 'Which department can help?', exact: true }),
          ).toHaveText('Admissions')
          await expect(
            visitor.getByRole('status').filter({ hasText: 'The questions have changed.' }),
          ).toContainText('Removed choices were cleared in: Areas of interest, Services')
          await expect(
            topics.getByRole('checkbox', { name: 'Admissions', exact: true }),
          ).toBeChecked()
          await expect(topics.getByRole('checkbox', { name: 'Library', exact: true })).toHaveCount(
            0,
          )
          await expect(services).toHaveText('1 option selected')
          await expect(visitDate).toHaveValue('2026-10-22')
          await expect(visitTime).toHaveValue('')
          await expect(reminder).not.toBeChecked()
          await visitTime.fill('11:00')
          await reminder.check()
          await expect(visitor.getByLabel('Contact preference', { exact: true })).toHaveValue('')
          await expect(
            visitor.getByText(
              /These answers were cleared because their questions changed: Your name, You may contact me, Visit duration, Visit time, Send me a reminder/,
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
          expect(docs[0].submitterPhone).toBeFalsy() // Time named phone is an ordinary answer.
          expect(docs[0].submitterEmail).toBeFalsy() // Number named email is an ordinary answer.
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
              expect.objectContaining({
                name: 'submitterEmail',
                type: 'radio',
                value: { raw: 'admissions' },
                displayValue: 'Admissions',
              }),
              expect.objectContaining({
                name: 'topics',
                type: 'checkboxGroup',
                value: { raw: ['admissions'] },
                displayValue: 'Admissions',
              }),
              expect.objectContaining({
                name: 'services',
                type: 'multiSelect',
                value: { raw: ['admissions'] },
                displayValue: 'Admissions',
              }),
              expect.objectContaining({
                name: 'visit_day',
                type: 'date',
                value: { raw: '2026-10-22' },
                displayValue: '2026-10-22',
              }),
              expect.objectContaining({
                name: 'phone',
                type: 'time',
                value: { raw: '11:00' },
                displayValue: '11:00',
              }),
              expect.objectContaining({
                name: 'reminder',
                type: 'switch',
                value: { raw: true },
                displayValue: 'Yes',
              }),
              expect.objectContaining({ name: 'visitor_full_name', value: { raw: 'Taylor' } }),
              expect.objectContaining({
                name: 'reference_link',
                type: 'url',
                displayValue: 'https://example.com/visit',
              }),
              expect.objectContaining({
                name: 'email',
                type: 'number',
                value: { raw: '2.50' },
                displayValue: '2.50',
              }),
              expect.objectContaining({
                name: 'contact_permission',
                value: { raw: 'Email is best' },
              }),
            ]),
          )

          expect(docs[0].attachments).toEqual([
            expect.objectContaining({
              filename: 'résumé.pdf',
              token: uploadedFile.token,
              fieldName: 'supporting_documents',
            }),
          ])
          expect(docs[0].answers).toContainEqual(
            expect.objectContaining({
              name: 'supporting_documents',
              type: 'file',
              displayValue: 'résumé.pdf',
              value: { raw: [uploadedFile.token] },
            }),
          )
          const downloadURL = `/api/form-submissions/${docs[0].id}/attachments/${uploadedFile.token}`
          expect((await visitor.request.get(downloadURL)).status()).toBe(404)
          const downloaded = await page.request.get(downloadURL, { headers: authHeaders })
          expect(downloaded.status()).toBe(200)
          expect(await downloaded.body()).toEqual(fileBytes)
          expect(downloaded.headers()['content-disposition']).toContain('attachment;')
          await page.goto(`/admin/collections/form-submissions/${docs[0].id}`, {
            waitUntil: 'domcontentloaded',
          })
          await expect(
            page.getByRole('link', { name: 'Download file', exact: true }),
          ).toHaveAttribute('href', downloadURL)

          await page
            .getByRole('link', { name: 'Download file', exact: true })
            .scrollIntoViewIfNeeded()
          await page.screenshot({ path: testInfo.outputPath('private-attachment-admin.png') })
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
          await expect(page.getByLabel(/Supporting documents/)).toBeDisabled()
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
