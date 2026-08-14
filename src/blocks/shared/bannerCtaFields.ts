import type { Condition, SelectField } from 'payload'

const withCondition = (field: SelectField, condition?: Condition): SelectField =>
  condition ? { ...field, admin: { ...field.admin, condition } } : field

export const createBannerActionPlacementField = (condition?: Condition): SelectField =>
  withCondition(
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
    },
    condition,
  )

export const createBannerContentAlignmentField = (condition?: Condition): SelectField =>
  withCondition(
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
    },
    condition,
  )

export const createBannerContentWidthField = (condition?: Condition): SelectField =>
  withCondition(
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
    },
    condition,
  )

export const createBannerThemeModeField = (condition?: Condition): SelectField =>
  withCondition(
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
    },
    condition,
  )

export const createBannerOverlayStyleField = (condition?: Condition): SelectField =>
  withCondition(
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
    },
    condition,
  )

export const createBannerOverlayDirectionField = (condition?: Condition): SelectField =>
  withCondition(
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
    },
    condition,
  )

export const createBannerHeightField = (condition?: Condition): SelectField =>
  withCondition(
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
    },
    condition,
  )

export const createBannerSectionPaddingField = (condition?: Condition): SelectField =>
  withCondition(
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
    },
    condition,
  )
