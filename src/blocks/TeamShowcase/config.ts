import type { ArrayField, Block, CheckboxField, SelectField, TabsField } from 'payload'

import { getBlockThumbnailAdmin } from '@/block-thumbnails/definitions'
import { createContentActionModeField, createContentActionsField } from '@/blocks/shared/contentActionsFields'

import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'

const teamShowcaseMembersField = {
  name: 'members',
  label: 'Team Members',
  type: 'array',
  minRows: 1,
  maxRows: 24,
  admin: {
    initCollapsed: true,
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      label: 'Role / Designation',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
  ],
} satisfies ArrayField

export const TeamShowcaseBlock: Block = {
  slug: 'teamShowcase',
  admin: getBlockThumbnailAdmin('teamShowcase'),
  labels: {
    singular: 'Team Showcase',
    plural: 'Team Showcases',
  },
  interfaceName: 'TeamShowcaseBlock',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'heading',
              type: 'text',
            },
            {
              name: 'description',
              type: 'textarea',
            },
            createContentActionsField(),
            teamShowcaseMembersField,
          ],
        },
        {
          label: 'Layout & Theme',
          fields: [
            createBlockAppearanceFields({ includeTextOverride: false }),
            createContentActionModeField(),
            {
              name: 'contentAlignment',
              label: 'Content Alignment',
              type: 'select',
              defaultValue: 'left',
              options: [
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
                { label: 'Right', value: 'right' },
              ],
              required: true,
            } satisfies SelectField,
            {
              name: 'size',
              label: 'Size',
              type: 'select',
              defaultValue: 'default',
              options: [
                { label: 'Compact', value: 'compact' },
                { label: 'Default', value: 'default' },
                { label: 'Comfortable', value: 'comfortable' },
              ],
              required: true,
            } satisfies SelectField,
            {
              name: 'showHeaderDivider',
              label: 'Show Header Divider',
              type: 'checkbox',
              defaultValue: true,
            } satisfies CheckboxField,
          ],
        },
      ],
    } satisfies TabsField,
  ],
} satisfies Block
