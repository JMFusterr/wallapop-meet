import * as React from "react"

import { cn } from "@/lib/utils"

type NoticeBannerTone = "warning" | "success"

type NoticeBannerProps = React.ComponentProps<"p"> & {
    tone?: NoticeBannerTone
}

const toneClassName: Record<NoticeBannerTone, string> = {
    warning:
        "border border-[color:var(--border-warning-subtle)] bg-[color:var(--bg-warning-subtle)] text-[color:var(--feedback-warning-strong)]",
    success:
        "border border-[color:var(--border-success-subtle)] bg-[color:var(--bg-accent-subtle)] text-[color:var(--action-primary-pressed)]",
}

function NoticeBanner({ className, tone = "warning", ...props }: NoticeBannerProps) {
    return (
        <p
            className={cn(
                "rounded-[var(--wm-size-8)] px-2 py-1 font-wallie-fit text-[length:var(--wm-size-13)]",
                toneClassName[tone],
                className
            )}
            {...props}
        />
    )
}

export { NoticeBanner }
export type { NoticeBannerProps, NoticeBannerTone }
