import {
  slugField,
  type CollectionConfig,
} from 'payload'

import {
  allowPublicReadOrCapability,
  hideFromUsersWithoutCapability,
  requireCapability,
} from '@/access/adminCapabilities'
import {
  formFieldTypeOptions,
  isTextLikeFormFieldType,
  isValidFormFieldName,
  validateFormFieldDefinitions,
} from '@/lib/forms'

export const Forms: CollectionConfig = {
  slug: 'forms',
  labels: {
    singular: 'Form',
    plural: 'Forms',
  },
  admin: {
    group: 'Forms',
    hidden: hideFromUsersWithoutCapability('manage_forms'),
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    description: 'Reusable form definitions that can be placed on pages.',
    listSearchableFields: ['title', 'slug'],
  },
  access: {
    create: requireCapability('manage_forms'),
    delete: requireCapability('manage_forms'),
    read: allowPublicReadOrCapability('manage_forms'),
    readVersions: requireCapability('manage_forms'),
    update: requireCapability('manage_forms'),
  },
  versions: {
    drafts: true,
  },
  timestamps: true,
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField({
      useAsSlug: 'title',
    }),
    {
      name: 'internalNotes',
      label: 'Internal Notes',
      type: 'textarea',
      admin: {
        description: 'Optional notes for editors. This is not shown on the website.',
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
      name: 'fields',
      type: 'array',
      required: true,
      minRows: 1,
      validate: validateFormFieldDefinitions,
      labels: {
        singular: 'Field',
        plural: 'Fields',
      },
      admin: {
        initCollapsed: true,
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
                description: 'Machine key used in stored submission data.',
                width: '50%',
              },
              validate: (value: unknown) => {
                if (typeof value !== 'string' || !value.trim()) {
                  return 'Field name is required.'
                }

                return isValidFormFieldName(value.trim())
                  ? true
                  : 'Use only letters, numbers, and underscores. Names must start with a letter.'
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
          name: 'placeholder',
          type: 'text',
          admin: {
            condition: (_, siblingData) => isTextLikeFormFieldType(siblingData?.type ?? 'text'),
          },
        },
        {
          name: 'options',
          type: 'array',
          labels: {
            singular: 'Option',
            plural: 'Options',
          },
          admin: {
            initCollapsed: true,
            condition: (_, siblingData) => siblingData?.type === 'select',
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
