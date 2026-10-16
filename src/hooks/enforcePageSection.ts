import { APIError, type CollectionBeforeValidateHook } from 'payload'
import { isSiteManager } from '@/access/featureAccess'
import { grantedSectionRoots, relationshipID, scopedPageIDs } from '@/access/sectionAccess'

export const enforcePageSection: CollectionBeforeValidateHook = async ({
  data,
  originalDoc,
  req,
  operation,
}) => {
  if (!data || !isSiteManager(req.user)) return data
  const ids = await scopedPageIDs(req)
  const currentID = relationshipID(originalDoc)
  if (operation === 'update' && (!currentID || !ids.includes(currentID)))
    throw new APIError('This Page is outside your assigned sections.', 403)
  const previousParent = relationshipID(originalDoc?.parent)
  const nextParent = Object.hasOwn(data, 'parent') ? relationshipID(data.parent) : previousParent
  const roots = await grantedSectionRoots(req)
  if (operation === 'update' && currentID && roots.includes(currentID)) {
    if (nextParent !== previousParent || data.deletedAt)
      throw new APIError('Only an Admin can move or trash a section root.', 403)
    return data
  }
  if (!nextParent || !ids.includes(nextParent))
    throw new APIError('Choose a parent Page in your assigned section.', 403)
  // Resolve both parents to their stable root. A Manager assigned A and B still cannot move A content into B.
  const rootOf = async (start: string): Promise<string | null> => {
    let id: string | null = start
    for (let depth = 0; id && depth < 100; depth++) {
      if (roots.includes(id)) return id
      const page = await req.payload.findByID({
        collection: 'pages',
        id,
        req,
        overrideAccess: true,
        draft: true,
        depth: 0,
        select: { parent: true },
      })
      id = relationshipID(page.parent)
    }
    return null
  }
  if (
    operation === 'update' &&
    previousParent &&
    nextParent !== previousParent &&
    (await rootOf(previousParent)) !== (await rootOf(nextParent))
  )
    throw new APIError('Only an Admin can move a Page between sections.', 403)
  return data
}
