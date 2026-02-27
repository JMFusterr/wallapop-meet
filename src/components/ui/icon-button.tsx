import * as React from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import type { DesignSystemEntityMeta } from "@/design-system/catalog/types"
type IconButtonVariant = "icon" | "menu_close"

type IconButtonProps = Omit<ButtonProps, "variant" | "size" | "children"> & {
    label: string
    icon: React.ReactNode
    variant?: IconButtonVariant
}

function IconButton({ label, icon, variant = "icon", className, ...props }: IconButtonProps) {
    return (
        <Button
            type="button"
            variant={variant}
            size={variant === "icon" ? "icon" : "sm"}
            aria-label={label}
            className={cn("shrink-0", className)}
            {...props}
        >
            {icon}
        </Button>
    )
}


const designSystemMeta = {
    id: "icon-button",
    entityType: "component",
    title: "Icon Button",
    description: "Icon Button del design system de Wallapop Meet.",
    status: "ready",
    states: ["default","disabled"],
    storybookTitle: "Design System/Icon Button",
    tokensUsed: ["tokens.color.semantic.action.primary","tokens.color.semantic.text.primary","tokens.color.semantic.border.divider"],
} satisfies DesignSystemEntityMeta

// eslint-disable-next-line react-refresh/only-export-components
export { IconButton, designSystemMeta }
