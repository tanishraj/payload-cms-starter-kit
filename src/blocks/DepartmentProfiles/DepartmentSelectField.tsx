'use client'

import { useMemo } from 'react'

import { SelectInput, useField, useFormFields } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'

import { getDepartmentOptionsFromFormFields, type DepartmentFormFields } from './departmentOptions'

export const DepartmentSelectField: TextFieldClientComponent = (props) => {
  const {
    field: { name, admin: { description, placeholder } = {}, label, required },
    path: pathFromProps,
    readOnly,
  } = props
  const fields = useFormFields(([formFields]) => formFields as DepartmentFormFields)
  const {
    customComponents: { AfterInput, BeforeInput, Description, Error, Label } = {},
    disabled,
    path,
    setValue,
    showError,
    value,
  } = useField<string | null>({ potentiallyStalePath: pathFromProps })
  const options = useMemo(
    () => getDepartmentOptionsFromFormFields(fields, path, value),
    [fields, path, value],
  )

  return (
    <SelectInput
      AfterInput={AfterInput}
      BeforeInput={BeforeInput}
      Description={Description}
      description={description}
      Error={Error}
      isClearable={!required}
      Label={Label}
      label={label}
      name={name}
      onChange={(selectedOption) => {
        const option = Array.isArray(selectedOption) ? selectedOption[0] : selectedOption
        setValue(option && typeof option.value === 'string' ? option.value : null)
      }}
      options={options}
      path={path}
      placeholder={
        options.length
          ? typeof placeholder === 'string'
            ? placeholder
            : 'Select a department'
          : 'Add a department above first'
      }
      readOnly={readOnly || disabled || options.length === 0}
      required={required}
      showError={showError}
      value={value ?? undefined}
    />
  )
}
