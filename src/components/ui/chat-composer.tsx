import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ChatComposerProps = Omit<React.ComponentProps<"textarea">, "onSubmit"> & {
  onSubmit?: (value: string) => void
  submitLabel?: string
}

function ChatComposer({
  className,
  value,
  defaultValue,
  onChange,
  onSubmit,
  disabled,
  submitLabel = "Enviar",
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
      className="w-full bg-white px-5 py-3"
      role="group"
      aria-label="Composer de chat"
    >
      <div
        data-slot="chat-composer"
        className={cn(
          "flex items-end gap-2 rounded-[24px] border-[0.8px] bg-white px-5 py-1 pr-1 transition-colors",
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
            "max-h-32 min-h-7 flex-1 resize-none border-none bg-transparent py-2 font-wallie text-[16px] leading-6 text-black outline-none",
            "placeholder:text-[#90A4AE]"
          )}
          {...props}
        />
        <Button
          type="button"
          variant="inline_action"
          size="md"
          onClick={handleSubmit}
          disabled={disabled || isEmpty}
          className="h-[36px] px-4 text-[12px] leading-[18px]"
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  )
}

export { ChatComposer }
