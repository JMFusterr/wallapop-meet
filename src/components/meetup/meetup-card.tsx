import { Button } from "@/components/ui/button"
import { resolveArrivalActionState } from "@/components/meetup/meetup-ui-rules"
import { transitionMeetup } from "@/meetup/state-machine"
import type { ActorRole, MeetupMachine, MeetupStatus } from "@/meetup/types"

type MeetupCardProps = {
    meetup: MeetupMachine
    actorRole: ActorRole
    currentTime: Date
    onMeetupChange: (next: MeetupMachine) => void
    onError: (message: string) => void
}

type CardAction = {
    id: string
    label: string
    variant: "primary" | "inline_action" | "critical"
    run: () => void
    disabled?: boolean
}

function nextStatusLabel(status: MeetupStatus | null): string {
    return status ?? "NO_PROPOSAL"
}

function MeetupCard({
    meetup,
    actorRole,
    currentTime,
    onMeetupChange,
    onError,
}: MeetupCardProps) {
    const arrivalAction = resolveArrivalActionState(meetup, currentTime)

    const applyEvent = (
        event:
            | { type: "PROPOSE"; actorRole: ActorRole; occurredAt: Date }
            | { type: "COUNTER_PROPOSE"; actorRole: ActorRole; occurredAt: Date }
            | { type: "ACCEPT"; actorRole: ActorRole; occurredAt: Date }
            | { type: "MARK_ARRIVED"; actorRole: ActorRole; occurredAt: Date }
            | { type: "COMPLETE"; actorRole: ActorRole; occurredAt: Date }
            | { type: "CANCEL"; actorRole: ActorRole; occurredAt: Date }
            | { type: "EXPIRE"; occurredAt: Date }
    ) => {
        const result = transitionMeetup(meetup, event)
        if (!result.ok) {
            onError(result.reason)
            return
        }
        onError("")
        onMeetupChange(result.meetup)
    }

    const actions: CardAction[] = []

    if (meetup.status === null) {
        actions.push({
            id: "propose",
            label: "Enviar propuesta",
            variant: "primary",
            run: () =>
                applyEvent({
                    type: "PROPOSE",
                    actorRole,
                    occurredAt: currentTime,
                }),
            disabled: actorRole !== "SELLER",
        })
    }

    if (meetup.status === "PROPOSED") {
        actions.push({
            id: "accept",
            label: "Aceptar",
            variant: "primary",
            run: () =>
                applyEvent({
                    type: "ACCEPT",
                    actorRole,
                    occurredAt: currentTime,
                }),
            disabled: actorRole !== "BUYER",
        })
        actions.push({
            id: "counter",
            label: "Contraofertar",
            variant: "inline_action",
            run: () =>
                applyEvent({
                    type: "COUNTER_PROPOSE",
                    actorRole,
                    occurredAt: currentTime,
                }),
            disabled: actorRole !== "BUYER",
        })
    }

    if (meetup.status === "COUNTER_PROPOSED") {
        actions.push({
            id: "repropose",
            label: "Reenviar propuesta",
            variant: "inline_action",
            run: () =>
                applyEvent({
                    type: "PROPOSE",
                    actorRole,
                    occurredAt: currentTime,
                }),
            disabled: actorRole !== "SELLER",
        })
        actions.push({
            id: "accept-counter",
            label: "Aceptar contraoferta",
            variant: "primary",
            run: () =>
                applyEvent({
                    type: "ACCEPT",
                    actorRole,
                    occurredAt: currentTime,
                }),
            disabled: actorRole !== "SELLER",
        })
    }

    if (meetup.status === "CONFIRMED") {
        actions.push({
            id: "arrived",
            label: "I'm here",
            variant: "primary",
            run: () =>
                applyEvent({
                    type: "MARK_ARRIVED",
                    actorRole,
                    occurredAt: currentTime,
                }),
            disabled: !arrivalAction.enabled,
        })
        actions.push({
            id: "expire",
            label: "Expirar meetup",
            variant: "critical",
            run: () =>
                applyEvent({
                    type: "EXPIRE",
                    occurredAt: currentTime,
                }),
        })
    }

    if (meetup.status === "ARRIVED") {
        actions.push({
            id: "complete",
            label: "Confirmar venta",
            variant: "primary",
            run: () =>
                applyEvent({
                    type: "COMPLETE",
                    actorRole,
                    occurredAt: currentTime,
                }),
        })
    }

    if (
        meetup.status !== "COMPLETED" &&
        meetup.status !== "EXPIRED" &&
        meetup.status !== "CANCELLED" &&
        meetup.status !== null
    ) {
        actions.push({
            id: "cancel",
            label: "Cancelar meetup",
            variant: "critical",
            run: () =>
                applyEvent({
                    type: "CANCEL",
                    actorRole,
                    occurredAt: currentTime,
                }),
        })
    }

    return (
        <section className="rounded-[12px] border border-[#D3DEE2] bg-white p-4">
            <p className="font-wallie-fit text-[12px] text-[#6E8792]">Meetup card</p>
            <h2 className="font-wallie-fit text-[16px] text-[#253238]">
                Estado: {nextStatusLabel(meetup.status)}
            </h2>
            <p className="font-wallie-fit text-[13px] text-[#4A5A63]">
                Actor activo: {actorRole}
            </p>

            {meetup.status === "CONFIRMED" ? (
                <p className="mt-3 font-wallie-fit text-[12px] text-[#4A5A63]">
                    {arrivalAction.message}
                </p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
                {actions.map((action) => (
                    <Button
                        key={action.id}
                        variant={action.variant}
                        size="sm"
                        onClick={action.run}
                        disabled={action.disabled}
                    >
                        {action.label}
                    </Button>
                ))}
            </div>
        </section>
    )
}

export { MeetupCard }
