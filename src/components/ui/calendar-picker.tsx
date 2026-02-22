import * as React from "react"

import { WallapopIcon } from "@/components/ui/wallapop-icon"
import { cn } from "@/lib/utils"

type CalendarDayCell = {
  date: Date
  dateValue: string
  inCurrentMonth: boolean
  isPast: boolean
}

type CalendarPickerProps = {
  monthDate: Date
  selectedDateValue: string
  minDateValue: string
  onMonthChange: (nextMonthDate: Date) => void
  onSelectDate: (nextDateValue: string) => void
  dayLabels?: string[]
  locale?: string
  className?: string
}

function toLocalDateValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function buildCalendarDayCells(monthDate: Date, minDateValue: string): CalendarDayCell[] {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  const dayOffset = (firstOfMonth.getDay() + 6) % 7
  const firstVisibleDay = new Date(year, month, 1 - dayOffset)
  const cells: CalendarDayCell[] = []

  for (let index = 0; index < 42; index += 1) {
    const currentDay = new Date(firstVisibleDay)
    currentDay.setDate(firstVisibleDay.getDate() + index)
    const currentDateValue = toLocalDateValue(currentDay)
    cells.push({
      date: currentDay,
      dateValue: currentDateValue,
      inCurrentMonth: currentDay.getMonth() === month,
      isPast: currentDateValue < minDateValue,
    })
  }

  return cells
}

function CalendarPicker({
  monthDate,
  selectedDateValue,
  minDateValue,
  onMonthChange,
  onSelectDate,
  dayLabels = ["L", "M", "X", "J", "V", "S", "D"],
  locale = "es-ES",
  className,
}: CalendarPickerProps) {
  const calendarCells = React.useMemo(
    () => buildCalendarDayCells(monthDate, minDateValue),
    [monthDate, minDateValue]
  )

  return (
    <div className={cn("rounded-[18px] border border-[#B8C9CF] p-3", className)}>
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
              className={`h-8 rounded-[8px] text-center font-wallie-fit text-[13px] ${
                cell.inCurrentMonth ? "text-[#253238]" : "text-[#9BB0B9]"
              } ${
                isSelected
                  ? "bg-[#13C1AC] text-[#0F252B]"
                  : "bg-[#F8FBFC] hover:bg-[#EAF1F4]"
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
  )
}

export { CalendarPicker, buildCalendarDayCells, toLocalDateValue }
export type { CalendarDayCell, CalendarPickerProps }
