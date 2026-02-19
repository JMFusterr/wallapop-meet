import * as React from "react"
import { Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
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
      className={cn("relative w-[302px] overflow-hidden rounded-[10px] bg-white", className)}
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
          className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-[8px] border-2 border-[rgba(207,216,220,0.5)] bg-white"
          aria-label="Editar anuncio"
        >
          <Pencil className="size-4" aria-hidden="true" />
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
      <div className="px-5 pt-3 pb-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="inline_action"
            size="md"
            onClick={onReserve}
            className="h-[27.6px] flex-1 rounded-[25px] bg-[#4368CC] px-5 font-wallie text-[12px] leading-[18px] text-white"
          >
            {reserveLabel}
          </Button>
          <Button
            type="button"
            variant="inline_action"
            size="md"
            onClick={onSold}
            className="h-[27.6px] flex-1 rounded-[25px] bg-[#F75883] px-5 font-wallie text-[12px] leading-[18px] text-white"
          >
            {soldLabel}
          </Button>
        </div>
      </div>
    </article>
  )
}

export { ChatProductCard }
