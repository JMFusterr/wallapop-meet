import * as React from "react"

import {
  buildCalendarDayCells,
  type CalendarDayCell,
} from "@/components/ui/calendar-picker.utils"
import { WallapopIcon } from "@/components/ui/wallapop-icon"
import { cn } from "@/lib/utils"

type CalendarPickerProps = {
  label?: string
  monthDate: Date
  selectedDateValue: string
  minDateValue: string
  onMonthChange: (nextMonthDate: Date) => void
  onSelectDate: (nextDateValue: string) => void
  state?: "default" | "error"
  error?: string
  dayLabels?: string[]
  locale?: string
  className?: string
}

function CalendarPicker({
  label,
  monthDate,
  selectedDateValue,
  minDateValue,
  onMonthChange,
  onSelectDate,
  state = "default",
  error,
  dayLabels = ["L", "M", "X", "J", "V", "S", "D"],
  locale = "es-ES",
  className,
}: CalendarPickerProps) {
  const calendarCells = React.useMemo(
    () => buildCalendarDayCells(monthDate, minDateValue),
    [monthDate, minDateValue]
  )

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label ? (
        <label className="text-[14px] font-medium leading-[1.4] text-[var(--wm-color-text-primary)]">
          {label}
        </label>
      ) : null}
      <div
        className={cn(
          "rounded-[18px] border p-3",
          state === "error"
            ? "border-2 border-[var(--wm-color-input-ring-error)]"
            : "border-[var(--wm-color-border-default)]",
          className
        )}
      >
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          aria-label="Mes anterior"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F6F8] text-[#253238]"
          onClick={() =>
            onMonthChange(
              new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1)
            )
          }
        >
          <WallapopIcon name="chevron_right" size="small" className="rotate-180" />
        </button>
        <p className="font-wallie-chunky text-[17px] capitalize text-[#253238]">
          {monthDate.toLocaleDateString(locale, {
            month: "long",
            year: "numeric",
          })}
        </p>
        <button
          type="button"
          aria-label="Mes siguiente"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F6F8] text-[#253238]"
          onClick={() =>
            onMonthChange(
              new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1)
            )
          }
        >
          <WallapopIcon name="chevron_right" size="small" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1" role="presentation">
        {dayLabels.map((label) => (
          <p
            key={label}
            className="pb-0.5 text-center font-wallie-fit text-[11px] text-[#6E8792]"
          >
            {label}
          </p>
        ))}
        {calendarCells.map((cell) => {
          const isSelected = selectedDateValue === cell.dateValue
          return (
            <button
              key={cell.dateValue}
              type="button"
              aria-label={cell.date.toLocaleDateString(locale, {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              aria-pressed={isSelected}
              disabled={cell.isPast}
              onClick={() => onSelectDate(cell.dateValue)}
              className={`h-8 rounded-[8px] border text-center text-[13px] ${
                isSelected
                  ? "border-[#038673] bg-[#E6FAF6] font-wallie-chunky text-[#0F252B] shadow-[inset_0_0_0_1px_#13C1AC]"
                  : `border-transparent bg-[#F8FBFC] font-wallie-fit hover:bg-[#EAF1F4] ${
                      cell.inCurrentMonth ? "text-[#253238]" : "text-[#9BB0B9]"
                    }`
              } ${
                cell.isPast
                  ? "cursor-not-allowed opacity-40 hover:bg-[#F8FBFC]"
                  : ""
              }`}
            >
              {cell.date.getDate()}
            </button>
          )
        })}
      </div>
      </div>
      {error ? (
        <p className="text-[12px] leading-[1.4] text-[var(--wm-color-input-ring-error)]">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export { CalendarPicker }
export type { CalendarPickerProps, CalendarDayCell }
