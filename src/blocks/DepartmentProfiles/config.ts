import type { ArrayField, Block, CheckboxField, SelectField, TabsField, TextField } from 'payload'

import { getBlockThumbnailAdmin } from '@/block-thumbnails/definitions'
import { createBlockAppearanceFields } from '@/blocks/shared/blockAppearanceFields'
import { createContentActionsField } from '@/blocks/shared/contentActionsFields'

type HeaderLayoutSiblingData = {
  headerLayout?: 'split' | 'stacked' | null
}

type DirectoryControlSiblingData = {
  showDepartmentTabs?: boolean | null
  showSearch?: boolean | null
}

type CardLayoutSiblingData = {
  cardLayout?: 'inline' | 'overlay' | null
}

type CardSizeSiblingData = {
  cardLayout?: 'inline' | 'overlay' | null
  cardSize?: 'lg' | 'md' | 'sm' | null
}

type DepartmentValue = {
  id?: string | null
  name?: string | null
}

type DepartmentProfilesBlockData = {
  departments?: DepartmentValue[] | null
}

const isSplitHeader = (_data: unknown, siblingData: HeaderLayoutSiblingData) =>
  siblingData?.headerLayout !== 'stacked'

const showsSearch = (_data: unknown, siblingData: DirectoryControlSiblingData) =>
  siblingData?.showSearch !== false

const showsDepartmentTabs = (_data: unknown, siblingData: DirectoryControlSiblingData) =>
  siblingData?.showDepartmentTabs !== false

const usesOverlayCards = (_data: unknown, siblingData: CardLayoutSiblingData) =>
  siblingData?.cardLayout !== 'inline'

const usesBaseColumns = (_data: unknown, siblingData: CardSizeSiblingData) =>
  siblingData?.cardLayout === 'inline' ||
  (siblingData?.cardSize !== 'md' && siblingData?.cardSize !== 'sm')

const usesMediumCards = (_data: unknown, siblingData: CardSizeSiblingData) =>
  siblingData?.cardLayout !== 'inline' && siblingData?.cardSize === 'md'

const usesSmallCards = (_data: unknown, siblingData: CardSizeSiblingData) =>
  siblingData?.cardLayout !== 'inline' && siblingData?.cardSize === 'sm'

const normalizeDepartmentName = (value?: string | null) => value?.trim().toLocaleLowerCase() ?? ''

export const validateDepartmentRows = (value: unknown): string | true => {
  if (!Array.isArray(value)) return true

  const seen = new Set<string>()
  for (const row of value as DepartmentValue[]) {
    const normalizedName = normalizeDepartmentName(row?.name)
    if (!normalizedName) return 'Every department must have a name.'
    if (seen.has(normalizedName)) return 'Department names must be unique.'
    seen.add(normalizedName)
  }

  return true
}

export const validateProfileDepartment = (
  value: unknown,
  { blockData }: { blockData?: Partial<DepartmentProfilesBlockData> },
): string | true => {
  if (typeof value !== 'string' || !value.trim()) return 'Select a department.'

  const departmentExists = (blockData?.departments ?? []).some(
    (department) => department?.id === value,
  )

  return departmentExists
    ? true
    : 'This department is no longer available. Select a configured department.'
}

const departmentsField = {
  name: 'departments',
  label: 'Departments',
  type: 'array',
  required: true,
  minRows: 1,
  maxRows: 50,
  validate: validateDepartmentRows,
  admin: {
    description: 'Add departments once in the order they should appear in the public filter tabs.',
    initCollapsed: true,
  },
  fields: [
    {
      name: 'name',
      label: 'Department Name',
      type: 'text',
      required: true,
    },
  ],
} satisfies ArrayField

