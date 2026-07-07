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
    useAsTitle: 'id',
    defaultColumns: ['form', 'createdAt'],
    description: 'Stored form submissions. These records are read-only after creation.',
  },
  access: {
    create: () => false,
    delete: requireCapability('manage_form_submissions'),
    read: requireCapability('manage_form_submissions'),
    update: () => false,
  },
  timestamps: true,
  fields: [
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      required: true,
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
