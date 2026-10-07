import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
const mocks = vi.hoisted(() => ({ find: vi.fn() }))
vi.mock('payload', () => ({ getPayload: async () => ({ find: mocks.find }) }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn, revalidateTag: vi.fn() }))
import { getPublishedGenericForm } from '@/lib/genericForm.server'
import { Contact6BlockComponent } from '@/blocks/Contact6/Component'
import { GenericFormBlockComponent } from '@/blocks/GenericForm/Component'

describe('published generic form loader', () => {
  it.each([GenericFormBlockComponent, Contact6BlockComponent])(
    'fetches a published access-checked minimal projection even when page relationship data is stale: %s',
    async (Component) => {
      mocks.find.mockResolvedValue({
        docs: [
          {
            id: 'id',
            _status: 'published',
            submissionIntent: 'lead',
            slug: 'enquiry',
            submitButtonLabel: 'Send',
            fields: [{ name: 'question', label: 'Latest published question', type: 'text' }],
          },
        ],
      })
      const props = { size: 'default' as const, form: 'id', heading: 'Ask' }
      const rendered =
        Component === GenericFormBlockComponent
          ? await GenericFormBlockComponent({ ...props, blockType: 'genericForm' })
          : await Contact6BlockComponent({ ...props, blockType: 'contact6' })
      expect(renderToStaticMarkup(rendered)).toContain('Latest published question')
      expect(mocks.find).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'forms',
          depth: 0,
          draft: false,
          overrideAccess: false,
          select: {
            slug: true,
            fields: true,
            submitButtonLabel: true,
            submissionIntent: true,
            _status: true,
          },
          where: {
            and: [
              { id: { equals: 'id' } },
              { _status: { equals: 'published' } },
              { submissionIntent: { in: ['general', 'lead'] } },
            ],
          },
        }),
      )
      mocks.find.mockResolvedValue({ docs: [] })
      expect(await getPublishedGenericForm('deleted')).toBeNull()
    },
  )
})
