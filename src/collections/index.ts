import type { CollectionConfig } from 'payload'

import { Media } from './Media'
import { Pages } from './Pages'
import { Users } from './Users'

function withDefaultCollectionOptions<T extends CollectionConfig>(collection: T): T {
  return {
    trash: true,
    ...collection,
  }
}

const COLLECTIONS_LIST = [Users, Media, Pages]

export const collections = COLLECTIONS_LIST.map(withDefaultCollectionOptions)

export { Media, Pages, Users }
