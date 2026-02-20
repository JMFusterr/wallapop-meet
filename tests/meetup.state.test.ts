import { describe, expect, it } from "vitest"

import { createMeetupMachine, transitionMeetup } from "@/meetup/state-machine"

describe("meetup state machine", () => {
    const scheduledAt = new Date("2026-02-20T18:00:00.000Z")

    it("permite que el vendedor inicie propuesta", () => {
        const initial = createMeetupMachine(scheduledAt)
        const result = transitionMeetup(initial, {
            type: "PROPOSE",
            actorRole: "SELLER",
        })

        expect(result.ok).toBe(true)
        if (result.ok) {
            expect(result.meetup.status).toBe("PROPOSED")
        }
    })

    it("bloquea que el comprador inicie propuesta", () => {
        const initial = createMeetupMachine(scheduledAt)
        const result = transitionMeetup(initial, {
            type: "PROPOSE",
            actorRole: "BUYER",
        })

        expect(result.ok).toBe(false)
    })

    it("permite contraoferta del comprador desde PROPOSED", () => {
        const proposed = transitionMeetup(createMeetupMachine(scheduledAt), {
            type: "PROPOSE",
            actorRole: "SELLER",
        })
        if (!proposed.ok) {
            throw new Error("Se esperaba PROPOSE valido para el escenario.")
        }

        const result = transitionMeetup(proposed.meetup, {
            type: "COUNTER_PROPOSE",
            actorRole: "BUYER",
        })

        expect(result.ok).toBe(true)
        if (result.ok) {
            expect(result.meetup.status).toBe("COUNTER_PROPOSED")
        }
    })

    it("bloquea MARK_ARRIVED fuera de la ventana valida", () => {
        const proposed = transitionMeetup(createMeetupMachine(scheduledAt), {
            type: "PROPOSE",
            actorRole: "SELLER",
        })
        if (!proposed.ok) {
            throw new Error("Se esperaba PROPOSE valido para el escenario.")
        }

        const confirmed = transitionMeetup(proposed.meetup, {
            type: "ACCEPT",
            actorRole: "BUYER",
        })
        if (!confirmed.ok) {
            throw new Error("Se esperaba ACCEPT valido para el escenario.")
        }

        const result = transitionMeetup(confirmed.meetup, {
            type: "MARK_ARRIVED",
            actorRole: "BUYER",
            occurredAt: new Date("2026-02-20T20:01:00.000Z"),
        })

        expect(result.ok).toBe(false)
    })

    it("permite MARK_ARRIVED dentro de la ventana valida", () => {
        const proposed = transitionMeetup(createMeetupMachine(scheduledAt), {
            type: "PROPOSE",
            actorRole: "SELLER",
        })
        if (!proposed.ok) {
            throw new Error("Se esperaba PROPOSE valido para el escenario.")
        }

        const confirmed = transitionMeetup(proposed.meetup, {
            type: "ACCEPT",
            actorRole: "BUYER",
        })
        if (!confirmed.ok) {
            throw new Error("Se esperaba ACCEPT valido para el escenario.")
        }

        const arrived = transitionMeetup(confirmed.meetup, {
            type: "MARK_ARRIVED",
            actorRole: "SELLER",
            occurredAt: new Date("2026-02-20T17:50:00.000Z"),
        })
        expect(arrived.ok).toBe(true)

        if (!arrived.ok) {
            return
        }

        const completed = transitionMeetup(arrived.meetup, {
            type: "COMPLETE",
            actorRole: "BUYER",
        })
        expect(completed.ok).toBe(true)
        if (completed.ok) {
            expect(completed.meetup.status).toBe("COMPLETED")
        }
    })

    it("bloquea transiciones desde estado final", () => {
        const initial = createMeetupMachine(scheduledAt)
        const cancelled = transitionMeetup(initial, {
            type: "PROPOSE",
            actorRole: "SELLER",
        })
        if (!cancelled.ok) {
            throw new Error("Se esperaba PROPOSE valido para el escenario.")
        }

        const terminal = transitionMeetup(cancelled.meetup, {
            type: "CANCEL",
            actorRole: "BUYER",
        })
        if (!terminal.ok) {
            throw new Error("Se esperaba CANCEL valido para el escenario.")
        }

        const retry = transitionMeetup(terminal.meetup, {
            type: "EXPIRE",
        })

        expect(retry.ok).toBe(false)
    })
})
