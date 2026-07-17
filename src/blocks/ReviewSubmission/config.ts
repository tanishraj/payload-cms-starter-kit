import type { ArrayField, Block, SelectField, TabsField } from 'payload'

import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'

const sizeField = {
  name: 'size',
  label: 'Size',
  type: 'select',
  defaultValue: 'default',
  options: [
    { label: 'Compact', value: 'compact' },
    { label: 'Default', value: 'default' },
    { label: 'Comfortable', value: 'comfortable' },
  ],
  required: true,
} satisfies SelectField

const benefitsField = {
  name: 'benefits',
  label: 'Benefits',
  type: 'array',
  admin: {
    initCollapsed: true,
  },
  fields: [
    {
      name: 'text',
      type: 'text',
      required: true,
    },
  ],
} satisfies ArrayField

export const ReviewSubmissionBlock: Block = {
  slug: 'reviewSubmission',
  interfaceName: 'ReviewSubmissionBlock',
  labels: {
    singular: 'Review Submission',
    plural: 'Review Submissions',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'eyebrow',
              type: 'text',
            },
            {
              name: 'heading',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
            },
            benefitsField,
            {
              name: 'form',
              label: 'Review Form',
              type: 'relationship',
              relationTo: 'forms',
              required: true,
              filterOptions: {
                submissionIntent: {
                  equals: 'review',
                },
              },
              admin: {
                description:
                  'Select a review-intent form. Use rating, reviewerName, reviewerEmail, reviewBody, and an optional subjectLabel select field; subjectLabel options become the topic chips. Review titles are generated from the submitted review.',
              },
            },
            {
              name: 'formHeading',
              type: 'text',
            },
            {
              name: 'formEyebrow',
              type: 'text',
            },
            {
              name: 'formDescription',
              type: 'textarea',
            },
          ],
        },
        {
          label: 'Layout & Theme',
          fields: [createBlockAppearanceFields({ includeTextOverride: false }), sizeField],
        },
      ],
    } satisfies TabsField,
  ],
}
