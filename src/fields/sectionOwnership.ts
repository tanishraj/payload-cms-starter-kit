import { APIError, type CollectionBeforeValidateHook, type Field, type FieldAccess } from 'payload'
import { hasFeature, isAdmin, isSiteManager } from '@/access/featureAccess'
import {
  grantedSectionRoots,
  normalizeSectionRoots,
  relationshipID,
  rootPageFilter,
} from '@/access/sectionAccess'

export const sectionOwnershipField = (submission = false): Field => ({
  name: 'sectionRoot',
  label: 'Website section',
  type: 'relationship',
  relationTo: 'pages',
  index: true,
  access: { read: ({ req }) => Boolean(req.user), update: ({ req }) => isAdmin(req.user) },
  filterOptions: rootPageFilter,
  admin: {
    position: 'sidebar',
    description: submission
      ? 'Access section captured at submission time. Unassigned submissions are Admin-only; moving a Form does not move its old submissions.'
      : 'Choose a root Page. Leave empty for an Admin-managed shared resource. Site Managers can create resources only in their assigned sections.',
  },
})
export const enforceSectionOwnership: CollectionBeforeValidateHook = async ({
  data,
  originalDoc,
  req,
  operation,
}) => {
  if (!data || !isSiteManager(req.user)) return data
  const before = relationshipID(originalDoc?.sectionRoot)
  const after = Object.hasOwn(data, 'sectionRoot') ? relationshipID(data.sectionRoot) : before
  const roots = await grantedSectionRoots(req)
  if (operation === 'update' && (before === null || before !== after))
    throw new APIError('Only an Admin can reassign a resource or edit a shared resource.', 403)
  if (!after || !roots.includes(after))
    throw new APIError('Choose one of your assigned website sections.', 403)
  return data
}
/** Shared definitions expose their published presentation, never private authoring settings. */
export const scopedFormPrivateRead: FieldAccess = ({ req, doc }) =>
  isAdmin(req.user) ||
  (hasFeature(req.user, 'forms') &&
    Boolean(relationshipID(doc?.sectionRoot)) &&
    normalizeSectionRoots(
      req.user && 'sectionRoots' in req.user ? req.user.sectionRoots : [],
    ).includes(relationshipID(doc?.sectionRoot)!))
