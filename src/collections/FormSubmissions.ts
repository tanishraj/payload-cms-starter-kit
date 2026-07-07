import type { CollectionConfig } from 'payload'

import {
  hideFromUsersWithoutCapability,
  requireCapability,
} from '@/access/adminCapabilities'

export const FormSubmissions: CollectionConfig = {
  slug: 'form-submissions',
  labels: {
    singular: 'Form Submission',
    plural: 'Form Submissions',
  },
  admin: {
    group: 'Forms',
    hidden: hideFromUsersWithoutCapability('manage_form_submissions'),
    useAsTitle: 'email',
    defaultColumns: ['email', 'status', 'form', 'submittedAt'],
    description:
      'Stored form submissions. Submission payload fields stay read-only after creation, while operators can update workflow status.',
    listSearchableFields: ['email'],
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
      name: 'email',
      type: 'email',
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
