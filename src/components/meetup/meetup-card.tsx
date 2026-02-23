import * as React from "react"
import { Button } from "@/components/ui/button"
import { WallapopIcon } from "@/components/ui/wallapop-icon"
import { resolveArrivalActionState } from "@/components/meetup/meetup-ui-rules"
import L from "leaflet"
import { Banknote, MapPin } from "lucide-react"
import { MapContainer, Marker, TileLayer } from "react-leaflet"
import { transitionMeetup } from "@/meetup/state-machine"
import type { ActorRole, MeetupMachine, MeetupPaymentMethod, MeetupStatus } from "@/meetup/types"

type MeetupCardProps = {
    meetup: MeetupMachine
    actorRole: ActorRole
    currentTime: Date
    onMeetupChange: (next: MeetupMachine) => void
    onError: (message: string) => void
    counterpartName?: string
    onEditProposal?: () => void
    onOpenMapPreview?: () => void
    onRedZoneCancelConfirmed?: () => void
}

type CardAction = {
    id: string
    label: string
    variant: "primary" | "inline_action" | "critical" | "secondary" | "ghost"
    run: () => void
    disabled?: boolean
    className?: string
    fullWidth?: boolean
}

const RED_ZONE_CANCELLATION_MINUTES = 30

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
                label: "pendiente",
                className:
                    "border-[var(--wm-color-border-default)] bg-[var(--wm-color-background-base)] text-[var(--wm-color-text-secondary)]",
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
                className: "border-[#D32069] bg-[#FDEAF2] text-[#9F1A53]",
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
    const datePart = value.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
    })
    const timePart = value.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
    })
    return `${datePart} \u00B7 ${timePart}`
}

function formatMessageTime(value: Date): string {
    return value.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
    })
}

function buildStaticMapThumbnailUrl(lat: number, lng: number): string {
    return `${lat.toFixed(6)},${lng.toFixed(6)}`
}

function formatIcsDate(value: Date): string {
    const iso = value.toISOString().replace(/[-:]/g, "")
    return iso.replace(/\.\d{3}Z$/, "Z")
}

function buildMeetupIcs(meetup: MeetupMachine): string {
    const startAt = meetup.scheduledAt
    const endAt = new Date(startAt.getTime() + 60 * 60 * 1000)
    const location = meetup.proposedLocation ?? "Punto por confirmar"

    return [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Wallapop Meet//ES",
        "BEGIN:VEVENT",
        `UID:wallapop-meet-${startAt.getTime()}@wallapop.local`,
        `DTSTAMP:${formatIcsDate(new Date())}`,
        `DTSTART:${formatIcsDate(startAt)}`,
        `DTEND:${formatIcsDate(endAt)}`,
        "SUMMARY:Quedada Wallapop Meet",
        `LOCATION:${location}`,
        "END:VEVENT",
        "END:VCALENDAR",
    ].join("\r\n")
}

