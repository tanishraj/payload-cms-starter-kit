import { formSubmissionEndpoints } from '@/endpoints/formEndpoints'
import type { CollectionAfterReadHook, CollectionConfig } from 'payload'

import {
  adminOnlyAccess,
  canReadFeature,
  hasFeature,
  hideUnlessFeature,
  requireFeature,
} from '@/access/featureAccess'
import { releaseFormAttachments } from '@/hooks/releaseFormAttachments'
import { syncFormSubmissionToWorkQueue } from '@/hooks/syncFormSubmissionToWorkQueue'
import { updateFormSubmissionActivity } from '@/hooks/updateFormSubmissionActivity'
import { formSubmissionIntentOptions } from '@/lib/forms'

const immutableSubmissionFieldAccess = {
  update: () => false,
}

const sanitizeSubmissionDependencyRead: CollectionAfterReadHook = ({ doc, req }) => {
  if (hasFeature(req.user, 'formSubmissions')) return doc
  if (!hasFeature(req.user, 'reviews')) return doc

  return {
    id: doc.id,
    submitterEmail: `Submission #${doc.id}`,
  }
}

export const FormSubmissions: CollectionConfig = {
  slug: 'form-submissions',
  endpoints: formSubmissionEndpoints,
  labels: {
    singular: 'Form Submission',
    plural: 'Form Submissions',
  },
  admin: {
    group: 'Forms',
    hidden: hideUnlessFeature('formSubmissions'),
    useAsTitle: 'submitterEmail',
    defaultColumns: [
      'status',
      'owner',
      'submissionIntent',
      'submitterName',
      'submitterEmail',
      'submitterPhone',
      'submittedAt',
      'lastActionAt',
    ],
    description:
      'Stored form submissions. Submission payload fields stay read-only after creation, while operators can update operational status.',
    listSearchableFields: [
      'email',
      'submitterEmail',
      'submitterName',
      'submitterPhone',
      'campaign',
      'source',
    ],
  },
  access: {
    create: () => false,
    delete: adminOnlyAccess,
    read: ({ req }) => canReadFeature(req.user, 'formSubmissions'),
    update: requireFeature('formSubmissions'),
  },
  hooks: {
    afterChange: [syncFormSubmissionToWorkQueue],
    afterDelete: [releaseFormAttachments],
    afterRead: [sanitizeSubmissionDependencyRead],
    beforeChange: [updateFormSubmissionActivity],
  },
  timestamps: true,
  fields: [
    ...(['submissionKeyHash', 'submissionRequestHash', 'submissionConfirmation'] as const).map(
      (name) => ({
        name,
        type: 'text' as const,
        ...(name === 'submissionKeyHash' ? { unique: true } : {}),
        access: { read: () => false, update: () => false },
        admin: { hidden: true, readOnly: true },
      }),
    ),
    {
      name: 'form',
      type: 'relationship',
      access: immutableSubmissionFieldAccess,
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
      access: immutableSubmissionFieldAccess,
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
      access: immutableSubmissionFieldAccess,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'campaign',
      type: 'text',
      access: immutableSubmissionFieldAccess,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'landingPage',
      type: 'text',
      access: immutableSubmissionFieldAccess,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'submitterName',
      type: 'text',
      access: immutableSubmissionFieldAccess,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'submitterEmail',
      type: 'email',
      access: immutableSubmissionFieldAccess,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'submitterPhone',
      type: 'text',
      access: immutableSubmissionFieldAccess,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'email',
      type: 'email',
      access: immutableSubmissionFieldAccess,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'linkedReview',
      type: 'relationship',
      access: immutableSubmissionFieldAccess,
      relationTo: 'reviews',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'promotionError',
      type: 'textarea',
      access: immutableSubmissionFieldAccess,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'submittedAt',
      type: 'date',
      access: immutableSubmissionFieldAccess,
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'lastActionAt',
      type: 'date',
      access: immutableSubmissionFieldAccess,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'formRevision',
      type: 'text',
      access: immutableSubmissionFieldAccess,
      admin: {
        readOnly: true,
        description: 'Identity of the published definition used when this submission was received.',
      },
    },
    {
      name: 'formSnapshot',
      type: 'json',
      access: immutableSubmissionFieldAccess,
      admin: { hidden: true, readOnly: true },
    },
    {
      name: 'attachments',
      label: 'Private attachments',
      type: 'array',
      access: immutableSubmissionFieldAccess,
      admin: {
        readOnly: true,
        description:
          'Original files. Downloads require this submission’s inbox permissions; files are never attached to notification emails.',
      },
      fields: [
        { name: 'filename', type: 'text', required: true, admin: { readOnly: true } },
        {
          name: 'label',
          label: 'Original question',
          type: 'text',
          required: true,
          admin: { readOnly: true },
        },
        {
          name: 'size',
          label: 'Size (bytes)',
          type: 'number',
          required: true,
          admin: { readOnly: true },
        },
        { name: 'fileType', type: 'text', required: true, admin: { readOnly: true } },
        { name: 'fieldID', type: 'text', required: true, admin: { hidden: true } },
        { name: 'fieldName', type: 'text', required: true, admin: { hidden: true } },
        {
          name: 'token',
          label: 'Download file',
          type: 'text',
          required: true,
          admin: {
            readOnly: true,
            components: {
              Field: '@/components/admin/FormAttachmentDownload#FormAttachmentDownload',
            },
          },
        },
      ],
    },
    {
      name: 'answers',
      label: 'Original Questions and Answers',
      type: 'array',
      access: immutableSubmissionFieldAccess,
      admin: {
        readOnly: true,
        description:
          'Questions and readable answers captured at submission time. Later form changes do not alter them. Older submissions may only have Submitted Data.',
      },
      fields: [
        { name: 'label', label: 'Question', type: 'text', admin: { readOnly: true } },
        { name: 'displayValue', label: 'Answer', type: 'textarea', admin: { readOnly: true } },
        { name: 'name', label: 'Field Name', type: 'text', admin: { readOnly: true } },
        { name: 'fieldID', type: 'text', admin: { hidden: true, readOnly: true } },
        { name: 'type', type: 'text', admin: { hidden: true, readOnly: true } },
        { name: 'value', type: 'json', admin: { hidden: true, readOnly: true } },
      ],
    },
    {
      name: 'data',
      label: 'Submitted Data',
      type: 'json',
      access: immutableSubmissionFieldAccess,
      required: true,
      admin: {
        readOnly: true,
      },
    },
  ],
}
