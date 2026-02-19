import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type ChatListItemProps = React.ComponentProps<"button"> & {
  userName: string
  messageDate: string
  itemTitle: string
  messagePreview: string
  unreadCount?: number
  avatarSrc?: string
  avatarAlt?: string
  selected?: boolean
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
  ...props
}: ChatListItemProps) {
  return (
    <button
      type="button"
      data-slot="chat-list-item"
      data-selected={selected}
      className={cn(
        "flex h-[100px] w-full cursor-pointer items-start gap-3 border-none bg-transparent px-5 pt-5 pr-3 pb-5 text-left",
        "transition-colors hover:bg-[var(--wm-color-background-surface)] data-[selected=true]:bg-[var(--wm-color-background-surface)]",
        className
      )}
      {...props}
    >
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[var(--wm-color-border-default)]">
        {avatarSrc ? (
          <img src={avatarSrc} alt={avatarAlt ?? userName} className="h-full w-full object-cover" />
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
          <p className="truncate font-wallie text-[14px] leading-[14px] text-[#90A4AE]">
            {messagePreview}
          </p>
          <Badge value={unreadCount} variant="unread" />
        </div>
      </div>
    </button>
  )
}

export { ChatListItem }
