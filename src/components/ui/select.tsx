import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

type SelectState = "default" | "error"
type SelectSize = "md" | "lg"

type SelectOption = {
  value: string
  label: string
  disabled?: boolean
}

type SelectProps = Omit<React.ComponentProps<"select">, "size" | "onChange"> & {
  label?: string
  hint?: string
  error?: string
  state?: SelectState
  size?: SelectSize
  options?: SelectOption[]
  placeholder?: string
  onValueChange?: (nextValue: string) => void
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void
  maxVisibleOptions?: number
  dropdownDirection?: "up" | "down"
}

const selectBaseClass =
  "w-full rounded-[var(--wm-radius-200)] border bg-[var(--wm-color-background-base)] pr-10 text-left text-[16px] leading-[1.4] text-[var(--wm-color-text-primary)] transition-colors duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--wm-color-border-focus)] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"

const selectStateClass: Record<SelectState, string> = {
  default: "border-[var(--wm-color-border-default)]",
  error: "border-[var(--wm-color-border-error)] focus-visible:ring-[var(--wm-color-border-error)]",
}

const selectSizeClass: Record<SelectSize, string> = {
  md: "min-h-11 px-4 py-2.5",
  lg: "min-h-12 px-4 py-3",
}

const helperTextClass =
  "text-[12px] leading-[1.4] text-[var(--wm-color-text-secondary)]"

const errorTextClass = "text-[12px] leading-[1.4] text-[var(--wm-color-semantic-error)]"

function extractOptionsFromChildren(children: React.ReactNode): SelectOption[] {
  return React.Children.toArray(children).flatMap((child) => {
    if (!React.isValidElement(child) || child.type !== "option") {
      return []
    }

    const optionElement = child as React.ReactElement<{
      value?: string
      children?: React.ReactNode
      disabled?: boolean
    }>

    const optionValue =
      typeof optionElement.props.value === "string"
        ? optionElement.props.value
        : String(optionElement.props.value ?? "")
    const optionLabel =
      typeof optionElement.props.children === "string"
        ? optionElement.props.children
        : String(optionElement.props.children ?? "")

    return [
      {
        value: optionValue,
        label: optionLabel,
        disabled: Boolean(optionElement.props.disabled),
      },
    ]
  })
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      className,
      label,
      hint,
      error,
      state = "default",
      size = "md",
      id,
      options,
      value,
      defaultValue,
      placeholder = "Selecciona una opcion",
      onValueChange,
      children,
      disabled,
      name,
      required,
      maxVisibleOptions = 10,
      dropdownDirection = "down",
      ...props
    },
    ref
  ) => {
    const resolvedState: SelectState = error ? "error" : state
    const helperMessage = error ?? hint
    const helperClassName = error ? errorTextClass : helperTextClass
    const selectId = React.useId()
    const resolvedId = id ?? selectId
    const listboxId = `${resolvedId}-listbox`
    const isControlled = value !== undefined
    const fallbackOptions = React.useMemo(() => extractOptionsFromChildren(children), [children])
    const resolvedOptions = options ?? fallbackOptions
    const initialValue = typeof defaultValue === "string" ? defaultValue : ""
    const [internalValue, setInternalValue] = React.useState(initialValue)
    const [isOpen, setIsOpen] = React.useState(false)
    const rootRef = React.useRef<HTMLDivElement | null>(null)

    const resolvedValue = isControlled ? String(value ?? "") : internalValue
    const selectedOption = resolvedOptions.find((option) => option.value === resolvedValue)

    React.useEffect(() => {
      if (!isOpen) {
        return
      }

      const handlePointerDown = (event: MouseEvent) => {
        if (!rootRef.current) {
          return
        }
        if (!rootRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setIsOpen(false)
        }
      }

      window.addEventListener("mousedown", handlePointerDown)
      window.addEventListener("keydown", handleEscape)
      return () => {
        window.removeEventListener("mousedown", handlePointerDown)
        window.removeEventListener("keydown", handleEscape)
      }
    }, [isOpen])

    const emitChange = (nextValue: string) => {
      const syntheticEvent = {
        target: { value: nextValue, name },
        currentTarget: { value: nextValue, name },
      } as unknown as React.ChangeEvent<HTMLSelectElement>
      onValueChange?.(nextValue)
      props.onChange?.(syntheticEvent)
    }

    const handleSelectOption = (nextValue: string) => {
      if (!isControlled) {
        setInternalValue(nextValue)
      }
      emitChange(nextValue)
      setIsOpen(false)
    }

    const optionHeightPx = 36
    const dropdownHeightStyle = {
      maxHeight: `${Math.max(1, maxVisibleOptions) * optionHeightPx}px`,
    }

    return (
      <div ref={rootRef} className="flex w-full flex-col gap-1.5">
        {label ? (
          <label
            htmlFor={resolvedId}
            className="text-[14px] font-medium leading-[1.4] text-[var(--wm-color-text-primary)]"
          >
            {label}
          </label>
        ) : null}
        <div className="relative">
          <button
            ref={ref}
            id={resolvedId}
            type="button"
            data-slot="select"
            aria-invalid={resolvedState === "error"}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            disabled={disabled}
            className={cn(
              selectBaseClass,
              selectStateClass[resolvedState],
              selectSizeClass[size],
              className
            )}
            onClick={() => setIsOpen((previous) => !previous)}
          >
            <span className={cn(!selectedOption && "text-[var(--wm-color-text-secondary)]")}>
              {selectedOption?.label ?? placeholder}
            </span>
          </button>
          <span
            className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--wm-color-text-secondary)]/70"
            aria-hidden="true"
          >
            <ChevronDown size={14} strokeWidth={1.8} />
          </span>
          {isOpen ? (
            <ul
              id={listboxId}
              role="listbox"
              aria-labelledby={resolvedId}
              className={cn(
                "absolute z-50 w-full overflow-y-auto rounded-[var(--wm-radius-200)] border border-[var(--wm-color-border-default)] bg-[var(--wm-color-background-base)] py-1 shadow-[0_10px_24px_rgba(16,42,67,0.14)]",
                dropdownDirection === "up" ? "bottom-full mb-1" : "top-full mt-1"
              )}
              style={dropdownHeightStyle}
            >
              {resolvedOptions.map((option) => {
                const isSelected = option.value === resolvedValue
                return (
                  <li key={option.value} role="none">
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={option.disabled}
                      onClick={() => handleSelectOption(option.value)}
                      className={cn(
                        "flex h-9 w-full items-center px-3 text-left text-[13px] text-[var(--wm-color-text-primary)] transition-colors",
                        isSelected && "bg-[var(--wm-color-background-surface)]",
                        !isSelected && "hover:bg-[var(--wm-color-background-surface)]",
                        option.disabled && "cursor-not-allowed opacity-40"
                      )}
                    >
                      {option.label}
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : null}
          <select
            tabIndex={-1}
            aria-hidden="true"
            className="hidden"
            value={resolvedValue}
            name={name}
            required={required}
            onChange={() => {
              // El valor se sincroniza desde el dropdown custom.
            }}
          >
            {resolvedOptions.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {helperMessage ? <p className={helperClassName}>{helperMessage}</p> : null}
      </div>
    )
  }
)

Select.displayName = "Select"

export { Select, type SelectOption }
