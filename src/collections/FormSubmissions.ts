import type { CollectionConfig } from 'payload'

import {
  hideFromUsersWithoutCapability,
  requireCapability,
} from '@/access/adminCapabilities'
import { formSubmissionTypeOptions } from '@/lib/forms'

export const FormSubmissions: CollectionConfig = {
  slug: 'form-submissions',
  labels: {
    singular: 'Form Submission',
    plural: 'Form Submissions',
  },
  admin: {
    group: 'Forms',
    hidden: hideFromUsersWithoutCapability('manage_form_submissions'),
    useAsTitle: 'submitterEmail',
    defaultColumns: ['submissionType', 'submitterName', 'submitterEmail', 'status', 'submittedAt'],
    description:
      'Stored form submissions. Submission payload fields stay read-only after creation, while operators can update workflow status.',
    listSearchableFields: ['email', 'submitterEmail', 'submitterName'],
  },
  access: {
    create: () => false,
    delete: requireCapability('manage_form_submissions'),
    read: requireCapability('manage_form_submissions'),
    update: requireCapability('manage_form_submissions'),
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
          label: 'Reviewed',
          value: 'reviewed',
        },
        {
          label: 'Archived',
          value: 'archived',
        },
      ],
    },
    {
      name: 'submissionType',
      type: 'select',
      defaultValue: 'general',
      options: [...formSubmissionTypeOptions],
      required: true,
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
