import * as React from "react"

import { cn } from "@/lib/utils"

import type { DesignSystemEntityMeta } from "@/design-system/catalog/types"

type LabelTone = "pending" | "confirmed" | "arrived" | "completed" | "expired" | "cancelled"

type LabelProps = React.ComponentProps<"span"> & {
    tone?: LabelTone
}

const toneClassMap: Record<LabelTone, string> = {
    pending:
        "border-[color:var(--meetup-status-pending-border)] bg-[color:var(--meetup-status-pending-bg)] text-[color:var(--meetup-status-pending-text)]",
    confirmed:
        "border-[color:var(--meetup-status-confirmed-border)] bg-[color:var(--meetup-status-confirmed-bg)] text-[color:var(--meetup-status-confirmed-text)]",
    arrived:
        "border-[color:var(--meetup-status-arrived-border)] bg-[color:var(--meetup-status-arrived-bg)] text-[color:var(--meetup-status-arrived-text)]",
    completed:
        "border-[color:var(--meetup-status-completed-border)] bg-[color:var(--meetup-status-completed-bg)] text-[color:var(--meetup-status-completed-text)]",
    expired:
        "border-[color:var(--meetup-status-expired-border)] bg-[color:var(--meetup-status-expired-bg)] text-[color:var(--meetup-status-expired-text)]",
    cancelled:
        "border-[color:var(--meetup-status-cancelled-border)] bg-[color:var(--meetup-status-cancelled-bg)] text-[color:var(--meetup-status-cancelled-text)]",
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
    states: ["pending", "confirmed", "arrived", "completed", "expired", "cancelled"],
    storybookTitle: "Design System/Label",
    tokensUsed: ["tokens.color.semantic.action.primary", "tokens.color.semantic.text.primary", "tokens.color.semantic.border.divider"],
} satisfies DesignSystemEntityMeta

// eslint-disable-next-line react-refresh/only-export-components
export { Label, designSystemMeta }
export type { LabelProps, LabelTone }

