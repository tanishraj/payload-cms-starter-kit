# Forms Guide

## What This Section Is

`Forms` is where you define reusable public forms that can be placed on website pages. A form controls what fields the visitor sees, what success message they get, who is notified internally, and how the submission should be operated after it is received.

In North Valley Medical College, this is the section you would use for forms such as `Admission Enquiry`, `Request Prospectus`, or `Student Experience Review`.

## When To Use It

Use `Forms` when you need to:

- collect information from website visitors
- place a reusable form block onto a page
- decide whether submissions behave like general enquiries, leads, or review intake
- notify internal staff when a valid submission arrives

Do not use `Forms` to manage the received entries themselves. That belongs in `Form Submissions`.

## How It Connects To The Website

Forms connect directly to the frontend. A published form definition can be inserted into a page layout, and the public website submits data through the live form endpoint for that form slug.

This section also controls downstream operations:

- `submissionIntent` decides whether the submission is handled as general intake, a lead, or a review
- notification recipients receive internal alerts when valid submissions arrive
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
9. Add fields such as `full_name`, `email`, `phone`, `program_interest`, and `message`.
10. Mark the required fields clearly.
11. Save the form and publish it.
12. Open the page where this form should appear, add the form block, and select `Admission Enquiry`.

Expected website result:

- visitors can submit an admissions enquiry from the public page
- the CMS stores the submission automatically
- the admissions team can review it in `Form Submissions`

## Best Practices

- keep field names machine-safe and stable because they are used in stored submission data
- use clear labels that non-technical operators can understand later
- choose the correct `submissionIntent` before launch because it affects downstream handling
- keep success messages short and reassuring
- add notification recipients only when someone is expected to monitor them

## Common Mistakes And Recovery

- building a form but forgetting to place it on a page
- using vague field names that make submission data hard to understand later
- choosing `General` when the form should really be treated as a lead workflow
- publishing a review-intent form without checking that the required review fields are included

If submissions are not behaving as expected, first review the form field definitions, `submissionIntent`, and notification recipients. Then submit a real frontend test entry and inspect the result in `Form Submissions`.

## Related Guides

- [Pages](./pages.md)
- [Form Submissions](./form-submissions.md)
- [Reviews](./reviews.md)
- [Work Queue](./work-queue.md)
