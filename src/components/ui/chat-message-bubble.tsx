import * as React from "react"

import { cn } from "@/lib/utils"

type ChatMessageBubbleVariant = "sent" | "received"

type ChatMessageBubbleProps = React.ComponentProps<"div"> & {
  variant?: ChatMessageBubbleVariant
}

const bubbleVariantClass: Record<ChatMessageBubbleVariant, string> = {
  received:
    "border-[0.8px] border-[var(--wm-color-border-default)] bg-transparent px-3 py-2",
  sent: "border-[0.8px] border-[var(--wm-color-border-default)] bg-[var(--wm-color-border-default)] px-3 pr-8 py-2",
}

function ChatMessageBubble({
  className,
  variant = "received",
  children,
  ...props
}: ChatMessageBubbleProps) {
  return (
    <div
      data-slot="chat-message-bubble"
      data-variant={variant}
      className={cn(
        "inline-block max-w-[88%] rounded-[20px] font-wallie text-[16px] leading-5 text-[var(--wm-color-text-primary)] sm:max-w-[80%]",
        bubbleVariantClass[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { ChatMessageBubble }
