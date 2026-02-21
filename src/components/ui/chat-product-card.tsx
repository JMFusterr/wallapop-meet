import * as React from "react"
import { Eye } from "lucide-react"

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
    const showStats = isSeller && typeof viewsCount === "number" && typeof likesCount === "number"

    return (
        <article
            data-slot="chat-product-card"
            className={cn(
                "relative w-full overflow-hidden rounded-[12px] border border-[#E8ECEF] bg-white",
                className
            )}
            {...props}
        >
            <div className="relative">
                <img src={imageSrc} alt={imageAlt} className="h-[200px] w-full object-cover" />
                {isSeller && onEdit ? (
                    <button
                        type="button"
                        onClick={onEdit}
                        className="absolute top-3 right-3 inline-flex h-12 w-12 items-center justify-center rounded-[12px] border border-[#D3DEE2] bg-white text-[#546E7A]"
                        aria-label="Editar anuncio"
                    >
                        <WallapopIcon name="edit" size={20} />
                    </button>
                ) : null}
                {!isSeller && statusLabel ? (
                    <span className="absolute right-4 bottom-4 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 font-wallie-chunky text-[14px] text-[#EB4F8B]">
                        <WallapopIcon name="bookmark" size={15} className="text-[#EB4F8B]" />
                        {statusLabel}
                    </span>
                ) : null}
            </div>

            {isSeller ? (
                <div className="px-4 pt-3">
                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="inline_action"
                            size="md"
                            onClick={onReserve}
                            className="h-8 flex-1 rounded-full bg-[#4368CC] px-4 font-wallie-chunky text-[13px] text-white"
                        >
                            {reserveLabel}
                        </Button>
                        <Button
                            type="button"
                            variant="inline_action"
                            size="md"
                            onClick={onSold}
                            className="h-8 flex-1 rounded-full bg-[#F75883] px-4 font-wallie-chunky text-[13px] text-white"
                        >
                            {soldLabel}
                        </Button>
                    </div>
                </div>
            ) : null}

            <div className="px-4 py-4">
                <h4 className="font-wallie-chunky text-[16px] leading-[20px] text-[#253238]">
                    {title}
                </h4>
                <div className="mt-2 flex items-center justify-between gap-4">
                    <p className="font-wallie-fit text-[16px] text-[#253238]">
                        {price}
                    </p>
                    {showStats ? (
                        <div className="flex items-center gap-3 font-wallie-fit text-[14px] text-[#546E7A]">
                            <span className="inline-flex items-center gap-1">
                                <Eye size={15} />
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
                    <p className="mt-1 font-wallie-fit text-[12px] text-[#607D8B]">{stats}</p>
                ) : null}
            </div>
        </article>
    )
}

export { ChatProductCard, type ChatProductCardViewerRole }
