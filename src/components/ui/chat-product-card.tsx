import * as React from "react"

import { Button } from "@/components/ui/button"
import { WallapopIcon } from "@/components/ui/wallapop-icon"
import { cn } from "@/lib/utils"

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
  reserveLabel = "Reservado",
  soldLabel = "Vendido",
  ...props
}: ChatProductCardProps) {
  return (
    <article
      data-slot="chat-product-card"
      className={cn("relative w-full max-w-[302px] overflow-hidden rounded-[10px] bg-white", className)}
      {...props}
    >
      <img
        src={imageSrc}
        alt={imageAlt}
        className="h-[180px] w-full rounded-[10px] border-4 border-white object-cover"
      />
      {onEdit ? (
        <button
          type="button"
          onClick={onEdit}
          className="absolute top-3 right-3 flex h-11 w-11 items-center justify-center rounded-[8px] border-2 border-[rgba(207,216,220,0.5)] bg-white sm:h-10 sm:w-10"
          aria-label="Editar anuncio"
        >
          <WallapopIcon name="edit" size="small" className="text-[#253238]" />
        </button>
      ) : null}
      <div className="px-3 py-3">
        <p className="mb-3 font-wallie-chunky text-[16px] leading-5 text-[var(--wm-color-text-primary)]">
          {title}
        </p>
        <p className="font-wallie text-[16px] leading-6 text-[var(--wm-color-text-primary)]">
          {price}
        </p>
        {stats ? (
          <p className="font-wallie text-[12px] leading-[26px] text-[#607D8B]">{stats}</p>
        ) : null}
      </div>
      <div className="px-4 pt-3 pb-4 sm:px-5">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="inline_action"
            size="md"
            onClick={onReserve}
            className="h-11 flex-1 rounded-[25px] bg-[#4368CC] px-5 font-wallie text-[12px] leading-[18px] text-white sm:h-[27.6px]"
          >
            {reserveLabel}
          </Button>
          <Button
            type="button"
            variant="inline_action"
            size="md"
            onClick={onSold}
            className="h-11 flex-1 rounded-[25px] bg-[#F75883] px-5 font-wallie text-[12px] leading-[18px] text-white sm:h-[27.6px]"
          >
            {soldLabel}
          </Button>
        </div>
      </div>
    </article>
  )
}

export { ChatProductCard }
