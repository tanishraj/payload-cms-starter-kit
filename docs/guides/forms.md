# Forms Guide

## What This Section Is

`Forms` defines public form schemas, success copy, notification recipients, intent, and optional submitter confirmation. Pages expose these through `Generic Form`, the fixed-layout `Contact Form`, and `Review Submission` blocks. A form block owns its presentation; its selected reusable Form owns the questions. You can edit that Form through Payload’s relationship drawer without leaving the Page.

In North Valley Medical College, this is the section you would use for forms such as `Admission Enquiry`, `Request Prospectus`, or `Student Experience Review`.

## When To Use It

Use `Forms` when you need to:

- collect information from website visitors
- configure a reusable Form selected by Generic Form, Contact Form or Review Submission
- decide whether submissions behave like general enquiries, leads, or review intake
- notify internal staff when a valid submission arrives

Do not use `Forms` to manage the received entries themselves. That belongs in `Form Submissions`.

## How It Connects To The Website

Only published Forms are loaded by `POST /api/forms/[slug]/submit`. Contact Form accepts a general/lead Form with the expected `name` text, `email` email, `subject` select, and `message` textarea fields. It also renders an optional field named `phone` when that field uses the Phone type; editors may make it required. Existing Contact Forms without `phone` remain valid. Review Submission accepts review-intent Forms and its fixed review field names; the CMS rejects additional required fields that the block cannot render.

This section also controls downstream operations:

- `submissionIntent` decides whether the submission is handled as general intake, a lead, or a review
- notification recipients receive responsive branded alerts with readable dates in the Site Identity timezone when valid submissions arrive
- form fields define what data is stored in `Form Submissions`
- review-intent forms can automatically create or update a linked draft in `Reviews`

If a form is misconfigured, the website may show the wrong questions, reject valid submissions, or send incomplete data into your intake workflow.

## Step-By-Step Medical College Example

Create an `Admission Enquiry` form for North Valley Medical College:

1. Open `Forms`.
2. Click `Create New`.
3. Enter the title `Admission Enquiry`.
4. Confirm the slug is clear and stable, such as `admission-enquiry`.
5. Set `Submission Intent` to `Lead`.
6. Set the submit button label to `Request a Call Back`.
7. Write a success message such as `Thanks. Our admissions team will contact you shortly.`
8. Add one or more notification recipients from the admissions office.
9. Add the Contact Form fields `name` (Text), `email` (Email), `subject` (Select), and `message` (Textarea).
10. To collect a telephone number, add `phone`, choose the Phone type, and configure its label, placeholder, and required state.
11. Save the form and publish it.
12. Ensure the schema matches Contact Form, then add that block to a Page and select `Admission Enquiry`.

Expected website result:

- visitors can submit an admissions enquiry from the public page
- the CMS stores the submission automatically
- the admissions team can review it in `Form Submissions`

## Submitter Confirmation Email

Each form can optionally send an automatic confirmation email to the person who submitted it. Enable this under **Submitter Confirmation** when the visitor should receive an immediate acknowledgment.

To configure it:

1. Open the form.
2. Expand the **Submitter Confirmation** section.
3. Turn on `Send confirmation email to submitter`.
4. Enter an email subject such as `We have received your enquiry`.
5. Write a plain-text message body confirming receipt and next steps.
6. Save and publish the form.

Choose **Use answer as → Submitter email** on one Email field to use a custom
name such as `work_email` for inbox contact details and confirmation delivery.
Similarly, one Text field may supply the submitter name and one Phone field may
supply the submitter phone. Labels and machine names stay configurable. Each role
may be assigned once, and the CMS validates its control type. Leave ordinary
questions unassigned. An explicitly mapped but empty answer does not fall back to
a different email field.

Without an explicit role, the CMS looks for a submitted email using the normalized keys `submitterEmail`, then `reviewerEmail`, then `email`. If none exists, no confirmation is sent even when enabled. Internal notifications and submitter confirmations share the same responsive email shell branded with Site Identity.

## Submission History

New submissions retain the published intake definition, its content fingerprint,
and read-only original questions/answers. A select answer includes its original
option label; a checkbox reads Yes/No. Form labels, names, order and options can
later change without rewriting those captured answers. Payload field-row IDs
identify fields where present; names are not treated as immutable identity.

This is a submission-history foundation, not a generic public form presentation.
The existing Contact Form and Review Submission field restrictions above still
apply. Assign contact roles only to fields the selected presentation actually
collects. A visitor currently submits against the latest published definition;
client revision negotiation and stale-form recovery are not implemented yet.
Older submissions keep their original raw data and are not retroactively labelled
using today's schema. No database migration/backfill is required for these optional
history fields. See [Form Submissions](./form-submissions.md).

## Spam Protection And Failure Handling

