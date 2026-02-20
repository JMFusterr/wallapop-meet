const MINUTES_BEFORE_SCHEDULED = 15
const HOURS_AFTER_SCHEDULED = 2

export type ArrivalWindow = {
    opensAt: Date
    closesAt: Date
}

export function getArrivalWindow(scheduledAt: Date): ArrivalWindow {
    const opensAt = new Date(
        scheduledAt.getTime() - MINUTES_BEFORE_SCHEDULED * 60 * 1000
    )
    const closesAt = new Date(
        scheduledAt.getTime() + HOURS_AFTER_SCHEDULED * 60 * 60 * 1000
    )

    return { opensAt, closesAt }
}

export function isWithinArrivalWindow(
    scheduledAt: Date,
    occurredAt: Date
): boolean {
    const { opensAt, closesAt } = getArrivalWindow(scheduledAt)
    return occurredAt >= opensAt && occurredAt <= closesAt
}

export const ARRIVAL_WINDOW_RULE = {
    minutesBefore: MINUTES_BEFORE_SCHEDULED,
    hoursAfter: HOURS_AFTER_SCHEDULED,
} as const
