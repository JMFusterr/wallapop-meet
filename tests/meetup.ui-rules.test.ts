import { describe, expect, it } from "vitest"

import {
    resolveArrivalActionState,
    resolveMeetupDayBannerVariant,
} from "@/components/meetup/meetup-ui-rules"
import { createMeetupMachine, transitionMeetup } from "@/meetup"

describe("meetup ui rules", () => {
    const scheduledAt = new Date("2026-02-20T18:00:00.000Z")

    function buildConfirmedMeetup() {
        const proposed = transitionMeetup(createMeetupMachine(scheduledAt), {
            type: "PROPOSE",
            actorRole: "SELLER",
            occurredAt: new Date("2026-02-20T16:00:00.000Z"),
        })
        if (!proposed.ok) {
            throw new Error("Se esperaba meetup propuesto para la prueba.")
        }

        const confirmed = transitionMeetup(proposed.meetup, {
            type: "ACCEPT",
            actorRole: "BUYER",
            occurredAt: new Date("2026-02-20T16:30:00.000Z"),
        })
        if (!confirmed.ok) {
            throw new Error("Se esperaba meetup confirmado para la prueba.")
        }

        return confirmed.meetup
    }

    it("habilita accion de llegada en ventana valida", () => {
        const meetup = buildConfirmedMeetup()
        const state = resolveArrivalActionState(
            meetup,
            new Date("2026-02-20T17:50:00.000Z")
        )

        expect(state.enabled).toBe(true)
    })

    it("deshabilita accion de llegada fuera de ventana", () => {
        const meetup = buildConfirmedMeetup()
        const state = resolveArrivalActionState(
            meetup,
            new Date("2026-02-20T21:30:00.000Z")
        )

        expect(state.enabled).toBe(false)
    })

    it("resuelve variante de banner para meetup expirado", () => {
        const meetup = buildConfirmedMeetup()
        const expired = transitionMeetup(meetup, {
            type: "EXPIRE",
            occurredAt: new Date("2026-02-20T21:30:00.000Z"),
        })
        if (!expired.ok) {
            throw new Error("Se esperaba meetup expirado para la prueba.")
        }

        const variant = resolveMeetupDayBannerVariant(
            expired.meetup,
            new Date("2026-02-20T21:31:00.000Z")
        )

        expect(variant).toBe("expired")
    })
})
