import * as React from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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

export { IconButton }
