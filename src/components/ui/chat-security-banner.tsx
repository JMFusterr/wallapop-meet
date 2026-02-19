import * as React from "react"

import { cn } from "@/lib/utils"
import { WallapopIcon } from "@/components/ui/wallapop-icon"

type ChatSecurityBannerProps = React.ComponentProps<"div"> & {
  message: string
  linkText?: string
  onLinkClick?: () => void
  showIcon?: boolean
}

function ChatSecurityBanner({
  className,
  message,
  linkText,
  onLinkClick,
  showIcon = true,
  ...props
}: ChatSecurityBannerProps) {
  return (
    <div
      data-slot="chat-security-banner"
      className={cn("w-full bg-white px-4 pt-4 pb-2", className)}
      {...props}
    >
      <div className="flex items-center gap-2">
        {showIcon ? (
          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[8px] bg-[#F0F3F5]">
            <WallapopIcon name="shield" size="small" className="text-[#13C1AC]" />
          </span>
        ) : null}
        <p className="font-wallie text-[12px] leading-[18px] text-[#212529]">
          {message}{" "}
          {linkText ? (
            <button
              type="button"
              onClick={onLinkClick}
              className="font-wallie-fit text-[12px] leading-4 text-[#038673] underline"
            >
              {linkText}
            </button>
          ) : null}
        </p>
      </div>
    </div>
  )
}

export { ChatSecurityBanner }
