import * as migration_20260829_000000_rename_snmih_theme_values from './20260829_000000_rename_snmih_theme_values'

export const migrations = [
  {
    up: migration_20260829_000000_rename_snmih_theme_values.up,
    down: migration_20260829_000000_rename_snmih_theme_values.down,
    name: '20260829_000000_rename_snmih_theme_values',
  },
]
