import * as React from "react"
import { cn } from "@/lib/utils"

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

export { SelectableOption }

