import type { Block, SelectField, TabsField } from 'payload'

import { getBlockThumbnailAdmin } from '@/block-thumbnails/definitions'
import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'
import { createContentActionsField } from '@/blocks/shared/contentActionsFields'

export const BannerCtaBlock: Block = {
  admin: getBlockThumbnailAdmin('bannerCta'),
  slug: 'bannerCta',
  interfaceName: 'BannerCtaBlock',
  labels: {
    singular: 'Banner CTA',
    plural: 'Banner CTAs',
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
              admin: {
                description:
                  'Sits behind the overlay. Without one the block falls back to the Appearance background.',
              },
            },
            {
              name: 'eyebrow',
              type: 'text',
              admin: { description: 'Small label above the heading.' },
            },
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'accentTitle',
              label: 'Accent Title (Italic)',
              type: 'text',
              admin: { description: 'Optional emphasized second line of the heading.' },
            },
            {
              name: 'description',
              type: 'textarea',
            },
            createContentActionsField({ label: 'Actions', maxRows: 3 }),
            createContentActionsField({
              name: 'footerActions',
              label: 'Footer Actions',
              maxRows: 2,
            }),
          ],
        },
        {
          label: 'Theme Settings',
          fields: [
            createBlockAppearanceFields(),
            {
              name: 'actionPlacement',
              label: 'Action Placement',
              type: 'select',
              defaultValue: 'side',
              options: [
                { label: 'Side column (stacked beside the copy)', value: 'side' },
                { label: 'Below the copy', value: 'below' },
              ],
              admin: {
                description: 'The side column stacks back under the copy on small screens.',
              },
            } satisfies SelectField,
            {
              name: 'contentAlignment',
              label: 'Section Content Alignment',
              type: 'select',
              defaultValue: 'left',
              options: [
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
                { label: 'Right', value: 'right' },
              ],
            } satisfies SelectField,
            {
              name: 'contentWidth',
              label: 'Content Width',
              type: 'select',
              defaultValue: 'default',
              options: [
                { label: 'Narrow', value: 'narrow' },
                { label: 'Default', value: 'default' },
                { label: 'Wide', value: 'wide' },
              ],
            } satisfies SelectField,
            {
              name: 'themeMode',
              label: 'Overlay Tone',
              type: 'select',
              defaultValue: 'dark',
              options: [
                { label: 'Auto (theme primary)', value: 'auto' },
                { label: 'Light', value: 'light' },
                { label: 'Dark', value: 'dark' },
              ],
              admin: {
                description:
                  'Auto tints with the theme primary and follows it into dark mode. Light uses a pale scrim under dark copy. Dark keeps white copy over the image regardless of the site theme.',
              },
            } satisfies SelectField,
            {
              name: 'overlayStyle',
              label: 'Overlay Strength',
              type: 'select',
              defaultValue: 'darker',
              options: [
                { label: 'Light', value: 'light' },
                { label: 'Dark', value: 'dark' },
                { label: 'Darker', value: 'darker' },
              ],
            } satisfies SelectField,
            {
              name: 'overlayDirection',
              label: 'Overlay Direction',
              type: 'select',
              defaultValue: 'leftToRight',
              options: [
                { label: 'Vertical', value: 'vertical' },
                { label: 'Left to Right', value: 'leftToRight' },
                { label: 'Right to Left', value: 'rightToLeft' },
              ],
            } satisfies SelectField,
            {
              name: 'height',
              label: 'Minimum Height',
              type: 'select',
              defaultValue: 'default',
              options: [
                { label: 'Compact', value: 'compact' },
                { label: 'Default', value: 'default' },
                { label: 'Immersive', value: 'immersive' },
              ],
            } satisfies SelectField,
            {
              name: 'size',
              label: 'Section Padding',
              type: 'select',
              defaultValue: 'default',
              options: [
                { label: 'None', value: 'none' },
                { label: 'Compact', value: 'compact' },
                { label: 'Default', value: 'default' },
                { label: 'Comfortable', value: 'comfortable' },
              ],
            } satisfies SelectField,
          ],
        },
      ],
    } satisfies TabsField,
  ],
}
