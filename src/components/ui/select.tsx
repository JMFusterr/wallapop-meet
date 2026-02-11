import * as React from "react"

import { cn } from "@/lib/utils"

type SelectState = "default" | "error"
type SelectSize = "md" | "lg"

type SelectProps = Omit<React.ComponentProps<"select">, "size"> & {
  label?: string
  hint?: string
  error?: string
  state?: SelectState
  size?: SelectSize
}

const selectBaseClass =
  "w-full appearance-none rounded-[var(--wm-radius-200)] border bg-[var(--wm-color-background-base)] pr-10 text-[16px] leading-[1.4] text-[var(--wm-color-text-primary)] transition-colors duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--wm-color-border-focus)] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"

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

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      hint,
      error,
      state = "default",
      size = "md",
      id,
      children,
      ...props
    },
    ref
  ) => {
    const resolvedState: SelectState = error ? "error" : state
    const helperMessage = error ?? hint
    const helperClassName = error ? errorTextClass : helperTextClass
    const selectId = React.useId()
    const resolvedId = id ?? selectId

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label ? (
          <label
            htmlFor={resolvedId}
            className="text-[14px] font-medium leading-[1.4] text-[var(--wm-color-text-primary)]"
          >
            {label}
          </label>
        ) : null}
        <div className="relative">
          <select
            ref={ref}
            id={resolvedId}
            data-slot="select"
            aria-invalid={resolvedState === "error"}
            className={cn(
              selectBaseClass,
              selectStateClass[resolvedState],
              selectSizeClass[size],
              className
            )}
            {...props}
          >
            {children}
          </select>
          <span
            className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--wm-color-text-secondary)]"
            aria-hidden="true"
          >
            ▼
          </span>
        </div>
        {helperMessage ? <p className={helperClassName}>{helperMessage}</p> : null}
      </div>
    )
  }
)

Select.displayName = "Select"

export { Select }
