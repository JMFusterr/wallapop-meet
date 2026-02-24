export type CalendarDayCell = {
    date: Date
    dateValue: string
    inCurrentMonth: boolean
    isPast: boolean
}

export function toLocalDateValue(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}

export function buildCalendarDayCells(
    monthDate: Date,
    minDateValue: string
): CalendarDayCell[] {
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
