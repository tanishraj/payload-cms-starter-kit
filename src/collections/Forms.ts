import { formEndpoints } from '@/endpoints/formEndpoints'
import { requireFormAttachmentStorage } from '@/hooks/requireFormAttachmentStorage'
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
import { FORM_MAX_FIELDS, formSubmissionIntentOptions } from '@/lib/forms'
import { formQuestionFields } from '@/fields/formQuestionFields'
import { FORM_MAX_LAYOUT_ENTRIES, validateFormEntries } from '@/lib/formLayout'
import type { Field } from 'payload'

// Keep legacy question paths. Only top-level question controls need the entry selector.
const topLevelQuestionFields: Field[] = formQuestionFields.map(function decorate(field): Field {
  if (field.type === 'row') return { ...field, fields: field.fields.map(decorate) }
  const condition = field.admin?.condition
  const question = (_: unknown, sibling: Record<string, unknown>) =>
    sibling?.entryType == null || sibling.entryType === 'question'
  const result = {
    ...field,
    admin: {
      ...field.admin,
      condition: (data, sibling, context) =>
        question(data, sibling) && (!condition || condition(data, sibling, context)),
    },
  } as Field
  // Display rows have no answer name/label/type. Parent validation enforces all question requirements.
  if ('name' in result && ['name', 'label', 'type'].includes(result.name ?? '')) {
    if ('required' in result) result.required = false
    if (result.type === 'text' && !result.hasMany && result.name === 'name') {
      const validate = result.validate
      result.validate = (value, context) =>
        question(context.data, context.siblingData) ? (validate?.(value, context) ?? true) : true
    }
  }
  return result
})

export const Forms: CollectionConfig = {
  slug: 'forms',
  endpoints: formEndpoints,
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
      maxRows: FORM_MAX_LAYOUT_ENTRIES,
      validate: (value, { data }) =>
        validateFormEntries(value, (data as { submissionIntent?: unknown }).submissionIntent),
      labels: {
        singular: 'Entry',
        plural: 'Entries',
      },
      admin: {
        description:
          'Generic Form and Contact Cards & Form render this ordered list of questions and display entries. Add a Question group for related questions; headings, descriptions and separators do not collect answers. Edit existing rows to preserve question identity when relabelling, renaming or reordering; deleting and recreating a row creates a new question. Visitors review published changes before resubmitting. Review Submission has fixed questions and does not support these presentation settings.',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'entryType',
          label: 'Entry',
          type: 'select',
          defaultValue: 'question',
          options: [
            { label: 'Question', value: 'question' },
            { label: 'Heading', value: 'heading' },
            { label: 'Description', value: 'description' },
            { label: 'Separator', value: 'separator' },
            { label: 'Question group', value: 'group' },
          ],
          admin: {
            description:
              'Choose a question or a display entry. Groups contain questions, with one shared label and optional description.',
          },
        },
        ...topLevelQuestionFields,
        {
          name: 'displayText',
          label: 'Display text / group label',
          type: 'textarea',
          maxLength: 2000,
          admin: {
            condition: (_, sibling) =>
              ['heading', 'description', 'group'].includes(sibling?.entryType),
            description:
              'Plain text. Heading/group label: 200 characters; description: 2,000. Display entries are never stored as answers.',
          },
        },
        {
          name: 'groupDescription',
          label: 'Group description',
          type: 'textarea',
          maxLength: 2000,
          admin: { condition: (_, sibling) => sibling?.entryType === 'group' },
        },
        {
          name: 'questions',
          label: 'Group questions',
          type: 'array',
          maxRows: FORM_MAX_FIELDS,
          labels: { singular: 'Question', plural: 'Questions' },
          admin: {
            initCollapsed: false,
            condition: (_, sibling) => sibling?.entryType === 'group',
            description:
              'Add or reorder questions in this group. Names and IDs must be unique across the whole form. A form supports up to 100 questions in total. Edit existing rows to retain identity; recreating a question gives it a new identity.',
          },
          fields: formQuestionFields,
        },
      ],
    },
  ],
}
