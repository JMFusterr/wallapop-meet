import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { WallapopIcon } from "@/components/ui/wallapop-icon"
import { cn } from "@/lib/utils"

type ChatListItemLeadingIndicator = "bookmark" | "deal"
type ChatListItemDeliveryState = "sent" | "read"

type ChatListItemProps = React.ComponentProps<"button"> & {
  userName: string
  messageDate: string
  itemTitle: string
  messagePreview: string
  unreadCount?: number
  avatarSrc?: string
  avatarAlt?: string
  selected?: boolean
  showDivider?: boolean
  leadingIndicator?: ChatListItemLeadingIndicator
  lastMessageDeliveryState?: ChatListItemDeliveryState
}

function ChatListItem({
  className,
  userName,
  messageDate,
  itemTitle,
  messagePreview,
  unreadCount = 0,
  avatarSrc,
  avatarAlt,
  selected = false,
  showDivider = true,
  leadingIndicator,
  lastMessageDeliveryState,
  ...props
}: ChatListItemProps) {
  const indicatorIconName = leadingIndicator === "deal" ? "deal" : "bookmark"

  return (
    <button
      type="button"
      data-slot="chat-list-item"
      data-selected={selected}
      className={cn(
        "flex h-[100px] w-full cursor-pointer items-start gap-3 border-none bg-transparent pl-5 pt-5 pr-3 pb-5 text-left",
        showDivider && "border-b border-[var(--wm-color-border-default)]",
        "transition-colors hover:bg-[var(--wm-color-background-surface)] data-[selected=true]:bg-[var(--wm-color-background-surface)]",
        className
      )}
      {...props}
    >
      <div className="relative h-16 w-16 shrink-0 overflow-visible rounded-[16px] bg-[var(--wm-color-border-default)]">
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={avatarAlt ?? userName}
            className="h-full w-full rounded-[16px] object-cover"
          />
        ) : null}
        {leadingIndicator ? (
          <span
            className="absolute -top-2 -left-2 z-10 inline-flex size-8 items-center justify-center rounded-full border border-[#ECEFF1] bg-white text-[#AC2B8B]"
            aria-hidden="true"
          >
            <WallapopIcon name={indicatorIconName} size={15} strokeWidth={2} />
          </span>
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-wallie text-[12px] leading-[18px] text-[#90A4AE]">
            {userName}
          </p>
          <p className="shrink-0 font-wallie text-[12px] leading-[18px] text-[#90A4AE]">
            {messageDate}
          </p>
        </div>
        <p className="truncate font-wallie-chunky text-[16px] leading-[16px] text-[var(--wm-color-text-primary)]">
          {itemTitle}
        </p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="flex min-w-0 items-center gap-1 truncate font-wallie text-[14px] leading-[14px] text-[#90A4AE]">
            {lastMessageDeliveryState ? (
              <span
                aria-label={lastMessageDeliveryState === "read" ? "Leido" : "Enviado"}
                className={cn(
                  "inline-flex shrink-0 items-center leading-none",
                  lastMessageDeliveryState === "read" ? "text-[#13C1AC]" : "text-[#C2CDD3]"
                )}
              >
                <WallapopIcon name="double_check" size={13} strokeWidth={1.9} />
              </span>
            ) : null}
            {messagePreview}
          </p>
          <Badge value={unreadCount} variant="unread" />
        </div>
      </div>
    </button>
  )
}

export { ChatListItem }

