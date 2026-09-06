import type { Block, CheckboxField, SelectField, TabsField } from 'payload'

import { getBlockThumbnailAdmin } from '@/block-thumbnails/definitions'
import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'
import { createContentActionsField } from '@/blocks/shared/contentActionsFields'
import {
  createMediaOverlayCoverageField,
  createMediaOverlayDirectionField,
  createMediaOverlayStrengthField,
  createMediaOverlayToneField,
} from '@/blocks/shared/mediaOverlayFields'

const horizontalAlignmentField = {
  name: 'horizontalAlignment',
  label: 'Horizontal Alignment',
  type: 'select',
  defaultValue: 'left',
  options: [
    { label: 'Left', value: 'left' },
    { label: 'Center', value: 'center' },
    { label: 'Right', value: 'right' },
  ],
  required: true,
} satisfies SelectField

const verticalAlignmentField = {
  name: 'verticalAlignment',
  label: 'Vertical Alignment',
  type: 'select',
  defaultValue: 'center',
  options: [
    { label: 'Top', value: 'top' },
    { label: 'Center', value: 'center' },
    { label: 'Bottom', value: 'bottom' },
  ],
  required: true,
} satisfies SelectField

const overlayStyleField = createMediaOverlayStrengthField({ defaultValue: 'dark' })

const overlayDirectionField = createMediaOverlayDirectionField({ defaultValue: 'vertical' })

const overlayCoverageField = createMediaOverlayCoverageField({ required: false })

const enableTextShadowField = {
  name: 'enableTextShadow',
  label: 'Enable Text Shadow',
  type: 'checkbox',
  defaultValue: false,
  admin: {
    description: 'Adds a restrained shadow to text and editorial links over dark image overlays.',
  },
} satisfies CheckboxField

const themeModeField = createMediaOverlayToneField({ defaultValue: 'auto' })

const contentWidthField = {
  name: 'contentWidth',
  label: 'Content Width',
  type: 'select',
  defaultValue: 'default',
  options: [
    { label: 'Narrow', value: 'narrow' },
    { label: 'Default', value: 'default' },
    { label: 'Wide', value: 'wide' },
  ],
  required: true,
} satisfies SelectField

const heightField = {
  name: 'height',
  label: 'Height',
  type: 'select',
  defaultValue: 'default',
  options: [
    { label: 'Compact', value: 'compact' },
    { label: 'Default', value: 'default' },
    { label: 'Immersive', value: 'immersive' },
  ],
  required: true,
} satisfies SelectField

const buttonsField = createContentActionsField({
  defaultMode: 'button',
  defaultVariant: 'default',
  label: 'Buttons',
  maxRows: 2,
  name: 'buttons',
})

export const HeroBannerBlock: Block = {
  slug: 'heroBanner',
  interfaceName: 'HeroBannerBlock',
  admin: getBlockThumbnailAdmin('heroBanner'),
  labels: {
    singular: 'Hero Banner',
    plural: 'Hero Banners',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'backgroundImage',
              label: 'Background Image',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
            {
              name: 'eyebrow',
              type: 'text',
            },
            {
              name: 'title',
              type: 'text',
            },
            {
              name: 'accentTitle',
              label: 'Accent Title (Italic)',
              type: 'text',
            },
            {
              name: 'description',
              type: 'textarea',
            },
            buttonsField,
          ],
        },
        {
          label: 'Theme Settings',
          fields: [
            themeModeField,
            overlayStyleField,
            overlayDirectionField,
            overlayCoverageField,
            enableTextShadowField,
            createBlockAppearanceFields(),
            horizontalAlignmentField,
            verticalAlignmentField,
            contentWidthField,
            heightField,
          ],
        },
      ],
    } satisfies TabsField,
  ],
}