- the submission endpoint accepts `application/json` (including parameters such as `charset=utf-8`) and rejects request bodies larger than 256 KiB
- each schema/submission may contain at most 100 question/answer keys (the transport-only website honeypot is excluded); email fields allow 320 characters, text fields allow 500, and textarea fields allow 10,000
- campaign and source metadata allow 500 characters, landing-page metadata allows 2,048, and unrecognized metadata keys are discarded
- the hidden honeypot key is `website`; suspected bots receive a neutral success response
- the built-in limiter allows five attempts per IP and form slug per ten minutes
- the limiter is bounded and periodically pruned, but remains an in-memory, single-application-instance defense-in-depth control rather than a durable distributed rate limiter
- client forwarding headers are used for limiter identity only on the documented Vercel deployment, where the platform owns those headers; the first normalized address is length-capped before it becomes a limiter key
- every rate-limited response includes `Retry-After` so clients know when to try again
- required, email, phone, select-option, and checkbox-acceptance rules come from the Form schema
- undeclared answer keys and malformed text/select/checkbox values are rejected instead of silently discarded or coerced; review submissions separately validate their known fixed fields
- Text, Email, Phone, Textarea and Select answers must be strings; Checkbox answers should be booleans (known legacy HTML encodings are also accepted)
- phone values preserve their readable formatting, allow common international punctuation, and must contain 7 to 15 digits
- notification, confirmation, downstream-event, and review-promotion failures are logged without changing a successful visitor response after the submission is stored

Production deployments should enforce coordinated limits at Vercel WAF or through a durable shared store. Review `/api/search`, `/api/forms/*/submit`, `/api/review-feed`, `/api/news-events-tabs`, `/api/calendar-events`, Payload login, and Payload password endpoints when defining that policy. The repository's in-memory form and search limiters do not coordinate across processes, regions, or instances.

## Best Practices

- use unique machine-safe names: start with a letter, followed by letters, numbers or underscores; constructor, prototype and website are reserved
- keep names stable because they are used in stored submission data; an older definition using a newly reserved name must be renamed before saving
- preview the new generic six-control presentation in [Storybook](../operations/storybook.md#generic-form-workshop); it is not yet a selectable public block
- use clear labels that non-technical operators can understand later
- use the exact field name `phone` with the Phone type when the Contact Form should collect a number
- keep phone collection on general or lead Contact Forms; Review Submission intentionally does not request it
- choose the correct `submissionIntent` before launch because it affects downstream handling
- keep success messages short and reassuring
- add notification recipients only when someone is expected to monitor them
- write confirmation email messages in plain language that reassures the submitter about next steps

## Common Mistakes And Recovery

- selecting a Form whose fields do not match Contact Form or Review Submission
- using vague field names that make submission data hard to understand later
- choosing `General` when the form should really be treated as a lead workflow
- publishing a review-intent form without checking that the required review fields are included

If submissions are not behaving as expected, first review the form field definitions, `submissionIntent`, and notification recipients. Then submit a real frontend test entry and inspect the result in `Form Submissions`.

## Related Guides

- [Pages](./pages.md)
- [Form Submissions](./form-submissions.md)
- [Reviews](./reviews.md)
- [Work Queue](./work-queue.md)

## Build a form with your own questions

1. Open **Forms**, create a definition, and choose General or Lead intent.
2. Add controls with your labels and machine names. For example, add Text
   `visitor_name`, required Select `preferred_department` labelled “Which department
   can help?”, and Checkbox `contact_permission`. Enter each select option’s label
   and stored value. Field and option rows open ready to edit.
3. Set the submit label and confirmation message, then explicitly publish the Form.
4. In a Page, add **Generic Form** from **Advanced Library**, select that Form,
   and set the heading, description and section padding. Save and inspect Live Preview.
5. Publish the Page to accept responses. Review original questions and readable
   answers under **Form Submissions**, subject to your feature access.

Text, Email, Phone, Textarea, Select and Checkbox work with arbitrary valid custom
machine names. Names must be unique, begin with a letter, and contain only letters,
numbers or underscores; `website`, `constructor` and `prototype` are reserved.
Adding more control types needs shared renderer and validation support; it is not
arbitrary HTML input code. General/Lead definitions can be shared by multiple blocks.
Review-intent Forms retain their dedicated workflow.

The block uses shared website theme tokens and upstream components; there is no
form-specific palette or stylesheet. Storybook retains the selected Neutral workshop
foundation. Live Preview shows disabled controls and never sends requests to intake.
Public pages always load the selected published Form. Saving a Form draft does not
change live questions; publishing shared changes affects every use. Missing,
unpublished, invalid or review-only definitions show an unavailable message.

Required/options/type checks share the server validator. The public adapter posts
to `/api/forms/[slug]/submit`, includes the current landing page, disables duplicate
clicks while pending, and displays server confirmation only after acceptance. Network
or server failures retain answers and report an unconfirmed result. Retry is manual;
server idempotency and stale-client revision handling remain pending. A response lost
after persistence can still make a deliberate retry create another submission.

The same engine powers the sourced Shadcnblocks `contact6` layout:
the layout can differ while editors choose a reusable schema rather than inheriting
hard-coded example questions. Contact6 is available as **Contact Cards & Form** in Advanced Library, Pages, Reusable Sections and detail templates. Select a published General/Lead Form; use the native relationship drawer to create or edit it. Configure contact cards, message-card introduction and office hours on the block. The first two short questions share a row on wider screens; a textarea/checkbox in that pair keeps both stacked. Remaining questions fill the form width. Question order, names, labels and required state belong to the reusable Form. Publishing that Form updates all blocks selecting it; draft-only edits stay out of public pages. Public controls become active after JavaScript is ready; an early click cannot send answers through the URL. Live Preview disables all controls. An unavailable Form still leaves the alternative contact cards visible.
