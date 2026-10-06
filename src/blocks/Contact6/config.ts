import type { ArrayField, Block } from 'payload'
import { getBlockThumbnailAdmin } from '@/block-thumbnails/definitions'
import { createGenericFormField } from '@/blocks/shared/genericFormField'
import { createSectionPaddingField } from '@/blocks/shared/sectionFields'
import { validateContact6Href } from '@/lib/contact6Shared'

const detailRows = (name: string, label: string): ArrayField => ({
  name,
  label,
  type: 'array',
  maxRows: 12,
  admin: { initCollapsed: false },
  fields: [
    { name: 'label', type: 'text', required: true },
    { name: 'value', type: 'text', required: true },
  ],
})

export const Contact6Block: Block = {
  slug: 'contact6',
  interfaceName: 'Contact6Block',
  labels: { singular: 'Contact Cards & Form', plural: 'Contact Cards & Forms' },
  admin: getBlockThumbnailAdmin('contact6'),
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'heading', type: 'text', defaultValue: 'Contact Us' },
            { name: 'description', type: 'textarea' },
            { name: 'formTitle', type: 'text', defaultValue: 'Send us a message' },
            { name: 'formDescription', type: 'textarea' },
            createGenericFormField(),
            {
              name: 'contactInfo',
              label: 'Contact cards',
              type: 'array',
              maxRows: 8,
              admin: {
                initCollapsed: false,
                description:
                  'Optional ways to contact you beside the form. Do not claim live chat is available unless you provide a working link.',
              },
              fields: [
                {
                  name: 'icon',
                  type: 'select',
                  required: true,
                  defaultValue: 'email',
                  options: [
                    { label: 'Email', value: 'email' },
                    { label: 'Chat', value: 'chat' },
                    { label: 'Phone', value: 'phone' },
                    { label: 'Location', value: 'location' },
                  ],
                },
                { name: 'title', type: 'text', required: true },
                { name: 'description', type: 'text' },
                { name: 'value', label: 'Contact text', type: 'text', required: true },
                {
                  name: 'href',
                  label: 'Contact link',
                  type: 'text',
                  validate: validateContact6Href,
                  admin: {
                    description:
                      'Optional site path, anchor, https://, mailto: or tel: URL. Empty means plain text.',
                  },
                },
              ],
            },
            { name: 'officeHoursTitle', type: 'text', defaultValue: 'Office Hours' },
            detailRows('officeHours', 'Office hours'),
            { name: 'contactDetailsTitle', type: 'text', defaultValue: 'Contact Information' },
            detailRows('contactDetails', 'Contact information'),
          ],
        },
        { label: 'Theme Settings', fields: [createSectionPaddingField()] },
      ],
    },
  ],
}
