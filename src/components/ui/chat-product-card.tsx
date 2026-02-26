import * as React from "react"

import { Button } from "@/components/ui/button"
import { WallapopIcon } from "@/components/ui/wallapop-icon"
import { cn } from "@/lib/utils"

type ChatProductCardViewerRole = "seller" | "buyer"

type ChatProductCardProps = React.ComponentProps<"article"> & {
    imageSrc: string
    imageAlt: string
    title: string
    price: string
    stats?: string
    onReserve?: () => void
    onSold?: () => void
    onEdit?: () => void
    reserveLabel?: string
    soldLabel?: string
    viewerRole?: ChatProductCardViewerRole
    viewsCount?: number
    likesCount?: number
    statusLabel?: string
}

type ListingStatus = "available" | "reserved" | "sold"

function resolveListingStatus(statusLabel?: string): ListingStatus {
    const normalized = statusLabel?.trim().toLowerCase() ?? ""
    if (normalized.includes("vendid")) {
        return "sold"
    }
    if (normalized.includes("reservad")) {
        return "reserved"
    }
    return "available"
}

function resolveStatusBadgeConfig(statusLabel?: string): { color: string; iconName: "bookmark" | "deal" } {
    const normalized = statusLabel?.trim().toLowerCase() ?? ""
    if (normalized.includes("reservad")) {
        return { color: "var(--status-reserved)", iconName: "bookmark" }
    }
    if (normalized.includes("vendid")) {
        return { color: "var(--status-sold)", iconName: "deal" }
    }
    return { color: "var(--status-sold)", iconName: "deal" }
}

function ChatProductCard({
    className,
    imageSrc,
    imageAlt,
    title,
    price,
    stats,
    onReserve,
    onSold,
    onEdit,
    reserveLabel = "Reservar",
    soldLabel = "Vendido",
    viewerRole = "seller",
    viewsCount,
    likesCount,
    statusLabel,
    ...props
}: ChatProductCardProps) {
    const isSeller = viewerRole === "seller"
    const listingStatus = resolveListingStatus(statusLabel)
    const isSoldListing = listingStatus === "sold"
    const isReservedListing = listingStatus === "reserved"
    const showStats =
        isSeller &&
        !isSoldListing &&
        typeof viewsCount === "number" &&
        typeof likesCount === "number"
    const statusBadgeConfig = resolveStatusBadgeConfig(statusLabel)

    return (
        <article
            data-slot="chat-product-card"
            className={cn(
                "relative w-full overflow-hidden rounded-[var(--wm-size-12)] border border-[color:var(--border-divider)] bg-[color:var(--bg-base)]",
                className
            )}
            {...props}
        >
            <div className="relative">
                <img src={imageSrc} alt={imageAlt} className="h-[var(--wm-size-200)] w-full object-cover" />
                {isSeller && !isSoldListing && onEdit ? (
                    <button
                        type="button"
                        onClick={onEdit}
                        className="absolute top-3 right-3 inline-flex h-12 w-12 items-center justify-center rounded-[var(--wm-size-12)] border border-[color:var(--border-strong)] bg-[color:var(--bg-base)] text-[color:var(--text-secondary)]"
                        aria-label="Editar anuncio"
                    >
                        <WallapopIcon name="edit" size={20} />
                    </button>
                ) : null}
                {statusLabel ? (
                    <span
                        className="absolute right-4 bottom-4 inline-flex items-center gap-1 rounded-full bg-[color:var(--bg-base)] px-3 py-1 font-wallie-chunky text-[length:var(--wm-size-14)]"
                        style={{ color: statusBadgeConfig.color }}
                    >
                        <WallapopIcon
                            name={statusBadgeConfig.iconName}
                            size={15}
                            style={{ color: statusBadgeConfig.color }}
                        />
                        {statusLabel}
                    </span>
                ) : null}
            </div>

            {isSeller && !isSoldListing ? (
                <div className="px-4 pt-3">
                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant={isReservedListing ? "status_reserve_outline" : "status_reserve_solid"}
                            size="md"
                            onClick={onReserve}
                            className="h-8 flex-1 px-4"
                        >
                            {isReservedListing ? "Anular reserva" : reserveLabel}
                        </Button>
                        <Button
                            type="button"
                            variant="status_sold_solid"
                            size="md"
                            onClick={onSold}
                            className="h-8 flex-1 px-4"
                        >
                            {soldLabel}
                        </Button>
                    </div>
                </div>
            ) : null}

            <div className="px-4 py-4">
                <h4 className="font-wallie-chunky text-[length:var(--wm-size-16)] leading-[var(--wm-size-20)] text-[color:var(--text-primary)]">
                    {title}
                </h4>
                <div className="mt-2 flex items-center justify-between gap-4">
                    <p className="font-wallie-fit text-[length:var(--wm-size-16)] text-[color:var(--text-primary)]">
                        {price}
                    </p>
                    {showStats ? (
                        <div className="flex items-center gap-3 font-wallie-fit text-[length:var(--wm-size-14)] text-[color:var(--text-secondary)]">
                            <span className="inline-flex items-center gap-1">
                                <WallapopIcon name="eye" size={15} />
                                {viewsCount}
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <WallapopIcon name="heart" size={15} />
                                {likesCount}
                            </span>
                        </div>
                    ) : null}
                </div>
                {!showStats && stats ? (
                    <p className="mt-1 font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">{stats}</p>
                ) : null}
            </div>
        </article>
    )
}

export { ChatProductCard, type ChatProductCardViewerRole }


