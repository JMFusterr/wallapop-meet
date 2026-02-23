import { describe, expect, it } from "vitest"

import {
    ARRIVAL_WINDOW_RULE,
    getArrivalWindow,
    isWithinArrivalWindow,
} from "@/meetup/arrival-window"

describe("meetup arrival window", () => {
    const scheduledAt = new Date("2026-02-20T18:00:00.000Z")

    it("calcula ventana con -30 minutos y +2 horas", () => {
        const window = getArrivalWindow(scheduledAt)

        expect(window.opensAt.toISOString()).toBe("2026-02-20T17:30:00.000Z")
        expect(window.closesAt.toISOString()).toBe("2026-02-20T20:00:00.000Z")
        expect(ARRIVAL_WINDOW_RULE).toEqual({
            minutesBefore: 30,
            hoursAfter: 2,
        })
    })

    it("incluye limites exactos de la ventana", () => {
        expect(
            isWithinArrivalWindow(scheduledAt, new Date("2026-02-20T17:30:00.000Z"))
        ).toBe(true)
        expect(
            isWithinArrivalWindow(scheduledAt, new Date("2026-02-20T20:00:00.000Z"))
        ).toBe(true)
    })

    it("rechaza eventos fuera de la ventana", () => {
        expect(
            isWithinArrivalWindow(scheduledAt, new Date("2026-02-20T17:29:59.999Z"))
        ).toBe(false)
        expect(
            isWithinArrivalWindow(scheduledAt, new Date("2026-02-20T20:00:00.001Z"))
        ).toBe(false)
    })
})
