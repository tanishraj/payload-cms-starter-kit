'use client'

// Authenticated source (2026-10-14): @shadcnblocks/radio-group-radio-group-form-1,
// @shadcnblocks/field-field-toggles-2, @shadcnblocks/combobox-combobox-multi-select-3.
// Adaptations: controlled schema answers, unique IDs, accessible form errors,
// contextual search and website-theme portal. Upstream layouts/styles preserved.
import { useState, type ComponentProps, type Ref } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/revamp/ui/button'
import { Checkbox } from '@/components/revamp/ui/checkbox'
import { Field, FieldGroup, FieldLabel } from '@/components/revamp/ui/field'
import { Label } from '@/components/revamp/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/revamp/ui/radio-group'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/revamp/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/revamp/ui/popover'
import { cn } from '@/lib/utils'
import type { FormAnswer, SimpleFormField } from '@/lib/forms'

type Props = Pick<
  ComponentProps<'button'>,
  'id' | 'aria-invalid' | 'aria-required' | 'aria-describedby' | 'aria-labelledby'
> & {
  id: string
  definition: SimpleFormField
  value: FormAnswer
  onChange: (value: FormAnswer) => void
  onBlur: () => void
  controlRef: Ref<HTMLButtonElement>
  disabled: boolean
  container?: HTMLElement | null
}

export function FormChoiceControl({
  definition,
  value,
  onChange,
  onBlur,
  controlRef,
  disabled,
  container,
  ...a11y
}: Props) {
  const [open, setOpen] = useState(false)
  const options = definition.options ?? []
  const selected = Array.isArray(value) ? value : []
  const toggle = (option: string) =>
    onChange(
      selected.includes(option)
        ? selected.filter((item) => item !== option)
        : [...selected, option],
    )
  const optionID = (index: number) => `${a11y.id}-option-${index}`
  if (definition.type === 'radio')
    return (
      <>
        <RadioGroup
          {...a11y}
          className="flex flex-col space-y-1"
          name={definition.name}
          value={typeof value === 'string' ? value : ''}
          onValueChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={Boolean(definition.required)}
        >
          {options.map((option, index) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem
                id={optionID(index)}
                value={option.value}
                ref={index === 0 ? controlRef : undefined}
                aria-invalid={a11y['aria-invalid']}
                aria-describedby={a11y['aria-describedby']}
              />
              <Label htmlFor={optionID(index)}>{option.label}</Label>
            </div>
          ))}
        </RadioGroup>
        {!definition.required && typeof value === 'string' && value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => onChange('')}
          >
            Clear {definition.label}
          </Button>
        )}
      </>
    )
  if (definition.type === 'checkboxGroup')
    return (
      <FieldGroup className="gap-3" id={a11y.id}>
        {options.map((option, index) => (
          <Field
            key={option.value}
            orientation="horizontal"
            data-invalid={a11y['aria-invalid']}
            data-disabled={disabled}
          >
            <Checkbox
              id={optionID(index)}
              ref={index === 0 ? controlRef : undefined}
              checked={selected.includes(option.value)}
              onCheckedChange={() => toggle(option.value)}
              onBlur={onBlur}
              disabled={disabled}
              aria-invalid={a11y['aria-invalid']}
              aria-describedby={a11y['aria-describedby']}
            />
            <FieldLabel className="font-normal" htmlFor={optionID(index)}>
              {option.label}
            </FieldLabel>
          </Field>
        ))}
      </FieldGroup>
    )
  return (
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          {...a11y}
          ref={controlRef}
          type="button"
          onBlur={onBlur}
          disabled={disabled}
          aria-expanded={open && !disabled}
          aria-controls={open && !disabled ? `${a11y.id}-picker` : undefined}
          aria-haspopup="dialog"
          className="w-[200px] max-w-full justify-between"
          role="combobox"
          variant="outline"
        >
          {selected.length ? (
            <span>
              {selected.length} option{selected.length > 1 ? 's' : ''} selected
            </span>
          ) : (
            'Select options...'
          )}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        id={`${a11y.id}-picker`}
        aria-label={definition.label}
        container={container}
        className="w-[200px] p-0"
      >
        <Command label={`Search ${definition.label}`}>
          <CommandInput placeholder="Search options..." aria-label={`Search ${definition.label}`} />
          <CommandList id={`${a11y.id}-list`} aria-multiselectable="true" label={definition.label}>
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  keywords={[option.label]}
                  data-checked={selected.includes(option.value)}
                  aria-label={`${option.label}, ${selected.includes(option.value) ? 'selected' : 'not selected'}`}
                  onSelect={() => toggle(option.value)}
                >
                  <Check
                    aria-hidden="true"
                    className={cn(
                      'mr-2 size-4',
                      selected.includes(option.value) ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
