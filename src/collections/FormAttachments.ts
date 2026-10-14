import type { CollectionConfig } from 'payload'

/** Internal transport metadata, not a Payload upload collection and never public Media.
 * Downloads require an access-enforced submission read through the dedicated route.
 */
export const FormAttachments: CollectionConfig = {
  slug: 'form-attachments',
  admin: { hidden: true },
  trash: false,
  graphQL: false,
  access: { create: () => false, read: () => false, update: () => false, delete: () => false },
  fields: [
    { name: 'token', type: 'text', required: true, unique: true },
    { name: 'uploadIdentity', type: 'text', required: true, unique: true },
    { name: 'attemptSlot', type: 'text', required: true, unique: true },
    { name: 'submissionKeyHash', type: 'text', required: true, index: true },
    { name: 'formID', type: 'text', required: true },
    { name: 'fieldID', type: 'text', required: true },
    { name: 'filename', type: 'text', required: true },
    { name: 'fileType', type: 'select', required: true, options: ['pdf', 'docx', 'png', 'jpg'] },
    { name: 'size', type: 'number', required: true },
    { name: 'sha256', type: 'text', required: true },
    {
      name: 'state',
      type: 'select',
      required: true,
      options: ['staging', 'ready', 'attached', 'deleting'],
    },
    { name: 'expiresAt', type: 'date', required: true, index: true },
  ],
}
