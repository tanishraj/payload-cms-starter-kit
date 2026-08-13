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

type CreateContentActionsWithModeFieldsOptions = CreateContentActionsFieldOptions & {
  modeLabel?: string
}

type ActionLayoutSiblingData = {
  mode?: 'button' | 'link' | null
}

type CreateContentActionModeFieldOptions = {
  condition?: Condition
  label?: string
  name?: string
}

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
          required: true,
        } satisfies SelectField,
      ]
    : []),
  {
    name: 'variant',
    label: 'Button Variant',
    type: 'select',
    defaultValue: 'default',
    options: [
      { label: 'Primary', value: 'default' },
      { label: 'Secondary', value: 'secondary' },
      { label: 'Outline', value: 'outline' },
    ],
    required: true,
    ...(includeDisplayMode
      ? {
          admin: {
            condition: isButtonMode,
          },
        }
      : {}),
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
  required: true,
  ...(condition
    ? {
        admin: {
          condition,
        },
      }
    : {}),
})

// Returns [modeSelectField, actionsArrayField] so both can be spread together in the
// Content tab, keeping "how" next to "what" without splitting across tabs.
export const createContentActionsWithModeFields = ({
  includeDisplayMode = false,
  label = 'Actions',
  maxRows = 2,
  modeLabel,
  name = 'actions',
}: CreateContentActionsWithModeFieldsOptions = {}): Field[] => {
  // actions → actionMode, footerActions → footerActionMode
  const modeName = name.replace(/s$/, 'Mode')
  const resolvedModeLabel = modeLabel ?? label.replace(/s$/, '') + ' Mode'
  return [
    { ...createContentActionModeField({ label: resolvedModeLabel, name: modeName }), required: false },
    createContentActionsField({ includeDisplayMode, label, maxRows, name }),
  ]
}

export const createContentActionsField = ({
  includeDisplayMode = false,
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
