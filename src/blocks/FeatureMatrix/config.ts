import type { ArrayField, Block, CheckboxField, SelectField, TabsField } from 'payload'

import { getBlockThumbnailAdmin } from '@/block-thumbnails/definitions'
import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'
import {
  createContentActionModeField,
  createContentActionsField,
} from '@/blocks/shared/contentActionsFields'

const featuresField = {
  name: 'features',
  label: 'Features',
  type: 'array',
  minRows: 4,
  maxRows: 4,
  admin: {
    initCollapsed: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'imagePosition',
      label: 'Background Position',
      type: 'select',
      defaultValue: 'center',
      options: [
        { label: 'Center', value: 'center' },
        { label: 'Top', value: 'top' },
        { label: 'Bottom', value: 'bottom' },
        { label: 'Left', value: 'left' },
        { label: 'Right', value: 'right' },
      ],
      required: true,
    } satisfies SelectField,
  ],
} satisfies ArrayField

export const FeatureMatrixBlock: Block = {
  slug: 'featureMatrix',
  interfaceName: 'FeatureMatrixBlock',
  admin: getBlockThumbnailAdmin('featureMatrix'),
  labels: {
    singular: 'Feature Matrix',
    plural: 'Feature Matrices',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'eyebrow',
              type: 'text',
            },
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
            },
            createContentActionsField(),
            featuresField,
          ],
        },
        {
          label: 'Layout',
          fields: [
            createBlockAppearanceFields({ includeTextOverride: false }),
            createContentActionModeField(),
            {
              name: 'contentAlignment',
              label: 'Section Content Alignment',
              type: 'select',
              defaultValue: 'center',
              options: [
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
                { label: 'Right', value: 'right' },
              ],
              required: true,
            } satisfies SelectField,
            {
              name: 'size',
              label: 'Section Padding',
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
              name: 'showOuterBorder',
              label: 'Show Outer Border',
              type: 'checkbox',
              defaultValue: true,
            } satisfies CheckboxField,
            {
              name: 'borderAnimationEnabled',
              label: 'Enable Border Animation',
              type: 'checkbox',
              defaultValue: true,
            } satisfies CheckboxField,
          ],
        },
      ],
    } satisfies TabsField,
  ],
}
