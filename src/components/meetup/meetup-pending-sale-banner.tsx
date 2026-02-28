import * as React from "react"
import { Button } from "@/components/ui/button"

import type { DesignSystemEntityMeta } from "@/design-system/catalog/types"

type MeetupPendingSaleBannerProps = {
    scheduledAt: Date
    onJumpToMeetup: () => void
}

function formatCountdown(target: Date, now: Date): string {
    const deltaMs = target.getTime() - now.getTime()
    if (deltaMs <= 0) {
        return "ahora"
    }
    const totalMinutes = Math.floor(deltaMs / (60 * 1000))
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    if (hours <= 0) {
        return `${minutes} min`
    }
    return `${hours} h ${minutes} min`
}

function MeetupPendingSaleBanner({ scheduledAt, onJumpToMeetup }: MeetupPendingSaleBannerProps) {
    const [now, setNow] = React.useState(() => new Date())

    React.useEffect(() => {
        const intervalId = window.setInterval(() => {
            setNow(new Date())
        }, 30 * 1000)
        return () => window.clearInterval(intervalId)
    }, [])

    return (
        <div className="border-b border-[color:var(--action-primary-pressed)] bg-[color:var(--action-primary)] px-3 py-2 sm:px-4">
            <div className="flex items-center gap-2">
                <p className="min-w-0 flex-1 truncate font-wallie-chunky text-[length:var(--wm-size-13)] text-[color:var(--text-on-action)]">
                    Hay una venta pendiente en {formatCountdown(scheduledAt, now)}.
                </p>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-[var(--wm-size-999)] border-[color:var(--text-on-action)] bg-transparent px-3 font-wallie-chunky text-[length:var(--wm-size-13)] text-[color:var(--text-on-action)] hover:border-[color:var(--text-on-action)] hover:bg-[color:var(--action-primary-hover)] hover:text-[color:var(--text-on-action)]"
                    onClick={onJumpToMeetup}
                >
                    Ir al mensaje
                </Button>
            </div>
        </div>
    )
}

const designSystemMeta = {
    id: "meetup-pending-sale-banner",
    entityType: "component",
    title: "Meetup Pending Sale Banner",
    description: "Banner fijo de venta pendiente en conversación.",
    status: "ready",
    states: ["default"],
    storybookTitle: "Design System/Meetup Pending Sale Banner",
    tokensUsed: [
        "tokens.color.semantic.action.primary",
        "tokens.color.semantic.action.primary_pressed",
        "tokens.color.semantic.text.on_action",
    ],
} satisfies DesignSystemEntityMeta

// eslint-disable-next-line react-refresh/only-export-components
export { MeetupPendingSaleBanner, designSystemMeta }
export type { MeetupPendingSaleBannerProps }