const profilesField = {
  name: 'profiles',
  label: 'Department Profiles',
  type: 'array',
  required: true,
  minRows: 1,
  maxRows: 200,
  admin: {
    description: 'Profiles shown in their displayed order.',
    initCollapsed: true,
  },
  fields: [
    {
      name: 'image',
      label: 'Profile Image',
      type: 'upload',
      relationTo: 'media',
    },
    { name: 'name', type: 'text', required: true },
    { name: 'designation', type: 'text' },
    {
      name: 'departmentId',
      label: 'Department',
      type: 'text',
      required: true,
      validate: validateProfileDepartment,
      admin: {
        components: {
          Field: '/blocks/DepartmentProfiles/DepartmentSelectField#DepartmentSelectField',
        },
        description: 'Choose one department from the list configured above.',
      },
    } satisfies TextField,
    {
      name: 'imagePosition',
      label: 'Image Position',
      type: 'select',
      defaultValue: 'center',
      required: true,
      options: [
        { label: 'Center', value: 'center' },
        { label: 'Top', value: 'top' },
        { label: 'Bottom', value: 'bottom' },
        { label: 'Left', value: 'left' },
        { label: 'Right', value: 'right' },
      ],
    } satisfies SelectField,
  ],
} satisfies ArrayField

export const DepartmentProfilesBlock: Block = {
  admin: getBlockThumbnailAdmin('departmentProfiles'),
  slug: 'departmentProfiles',
  interfaceName: 'DepartmentProfilesBlock',
  labels: {
    singular: 'Department Profiles',
    plural: 'Department Profiles',
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
              admin: { description: 'Small label above the section title.' },
            },
            { name: 'title', type: 'text' },
            {
              name: 'accentTitle',
              label: 'Accent Title',
              type: 'text',
              admin: { description: 'Optional italic second line of the heading.' },
            },
            { name: 'description', type: 'textarea' },
            createContentActionsField({ label: 'Section Actions', maxRows: 2 }),
            departmentsField,
            profilesField,
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
              name: 'showSearch',
              label: 'Show Search',
              type: 'checkbox',
              defaultValue: true,
            } satisfies CheckboxField,
            {
              name: 'searchPlaceholder',
              label: 'Search Placeholder',
              type: 'text',
              defaultValue: 'Search profiles',
              admin: { condition: showsSearch },
            },
            {
              name: 'showDepartmentTabs',
              label: 'Show Department Tabs',
              type: 'checkbox',
              defaultValue: true,
            } satisfies CheckboxField,
            {
              name: 'allTabLabel',
              label: 'All Tab Label',
              type: 'text',
              defaultValue: 'All',
              admin: { condition: showsDepartmentTabs },
            },
            {
              name: 'tabVariant',
              label: 'Department Tab Style',
              type: 'select',
              defaultValue: 'pill',
              required: true,
              options: [
                { label: 'Pill', value: 'pill' },
                { label: 'Underline', value: 'underline' },
                { label: 'Contained', value: 'contained' },
              ],
              admin: { condition: showsDepartmentTabs },
            } satisfies SelectField,
            {
              name: 'profilesPerLoad',
              label: 'Profiles Per Load',
              type: 'select',
              defaultValue: '20',
              required: true,
              options: [
                { label: '12 Profiles', value: '12' },
                { label: '16 Profiles', value: '16' },
                { label: '20 Profiles', value: '20' },
                { label: '24 Profiles', value: '24' },
              ],
            } satisfies SelectField,
            {
              name: 'loadMoreLabel',
              label: 'Load More Label',
              type: 'text',
              defaultValue: 'Load More',
            },
            {
              name: 'noResultsMessage',
              label: 'No Results Message',
              type: 'text',
              defaultValue: 'No matching profiles found.',
            },
            {
              name: 'cardLayout',
              label: 'Card Layout',
              type: 'select',
              defaultValue: 'overlay',
              required: true,
              options: [
                { label: 'Image Overlay', value: 'overlay' },
                { label: 'Inline', value: 'inline' },
              ],
            } satisfies SelectField,
            {
              name: 'cardSize',
              label: 'Card Size',
              type: 'select',
              defaultValue: 'lg',
              required: true,
              options: [
                { label: 'Small', value: 'sm' },
                { label: 'Medium', value: 'md' },
                { label: 'Large', value: 'lg' },
              ],
              admin: {
                description: 'Controls card proportion, media size, spacing, and typography.',
              },
            } satisfies SelectField,
            {
              name: 'themeMode',
              label: 'Overlay Tone',
              type: 'select',
              defaultValue: 'dark',
              required: true,
              options: [
                { label: 'Auto', value: 'auto' },
                { label: 'Dark', value: 'dark' },
                { label: 'Brand', value: 'brand' },
              ],
              admin: {
                condition: usesOverlayCards,
                description:
                  'Auto uses Brand on brand sections and Dark elsewhere. Light tone is excluded to protect small-text contrast.',
              },
            } satisfies SelectField,
            {
              name: 'overlayStyle',
              label: 'Overlay Strength',
              type: 'select',
              defaultValue: 'dark',
              required: true,
              options: [
                { label: 'Dark', value: 'dark' },
                { label: 'Darker', value: 'darker' },
              ],
              admin: { condition: usesOverlayCards },
            } satisfies SelectField,
            {
              name: 'contentAlignment',
              label: 'Section Content Alignment',
              type: 'select',
              defaultValue: 'left',
              required: true,
              options: [
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
                { label: 'Right', value: 'right' },
              ],
            } satisfies SelectField,
            {
              name: 'headerLayout',
              label: 'Header Layout',
              type: 'select',
              defaultValue: 'split',
              required: true,
              options: [
                { label: 'Split', value: 'split' },
                { label: 'Stacked', value: 'stacked' },
              ],
            } satisfies SelectField,
            {
              name: 'descriptionPosition',
              label: 'Description Placement',
              type: 'select',
              defaultValue: 'side',
              required: true,
              options: [
                { label: 'Right Column', value: 'side' },
                { label: 'Under Title', value: 'underTitle' },
              ],
              admin: { condition: isSplitHeader },
            } satisfies SelectField,
            {
              name: 'sideContentAlignment',
              label: 'Right Column Alignment',
              type: 'select',
              defaultValue: 'bottom',
              required: true,
              options: [
                { label: 'Top', value: 'top' },
                { label: 'Bottom', value: 'bottom' },
              ],
              admin: { condition: isSplitHeader },
            } satisfies SelectField,
            {
              name: 'columns',
              label: 'Profiles per Row',
              type: 'select',
              defaultValue: '4',
              required: true,
              options: [
                { label: '2 Columns', value: '2' },
                { label: '3 Columns', value: '3' },
                { label: '4 Columns', value: '4' },
              ],
              admin: { condition: usesBaseColumns },
            } satisfies SelectField,
            {
              name: 'mediumColumns',
              label: 'Profiles per Row',
              type: 'select',
              defaultValue: '6',
              required: true,
              options: [
                { label: '3 Columns', value: '3' },
                { label: '4 Columns', value: '4' },
                { label: '5 Columns', value: '5' },
                { label: '6 Columns', value: '6' },
              ],
              admin: { condition: usesMediumCards },
            } satisfies SelectField,
            {
              name: 'smallColumns',
              label: 'Profiles per Row',
              type: 'select',
              defaultValue: '8',
              required: true,
              options: [
                { label: '4 Columns', value: '4' },
                { label: '5 Columns', value: '5' },
                { label: '6 Columns', value: '6' },
                { label: '7 Columns', value: '7' },
                { label: '8 Columns', value: '8' },
              ],
              admin: { condition: usesSmallCards },
            } satisfies SelectField,
            {
              name: 'cardFrame',
              label: 'Card Frame',
              type: 'select',
              defaultValue: 'boxed',
              required: true,
              options: [
                { label: 'Boxed Cards', value: 'boxed' },
                { label: 'Framed Grid', value: 'framed' },
                { label: 'Ruled Grid', value: 'open' },
              ],
            } satisfies SelectField,
            {
              name: 'size',
              label: 'Section Padding',
              type: 'select',
              defaultValue: 'default',
              required: true,
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
