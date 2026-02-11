import * as React from "react"

import { cn } from "@/lib/utils"

type InputState = "default" | "error"

type InputProps = Omit<React.ComponentProps<"input">, "size"> & {
  label?: string
  hint?: string
  error?: string
  state?: InputState
}

const inputBaseClass =
  "w-full rounded-[var(--wm-radius-200)] border bg-[var(--wm-color-background-base)] px-4 py-3 text-[16px] leading-[1.4] text-[var(--wm-color-text-primary)] transition-colors duration-150 ease-out placeholder:text-[var(--wm-color-text-secondary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--wm-color-border-focus)] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"

const inputStateClass: Record<InputState, string> = {
  default: "border-[var(--wm-color-border-default)]",
  error: "border-[var(--wm-color-border-error)] focus-visible:ring-[var(--wm-color-border-error)]",
}

const helperTextClass =
  "text-[12px] leading-[1.4] text-[var(--wm-color-text-secondary)]"

const errorTextClass = "text-[12px] leading-[1.4] text-[var(--wm-color-semantic-error)]"

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, state = "default", id, ...props }, ref) => {
    const resolvedState: InputState = error ? "error" : state
    const helperMessage = error ?? hint
    const helperClassName = error ? errorTextClass : helperTextClass
    const inputId = React.useId()
    const resolvedId = id ?? inputId

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
        <input
          ref={ref}
          id={resolvedId}
          data-slot="input"
          aria-invalid={resolvedState === "error"}
          className={cn(inputBaseClass, inputStateClass[resolvedState], className)}
          {...props}
        />
        {helperMessage ? <p className={helperClassName}>{helperMessage}</p> : null}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input }
