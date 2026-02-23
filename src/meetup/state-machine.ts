import { isWithinArrivalWindow } from "@/meetup/arrival-window"
import type {
    CreateMeetupMachineInput,
    MeetupChatContext,
    MeetupEvent,
    MeetupMachine,
    TransitionResult,
} from "@/meetup/types"

function nowFallback(date?: Date): Date {
    return date ?? new Date()
}

function fail(reason: string): TransitionResult {
    return { ok: false, reason }
}

function success(meetup: MeetupMachine): TransitionResult {
    return { ok: true, meetup }
}

const RED_ZONE_CANCELLATION_MINUTES = 30

function isTerminalStatus(status: MeetupMachine["status"]): boolean {
    return (
        status === "COMPLETED" || status === "EXPIRED" || status === "CANCELLED"
    )
}

function isValidChatContextField(value: string): boolean {
    return value.trim().length > 0
}

function assertValidChatContext(chatContext: MeetupChatContext): void {
    const {
        conversationId,
        listingId,
        sellerUserId,
        buyerUserId,
    } = chatContext

    if (!isValidChatContextField(conversationId)) {
        throw new Error("conversationId es obligatorio para crear Wallapop Meet desde chat.")
    }

    if (!isValidChatContextField(listingId)) {
        throw new Error("listingId es obligatorio para crear Wallapop Meet desde chat.")
    }

    if (!isValidChatContextField(sellerUserId)) {
        throw new Error("sellerUserId es obligatorio para crear Wallapop Meet desde chat.")
    }

    if (!isValidChatContextField(buyerUserId)) {
        throw new Error("buyerUserId es obligatorio para crear Wallapop Meet desde chat.")
    }

    if (sellerUserId === buyerUserId) {
        throw new Error("sellerUserId y buyerUserId no pueden ser el mismo usuario.")
    }
}

export function createMeetupMachine({
    scheduledAt,
    chatContext,
}: CreateMeetupMachineInput): MeetupMachine {
    assertValidChatContext(chatContext)

    return {
        status: null,
        scheduledAt,
        chatContext,
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
                proposedAt: nowFallback(event.occurredAt),
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
            if (meetup.status !== "CONFIRMED" && meetup.status !== "ARRIVED") {
                return fail("MARK_ARRIVED solo es valido desde CONFIRMED o ARRIVED.")
            }

            if (!isWithinArrivalWindow(meetup.scheduledAt, event.occurredAt)) {
                return fail(
                    "La accion de llegada solo es valida entre 15 minutos antes y 2 horas despues."
                )
            }

            if (meetup.arrivalCheckins?.[event.actorRole]) {
                return fail("Este actor ya ha marcado llegada para esta quedada.")
            }

            const nextCheckins = {
                ...(meetup.arrivalCheckins ?? {}),
                [event.actorRole]: {
                    occurredAt: event.occurredAt,
                    distanceMeters: event.distanceMeters,
                    withinSafeRadius: event.withinSafeRadius,
                },
            } satisfies MeetupMachine["arrivalCheckins"]

            return success({
                ...meetup,
                status: "ARRIVED",
                arrivedAt: meetup.arrivedAt ?? event.occurredAt,
                arrivalCheckins: nextCheckins,
            })
        }

        case "LATE_NOTICE": {
            if (meetup.status !== "CONFIRMED") {
                return fail("LATE_NOTICE solo es valido desde CONFIRMED.")
            }

            const occurredAt = nowFallback(event.occurredAt)
            return success({
                ...meetup,
                lateNotices: [
                    ...(meetup.lateNotices ?? []),
                    {
                        actorRole: event.actorRole,
                        etaMinutes: event.etaMinutes,
                        occurredAt,
                    },
                ],
            })
        }

        case "COMPLETE": {
            if (meetup.status !== "ARRIVED") {
                return fail("COMPLETE solo es valido desde ARRIVED.")
            }

            if (event.actorRole !== "SELLER") {
                return fail("Solo el vendedor puede confirmar la venta.")
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

            const cancelledAt = nowFallback(event.occurredAt)
            const minutesBeforeScheduled = Math.floor(
                (meetup.scheduledAt.getTime() - cancelledAt.getTime()) / (60 * 1000)
            )
            const inRedZone =
                minutesBeforeScheduled >= 0 &&
                minutesBeforeScheduled <= RED_ZONE_CANCELLATION_MINUTES

            return success({
                ...meetup,
                status: "CANCELLED",
                cancelledAt,
                reliabilityImpacts: inRedZone
                    ? [
                          ...(meetup.reliabilityImpacts ?? []),
                          {
                              type: "RED_ZONE_CANCELLATION",
                              actorRole: event.actorRole,
                              occurredAt: cancelledAt,
                              minutesBeforeScheduled,
                          },
                      ]
                    : meetup.reliabilityImpacts,
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
