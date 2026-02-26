import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toastVariants = cva(
    "w-full rounded-[var(--wm-size-10)] border px-3 py-2.5 shadow-[var(--wm-shadow-200)]",
    {
        variants: {
            variant: {
                success: "border-transparent bg-[color:var(--toast-success-bg)] text-[color:var(--toast-text)]",
                error: "border-transparent bg-[color:var(--toast-error-bg)] text-[color:var(--toast-text)]",
                info: "border-transparent bg-[color:var(--toast-info-bg)] text-[color:var(--toast-text)]",
            },
        },
        defaultVariants: {
            variant: "info",
        },
    }
)

type ToastProps = React.ComponentProps<"div"> &
    VariantProps<typeof toastVariants> & {
        title: string
        description?: string
    }

function Toast({
    className,
    title,
    description,
    variant = "info",
    ...props
}: ToastProps) {
    const role = variant === "error" ? "alert" : "status"
    const ariaLive = variant === "error" ? "assertive" : "polite"

    return (
        <div
            data-slot="toast"
            data-variant={variant}
            role={role}
            aria-live={ariaLive}
            className={cn(toastVariants({ variant }), className)}
            {...props}
        >
            <p className="font-wallie-chunky text-[length:var(--wm-size-14)] leading-[1.2]">{title}</p>
            {description ? (
                <p className="mt-1 font-wallie-fit text-[length:var(--wm-size-12)] leading-[1.3] opacity-95">{description}</p>
            ) : null}
        </div>
    )
}

export { Toast, type ToastProps }


