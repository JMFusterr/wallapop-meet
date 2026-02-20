import * as React from "react"

import { WallapopIcon } from "@/components/ui/wallapop-icon"
import { cn } from "@/lib/utils"

type ChatMessageBubbleVariant = "sent" | "received"
type ChatMessageDeliveryState = "sent" | "read"

type ChatMessageBubbleProps = React.ComponentProps<"div"> & {
  variant?: ChatMessageBubbleVariant
  time?: string
  deliveryState?: ChatMessageDeliveryState
}

const bubbleVariantClass: Record<ChatMessageBubbleVariant, string> = {
  received:
    "border-[0.8px] border-[var(--wm-color-border-default)] bg-transparent px-3 py-2",
  sent: "border-[0.8px] border-[var(--wm-color-border-default)] bg-[var(--wm-color-border-default)] px-3 py-2",
}

function ChatMessageBubble({
  className,
  variant = "received",
  time,
  deliveryState = "sent",
  children,
  ...props
}: ChatMessageBubbleProps) {
  const showMeta = Boolean(time)

  return (
    <div
      data-slot="chat-message-bubble"
      data-variant={variant}
      data-delivery-state={deliveryState}
      className={cn(
        "inline-block max-w-[88%] rounded-[20px] font-wallie text-[16px] leading-5 text-[var(--wm-color-text-primary)] sm:max-w-[80%]",
        bubbleVariantClass[variant],
        className
      )}
      {...props}
    >
      <div className="flex items-end gap-2">
        <span>{children}</span>
        {showMeta ? (
          <span className="inline-flex shrink-0 items-center gap-1 self-end whitespace-nowrap font-wallie text-[14px] leading-[14px] text-[#8BA4B2]">
            <span>{time}</span>
            {variant === "sent" ? (
              <span
                aria-label={deliveryState === "read" ? "Leido" : "Enviado"}
                className={cn(
                  "inline-flex items-center leading-none",
                  deliveryState === "read" ? "text-[#13C1AC]" : "text-[#C2CDD3]"
                )}
              >
                <WallapopIcon name="double_check" size={13} strokeWidth={1.9} />
              </span>
            ) : null}
          </span>
        ) : null}
      </div>
    </div>
  )
}

export { ChatMessageBubble }

