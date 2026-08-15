import type {
  ArrayField,
  CheckboxField,
  Condition,
  Field,
  RadioField,
  SelectField,
  TabsField,
} from 'payload'

type LinkSiblingData = {
  linkType?: 'custom' | 'page' | null
}

type CreateContentActionsFieldOptions = {
  includeDisplayMode?: boolean
  label?: string
  maxRows?: number
  name?: string
}

type ActionLayoutSiblingData = {
  mode?: 'button' | 'link' | null
}

type CreateContentActionModeFieldOptions = {
  condition?: Condition
  label?: string
  name?: string
}

export const buttonVariantOptions = [
  { label: 'Default', value: 'default' },
  { label: 'Primary', value: 'primary' },
  { label: 'Secondary', value: 'secondary' },
  { label: 'Outline', value: 'outline' },
] satisfies SelectField['options']

export const buttonVariantWithLinkOptions = [
  ...buttonVariantOptions,
  { label: 'Link', value: 'link' },
] satisfies SelectField['options']

export const buttonVariantDescription =
  "Default adapts to the surrounding section or image overlay. Primary always uses the site theme's primary color."

const isPageLink = (_data: unknown, siblingData: LinkSiblingData) =>
  siblingData?.linkType === 'page'

const isCustomLink = (_data: unknown, siblingData: LinkSiblingData) =>
  siblingData?.linkType === 'custom'

const isButtonMode = (_data: unknown, siblingData: ActionLayoutSiblingData) =>
  siblingData?.mode === 'button'

const actionContentFields: Field[] = [
  {
    name: 'label',
    type: 'text',
    required: true,
  },
  {
    name: 'linkType',
    type: 'radio',
    defaultValue: 'page',
    options: [
      { label: 'Page', value: 'page' },
      { label: 'Custom URL', value: 'custom' },
    ],
    admin: {
      layout: 'horizontal',
    },
  } satisfies RadioField,
  {
    name: 'page',
    type: 'relationship',
    relationTo: 'pages',
    admin: {
      condition: isPageLink,
    },
  },
  {
    name: 'url',
    label: 'Custom URL',
    type: 'text',
    admin: {
      condition: isCustomLink,
    },
  },
  {
    name: 'openInNewTab',
    type: 'checkbox',
    defaultValue: false,
  } satisfies CheckboxField,
]

const createActionLayoutFields = (includeDisplayMode: boolean): Field[] => [
  ...(includeDisplayMode
    ? [
        {
          name: 'mode',
          label: 'Display As',
          type: 'select',
          defaultValue: 'link',
          options: [
            { label: 'Link', value: 'link' },
            { label: 'Button', value: 'button' },
          ],
          required: false,
        } satisfies SelectField,
      ]
    : []),
  {
    name: 'variant',
    label: 'Button Variant',
    type: 'select',
    defaultValue: 'default',
    options: buttonVariantOptions,
    required: true,
    admin: {
      description: buttonVariantDescription,
      ...(includeDisplayMode ? { condition: isButtonMode } : {}),
    },
  } satisfies SelectField,
  {
    name: 'showArrow',
    label: 'Show arrow',
    type: 'checkbox',
    defaultValue: false,
    admin: {
      description: 'Adds a trailing arrow when this action is displayed as a button.',
      ...(includeDisplayMode ? { condition: isButtonMode } : {}),
    },
  } satisfies CheckboxField,
]

export const createContentActionModeField = ({
  condition,
  label = 'Action Mode',
  name = 'actionMode',
}: CreateContentActionModeFieldOptions = {}): SelectField => ({
  name,
  label,
  type: 'select',
  defaultValue: 'link',
  options: [
    { label: 'Link', value: 'link' },
    { label: 'Button', value: 'button' },
  ],
  // Optional: the default already covers unset values, and marking it required
  // would make the generated type demand it on every seeded block.
  required: false,
  ...(condition
    ? {
        admin: {
          condition,
        },
      }
    : {}),
})

export const createContentActionsField = ({
  // Display mode lives on each action, inside its own Theme Settings tab, so a
  // row can be a button while its neighbour stays a link.
  includeDisplayMode = true,
  label = 'Actions',
  maxRows = 2,
  name = 'actions',
}: CreateContentActionsFieldOptions = {}): ArrayField => ({
  name,
  label,
  type: 'array',
  maxRows,
  admin: {
    initCollapsed: true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: actionContentFields,
        },
        {
          label: 'Theme Settings',
          fields: createActionLayoutFields(includeDisplayMode),
        },
      ],
    } satisfies TabsField,
  ],
})
