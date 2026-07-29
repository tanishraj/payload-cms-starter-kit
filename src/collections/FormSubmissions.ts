import type { CollectionConfig } from 'payload'

import {
  hideFromUsersWithoutCapability,
  requireCapability,
} from '@/access/adminCapabilities'
import { syncFormSubmissionToWorkQueue } from '@/hooks/syncFormSubmissionToWorkQueue'
import { updateFormSubmissionActivity } from '@/hooks/updateFormSubmissionActivity'
import { formSubmissionIntentOptions } from '@/lib/forms'

export const FormSubmissions: CollectionConfig = {
  slug: 'form-submissions',
  labels: {
    singular: 'Form Submission',
    plural: 'Form Submissions',
  },
  admin: {
    group: 'Lead Management',
    hidden: hideFromUsersWithoutCapability('manage_form_submissions'),
    useAsTitle: 'submitterEmail',
    defaultColumns: [
      'status',
      'owner',
      'submissionIntent',
      'submitterName',
      'submitterEmail',
      'submittedAt',
      'lastActionAt',
    ],
    description:
      'Stored form submissions. Submission payload fields stay read-only after creation, while operators can update workflow status.',
    listSearchableFields: ['email', 'submitterEmail', 'submitterName', 'campaign', 'source'],
  },
  access: {
    create: () => false,
    delete: requireCapability('manage_form_submissions'),
    read: requireCapability('manage_form_submissions'),
    update: requireCapability('manage_form_submissions'),
  },
  hooks: {
    afterChange: [syncFormSubmissionToWorkQueue],
    beforeChange: [updateFormSubmissionActivity],
  },
  timestamps: true,
  fields: [
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        {
          label: 'New',
          value: 'new',
        },
        {
          label: 'In Review',
          value: 'in_review',
        },
        {
          label: 'Qualified',
          value: 'qualified',
        },
        {
          label: 'Won',
          value: 'won',
        },
        {
          label: 'Rejected',
          value: 'rejected',
        },
        {
          label: 'Archived',
          value: 'archived',
        },
      ],
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'internalNotes',
      type: 'textarea',
    },
    {
      name: 'submissionIntent',
      type: 'select',
      defaultValue: 'general',
      options: [...formSubmissionIntentOptions],
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'source',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'campaign',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'landingPage',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'submitterName',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'submitterEmail',
      type: 'email',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'email',
      type: 'email',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'linkedReview',
      type: 'relationship',
      relationTo: 'reviews',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'promotionError',
      type: 'textarea',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'submittedAt',
      type: 'date',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'lastActionAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'data',
      label: 'Submitted Data',
      type: 'json',
      required: true,
      admin: {
        readOnly: true,
      },
    },
  ],
}
