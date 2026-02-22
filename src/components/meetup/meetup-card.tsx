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
                label: "Propuesta enviada",
                className: "border-[#66C9DB] bg-[#D9F3F9] text-[#1E7D92]",
            }
        case "COUNTER_PROPOSED":
            return {
                label: "Contraoferta recibida",
                className: "border-[#F3C56A] bg-[#FFF1D6] text-[#8A5B00]",
            }
        case "CONFIRMED":
            return {
                label: "Quedada confirmada",
                className: "border-[#9ED6B8] bg-[#E8F8EE] text-[#177A4B]",
            }
        case "ARRIVED":
            return {
                label: "Persona llegada",
                className: "border-[#9BB8F8] bg-[#EAF1FF] text-[#2A5BB6]",
            }
        case "COMPLETED":
            return {
                label: "Venta completada",
                className: "border-[#97D6B5] bg-[#E5F7ED] text-[#187347]",
            }
        case "EXPIRED":
            return {
                label: "Solicitud expirada",
                className: "border-[#F1B3B8] bg-[#FDEBEC] text-[#A81F2D]",
            }
        case "CANCELLED":
            return {
                label: "Solicitud cancelada",
                className: "border-[#CDD8DD] bg-[#F3F6F8] text-[#4A5A63]",
            }
        default:
            return {
                label: "Sin propuesta",
                className: "border-[#D3DEE2] bg-white text-[#4A5A63]",
            }
    }
}

function statusHeadline(status: MeetupStatus | null, actorRole: ActorRole): string {
    if (status === "PROPOSED" && actorRole === "SELLER") {
        return "Has enviado una solicitud de quedada."
    }
    if (status === "PROPOSED" && actorRole === "BUYER") {
        return "Tienes una solicitud de quedada pendiente."
    }
    if (status === "COUNTER_PROPOSED") {
        return "Se ha actualizado la propuesta de quedada."
    }
    if (status === "CONFIRMED") {
        return "La quedada esta confirmada."
    }
    if (status === "ARRIVED") {
        return "Una de las partes ya ha llegado al punto de encuentro."
    }
    if (status === "COMPLETED") {
        return "La operacion se marco como completada."
    }
    if (status === "EXPIRED") {
        return "La solicitud ha expirado."
    }
    if (status === "CANCELLED") {
        return "La solicitud fue cancelada."
    }
    return "Previsualizacion de solicitud de quedada."
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

    return (
        <section className="max-w-[420px] rounded-[20px] border border-[#ECEFF1] bg-[#C6EDF6] px-4 py-3">
            <div className="flex items-start justify-between gap-3">
                <p className="font-wallie-fit text-[11px] uppercase tracking-[0.06em] text-[#2C8CA0]">
                    Sistema Wallapop Meet
                </p>
                <span
                    className={`inline-flex rounded-full border px-2.5 py-1 font-wallie-fit text-[11px] leading-[1] ${currentStatusPill.className}`}
                >
                    {currentStatusPill.label}
                </span>
            </div>

            <p className="mt-2 font-wallie-fit text-[15px] leading-[1.35] text-[#253238]">
                {statusHeadline(meetup.status, actorRole)}
            </p>

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
                </div>
            ) : null}
        </section>
    )
}

export { MeetupCard }
