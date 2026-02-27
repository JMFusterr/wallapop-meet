import * as React from "react"

import { cn } from "@/lib/utils"

import type { DesignSystemEntityMeta } from "@/design-system/catalog/types"

type LabelTone = "pending" | "confirmed" | "arrived" | "completed" | "cancelled"

type LabelProps = React.ComponentProps<"span"> & {
    tone?: LabelTone
}

const toneClassMap: Record<LabelTone, string> = {
    pending:
        "border-[color:var(--border-strong)] bg-[color:var(--bg-surface)] text-[color:var(--text-secondary)]",
    confirmed:
        "border-[color:var(--border-focus)] bg-[color:var(--bg-accent-subtle)] text-[color:var(--text-primary)]",
    arrived:
        "border-[color:var(--border-warning-subtle)] bg-[color:var(--bg-warning-subtle)] text-[color:var(--feedback-warning-strong)]",
    completed:
        "border-[color:var(--status-sold-hover)] bg-[color:var(--bg-soft)] text-[color:var(--text-primary)]",
    cancelled:
        "border-[color:var(--border-error)] bg-[color:var(--bg-error-subtle)] text-[color:var(--text-primary)]",
}

function Label({ tone = "pending", className, children, ...props }: LabelProps) {
    return (
        <span
            data-slot="label"
            data-tone={tone}
            className={cn(
                "inline-flex rounded-full border px-2.5 py-1 font-wallie-fit text-[length:var(--wm-size-11)] leading-[1]",
                toneClassMap[tone],
                className
            )}
            {...props}
        >
            {children}
        </span>
    )
}

const designSystemMeta = {
    id: "label",
    entityType: "component",
    title: "Label",
    description: "Label de estado para componentes de meetup.",
    status: "ready",
    states: ["pending", "confirmed", "arrived", "completed", "cancelled"],
    storybookTitle: "Design System/Label",
    tokensUsed: [
        "tokens.color.meetup_status.pending.background",
        "tokens.color.meetup_status.pending.border",
        "tokens.color.meetup_status.confirmed.background",
        "tokens.color.meetup_status.arrived.background",
        "tokens.color.meetup_status.completed.background",
        "tokens.color.meetup_status.cancelled.background",
    ],
} satisfies DesignSystemEntityMeta

// eslint-disable-next-line react-refresh/only-export-components
export { Label, designSystemMeta }
export type { LabelProps, LabelTone }