const miniMapMarkerIcon = L.divIcon({
    className: "",
    html: `
        <span style="display:flex;height:28px;width:28px;align-items:center;justify-content:center;border-radius:999px;background:#2F6DF6;border:2px solid #FFFFFF;box-shadow:0 4px 10px rgba(37,50,56,0.28);">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10Z"></path>
                <circle cx="12" cy="11" r="2"></circle>
            </svg>
        </span>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
})

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

function PaymentMethodIcon({ method }: { method: MeetupPaymentMethod | undefined }) {
    void method
    return <Banknote size={16} className="text-[#253238]" />
}

function MeetupCard({
    meetup,
    actorRole,
    currentTime,
    onMeetupChange,
    onError,
    counterpartName,
    onEditProposal,
    onOpenMapPreview,
    onRedZoneCancelConfirmed,
}: MeetupCardProps) {
    const arrivalAction = resolveArrivalActionState(meetup, currentTime, actorRole)
    const minutesToMeetup = Math.floor(
        (meetup.scheduledAt.getTime() - currentTime.getTime()) / (60 * 1000)
    )
    const isRedZoneCancellation =
        minutesToMeetup >= 0 && minutesToMeetup <= RED_ZONE_CANCELLATION_MINUTES
    const isCalendarFallbackWindow =
        currentTime.getTime() >= meetup.scheduledAt.getTime() - 30 * 60 * 1000 &&
        currentTime.getTime() <= meetup.scheduledAt.getTime() + 2 * 60 * 60 * 1000
    const [isRedZoneModalOpen, setIsRedZoneModalOpen] = React.useState(false)

    const applyEvent = (
        event:
            | { type: "PROPOSE"; actorRole: ActorRole; occurredAt: Date }
            | { type: "COUNTER_PROPOSE"; actorRole: ActorRole; occurredAt: Date }
            | { type: "ACCEPT"; actorRole: ActorRole; occurredAt: Date }
            | { type: "MARK_ARRIVED"; actorRole: ActorRole; occurredAt: Date }
            | { type: "COMPLETE"; actorRole: ActorRole; occurredAt: Date }
            | { type: "CANCEL"; actorRole: ActorRole; occurredAt: Date }
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
    const PRIMARY_ACTION_CLASS =
        "h-10 w-full font-wallie-chunky text-[16px]"
    const OUTLINE_ACTION_CLASS =
        "h-10 w-full rounded-[999px] border-[#0FA58A] bg-white font-wallie-chunky text-[16px] text-[#0D907A] hover:bg-[#F5FFFD]"
    const TEXT_ACTION_CLASS =
        "h-auto border-transparent bg-transparent px-0 py-1 font-wallie-chunky text-[16px] text-[#6F7C83] underline underline-offset-2 hover:bg-transparent hover:text-[#4A5A63]"

    const runCancel = () => {
        if (isRedZoneCancellation) {
            setIsRedZoneModalOpen(true)
            return
        }

        applyEvent({
            type: "CANCEL",
            actorRole,
            occurredAt: currentTime,
        })
    }

    const confirmRedZoneCancellation = () => {
        setIsRedZoneModalOpen(false)
        applyEvent({
            type: "CANCEL",
            actorRole,
            occurredAt: currentTime,
        })
        onRedZoneCancelConfirmed?.()
    }

    const addToCalendar = () => {
        if (typeof window === "undefined" || typeof document === "undefined") {
            onError("No se pudo abrir el calendario en este entorno.")
            return
        }

        const icsContent = buildMeetupIcs(meetup)
        const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement("a")
        anchor.href = url
        anchor.download = "wallapop-meet.ics"
        document.body.appendChild(anchor)
        anchor.click()
        document.body.removeChild(anchor)
        URL.revokeObjectURL(url)
    }

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
            className: PRIMARY_ACTION_CLASS,
            fullWidth: true,
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
            className:
                `${PRIMARY_ACTION_CLASS} rounded-[999px] bg-[#14C8A8] text-[#16343A] shadow-[inset_0_-2px_0_rgba(0,0,0,0.08)]`,
            fullWidth: true,
        })
        actions.push({
            id: "counter",
            label: "Proponer cambios",
            variant: "secondary",
            run: onEditProposal
                ? onEditProposal
                : () =>
                    applyEvent({
                        type: "COUNTER_PROPOSE",
                        actorRole,
                        occurredAt: currentTime,
                    }),
            disabled: actorRole !== "BUYER",
            className:
                OUTLINE_ACTION_CLASS,
            fullWidth: true,
        })
        actions.push({
            id: "reject",
            label: "Rechazar quedada",
            variant: "ghost",
            run: runCancel,
            disabled: actorRole !== "BUYER",
            className: TEXT_ACTION_CLASS,
            fullWidth: true,
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
            className: PRIMARY_ACTION_CLASS,
            fullWidth: true,
        })
        actions.push({
            id: "repropose",
            label: "Reenviar propuesta",
            variant: "secondary",
            run: () =>
                applyEvent({
                    type: "PROPOSE",
                    actorRole,
                    occurredAt: currentTime,
            }),
            disabled: actorRole !== "SELLER",
            className: OUTLINE_ACTION_CLASS,
            fullWidth: true,
        })
    }

    if (meetup.status === "CONFIRMED") {
        if (isCalendarFallbackWindow) {
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
                className: PRIMARY_ACTION_CLASS,
                fullWidth: true,
            })
        } else {
            actions.push({
                id: "calendar",
                label: "Anadir a Calendar",
                variant: "secondary",
                run: addToCalendar,
                className: OUTLINE_ACTION_CLASS,
                fullWidth: true,
            })
        }
    }

    if (meetup.status === "ARRIVED") {
        if (arrivalAction.enabled) {
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
                className: PRIMARY_ACTION_CLASS,
                fullWidth: true,
            })
        }

        if (actorRole === "SELLER") {
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
                className: PRIMARY_ACTION_CLASS,
                fullWidth: true,
            })
        }
    }

    if (
        meetup.status !== "COMPLETED" &&
        meetup.status !== "EXPIRED" &&
        meetup.status !== "CANCELLED" &&
        meetup.status !== null &&
        !(meetup.status === "PROPOSED" && actorRole === "BUYER")
    ) {
        actions.push({
            id: "cancel",
            label: "Cancelar quedada",
            variant: "ghost",
            run: runCancel,
            className: TEXT_ACTION_CLASS,
            fullWidth: true,
        })
    }

    const paymentMethodValue = meetup.proposedPaymentMethod
        ? paymentMethodLabel(meetup.proposedPaymentMethod)
        : "Sin metodo"
    const formattedPrice =
        meetup.finalPrice !== undefined ? `${meetup.finalPrice.toFixed(2)} \u20AC` : "sin precio"
    const currentStatusPill = statusPill(meetup.status)
    const title = `Quedada con ${counterpartName ?? "usuario"}`
    const canEditProposal =
        actorRole === "SELLER" &&
        (meetup.status === "PROPOSED" || meetup.status === "COUNTER_PROPOSED")
    const isPendingActionStatus = meetup.status === "PROPOSED" || meetup.status === "COUNTER_PROPOSED"
    const sentAt = meetup.proposedAt ?? meetup.confirmedAt ?? meetup.cancelledAt ?? null
    if (canEditProposal && onEditProposal) {
        actions.unshift({
            id: "edit",
            label: "Editar",
            variant: "secondary",
            run: onEditProposal,
            className: OUTLINE_ACTION_CLASS,
            fullWidth: true,
        })
    }
    const primaryActions = actions.filter((action) => action.variant !== "ghost")
    const footerAction = actions.find((action) => action.variant === "ghost")
    const hasMapCoordinates =
        typeof meetup.proposedLocationLat === "number" &&
        typeof meetup.proposedLocationLng === "number"
    const mapThumbnailCenter =
        typeof meetup.proposedLocationLat === "number" && typeof meetup.proposedLocationLng === "number"
            ? buildStaticMapThumbnailUrl(meetup.proposedLocationLat, meetup.proposedLocationLng)
            : ""
    const mapThumbnailPosition = mapThumbnailCenter
        ? (mapThumbnailCenter.split(",").map(Number) as [number, number])
        : null

    return (
        <>
            <section className="relative w-[360px] rounded-[20px] border border-[#E4EAED] bg-white px-4 pb-3 pt-3 shadow-[0_3px_12px_rgba(37,50,56,0.08)]">
            <button
                type="button"
                className="wm-mini-map relative mb-3 h-[88px] w-full overflow-hidden rounded-[14px] border border-[#B8DCE4] bg-[#EAF8FC] text-left"
                onClick={onOpenMapPreview}
            >
                {hasMapCoordinates && mapThumbnailPosition ? (
                    <div className="h-full w-full [pointer-events:none]">
                        <MapContainer
                            center={mapThumbnailPosition}
                            zoom={15}
                            className="h-full w-full"
                            attributionControl={false}
                            zoomControl={false}
                            dragging={false}
                            touchZoom={false}
                            doubleClickZoom={false}
                            scrollWheelZoom={false}
                            keyboard={false}
                        >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Marker position={mapThumbnailPosition} icon={miniMapMarkerIcon} />
                        </MapContainer>
                    </div>
                ) : null}
            </button>

            <div className="flex items-center gap-2.5">
                <p className="font-wallie-chunky text-[17px] leading-[1.1] text-[#253238]">
                    {title}
                </p>
                <span
                    className={`inline-flex rounded-full border px-2.5 py-1 font-wallie-fit text-[11px] leading-[1] ${
                        isPendingActionStatus
                            ? "border-[#D7DEE2] bg-[#EEF2F4] text-[#75838A]"
                            : currentStatusPill.className
                    }`}
                >
                    {currentStatusPill.label}
                </span>
            </div>

            <dl className="mt-3 space-y-2.5">
                <div className="flex items-center gap-2.5">
                    <dt className="inline-flex items-center justify-center text-[#253238]">
                        <WallapopIcon name="calendar" size={14} />
                    </dt>
                    <dd className="font-wallie-fit text-[13px] text-[#253238]">
                        {formatScheduledAt(meetup.scheduledAt)}
                    </dd>
                </div>
                <div className="flex items-center gap-2.5">
                    <dt className="inline-flex items-center justify-center text-[#253238]">
                        <MapPin size={14} />
                    </dt>
                    <dd className="font-wallie-fit text-[13px] text-[#253238]">
                        {meetup.proposedLocation || "Calle sin definir"}
                    </dd>
                </div>
                <div className="flex items-center gap-2.5">
                    <dt className="inline-flex items-center justify-center text-[#253238]">
                        <PaymentMethodIcon method={meetup.proposedPaymentMethod} />
                    </dt>
                    <dd className="font-wallie-fit text-[13px] text-[#253238]">
                        {paymentMethodValue} {" \u00B7 "}
                        <span className="font-wallie-chunky text-[#1E2A2F]">
                            {formattedPrice}
                        </span>
                    </dd>
                </div>
            </dl>

            {meetup.status === "CONFIRMED" && isCalendarFallbackWindow ? (
                <p className="mt-3 rounded-[12px] border border-[#B4D9E2] bg-[#E8F7FB] px-3 py-2 font-wallie-fit text-[12px] text-[#1E7D92]">
                    {arrivalAction.message}
                </p>
            ) : null}

            {primaryActions.length > 0 ? (
                <div className="mt-4 space-y-2">
                    {primaryActions.map((action) => (
                        <Button
                            key={action.id}
                            variant={action.variant}
                            size="sm"
                            onClick={action.run}
                            disabled={action.disabled}
                            className={`${action.fullWidth ? "w-full" : ""} ${action.className ?? ""}`.trim()}
                        >
                            {action.label}
                        </Button>
                    ))}
                </div>
            ) : null}

            {footerAction ? (
                <div className="mt-1 flex min-h-8 items-center justify-center">
                    <Button
                        variant={footerAction.variant}
                        size="sm"
                        onClick={footerAction.run}
                        disabled={footerAction.disabled}
                        className={`${footerAction.className} text-center`}
                    >
                        {footerAction.label}
                    </Button>
                </div>
            ) : null}
            {sentAt ? (
                <p className="absolute bottom-3 right-4 text-right font-wallie-fit text-[12px] text-[#7A878E]">
                    {formatMessageTime(sentAt)}
                </p>
            ) : null}
            </section>
            {isRedZoneModalOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#253238]/50 px-4">
                    <div className="w-full max-w-[420px] rounded-[16px] bg-white p-4 shadow-[0_8px_30px_rgba(37,50,56,0.22)]">
                        <h3 className="font-wallie-chunky text-[18px] text-[#253238]">
                            Faltan menos de 30 min para la quedada
                        </h3>
                        <p className="mt-2 rounded-[12px] border border-[#F4C578] bg-[#FFF7E9] px-3 py-2 font-wallie-fit text-[13px] text-[#8A5B00]">
                            Cancelar ahora afectara a tu fiabilidad.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Button variant="critical" size="sm" onClick={confirmRedZoneCancellation}>
                                Cancelar igualmente
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsRedZoneModalOpen(false)}
                            >
                                Cerrar
                            </Button>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    )
}

export { MeetupCard }



