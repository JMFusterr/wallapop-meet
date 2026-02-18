import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex min-w-0 items-center justify-center whitespace-nowrap border font-normal transition-[color,background-color,box-shadow,opacity] duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--wm-color-border-focus)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "rounded-[100px] border-[#3DD2BA] bg-[#3DD2BA] font-wallie-chunky text-[16px] leading-6 text-[#29363D] hover:brightness-[0.98] active:brightness-95",
        nav_expandable:
          "rounded-none border-transparent bg-transparent font-wallie-fit text-[16px] leading-6 text-[#29363D] hover:bg-[rgba(41,54,61,0.06)] active:bg-[rgba(41,54,61,0.1)]",
        tab: "rounded-none border-transparent bg-transparent font-wallie text-[16px] leading-6 text-black hover:bg-[rgba(0,0,0,0.04)] active:bg-[rgba(0,0,0,0.08)] data-[selected=true]:font-semibold",
        inline_action:
          "rounded-[25px] border-transparent bg-[#3DAABF] font-wallie text-[14px] leading-[21px] text-white hover:brightness-[0.98] active:brightness-95",
        icon: "rounded-full border-transparent bg-[#ECEFF1] text-black shadow-[0_4px_4px_0_rgba(37,50,56,0.15)] hover:brightness-[0.98] active:brightness-95",
        menu_close:
          "rounded-[12px] border-transparent bg-white font-wallie text-[16px] leading-6 text-black hover:bg-[#f6f7f8] active:bg-[#eceff1]",

        // Legacy aliases: mantener temporalmente para no romper usos existentes.
        secondary:
          "border border-[var(--wm-color-border-default)] bg-[var(--wm-color-background-base)] text-[var(--wm-color-text-primary)] hover:bg-[var(--wm-color-background-surface)]",
        ghost:
          "bg-transparent text-[var(--wm-color-text-primary)] hover:bg-[var(--wm-color-background-surface)]",
        critical:
          "bg-[var(--wm-color-semantic-error)] text-[var(--wm-color-brand-on-primary)] hover:brightness-95",
      },
      size: {
        sm: "h-9 px-3 text-[14px]",
        md: "h-10 px-6",
        lg: "h-[47px] px-2",
        tab: "h-[35px] px-1.5",
        icon: "size-6 p-0",
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

export { Button, buttonVariants }
