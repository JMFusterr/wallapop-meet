import { isWithinArrivalWindow } from "@/meetup/arrival-window"
import type { MeetupEvent, MeetupMachine, TransitionResult } from "@/meetup/types"

function nowFallback(date?: Date): Date {
    return date ?? new Date()
}

function fail(reason: string): TransitionResult {
    return { ok: false, reason }
}

function success(meetup: MeetupMachine): TransitionResult {
    return { ok: true, meetup }
}

function isTerminalStatus(status: MeetupMachine["status"]): boolean {
    return (
        status === "COMPLETED" || status === "EXPIRED" || status === "CANCELLED"
    )
}

export function createMeetupMachine(scheduledAt: Date): MeetupMachine {
    return {
        status: null,
        scheduledAt,
    }
}

export function transitionMeetup(
    meetup: MeetupMachine,
    event: MeetupEvent
): TransitionResult {
    if (isTerminalStatus(meetup.status)) {
        return fail(`No se permiten transiciones desde estado final ${meetup.status}.`)
    }

    switch (event.type) {
        case "PROPOSE": {
            if (event.actorRole !== "SELLER") {
                return fail("Solo el vendedor puede iniciar o reenviar propuesta.")
            }

            if (meetup.status !== null && meetup.status !== "COUNTER_PROPOSED") {
                return fail("PROPOSE solo es valido desde estado inicial o COUNTER_PROPOSED.")
            }

            return success({
                ...meetup,
                status: "PROPOSED",
                proposedAt: nowFallback(event.occurredAt),
            })
        }

        case "COUNTER_PROPOSE": {
            if (event.actorRole !== "BUYER") {
                return fail("Solo el comprador puede contraofertar.")
            }

            if (meetup.status !== "PROPOSED") {
                return fail("COUNTER_PROPOSED solo puede ocurrir desde PROPOSED.")
            }

            return success({
                ...meetup,
                status: "COUNTER_PROPOSED",
            })
        }

        case "ACCEPT": {
            if (meetup.status === "PROPOSED" && event.actorRole !== "BUYER") {
                return fail("En PROPOSED solo el comprador puede aceptar.")
            }

            if (meetup.status === "COUNTER_PROPOSED" && event.actorRole !== "SELLER") {
                return fail("En COUNTER_PROPOSED solo el vendedor puede aceptar.")
            }

            if (meetup.status !== "PROPOSED" && meetup.status !== "COUNTER_PROPOSED") {
                return fail("ACCEPT solo es valido desde PROPOSED o COUNTER_PROPOSED.")
            }

            return success({
                ...meetup,
                status: "CONFIRMED",
                confirmedAt: nowFallback(event.occurredAt),
            })
        }

        case "MARK_ARRIVED": {
            if (meetup.status !== "CONFIRMED") {
                return fail("MARK_ARRIVED solo es valido desde CONFIRMED.")
            }

            if (!isWithinArrivalWindow(meetup.scheduledAt, event.occurredAt)) {
                return fail(
                    "La accion de llegada solo es valida entre 15 minutos antes y 2 horas despues."
                )
            }

            return success({
                ...meetup,
                status: "ARRIVED",
                arrivedAt: event.occurredAt,
            })
        }

        case "COMPLETE": {
            if (meetup.status !== "ARRIVED") {
                return fail("COMPLETE solo es valido desde ARRIVED.")
            }

            return success({
                ...meetup,
                status: "COMPLETED",
                completedAt: nowFallback(event.occurredAt),
            })
        }

        case "CANCEL": {
            if (meetup.status === null) {
                return fail("No existe una propuesta activa para cancelar.")
            }

            return success({
                ...meetup,
                status: "CANCELLED",
                cancelledAt: nowFallback(event.occurredAt),
            })
        }

        case "EXPIRE": {
            if (meetup.status === null) {
                return fail("No existe una propuesta activa para expirar.")
            }

            return success({
                ...meetup,
                status: "EXPIRED",
                expiredAt: nowFallback(event.occurredAt),
            })
        }

        default: {
            return fail("Evento no soportado.")
        }
    }
}
