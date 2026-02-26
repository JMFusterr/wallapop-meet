import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex min-w-0 items-center justify-center whitespace-nowrap font-normal transition-[color,background-color,box-shadow,opacity] duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "rounded-[100px] border-[var(--action-primary)] bg-[var(--action-primary)] font-wallie-chunky text-[16px] leading-6 text-[var(--text-on-action)] hover:border-[var(--action-primary-hover)] hover:bg-[var(--action-primary-hover)] active:border-[var(--action-primary-pressed)] active:bg-[var(--action-primary-pressed)] disabled:border-[var(--action-disabled-bg)] disabled:bg-[var(--action-disabled-bg)] disabled:text-[var(--action-disabled-text)] disabled:opacity-100",
        nav_expandable:
          "rounded-none border-transparent bg-transparent font-wallie-fit text-[16px] leading-6 text-[var(--text-primary)] hover:bg-[var(--bg-surface)] active:bg-[var(--bg-accent-subtle)]",
        tab: "rounded-[999px] border-transparent bg-transparent px-4 font-wallie-chunky text-[16px] leading-6 text-[var(--text-primary)] transition-[color,background-color] duration-150 ease-out hover:bg-[var(--bg-surface)] active:bg-[var(--bg-accent-subtle)] data-[selected=true]:bg-[var(--text-primary)] data-[selected=true]:text-[var(--text-inverse)] aria-selected:bg-[var(--text-primary)] aria-selected:text-[var(--text-inverse)] disabled:bg-transparent disabled:text-[var(--action-disabled-text)] disabled:opacity-100",
        inline_action:
          "rounded-[25px] border-transparent bg-[var(--action-primary)] font-wallie text-[14px] leading-[21px] text-[var(--text-on-action)] hover:bg-[var(--action-primary-hover)] active:bg-[var(--action-primary-pressed)]",
        icon: "rounded-full border-transparent bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[0_4px_4px_0_rgba(37,50,56,0.15)] hover:brightness-[0.98] active:brightness-95",
        menu_close:
          "rounded-[12px] border-transparent bg-[var(--bg-base)] font-wallie text-[16px] leading-6 text-[var(--text-primary)] hover:bg-[var(--bg-surface)] active:bg-[var(--border-divider)]",

        // Legacy aliases: mantener temporalmente para no romper usos existentes.
        secondary:
          "rounded-[999px] border border-[var(--action-primary-hover)] bg-[var(--bg-base)] font-wallie-chunky text-[16px] text-[var(--action-primary-hover)] hover:bg-[var(--bg-surface)] active:bg-[var(--bg-accent-subtle)]",
        ghost:
          "border-none bg-transparent font-wallie-chunky text-[16px] text-[var(--text-secondary)] underline underline-offset-2 hover:bg-transparent hover:text-[var(--text-primary)] active:bg-transparent",
        critical:
          "rounded-[25px] border-transparent bg-[var(--feedback-error)] text-[var(--text-inverse)] hover:brightness-95",
        link:
          "border-none bg-transparent px-0 font-wallie-fit text-[14px] text-[var(--action-primary)] underline underline-offset-2 hover:text-[var(--action-primary-hover)] active:text-[var(--action-primary-pressed)]",
      },
      size: {
        sm: "h-9 px-3 text-[14px]",
        md: "h-10 px-6",
        lg: "h-[47px] px-2",
        tab: "h-10",
        icon: "size-11 p-0 sm:size-6",
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
  const resolvedSize =
    size ??
    (variant === "icon"
      ? "icon"
      : variant === "tab"
        ? "tab"
        : "md")
  const isIconOnlyVariant = variant === "icon" || variant === "menu_close"

  if (
    import.meta.env.DEV &&
    isIconOnlyVariant &&
    !props["aria-label"] &&
    !props["aria-labelledby"]
  ) {
    // En variantes icon-only, forzamos documentación viva en runtime durante desarrollo.
    console.warn(
      "Button icon-only requiere aria-label o aria-labelledby para accesibilidad."
    )
  }

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={resolvedSize}
      aria-busy={loading}
      disabled={isDisabled}
      className={cn(buttonVariants({ variant, size: resolvedSize, className }))}
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

export { Button }
