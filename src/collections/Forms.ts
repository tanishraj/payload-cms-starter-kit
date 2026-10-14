import { requireFormAttachmentStorage } from '@/hooks/requireFormAttachmentStorage'
import { formFileTypeOptions } from '@/lib/formAttachments'
import { type CollectionConfig } from 'payload'

import {
  allowPublishedReadOrFeature,
  deleteFeatureOrAdmin,
  featureFieldReadAccess,
  hideUnlessFeature,
  requireFeature,
} from '@/access/featureAccess'
import { projectSlugField } from '@/fields/projectSlugField'
import { revalidateDeletedFormCache, revalidateGlobalsCache } from '@/hooks/revalidateCmsContent'
import {
  FORM_MAX_FIELDS,
  FORM_MAX_SINGLE_LINE_LENGTH,
  FORM_MAX_TEXTAREA_LENGTH,
  supportsFormTextLimits,
  formFieldTypeOptions,
  formSubmissionIntentOptions,
  isTextLikeFormFieldType,
  isMultipleChoiceFormFieldType,
  isBooleanFormFieldType,
  isSelectFormFieldType,
  isValidFormFieldName,
  validateFormFieldDefinitionsForIntent,
} from '@/lib/forms'

export const Forms: CollectionConfig = {
  slug: 'forms',
  labels: {
    singular: 'Form',
    plural: 'Forms',
  },
  admin: {
    group: 'Forms',
    hidden: hideUnlessFeature('forms'),
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    description: 'Reusable form definitions that can be placed on pages.',
    listSearchableFields: ['title', 'slug'],
  },
  access: {
    create: requireFeature('forms'),
    delete: deleteFeatureOrAdmin('forms'),
    read: allowPublishedReadOrFeature('forms'),
    readVersions: requireFeature('forms'),
    update: requireFeature('forms'),
  },
  versions: {
    drafts: true,
  },
  hooks: {
    beforeChange: [requireFormAttachmentStorage],
    afterChange: [revalidateGlobalsCache],
    afterDelete: [revalidateDeletedFormCache],
  },
  timestamps: true,
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    projectSlugField({
      useAsSlug: 'title',
    }),
    {
      name: 'internalNotes',
      label: 'Internal Notes',
      type: 'textarea',
      access: {
        read: featureFieldReadAccess('forms'),
      },
      admin: {
        description: 'Optional notes for editors. This is not shown on the website.',
      },
    },
    {
      name: 'submissionIntent',
      type: 'select',
      defaultValue: 'general',
      options: [...formSubmissionIntentOptions],
      required: true,
      admin: {
        description:
          'Controls how submissions are operated after intake and whether review promotion applies.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'submitButtonLabel',
          type: 'text',
          required: true,
          defaultValue: 'Submit',
          admin: {
            width: '50%',
          },
        },
        {
          name: 'successMessage',
          type: 'textarea',
          required: true,
          defaultValue: 'Thanks. Your submission has been received.',
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'notificationRecipients',
      label: 'Notification Recipients',
      type: 'array',
      access: {
        read: featureFieldReadAccess('forms'),
      },
      labels: {
        singular: 'Recipient',
        plural: 'Recipients',
      },
      admin: {
        description:
          'Optional internal email recipients who should be notified when this form receives a valid submission.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'email',
          type: 'email',
          required: true,
        },
      ],
    },
    {
      name: 'submitterReply',
      label: 'Submitter Confirmation',
      type: 'group',
      admin: {
        description:
          'Optional confirmation email sent automatically to the person who submitted the form.',
      },
      fields: [
        {
          name: 'enabled',
          label: 'Send confirmation email to submitter',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'subject',
          label: 'Subject',
          type: 'text',
          defaultValue: 'Thanks for getting in touch',
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.enabled),
          },
        },
        {
          name: 'message',
          label: 'Message body',
          type: 'textarea',
          defaultValue: 'We have received your message and will be in touch shortly.',
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.enabled),
            description: 'Plain text shown in the confirmation email.',
          },
        },
      ],
    },
    {
      name: 'fields',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: FORM_MAX_FIELDS,
      validate: (value, { data }) =>
        validateFormFieldDefinitionsForIntent({
          fields: value,
          submissionIntent: (data as { submissionIntent?: unknown }).submissionIntent,
        }),
      labels: {
        singular: 'Field',
        plural: 'Fields',
      },
      admin: {
        description:
          'Generic Form and Contact Cards & Form render these questions. Edit existing rows to preserve question identity when relabelling, renaming or reordering; deleting and recreating a row creates a new question. Visitors review published changes before resubmitting. Review Submission has fixed questions and does not support these presentation settings.',
        initCollapsed: false,
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
              admin: {
                description:
                  'Unique key stored with answers, such as preferred_department. Renaming changes future answer keys and may require updates to external mappings; original submissions retain their keys. Start with a letter; use letters, numbers and underscores. The names constructor, prototype and website are reserved.',
                width: '50%',
              },
              validate: (value: unknown) => {
                if (typeof value !== 'string' || !value.trim()) {
                  return 'Field name is required.'
                }

                return isValidFormFieldName(value.trim())
                  ? true
                  : 'Names must start with a letter and use only letters, numbers and underscores. Do not use constructor, prototype or website.'
              },
            },
            {
              name: 'label',
              type: 'text',
              required: true,
              admin: {
                width: '50%',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'type',
              type: 'select',
              required: true,
              options: [...formFieldTypeOptions],
              defaultValue: 'text',
              admin: {
                width: '50%',
              },
            },
            {
              name: 'required',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                width: '50%',
              },
            },
          ],
        },
        {
          name: 'contactRole',
          label: 'Use answer as',
          type: 'select',
          options: [
            { label: 'Submitter name', value: 'name' },
            { label: 'Submitter email', value: 'email' },
            { label: 'Submitter phone', value: 'phone' },
          ],
          admin: {
            isClearable: true,
            description:
              'Optional: use this answer for inbox contact details and confirmation emails. Each role can be assigned once; choose Text for name, Email for email, or Phone for phone. Leave empty for ordinary questions.',
          },
        },
        {
          name: 'placeholder',
          type: 'text',
          admin: {
            condition: (_, siblingData) => isTextLikeFormFieldType(siblingData?.type ?? 'text'),
          },
        },
        {
          name: 'helpText',
          label: 'Help text',
          type: 'textarea',
          maxLength: 1_000,
          admin: {
            condition: (data, siblingData) =>
              data?.submissionIntent !== 'review' || Boolean(siblingData?.helpText),
            description:
              'Optional instructions below this question. Keep the label meaningful; help text is not a placeholder.',
          },
        },
        {
          name: 'defaultValue',
          label: 'Initial answer',
          type: 'textarea',
          admin: {
            condition: (data, siblingData) =>
              siblingData?.type !== 'file' &&
              !isBooleanFormFieldType(siblingData?.type) &&
              !isMultipleChoiceFormFieldType(siblingData?.type) &&
              (data?.submissionIntent !== 'review' || Boolean(siblingData?.defaultValue)),
            description:
              'Optional starting answer for new responses. For Select or Radio, enter an option value, not its label. Must satisfy this question’s validation. Visitors can change or clear it; the server never supplies omitted answers.',
          },
        },
        {
          name: 'allowedFileTypes',
          label: 'Allowed file formats',
          type: 'select',
          hasMany: true,
          defaultValue: ['pdf', 'docx', 'png', 'jpg'],
          options: formFileTypeOptions.map(({ label, value }) => ({ label, value })),
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'file',
            description:
              'Leave unset for PDF, DOCX, PNG and JPEG. Server checks file content as well as extension. Files are private attachments, never public Media.',
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'maxFileSizeMB',
              label: 'Maximum size per file (MB)',
              type: 'number',
              min: 1,
              max: 3,
              admin: {
                condition: (_, siblingData) => siblingData?.type === 'file',
                width: '50%',
                description:
                  'Whole number 1–3. Default 3 MB. The bound keeps uploads below hosted request limits.',
              },
            },
            {
              name: 'maxFiles',
              label: 'Maximum files',
              type: 'number',
              min: 1,
              max: 5,
              admin: {
                condition: (_, siblingData) => siblingData?.type === 'file',
                width: '50%',
                description:
                  'Whole number 1–5. Default one file. A response may attach at most ten files across all questions.',
              },
            },
          ],
        },
        {
          name: 'defaultSelections',
          label: 'Initial selections',
          type: 'array',
          maxRows: 100,
          labels: { singular: 'Selection', plural: 'Selections' },
          admin: {
            condition: (_, siblingData) => isMultipleChoiceFormFieldType(siblingData?.type),
            description:
              'Optional starting choices for new responses. Enter option values, not labels; each value must be unique and still exist. Leave empty to let visitors choose. These values never refill answers after question-change recovery.',
          },
          fields: [{ name: 'value', type: 'text', required: true }],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'minSelections',
              label: 'Minimum selections',
              type: 'number',
              min: 0,
              admin: {
                width: '50%',
                step: 1,
                condition: (_, siblingData) => isMultipleChoiceFormFieldType(siblingData?.type),
                description:
                  'Optional minimum number of choices. Required questions need at least one even when this is zero. A new form may start empty; visitors must satisfy this rule before submitting.',
              },
            },
            {
              name: 'maxSelections',
              label: 'Maximum selections',
              type: 'number',
              min: 1,
              admin: {
                width: '50%',
                step: 1,
                condition: (_, siblingData) => isMultipleChoiceFormFieldType(siblingData?.type),
                description:
                  'Optional maximum number of choices, no greater than the available options. Leave blank to allow all options. Limits must be whole numbers; minimum cannot exceed maximum.',
              },
            },
          ],
        },
        {
          name: 'defaultChecked',
          label: 'Initially checked',
          type: 'checkbox',
          admin: {
            condition: (data, siblingData) =>
              isBooleanFormFieldType(siblingData?.type) &&
              (data?.submissionIntent !== 'review' || siblingData?.defaultChecked === true),
            description:
              'Optional checkboxes and switches only. Required acceptance questions must start unchecked/off so visitors make their own choice.',
          },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'minLength',
              label: 'Minimum characters',
              type: 'number',
              min: 0,
              admin: {
                width: '50%',
                step: 1,
                condition: (data, siblingData) =>
                  supportsFormTextLimits(siblingData?.type) &&
                  (data?.submissionIntent !== 'review' || siblingData?.minLength != null),
                description:
                  'Text and Textarea only. Blank optional answers remain valid. Spaces at the start/end are trimmed before counting.',
              },
            },
            {
              name: 'maxLength',
              label: 'Maximum characters',
              type: 'number',
              min: 1,
              admin: {
                width: '50%',
                step: 1,
                condition: (data, siblingData) =>
                  supportsFormTextLimits(siblingData?.type) &&
                  (data?.submissionIntent !== 'review' || siblingData?.maxLength != null),
                description: `Leave blank for the built-in cap: Text ${FORM_MAX_SINGLE_LINE_LENGTH}, Textarea ${FORM_MAX_TEXTAREA_LENGTH}. Settings are retained but inactive if you change to another control type.`,
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'minValue',
              label: 'Minimum value',
              type: 'number',
              admin: {
                width: '33%',
                step: 0.1,
                condition: (data, siblingData) =>
                  siblingData?.type === 'number' &&
                  (data?.submissionIntent !== 'review' || siblingData?.minValue != null),
                description:
                  'Number only. Optional inclusive lower limit; negative and decimal values are allowed.',
              },
            },
            {
              name: 'maxValue',
              label: 'Maximum value',
              type: 'number',
              admin: {
                width: '33%',
                step: 0.1,
                condition: (data, siblingData) =>
                  siblingData?.type === 'number' &&
                  (data?.submissionIntent !== 'review' || siblingData?.maxValue != null),
                description:
                  'Number only. Optional inclusive upper limit, no smaller than the minimum. Whole-number settings must be within ±9,007,199,254,740,991.',
              },
            },
            {
              name: 'step',
              label: 'Allowed increment',
              type: 'number',
              min: 0,
              admin: {
                width: '33%',
                step: 0.1,
                condition: (data, siblingData) =>
                  siblingData?.type === 'number' &&
                  (data?.submissionIntent !== 'review' || siblingData?.step != null),
                description:
                  'Optional positive increment: 1 for unit steps, 0.5 for half-unit steps. Starts at the minimum, or zero if no minimum is set. Leave blank to allow any decimal value. Numeric settings are retained but inactive on other types.',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'minDate',
              label: 'Earliest date',
              type: 'text',
              maxLength: 10,
              admin: {
                width: '50%',
                condition: (_, siblingData) => siblingData?.type === 'date',
                description:
                  'Optional inclusive bound in YYYY-MM-DD format. Calendar date only; no timezone conversion. Years 0001–9999. Leave blank for no bound. Stored settings are inactive on other types.',
              },
            },
            {
              name: 'maxDate',
              label: 'Latest date',
              type: 'text',
              maxLength: 10,
              admin: {
                width: '50%',
                condition: (_, siblingData) => siblingData?.type === 'date',
                description:
                  'Optional inclusive bound in YYYY-MM-DD format. Calendar date only; no timezone conversion. Years 0001–9999. Leave blank for no bound. Stored settings are inactive on other types.',
              },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'minTime',
              label: 'Earliest time',
              type: 'text',
              maxLength: 5,
              admin: {
                width: '50%',
                condition: (_, siblingData) => siblingData?.type === 'time',
                description:
                  'Optional inclusive bound in HH:mm format. Local 24-hour time, 00:00–23:59; no timezone conversion. Limits must describe one same-day window. Leave blank for no bound. Stored settings are inactive on other types.',
              },
            },
            {
              name: 'maxTime',
              label: 'Latest time',
              type: 'text',
              maxLength: 5,
              admin: {
                width: '50%',
                condition: (_, siblingData) => siblingData?.type === 'time',
                description:
                  'Optional inclusive bound in HH:mm format. Local 24-hour time, 00:00–23:59; no timezone conversion. Limits must describe one same-day window. Leave blank for no bound. Stored settings are inactive on other types.',
              },
            },
          ],
        },
        {
          name: 'options',
          type: 'array',
          labels: {
            singular: 'Option',
            plural: 'Options',
          },
          admin: {
            initCollapsed: false,
            condition: (_, siblingData) => isSelectFormFieldType(siblingData?.type),
            description:
              'Edit or reorder existing options to keep their row identity. Changing a value clears that selected answer during refresh; changing only the label keeps a still-valid value. Historical submissions retain the original label and value.',
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'value',
                  type: 'text',
                  required: true,
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
