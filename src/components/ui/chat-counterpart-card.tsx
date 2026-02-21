import * as React from "react"
import { Star } from "lucide-react"

import { cn } from "@/lib/utils"

type ChatCounterpartCardProps = React.ComponentProps<"article"> & {
    name: string
    rating: number
    distanceLabel: string
    locationLabel: string
    profileImageSrc?: string
    profileImageAlt?: string
}

function StarRating({ rating }: { rating: number }) {
    const stars = [1, 2, 3, 4, 5]

    return (
        <div className="flex items-center gap-0.5 text-[#253238]" aria-label={`${rating}/5 estrellas`}>
            {stars.map((value) => {
                const full = rating >= value
                const half = !full && rating >= value - 0.5

                if (full) {
                    return <Star key={value} size={16} className="fill-current" />
                }

                if (half) {
                    return (
                        <span key={value} className="relative inline-flex h-4 w-4">
                            <Star size={16} className="absolute inset-0 text-[#C2CDD3]" />
                            <span className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
                                <Star size={16} className="fill-current text-[#253238]" />
                            </span>
                        </span>
                    )
                }

                return <Star key={value} size={16} className="text-[#C2CDD3]" />
            })}
        </div>
    )
}

function ChatCounterpartCard({
    className,
    name,
    rating,
    distanceLabel,
    locationLabel,
    profileImageSrc,
    profileImageAlt,
    ...props
}: ChatCounterpartCardProps) {
    return (
        <article
            data-slot="chat-counterpart-card"
            className={cn("rounded-[12px] bg-white p-4", className)}
            {...props}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="truncate font-wallie-chunky text-[16px] text-[#455A64]">
                        {name}
                    </h3>
                    <div className="mt-2">
                        <StarRating rating={rating} />
                    </div>
                    <p className="mt-2 font-wallie-fit text-[16px] text-[#546E7A]">
                        {distanceLabel}
                    </p>
                    <p className="mt-1 font-wallie-fit text-[16px] text-[#546E7A]">
                        {locationLabel}
                    </p>
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
