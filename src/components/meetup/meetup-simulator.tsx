import * as React from "react"

import { Button } from "@/components/ui/button"
import { MeetupTimeline } from "@/components/meetup/meetup-timeline"
import {
    createMeetupMachine,
    getArrivalWindow,
    isWithinArrivalWindow,
    transitionMeetup,
} from "@/meetup"
import type { ActorRole, MeetupMachine } from "@/meetup/types"

const HALF_HOUR_MS = 30 * 60 * 1000
const TEN_MINUTES_MS = 10 * 60 * 1000
const THREE_HOURS_MS = 3 * 60 * 60 * 1000

type SimulationAction = {
    id: string
    label: string
    run: (machine: MeetupMachine, actorRole: ActorRole, now: Date) => MeetupMachine
}

function applyTransition(
    machine: MeetupMachine,
    actorRole: ActorRole,
    now: Date,
    eventType:
        | "PROPOSE"
        | "COUNTER_PROPOSE"
        | "ACCEPT"
        | "MARK_ARRIVED"
        | "COMPLETE"
        | "CANCEL"
        | "EXPIRE"
): MeetupMachine {
    const event =
        eventType === "EXPIRE"
            ? { type: eventType as const, occurredAt: now }
            : eventType === "MARK_ARRIVED"
              ? { type: eventType as const, actorRole, occurredAt: now }
              : { type: eventType as const, actorRole, occurredAt: now }

    const result = transitionMeetup(machine, event)
    if (!result.ok) {
        return machine
    }
    return result.meetup
}

function buildActions(status: MeetupMachine["status"]): SimulationAction[] {
    switch (status) {
        case null:
            return [
                {
                    id: "propose",
                    label: "Enviar propuesta",
                    run: (machine, actorRole, now) =>
                        applyTransition(machine, actorRole, now, "PROPOSE"),
                },
            ]
        case "PROPOSED":
            return [
                {
                    id: "counter",
                    label: "Contraofertar",
                    run: (machine, actorRole, now) =>
                        applyTransition(machine, actorRole, now, "COUNTER_PROPOSE"),
                },
                {
                    id: "accept",
                    label: "Aceptar",
                    run: (machine, actorRole, now) =>
                        applyTransition(machine, actorRole, now, "ACCEPT"),
                },
                {
                    id: "cancel",
                    label: "Cancelar",
                    run: (machine, actorRole, now) =>
                        applyTransition(machine, actorRole, now, "CANCEL"),
                },
            ]
        case "COUNTER_PROPOSED":
            return [
                {
                    id: "repropose",
                    label: "Reenviar propuesta",
                    run: (machine, actorRole, now) =>
                        applyTransition(machine, actorRole, now, "PROPOSE"),
                },
                {
                    id: "accept-counter",
                    label: "Aceptar contraoferta",
                    run: (machine, actorRole, now) =>
                        applyTransition(machine, actorRole, now, "ACCEPT"),
                },
                {
                    id: "cancel",
                    label: "Cancelar",
                    run: (machine, actorRole, now) =>
                        applyTransition(machine, actorRole, now, "CANCEL"),
                },
            ]
        case "CONFIRMED":
            return [
                {
                    id: "arrived",
                    label: "I'm here",
                    run: (machine, actorRole, now) =>
                        applyTransition(machine, actorRole, now, "MARK_ARRIVED"),
                },
                {
                    id: "expire",
                    label: "Expirar meetup",
                    run: (machine, actorRole, now) =>
                        applyTransition(machine, actorRole, now, "EXPIRE"),
                },
            ]
        case "ARRIVED":
            return [
                {
                    id: "complete",
                    label: "Confirmar venta completada",
                    run: (machine, actorRole, now) =>
                        applyTransition(machine, actorRole, now, "COMPLETE"),
                },
                {
                    id: "cancel",
                    label: "Cancelar meetup",
                    run: (machine, actorRole, now) =>
                        applyTransition(machine, actorRole, now, "CANCEL"),
                },
            ]
        default:
            return []
    }
}

