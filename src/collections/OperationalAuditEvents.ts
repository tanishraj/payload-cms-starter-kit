import type { CollectionConfig } from 'payload'

import {
  canViewOperationalAudit,
  hideFromUsersWithoutCapability,
} from '@/access/adminCapabilities'

export const OperationalAuditEvents: CollectionConfig = {
  slug: 'operational-audit-events',
  labels: {
    singular: 'Audit Log Entry',
    plural: 'Audit Log',
  },
  admin: {
    group: 'Administration',
    hidden: hideFromUsersWithoutCapability('view_operational_audit'),
    useAsTitle: 'summary',
    defaultColumns: ['occurredAt', 'entityType', 'entityTitle', 'actorEmail', 'action'],
  },
  access: {
    create: () => false,
    delete: () => false,
    read: ({ req }) => canViewOperationalAudit(req.user as never),
    update: () => false,
  },
  fields: [
    {
      name: 'entityType',
      type: 'text',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'entityId',
      type: 'text',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'entityTitle',
      type: 'text',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'action',
      type: 'text',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'actorEmail',
      type: 'email',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'actorRole',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'occurredAt',
      type: 'date',
      required: true,
      admin: {
        readOnly: true,
      },
    },
  ],
}
