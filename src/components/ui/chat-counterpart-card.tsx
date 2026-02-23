import * as React from "react"
import { Star } from "lucide-react"

import { cn } from "@/lib/utils"

type ChatCounterpartCardProps = React.ComponentProps<"article"> & {
    name: string
    rating: number
    ratingCount?: number
    distanceLabel: string
    attendanceRate?: number
    attendanceMeetups?: number
    profileImageSrc?: string
    profileImageAlt?: string
}

function StarRating({ rating, ratingCount }: { rating: number; ratingCount?: number }) {
    const stars = [1, 2, 3, 4, 5]

    return (
        <div className="flex items-center gap-2" aria-label={`${rating}/5 estrellas`}>
            <div className="flex items-center gap-0.5 text-[var(--wm-color-text-primary)]">
                {stars.map((value) => {
                    const full = rating >= value
                    const half = !full && rating >= value - 0.5

                    if (full) {
                        return <Star key={value} size={16} className="fill-current" />
                    }

                    if (half) {
                        return (
                            <span key={value} className="relative inline-flex h-4 w-4">
                                <Star
                                    size={16}
                                    className="absolute inset-0 text-[var(--wm-color-border-default)]"
                                />
                                <span className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
                                    <Star size={16} className="fill-current text-[var(--wm-color-text-primary)]" />
                                </span>
                            </span>
                        )
                    }

                    return (
                        <Star key={value} size={16} className="text-[var(--wm-color-border-default)]" />
                    )
                })}
            </div>
            {typeof ratingCount === "number" && ratingCount > 0 ? (
                <span className="font-wallie-fit text-[14px] text-[var(--wm-color-text-secondary)]">
                    ({ratingCount})
                </span>
            ) : null}
        </div>
    )
}

function ChatCounterpartCard({
    className,
    name,
    rating,
    ratingCount,
    distanceLabel,
    attendanceRate,
    attendanceMeetups,
    profileImageSrc,
    profileImageAlt,
    ...props
}: ChatCounterpartCardProps) {
    const hasAttendanceData =
        typeof attendanceRate === "number" &&
        Number.isFinite(attendanceRate) &&
        typeof attendanceMeetups === "number" &&
        attendanceMeetups > 0
    const resolvedAttendanceRate = hasAttendanceData
        ? Math.max(0, Math.min(100, Math.round(attendanceRate)))
        : null

    const attendanceMessage =
        resolvedAttendanceRate === null
            ? null
            : resolvedAttendanceRate > 90
              ? {
                    text: `${resolvedAttendanceRate}% de asistencia (${attendanceMeetups})`,
                    className: "text-[var(--wm-color-input-ring-success)]",
                }
              : resolvedAttendanceRate >= 70
                ? {
                      text: `${resolvedAttendanceRate}% de asistencia (${attendanceMeetups})`,
                      className: "text-[#F4A000]",
                  }
                : {
                      text: "Baja asistencia a quedadas",
                      className: "text-[var(--wm-color-semantic-error)]",
                  }

    return (
        <article
            data-slot="chat-counterpart-card"
            className={cn("rounded-[12px] bg-white p-4", className)}
            {...props}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="truncate font-wallie-chunky text-[16px] text-[var(--wm-color-text-primary)]">
                        {name}
                    </h3>
                    <div className="mt-2">
                        <StarRating rating={rating} ratingCount={ratingCount} />
                    </div>
                    <p className="mt-2 font-wallie-fit text-[14px] text-[var(--wm-color-text-secondary)]">
                        {distanceLabel}
                    </p>
                    {attendanceMessage ? (
                        <p className={`mt-1 font-wallie-fit text-[14px] ${attendanceMessage.className}`}>
                            {attendanceMessage.text}
                        </p>
                    ) : null}
                </div>
                {profileImageSrc ? (
                    <img
                        src={profileImageSrc}
                        alt={profileImageAlt ?? `Foto de perfil de ${name}`}
                        className="h-[60px] w-[60px] rounded-full object-cover"
                    />
                ) : null}
            </div>
        </article>
    )
}

export { ChatCounterpartCard }