function MeetupSimulator() {
    const scheduledAt = React.useMemo(() => new Date(Date.now() + HALF_HOUR_MS), [])
    const [machine, setMachine] = React.useState<MeetupMachine>(() =>
        createMeetupMachine(scheduledAt)
    )
    const [actorRole, setActorRole] = React.useState<ActorRole>("SELLER")
    const [currentTime, setCurrentTime] = React.useState<Date>(() => new Date())
    const [lastError, setLastError] = React.useState<string | null>(null)

    const { opensAt, closesAt } = getArrivalWindow(machine.scheduledAt)
    const inArrivalWindow = isWithinArrivalWindow(machine.scheduledAt, currentTime)
    const actions = buildActions(machine.status)

    const runAction = (action: SimulationAction) => {
        const next = action.run(machine, actorRole, currentTime)
        if (next === machine) {
            const result = transitionMeetup(
                machine,
                action.id === "expire"
                    ? { type: "EXPIRE", occurredAt: currentTime }
                    : action.id === "arrived"
                      ? {
                            type: "MARK_ARRIVED",
                            actorRole,
                            occurredAt: currentTime,
                        }
                      : action.id === "propose" || action.id === "repropose"
                        ? { type: "PROPOSE", actorRole, occurredAt: currentTime }
                        : action.id === "counter"
                          ? {
                                type: "COUNTER_PROPOSE",
                                actorRole,
                                occurredAt: currentTime,
                            }
                          : action.id === "accept" || action.id === "accept-counter"
                            ? { type: "ACCEPT", actorRole, occurredAt: currentTime }
                            : action.id === "complete"
                              ? { type: "COMPLETE", actorRole, occurredAt: currentTime }
                              : { type: "CANCEL", actorRole, occurredAt: currentTime }
            )
            if (!result.ok) {
                setLastError(result.reason)
            }
            return
        }

        setLastError(null)
        setMachine(next)
    }

    return (
        <section className="w-full rounded-[16px] border border-[var(--wm-color-border-default)] bg-white p-5 shadow-[0_1px_2px_rgba(37,50,56,0.1)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="font-wallie-fit text-[12px] text-[#6E8792]">
                        Wallapop Meet Demo
                    </p>
                    <h1 className="font-wallie-chunky text-[24px] leading-8 text-[#253238]">
                        Flujo de meetup
                    </h1>
                </div>
                <div className="flex items-center gap-2" role="tablist" aria-label="Rol actor">
                    <Button
                        variant="tab"
                        role="tab"
                        aria-selected={actorRole === "SELLER"}
                        data-selected={actorRole === "SELLER"}
                        onClick={() => setActorRole("SELLER")}
                    >
                        Seller
                    </Button>
                    <Button
                        variant="tab"
                        role="tab"
                        aria-selected={actorRole === "BUYER"}
                        data-selected={actorRole === "BUYER"}
                        onClick={() => setActorRole("BUYER")}
                    >
                        Buyer
                    </Button>
                </div>
            </div>

            <div className="mt-4 space-y-2 rounded-[12px] bg-[#F5F7F8] p-4">
                <p className="font-wallie-fit text-[14px] text-[#253238]">
                    Estado actual:{" "}
                    <strong>{machine.status ?? "NO_PROPOSAL"}</strong>
                </p>
                <p className="font-wallie-fit text-[13px] text-[#4A5A63]">
                    Programado: {machine.scheduledAt.toLocaleString()}
                </p>
                <p className="font-wallie-fit text-[13px] text-[#4A5A63]">
                    Ventana llegada: {opensAt.toLocaleTimeString()} - {closesAt.toLocaleTimeString()}
                </p>
                <p className="font-wallie-fit text-[13px] text-[#4A5A63]">
                    Hora simulada: {currentTime.toLocaleString()} ({inArrivalWindow ? "dentro" : "fuera"})
                </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                <Button
                    variant="inline_action"
                    size="sm"
                    onClick={() => setCurrentTime(new Date(machine.scheduledAt.getTime() - TEN_MINUTES_MS))}
                >
                    Simular -10m
                </Button>
                <Button
                    variant="inline_action"
                    size="sm"
                    onClick={() => setCurrentTime(new Date(machine.scheduledAt))}
                >
                    Simular hora exacta
                </Button>
                <Button
                    variant="inline_action"
                    size="sm"
                    onClick={() => setCurrentTime(new Date(machine.scheduledAt.getTime() + THREE_HOURS_MS))}
                >
                    Simular +3h
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        setMachine(createMeetupMachine(scheduledAt))
                        setCurrentTime(new Date())
                        setLastError(null)
                    }}
                >
                    Reiniciar
                </Button>
            </div>

            <div className="mt-4">
                <MeetupTimeline currentStatus={machine.status} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                {actions.map((action) => (
                    <Button
                        key={action.id}
                        variant={action.id === "cancel" || action.id === "expire" ? "critical" : "primary"}
                        size="sm"
                        onClick={() => runAction(action)}
                    >
                        {action.label}
                    </Button>
                ))}
            </div>

            {lastError ? (
                <p className="mt-3 rounded-[8px] bg-[#FDEBEC] px-3 py-2 font-wallie-fit text-[13px] text-[#A81F2D]">
                    {lastError}
                </p>
            ) : null}
        </section>
    )
}

export { MeetupSimulator }
