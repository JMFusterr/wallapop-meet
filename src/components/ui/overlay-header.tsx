import * as React from "react"
import { X } from "lucide-react"
import { IconButton } from "@/components/ui/icon-button"

type OverlayHeaderProps = {
    title: string
    onClose: () => void
    leading?: React.ReactNode
    trailing?: React.ReactNode
}

function OverlayHeader({ title, onClose, leading, trailing }: OverlayHeaderProps) {
    return (
        <header className="flex items-center justify-between border-b border-[color:var(--border-divider)] px-4 py-3">
            <div className="min-w-0">{leading}</div>
            <h2 className="truncate px-2 text-center font-wallie-chunky text-[length:var(--wm-size-18)] text-[color:var(--text-primary)]">
                {title}
            </h2>
            <div className="flex min-w-0 items-center gap-2">
                {trailing}
                <IconButton label="Cerrar" icon={<X size={16} />} variant="menu_close" onClick={onClose} />
            </div>
        </header>
    )
}

export { OverlayHeader }


