import { Button } from "@/components/ui/button"
import { resolveArrivalActionState } from "@/components/meetup/meetup-ui-rules"
import { transitionMeetup } from "@/meetup/state-machine"
import type { ActorRole, MeetupMachine, MeetupPaymentMethod, MeetupStatus } from "@/meetup/types"

type MeetupCardProps = {
    meetup: MeetupMachine
    actorRole: ActorRole
    currentTime: Date
    onMeetupChange: (next: MeetupMachine) => void
    onError: (message: string) => void
    onEditProposal?: () => void
}

type CardAction = {
    id: string
    label: string
    variant: "primary" | "inline_action" | "critical"
    run: () => void
    disabled?: boolean
}

type StatusPill = {
    label: string
    className: string
}

function statusPill(status: MeetupStatus | null): StatusPill {
    switch (status) {
        case "PROPOSED":
            return {
                label: "Pending",
                className:
                    "border-[var(--wm-color-border-default)] bg-[var(--wm-color-background-base)] text-[var(--wm-color-text-secondary)]",
            }
        case "COUNTER_PROPOSED":
            return {
                label: "COUNTER_PROPOSED",
                className: "border-[#F4A000] bg-[#FFF3DE] text-[#8A5B00]",
            }
        case "CONFIRMED":
            return {
                label: "CONFIRMED",
                className: "border-[#19A05D] bg-[#E6F7EF] text-[#177A4B]",
            }
        case "ARRIVED":
            return {
                label: "ARRIVED",
                className: "border-[#0D84FF] bg-[#E8F2FF] text-[#0A5EB5]",
            }
        case "COMPLETED":
            return {
                label: "COMPLETED",
                className: "border-[#AC2B8B] bg-[#F7EAF2] text-[#7B1E64]",
            }
        case "EXPIRED":
            return {
                label: "EXPIRED",
                className: "border-[#A8B2B8] bg-[#F5F7F8] text-[#4A5A63]",
            }
        case "CANCELLED":
            return {
                label: "CANCELLED",
                className: "border-[#FF5A5F] bg-[#FDEBEC] text-[#A81F2D]",
            }
        default:
            return {
                label: "Sin propuesta",
                className: "border-[#D3DEE2] bg-white text-[#4A5A63]",
            }
    }
}

function formatScheduledAt(value: Date): string {
    return value.toLocaleString("es-ES", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    })
}

function paymentMethodLabel(method: MeetupPaymentMethod): string {
    switch (method) {
        case "CASH":
            return "Efectivo"
        case "BIZUM":
            return "Bizum"
        case "WALLET":
            return "Wallapop Wallet"
        default:
            return method
    }
}

function MeetupCard({
    meetup,
    actorRole,
    currentTime,
    onMeetupChange,
    onError,
    onEditProposal,
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

    if (meetup.status === "PROPOSED" && actorRole === "BUYER") {
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

    if (meetup.status === "COUNTER_PROPOSED" && actorRole === "SELLER") {
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

    const details = [
        {
            id: "schedule",
            label: "Dia y hora",
            value: formatScheduledAt(meetup.scheduledAt),
        },
        meetup.proposedLocation
            ? {
                id: "location",
                label: "Punto de encuentro",
                value: meetup.proposedLocation,
            }
            : null,
        meetup.finalPrice !== undefined
            ? {
                id: "price",
                label: "Precio acordado",
                value: `${meetup.finalPrice.toFixed(2)} EUR`,
            }
            : null,
        meetup.proposedPaymentMethod
            ? {
                id: "payment",
                label: "Pago",
                value: paymentMethodLabel(meetup.proposedPaymentMethod),
            }
            : null,
    ].filter((detail): detail is { id: string; label: string; value: string } => detail !== null)

    const currentStatusPill = statusPill(meetup.status)
    const canEditProposal =
        actorRole === "SELLER" &&
        (meetup.status === "PROPOSED" || meetup.status === "COUNTER_PROPOSED")

    return (
        <section className="max-w-[420px] rounded-[20px] border border-[#ECEFF1] bg-[#C6EDF6] px-4 py-3">
            <div className="flex items-start justify-between gap-3">
                <p className="font-wallie-fit text-[11px] uppercase tracking-[0.06em] text-[#2C8CA0]">
                    Propuesta de quedada
                </p>
                <span
                    className={`inline-flex rounded-full border px-2.5 py-1 font-wallie-fit text-[11px] leading-[1] ${currentStatusPill.className}`}
                >
                    {currentStatusPill.label}
                </span>
            </div>

            <dl className="mt-3 space-y-1.5">
                {details.map((detail) => (
                    <div key={detail.id} className="grid grid-cols-[112px_1fr] gap-2">
                        <dt className="font-wallie-fit text-[12px] text-[#2C8CA0]">{detail.label}</dt>
                        <dd className="font-wallie-fit text-[12px] text-[#253238]">{detail.value}</dd>
                    </div>
                ))}
            </dl>

            {meetup.status === "CONFIRMED" ? (
                <p className="mt-3 rounded-[12px] border border-[#B4D9E2] bg-[#E8F7FB] px-3 py-2 font-wallie-fit text-[12px] text-[#1E7D92]">
                    {arrivalAction.message}
                </p>
            ) : null}

            {actions.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
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
                    {canEditProposal && onEditProposal ? (
                        <Button
                            variant="inline_action"
                            size="sm"
                            onClick={onEditProposal}
                        >
                            Editar
                        </Button>
                    ) : null}
                </div>
            ) : null}
            {actions.length === 0 && canEditProposal && onEditProposal ? (
                <div className="mt-3">
                    <Button variant="inline_action" size="sm" onClick={onEditProposal}>
                        Editar
                    </Button>
                </div>
            ) : null}
        </section>
    )
}

export { MeetupCard }
