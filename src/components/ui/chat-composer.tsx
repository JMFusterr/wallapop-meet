import * as React from "react"

import type { WallapopIconName } from "@/components/ui/wallapop-icon"
import { WallapopIcon } from "@/components/ui/wallapop-icon"
import { cn } from "@/lib/utils"

type ChatComposerProps = Omit<React.ComponentProps<"textarea">, "onSubmit"> & {
  onSubmit?: (value: string) => void
  submitLabel?: string
  submitAriaLabel?: string
  secondaryActionLabel?: string
  secondaryActionAriaLabel?: string
  secondaryActionIconName?: WallapopIconName
  onSecondaryAction?: () => void
  secondaryActionDisabled?: boolean
}

function ChatComposer({
  className,
  value,
  defaultValue,
  onChange,
  onSubmit,
  disabled,
  submitLabel = "Enviar",
  submitAriaLabel = "Enviar mensaje",
  secondaryActionLabel,
  secondaryActionAriaLabel = "Accion secundaria",
  secondaryActionIconName = "deal",
  onSecondaryAction,
  secondaryActionDisabled = false,
  placeholder = "Escribe un mensaje...",
  ...props
}: ChatComposerProps) {
  const [innerValue, setInnerValue] = React.useState(
    defaultValue == null ? "" : String(defaultValue)
  )
  const isControlled = value !== undefined
  const resolvedValue = isControlled ? String(value ?? "") : innerValue
  const isEmpty = resolvedValue.trim().length === 0

  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    if (!isControlled) {
      setInnerValue(event.target.value)
    }
    onChange?.(event)
  }

  const handleSubmit = () => {
    if (disabled || isEmpty) {
      return
    }
    onSubmit?.(resolvedValue)
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div
      data-slot="chat-composer-wrapper"
      className="w-full bg-white p-2 sm:p-3"
      role="group"
      aria-label="Composer de chat"
    >
      <div
        data-slot="chat-composer"
        className={cn(
          "flex items-end gap-1.5 rounded-[24px] border-[0.8px] bg-white p-1.5 transition-colors",
          disabled
            ? "border-[var(--wm-color-border-default)] opacity-60"
            : "border-[var(--wm-color-border-default)] focus-within:border-[#3DD2BA]",
          className
        )}
      >
        <textarea
          value={resolvedValue}
          disabled={disabled}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={placeholder}
          className={cn(
            "max-h-32 min-h-7 flex-1 resize-none border-none bg-transparent px-1 py-1.5 font-wallie text-[16px] leading-6 text-black outline-none",
            "placeholder:text-[#90A4AE]"
          )}
          {...props}
        />
        {secondaryActionLabel || onSecondaryAction ? (
          <button
            type="button"
            aria-label={secondaryActionLabel ?? secondaryActionAriaLabel}
            title={secondaryActionLabel ?? secondaryActionAriaLabel}
            onClick={() => onSecondaryAction?.()}
            disabled={disabled || secondaryActionDisabled}
            className={cn(
              "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[0.8px] transition-colors sm:h-10 sm:w-10",
              disabled || secondaryActionDisabled
                ? "border-[#D9E1E5] bg-[#C9D3D8] text-white"
                : "border-[#3DD2BA] bg-[#3DD2BA] text-white"
            )}
          >
            <WallapopIcon name={secondaryActionIconName} size="small" />
          </button>
        ) : null}
        <button
          type="button"
          aria-label={submitAriaLabel}
          title={submitLabel}
          onClick={handleSubmit}
          disabled={disabled || isEmpty}
          className={cn(
            "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[0.8px] transition-colors sm:h-10 sm:w-10",
            disabled || isEmpty
              ? "border-[#D9E1E5] bg-[#C9D3D8] text-white"
              : "border-[#3DD2BA] bg-[#3DD2BA] text-white"
          )}
        >
          <WallapopIcon name="paper_plane" size="small" className="-translate-x-[1px] rotate-[12deg]" />
        </button>
      </div>
    </div>
  )
}

export { ChatComposer }
