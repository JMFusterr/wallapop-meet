import { describe, expect, it } from "vitest"

import { createMeetupMachine, transitionMeetup } from "@/meetup/state-machine"
import type { MeetupChatContext } from "@/meetup/types"

describe("meetup state machine", () => {
    const scheduledAt = new Date("2026-02-20T18:00:00.000Z")
    const chatContext: MeetupChatContext = {
        conversationId: "conv-001",
        listingId: "listing-001",
        sellerUserId: "user-seller-001",
        buyerUserId: "user-buyer-001",
    }

    it("permite que el vendedor inicie propuesta", () => {
        const initial = createMeetupMachine({ scheduledAt, chatContext })
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
        const initial = createMeetupMachine({ scheduledAt, chatContext })
        const result = transitionMeetup(initial, {
            type: "PROPOSE",
            actorRole: "BUYER",
        })

        expect(result.ok).toBe(false)
    })

    it("permite contraoferta del comprador desde PROPOSED", () => {
        const proposed = transitionMeetup(createMeetupMachine({ scheduledAt, chatContext }), {
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
        const proposed = transitionMeetup(createMeetupMachine({ scheduledAt, chatContext }), {
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

    it("permite check-in cruzado en ARRIVED", () => {
        const proposed = transitionMeetup(createMeetupMachine({ scheduledAt, chatContext }), {
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

        const arrivedSeller = transitionMeetup(confirmed.meetup, {
            type: "MARK_ARRIVED",
            actorRole: "SELLER",
            occurredAt: new Date("2026-02-20T17:50:00.000Z"),
            distanceMeters: 18,
            withinSafeRadius: true,
        })
        expect(arrivedSeller.ok).toBe(true)
        if (!arrivedSeller.ok) {
            return
        }

        const arrivedBuyer = transitionMeetup(arrivedSeller.meetup, {
            type: "MARK_ARRIVED",
            actorRole: "BUYER",
            occurredAt: new Date("2026-02-20T17:52:00.000Z"),
            distanceMeters: 31,
            withinSafeRadius: true,
        })
        expect(arrivedBuyer.ok).toBe(true)
        if (!arrivedBuyer.ok) {
            return
        }

        expect(arrivedBuyer.meetup.arrivalCheckins?.SELLER?.withinSafeRadius).toBe(true)
        expect(arrivedBuyer.meetup.arrivalCheckins?.BUYER?.distanceMeters).toBe(31)
    })

    it("permite COMPLETE solo para vendedor", () => {
        const proposed = transitionMeetup(createMeetupMachine({ scheduledAt, chatContext }), {
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
        if (!arrived.ok) {
            throw new Error("Se esperaba MARK_ARRIVED valido para el escenario.")
        }

        const completedByBuyer = transitionMeetup(arrived.meetup, {
            type: "COMPLETE",
            actorRole: "BUYER",
        })
        expect(completedByBuyer.ok).toBe(false)

        const completedBySeller = transitionMeetup(arrived.meetup, {
            type: "COMPLETE",
            actorRole: "SELLER",
        })
        expect(completedBySeller.ok).toBe(true)
        if (completedBySeller.ok) {
            expect(completedBySeller.meetup.status).toBe("COMPLETED")
        }
    })

    it("permite registrar LATE_NOTICE en CONFIRMED", () => {
        const proposed = transitionMeetup(createMeetupMachine({ scheduledAt, chatContext }), {
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

        const lateNotice = transitionMeetup(confirmed.meetup, {
            type: "LATE_NOTICE",
            actorRole: "BUYER",
            etaMinutes: 20,
            occurredAt: new Date("2026-02-20T17:10:00.000Z"),
        })

        expect(lateNotice.ok).toBe(true)
        if (lateNotice.ok) {
            expect(lateNotice.meetup.lateNotices?.at(-1)?.etaMinutes).toBe(20)
        }
    })

    it("aplica impacto de fiabilidad al cancelar en zona roja", () => {
        const proposed = transitionMeetup(createMeetupMachine({ scheduledAt, chatContext }), {
            type: "PROPOSE",
            actorRole: "SELLER",
        })
        if (!proposed.ok) {
            throw new Error("Se esperaba PROPOSE valido para el escenario.")
        }

        const cancelled = transitionMeetup(proposed.meetup, {
            type: "CANCEL",
            actorRole: "BUYER",
            occurredAt: new Date("2026-02-20T17:45:00.000Z"),
        })

        expect(cancelled.ok).toBe(true)
        if (cancelled.ok) {
            expect(cancelled.meetup.reliabilityImpacts?.[0]?.type).toBe(
                "RED_ZONE_CANCELLATION"
            )
        }
    })

    it("permite nueva propuesta del vendedor tras CANCELLED", () => {
        const initial = createMeetupMachine({ scheduledAt, chatContext })
        const proposed = transitionMeetup(initial, {
            type: "PROPOSE",
            actorRole: "SELLER",
        })
        if (!proposed.ok) {
            throw new Error("Se esperaba PROPOSE valido para el escenario.")
        }

        const cancelled = transitionMeetup(proposed.meetup, {
            type: "CANCEL",
            actorRole: "BUYER",
        })
        if (!cancelled.ok) {
            throw new Error("Se esperaba CANCEL valido para el escenario.")
        }

        const reproposed = transitionMeetup(cancelled.meetup, {
            type: "PROPOSE",
            actorRole: "SELLER",
        })

        expect(reproposed.ok).toBe(true)
        if (reproposed.ok) {
            expect(reproposed.meetup.status).toBe("PROPOSED")
            expect(reproposed.meetup.cancelledAt).toBeUndefined()
        }
    })

    it("bloquea transiciones desde estado final", () => {
        const initial = createMeetupMachine({ scheduledAt, chatContext })
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
            trigger: "SYSTEM",
        })

        expect(retry.ok).toBe(false)
    })

    it("permite cierre neutral por inaccion del vendedor (opcion D)", () => {
        const initial = createMeetupMachine({ scheduledAt, chatContext })
        const proposed = transitionMeetup(initial, {
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

        const expiredNeutral = transitionMeetup(confirmed.meetup, {
            type: "EXPIRE",
            trigger: "SELLER_NO_RESPONSE_48H",
            occurredAt: new Date("2026-02-22T18:00:00.000Z"),
        })

        expect(expiredNeutral.ok).toBe(true)
        if (expiredNeutral.ok) {
            expect(expiredNeutral.meetup.status).toBe("EXPIRED")
            expect(expiredNeutral.meetup.expiredByTrigger).toBe("SELLER_NO_RESPONSE_48H")
        }
    })
})
