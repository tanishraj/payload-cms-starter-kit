import type { GroupField } from 'payload'
import { validateFormAppearanceForIntent } from '@/lib/formAppearance'

/** Native settings map to reviewed GenericForm props; no second block override. */
export const formAppearanceField: GroupField = {
  name: 'appearance',
  label: 'Form appearance',
  type: 'group',
  validate: (value, { data }) =>
    validateFormAppearanceForIntent(
      value,
      (data as { submissionIntent?: unknown })?.submissionIntent,
    ),
  admin: {
    description:
      'Shared by every Generic Form and Contact Cards & Form block using this Form. Defaults preserve the selected block. Controls inherit the website theme. Fixed Review Submission and Contact 33 require default appearance.',
  },
  fields: [
    {
      name: 'width',
      label: 'Form width',
      type: 'select',
      defaultValue: 'default',
      options: [
        { label: 'Block default', value: 'default' },
        { label: 'Narrow (20rem)', value: 'narrow' },
        { label: 'Wide (42rem)', value: 'wide' },
        { label: 'Fill available space', value: 'full' },
      ],
      admin: {
        description: 'Maximum width inside the selected block; never widens its card or section.',
      },
    },
    {
      name: 'columns',
      label: 'Question columns',
      type: 'select',
      defaultValue: 'default',
      options: [
        { label: 'Block default', value: 'default' },
        { label: 'One column', value: 'one' },
        { label: 'Two columns when space allows', value: 'two' },
      ],
      admin: {
        description:
          'Two columns need at least 32rem of available form width. Smaller forms stay stacked; display entries, groups and long/compound controls span both columns. Default preserves Contact Cards & Form’s first short row.',
      },
    },
    {
      name: 'spacing',
      label: 'Question spacing',
      type: 'select',
      defaultValue: 'default',
      options: [
        { label: 'Block default', value: 'default' },
        { label: 'Compact', value: 'compact' },
      ],
      admin: {
        description:
          'Compact uses the sourced 12px form/group gap. Labels, help and errors remain visible.',
      },
    },
    {
      name: 'buttonVariant',
      label: 'Submit button appearance',
      type: 'select',
      defaultValue: 'default',
      options: [
        { label: 'Primary (default)', value: 'default' },
        { label: 'Outline', value: 'outline' },
        { label: 'Secondary', value: 'secondary' },
      ],
      admin: {
        description:
          'Uses the website’s semantic theme colors; does not change submission behavior.',
      },
    },
    {
      name: 'buttonSize',
      label: 'Submit button size',
      type: 'select',
      defaultValue: 'default',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Small', value: 'sm' },
        { label: 'Large', value: 'lg' },
      ],
      admin: {
        description: 'Upstream text-button sizes; no icon-only or extra-small submit controls.',
      },
    },
    {
      name: 'buttonShape',
      label: 'Submit button shape',
      type: 'select',
      defaultValue: 'default',
      options: [
        { label: 'Theme default', value: 'default' },
        { label: 'Pill', value: 'pill' },
      ],
      admin: {
        description:
          'Theme default inherits the selected button; Pill uses upstream fully rounded corners.',
      },
    },
    {
      name: 'buttonWidth',
      label: 'Submit button width',
      type: 'select',
      defaultValue: 'default',
      options: [
        { label: 'Full width (default)', value: 'default' },
        { label: 'Fit label', value: 'content' },
      ],
      admin: { description: 'Fit label stays at the start of the form and wraps long labels.' },
    },
  ],
}
