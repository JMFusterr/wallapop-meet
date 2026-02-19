import * as React from "react"

import { cn } from "@/lib/utils"

type ChatSecurityBannerProps = React.ComponentProps<"div"> & {
  message: string
  linkText?: string
  onLinkClick?: () => void
}

function ChatSecurityBanner({
  className,
  message,
  linkText,
  onLinkClick,
  ...props
}: ChatSecurityBannerProps) {
  return (
    <div
      data-slot="chat-security-banner"
      className={cn("w-full bg-white px-4 pt-4 pb-2", className)}
      {...props}
    >
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
  )
}

export { ChatSecurityBanner }
