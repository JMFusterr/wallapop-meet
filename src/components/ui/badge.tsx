import * as React from "react"

import { cn } from "@/lib/utils"

type BadgeVariant = "unread" | "success" | "error"

type BadgeProps = React.ComponentProps<"span"> & {
  value?: number | string
  showWhenZero?: boolean
  variant?: BadgeVariant
}

const badgeVariantClass: Record<BadgeVariant, string> = {
  unread: "bg-[var(--status-sold)] text-[var(--text-inverse)]",
  success: "bg-[var(--feedback-success)] text-[var(--text-inverse)]",
  error: "bg-[var(--feedback-error)] text-[var(--text-inverse)]",
}

function Badge({
  className,
  value,
  showWhenZero = false,
  variant = "unread",
  children,
  ...props
}: BadgeProps) {
  const hasNumericValue = typeof value === "number"
  const isZeroValue = hasNumericValue && value <= 0
  const shouldHide = isZeroValue && !showWhenZero
  const content = value ?? children

  if (shouldHide || content == null || content === "") {
    return null
  }

  return (
    <span
      data-slot="badge"
      data-variant={variant}
      className={cn(
        "inline-flex min-h-6 min-w-6 items-center justify-center rounded-full px-1.5 font-wallie text-[12px] leading-[18px]",
        badgeVariantClass[variant],
        className
      )}
      {...props}
    >
      {content}
    </span>
  )
}

export { Badge }
