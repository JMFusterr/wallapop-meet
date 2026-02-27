import * as React from "react"
import { cn } from "@/lib/utils"

import type { DesignSystemEntityMeta } from "@/design-system/catalog/types"
type SelectableOptionProps = {
    selected: boolean
    className?: string
    onClick?: () => void
    children: React.ReactNode
}

function SelectableOption({ selected, className, onClick, children }: SelectableOptionProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={selected}
            className={cn(
                "w-full rounded-[var(--wm-size-18)] border px-4 py-4 text-left transition-shadow",
                selected
                    ? "border-[color:var(--text-primary)] shadow-[inset_0_0_0_1px_var(--text-primary)]"
                    : "border-[color:var(--border-strong)]",
                className
            )}
        >
            {children}
        </button>
    )
}


const designSystemMeta = {
    id: "selectable-option",
    entityType: "component",
    title: "Selectable Option",
    description: "Selectable Option del design system de Wallapop Meet.",
    status: "ready",
    states: ["default","selected","disabled"],
    storybookTitle: "Design System/Selectable Option",
    tokensUsed: ["tokens.color.semantic.action.primary","tokens.color.semantic.text.primary","tokens.color.semantic.border.divider"],
} satisfies DesignSystemEntityMeta

// eslint-disable-next-line react-refresh/only-export-components
export { SelectableOption, designSystemMeta }
