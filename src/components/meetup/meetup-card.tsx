import { Button } from "@/components/ui/button"
import { WallapopIcon } from "@/components/ui/wallapop-icon"
import { resolveArrivalActionState } from "@/components/meetup/meetup-ui-rules"
import { Banknote, MapPin } from "lucide-react"
import { transitionMeetup } from "@/meetup/state-machine"
import type { ActorRole, MeetupMachine, MeetupPaymentMethod, MeetupStatus } from "@/meetup/types"

type MeetupCardProps = {
    meetup: MeetupMachine
    actorRole: ActorRole
    currentTime: Date
    onMeetupChange: (next: MeetupMachine) => void
    onError: (message: string) => void
    onEditProposal?: () => void
    onOpenMapPreview?: () => void
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
                label: "pendiente",
                className:
                    "border-[var(--wm-color-border-default)] bg-[var(--wm-color-background-base)] text-[var(--wm-color-text-secondary)]",
            }
        case "COUNTER_PROPOSED":
            return {
                label: "contraoferta",
                className: "border-[#F4A000] bg-[#FFF3DE] text-[#8A5B00]",
            }
        case "CONFIRMED":
            return {
                label: "confirmada",
                className: "border-[#19A05D] bg-[#E6F7EF] text-[#177A4B]",
            }
        case "ARRIVED":
            return {
                label: "llegada",
                className: "border-[#0D84FF] bg-[#E8F2FF] text-[#0A5EB5]",
            }
        case "COMPLETED":
            return {
                label: "completada",
                className: "border-[#AC2B8B] bg-[#F7EAF2] text-[#7B1E64]",
            }
        case "EXPIRED":
            return {
                label: "expirada",
                className: "border-[#A8B2B8] bg-[#F5F7F8] text-[#4A5A63]",
            }
        case "CANCELLED":
            return {
                label: "cancelada",
                className: "border-[#FF5A5F] bg-[#FDEBEC] text-[#A81F2D]",
            }
        default:
            return {
                label: "sin propuesta",
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

function buildStaticMapThumbnailUrl(lat: number, lng: number): string {
    const latDelta = 0.0038
    const lngDelta = 0.0058
    const left = (lng - lngDelta).toFixed(6)
    const bottom = (lat - latDelta).toFixed(6)
    const right = (lng + lngDelta).toFixed(6)
    const top = (lat + latDelta).toFixed(6)
    const marker = `${lat.toFixed(6)},${lng.toFixed(6)}`
    return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${marker}`
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
    onOpenMapPreview,
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

    const paymentAndPriceValue = [
        meetup.proposedPaymentMethod ? paymentMethodLabel(meetup.proposedPaymentMethod) : "Sin metodo",
        meetup.finalPrice !== undefined ? `${meetup.finalPrice.toFixed(2)} EUR` : "sin precio",
    ].join(" · ")

    const currentStatusPill = statusPill(meetup.status)
    const canEditProposal =
        actorRole === "SELLER" &&
        (meetup.status === "PROPOSED" || meetup.status === "COUNTER_PROPOSED")
    const hasMapCoordinates =
        typeof meetup.proposedLocationLat === "number" &&
        typeof meetup.proposedLocationLng === "number"
    const mapThumbnailUrl = hasMapCoordinates
        ? buildStaticMapThumbnailUrl(meetup.proposedLocationLat, meetup.proposedLocationLng)
        : ""

    return (
        <section className="max-w-[420px] rounded-[20px] border border-[#ECEFF1] bg-[#C6EDF6] px-4 py-3">
            <button
                type="button"
                className="relative mb-3 h-[88px] w-full overflow-hidden rounded-[14px] border border-[#B8DCE4] bg-[#EAF8FC] text-left"
                onClick={onOpenMapPreview}
            >
                {hasMapCoordinates ? (
                    <iframe
                        title={`Miniatura del mapa de ${meetup.proposedLocation || "punto de encuentro"}`}
                        src={mapThumbnailUrl}
                        className="h-full w-full border-0 [pointer-events:none]"
                        loading="lazy"
                    />
                ) : null}
            </button>

            <div className="flex items-start justify-between gap-3">
                <p className="font-wallie-chunky text-[17px] leading-[1.1] text-[#253238]">
                    Propuesta de quedada
                </p>
                <span
                    className={`inline-flex rounded-full border px-2.5 py-1 font-wallie-fit text-[11px] leading-[1] ${currentStatusPill.className}`}
                >
                    {currentStatusPill.label}
                </span>
            </div>

            <dl className="mt-3 space-y-2.5">
                <div className="flex items-center gap-2.5">
                    <dt className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#EAF5F8] text-[#253238]">
                        <WallapopIcon name="calendar" size={14} />
                    </dt>
                    <dd className="font-wallie-fit text-[13px] text-[#253238]">
                        {formatScheduledAt(meetup.scheduledAt)}
                    </dd>
                </div>
                <div className="flex items-center gap-2.5">
                    <dt className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#EAF5F8] text-[#253238]">
                        <MapPin size={14} />
                    </dt>
                    <dd className="font-wallie-fit text-[13px] text-[#253238]">
                        {meetup.proposedLocation || "Calle sin definir"}
                    </dd>
                </div>
                <div className="flex items-center gap-2.5">
                    <dt className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#EAF5F8] text-[#253238]">
                        <Banknote size={14} />
                    </dt>
                    <dd className="font-wallie-fit text-[13px] text-[#253238]">
                        {paymentAndPriceValue}
                    </dd>
                </div>
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
