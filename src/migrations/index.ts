import * as migration_20260829_000000_rename_snmih_theme_values from './20260829_000000_rename_snmih_theme_values'
import * as migration_20260831_000000_provision_legal_pages from './20260831_000000_provision_legal_pages'
import * as migration_20260831_010000_nest_department_profiles from './20260831_010000_nest_department_profiles'

export const migrations = [
  {
    up: migration_20260829_000000_rename_snmih_theme_values.up,
    down: migration_20260829_000000_rename_snmih_theme_values.down,
    name: '20260829_000000_rename_snmih_theme_values',
  },
  {
    up: migration_20260831_000000_provision_legal_pages.up,
    down: migration_20260831_000000_provision_legal_pages.down,
    name: '20260831_000000_provision_legal_pages',
  },
  {
    up: migration_20260831_010000_nest_department_profiles.up,
    down: migration_20260831_010000_nest_department_profiles.down,
    name: '20260831_010000_nest_department_profiles',
  },
]
