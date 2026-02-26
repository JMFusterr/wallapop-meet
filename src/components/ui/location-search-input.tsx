import { Search } from "lucide-react"

import { cn } from "@/lib/utils"

type LocationSearchInputProps = {
    value: string
    onValueChange: (nextValue: string) => void
    placeholder?: string
    className?: string
}

function LocationSearchInput({
    value,
    onValueChange,
    placeholder = "¿Donde?",
    className,
}: LocationSearchInputProps) {
    return (
        <label
            className={cn(
                "flex items-center gap-2 rounded-full border border-[color:var(--border-soft)] bg-[color:var(--bg-soft)] px-4 py-2.5",
                className
            )}
        >
            <Search size={16} className="text-[color:var(--text-meta)]" aria-hidden />
            <input
                type="text"
                value={value}
                onChange={(event) => onValueChange(event.target.value)}
                placeholder={placeholder}
                className="w-full bg-transparent font-wallie-fit text-[length:var(--wm-size-16)] text-[color:var(--text-tertiary)] outline-none placeholder:text-[color:var(--text-meta)]"
            />
        </label>
    )
}

export { LocationSearchInput }
export type { LocationSearchInputProps }
