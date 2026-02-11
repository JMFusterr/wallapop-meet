import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex min-w-0 items-center justify-center whitespace-nowrap rounded-[var(--wm-radius-200)] text-[16px] font-semibold leading-[1.4] transition-colors duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--wm-color-border-focus)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--wm-color-brand-primary)] text-[var(--wm-color-brand-on-primary)] hover:bg-[var(--wm-color-brand-primary-hover)]",
        secondary:
          "border border-[var(--wm-color-border-default)] bg-[var(--wm-color-background-base)] text-[var(--wm-color-text-primary)] hover:bg-[var(--wm-color-background-surface)]",
        ghost:
          "bg-transparent text-[var(--wm-color-text-primary)] hover:bg-[var(--wm-color-background-surface)]",
        critical:
          "bg-[var(--wm-color-semantic-error)] text-[var(--wm-color-brand-on-primary)] hover:brightness-95",
      },
      size: {
        sm: "h-9 px-3 text-[14px]",
        md: "h-10 px-4",
        lg: "h-11 px-6",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    loading?: boolean
    loadingText?: string
  }

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  loadingText = "Cargando...",
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button"
  const isDisabled = disabled || loading

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      aria-busy={loading}
      disabled={isDisabled}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      <span className={cn("inline-flex items-center", loading && "opacity-0")}>
        {children}
      </span>
      {loading ? (
        <span className="absolute inset-0 inline-flex items-center justify-center gap-2">
          <span
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
          <span>{loadingText}</span>
        </span>
      ) : null}
    </Comp>
  )
}

export { Button, buttonVariants }
