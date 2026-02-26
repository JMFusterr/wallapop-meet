import * as React from "react"
import { Button } from "@/components/ui/button"
import { NoticeBanner } from "@/components/ui/notice-banner"
import { WallapopIcon } from "@/components/ui/wallapop-icon"
import { resolveArrivalActionState } from "@/components/meetup/meetup-ui-rules"
import L from "leaflet"
import { Banknote, MapPin } from "lucide-react"
import { MapContainer, Marker, TileLayer } from "react-leaflet"
import styles from "../../../styles.json"
import { getArrivalWindow } from "@/meetup/arrival-window"
import { transitionMeetup } from "@/meetup/state-machine"
import type { ActorRole, MeetupMachine, MeetupPaymentMethod } from "@/meetup/types"

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
    style: React.CSSProperties
}

type TokenLeaf = { value?: string | number }

function resolveColorToken(path: string): string {
    const keys = path.split(".")
    let cursor: unknown = styles
    for (const key of keys) {
        if (!cursor || typeof cursor !== "object" || !(key in (cursor as Record<string, unknown>))) {
            return "var(--text-primary)"
        }
        cursor = (cursor as Record<string, unknown>)[key]
    }
    if (cursor && typeof cursor === "object" && "value" in (cursor as TokenLeaf)) {
        const raw = (cursor as TokenLeaf).value
        if (typeof raw === "string" && raw.startsWith("{") && raw.endsWith("}")) {
            return resolveColorToken(raw.slice(1, -1))
        }
        return String(raw ?? "var(--text-primary)")
    }
    if (typeof cursor === "string") {
        return cursor
    }
    return "var(--text-primary)"
}

function meetupStatusColors(name: "pending" | "confirmed" | "arrived" | "completed" | "expired" | "cancelled"): React.CSSProperties {
    return {
        backgroundColor: resolveColorToken(`tokens.color.meetup_status.${name}.background`),
        borderColor: resolveColorToken(`tokens.color.meetup_status.${name}.border`),
        color: resolveColorToken(`tokens.color.meetup_status.${name}.text`),
    }
}

function statusPill(meetup: MeetupMachine): StatusPill {
    const { status } = meetup
    switch (status) {
        case "PROPOSED":
            return {
                label: "pendiente",
                style: meetupStatusColors("pending"),
            }
        case "COUNTER_PROPOSED":
            return {
                label: "pendiente",
                style: meetupStatusColors("pending"),
            }
        case "CONFIRMED":
            return {
                label: "confirmada",
                style: meetupStatusColors("confirmed"),
            }
        case "ARRIVED":
            return {
                label: "llegada",
                style: meetupStatusColors("arrived"),
            }
        case "COMPLETED":
            return {
                label: "completada",
                style: meetupStatusColors("completed"),
            }
        case "EXPIRED":
            return {
                label:
                    meetup.expiredByTrigger === "SELLER_NO_RESPONSE_48H"
                        ? "cierre neutral"
                        : "expirada",
                style: meetupStatusColors("expired"),
            }
        case "CANCELLED":
            return {
                label: "cancelada",
                style: meetupStatusColors("cancelled"),
            }
        default:
            return {
                label: "sin propuesta",
                style: meetupStatusColors("pending"),
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

function createMiniMapMarkerIcon(markerColor: string): L.DivIcon {
    return L.divIcon({
        className: "",
        html: `
        <span style="display:inline-flex;flex-direction:column;align-items:center;">
            <span style="display:flex;min-width:34px;height:26px;align-items:center;justify-content:center;border-radius:999px;background:${markerColor};border:2px solid var(--text-inverse);box-shadow:var(--wm-shadow-marker);padding:0 8px;">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="var(--text-inverse)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m11 17 2 2a1 1 0 1 0 3-3"></path>
                    <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"></path>
                    <path d="m21 3 1 11h-2"></path>
                    <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"></path>
                    <path d="M3 4h8"></path>
                </svg>
            </span>
            <svg viewBox="0 0 14 8" width="14" height="8" style="display:block;margin-top:-2px;" aria-hidden="true">
                <path d="M1 0H13L7 7Z" fill="${markerColor}"></path>
                <path d="M1 0L7 7L13 0" fill="none" stroke="var(--text-inverse)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
        </span>
    `,
        iconSize: [34, 33],
        iconAnchor: [17, 32],
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

function PaymentMethodIcon({ method }: { method: MeetupPaymentMethod | undefined }) {
    void method
    return <Banknote size={16} className="text-[color:var(--text-primary)]" />
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
    const arrivalWindow = getArrivalWindow(meetup.scheduledAt)
    const isCalendarFallbackWindow =
        currentTime.getTime() >= arrivalWindow.opensAt.getTime() &&
        currentTime.getTime() <= arrivalWindow.closesAt.getTime()
    const areBothActorsArrived =
        Boolean(meetup.arrivalCheckins?.SELLER) && Boolean(meetup.arrivalCheckins?.BUYER)
    const canApplyNeutralClosureBySellerInaction =
        actorRole === "SELLER" &&
        !areBothActorsArrived &&
        (meetup.status === "CONFIRMED" || meetup.status === "ARRIVED") &&
        currentTime.getTime() > arrivalWindow.closesAt.getTime()
    const [isCancelModalOpen, setIsCancelModalOpen] = React.useState(false)
    const miniMapMarkerIcon = React.useMemo(
        () => createMiniMapMarkerIcon(resolveColorToken("tokens.color.semantic.action.primary")),
        []
    )

    const applyEvent = (
        event:
            | { type: "PROPOSE"; actorRole: ActorRole; occurredAt: Date }
            | { type: "COUNTER_PROPOSE"; actorRole: ActorRole; occurredAt: Date }
            | { type: "ACCEPT"; actorRole: ActorRole; occurredAt: Date }
            | { type: "MARK_ARRIVED"; actorRole: ActorRole; occurredAt: Date }
            | { type: "COMPLETE"; actorRole: ActorRole; occurredAt: Date }
            | { type: "CANCEL"; actorRole: ActorRole; occurredAt: Date }
            | { type: "EXPIRE"; trigger: "SYSTEM" | "SELLER_NO_RESPONSE_48H"; occurredAt: Date }
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
        "h-10 w-full font-wallie-chunky text-[length:var(--wm-size-16)]"
    const OUTLINE_ACTION_CLASS =
        "h-10 w-full rounded-[var(--wm-size-999)] border-[color:var(--action-primary-hover)] bg-[color:var(--bg-base)] font-wallie-chunky text-[length:var(--wm-size-16)] text-[color:var(--action-primary-hover)] hover:bg-[color:var(--bg-surface)]"
    const TEXT_ACTION_CLASS =
        "h-auto border-transparent bg-transparent px-0 py-1 font-wallie-chunky text-[length:var(--wm-size-16)] text-[color:var(--text-secondary)] underline underline-offset-2 hover:bg-transparent hover:text-[color:var(--text-primary)]"

    const runCancel = () => {
        setIsCancelModalOpen(true)
    }

    const confirmCancellation = () => {
        setIsCancelModalOpen(false)
        applyEvent({
            type: "CANCEL",
            actorRole,
            occurredAt: currentTime,
        })
        if (isRedZoneCancellation) {
            onRedZoneCancelConfirmed?.()
        }
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
                `${PRIMARY_ACTION_CLASS} rounded-[var(--wm-size-999)] bg-[color:var(--action-primary)] text-[color:var(--text-on-action)] shadow-[var(--wm-shadow-inset-cta)]`,
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
                label: "Estoy aqui",
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
                label: "Estoy aqui",
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

    if (canApplyNeutralClosureBySellerInaction) {
        actions.push({
            id: "neutral-close",
            label: "Ignorar notificacion (48h)",
            variant: "secondary",
            run: () =>
                applyEvent({
                    type: "EXPIRE",
                    trigger: "SELLER_NO_RESPONSE_48H",
                    occurredAt: currentTime,
                }),
            className: OUTLINE_ACTION_CLASS,
            fullWidth: true,
        })
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
    const currentStatusPill = statusPill(meetup)
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
            <section className="relative w-full max-w-[var(--wm-size-360)] rounded-[var(--wm-size-20)] border border-[color:var(--border-divider)] bg-[color:var(--bg-base)] px-4 pb-3 pt-3">
            <button
                type="button"
                className="wm-mini-map relative mb-3 h-[var(--wm-size-88)] w-full overflow-hidden rounded-[var(--wm-size-14)] border border-[color:var(--border-strong)] bg-[color:var(--bg-accent-subtle)] text-left"
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
                <p className="font-wallie-chunky text-[length:var(--wm-size-17)] leading-[1.1] text-[color:var(--text-primary)]">
                    {title}
                </p>
                <span
                    className="inline-flex rounded-full border px-2.5 py-1 font-wallie-fit text-[length:var(--wm-size-11)] leading-[1]"
                    style={
                        isPendingActionStatus
                            ? meetupStatusColors("pending")
                            : currentStatusPill.style
                    }
                >
                    {currentStatusPill.label}
                </span>
            </div>

            <dl className="mt-3 space-y-2.5">
                <div className="flex items-center gap-2.5">
                    <dt className="inline-flex items-center justify-center text-[color:var(--text-primary)]">
                        <WallapopIcon name="calendar" size={14} />
                    </dt>
                    <dd className="font-wallie-fit text-[length:var(--wm-size-13)] text-[color:var(--text-primary)]">
                        {formatScheduledAt(meetup.scheduledAt)}
                    </dd>
                </div>
                <div className="flex items-center gap-2.5">
                    <dt className="inline-flex items-center justify-center text-[color:var(--text-primary)]">
                        <MapPin size={14} />
                    </dt>
                    <dd className="font-wallie-fit text-[length:var(--wm-size-13)] text-[color:var(--text-primary)]">
                        {meetup.proposedLocation || "Calle sin definir"}
                    </dd>
                </div>
                <div className="flex items-center gap-2.5">
                    <dt className="inline-flex items-center justify-center text-[color:var(--text-primary)]">
                        <PaymentMethodIcon method={meetup.proposedPaymentMethod} />
                    </dt>
                    <dd className="font-wallie-fit text-[length:var(--wm-size-13)] text-[color:var(--text-primary)]">
                        {paymentMethodValue} {" \u00B7 "}
                        <span className="font-wallie-chunky text-[color:var(--text-primary)]">
                            {formattedPrice}
                        </span>
                    </dd>
                </div>
            </dl>

            {meetup.status === "CONFIRMED" && isCalendarFallbackWindow ? (
                <NoticeBanner tone="success" className="mt-3 rounded-[var(--wm-size-12)] px-3 py-2 text-[length:var(--wm-size-12)]">
                    {arrivalAction.message}
                </NoticeBanner>
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
                <p className="absolute bottom-3 right-4 text-right font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">
                    {formatMessageTime(sentAt)}
                </p>
            ) : null}
            </section>
            {isCancelModalOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--overlay-scrim)] px-4">
                    <div className="w-full max-w-[var(--wm-size-420)] rounded-[var(--wm-size-16)] bg-[color:var(--bg-base)] p-4 shadow-[var(--wm-shadow-300)]">
                        <h3 className="font-wallie-chunky text-[length:var(--wm-size-18)] text-[color:var(--text-primary)]">
                            Seguro que quieres cancelar o rechazar la quedada?
                        </h3>
                        <p className="mt-2 font-wallie-fit text-[length:var(--wm-size-14)] text-[color:var(--text-secondary)]">
                            Esta accion no se puede deshacer.
                        </p>
                        {isRedZoneCancellation ? (
                            <NoticeBanner className="mt-2 py-2">
                                Estas en los ultimos 30 min y esto afectara a tu fiabilidad.
                            </NoticeBanner>
                        ) : null}
                        <div className="mt-4 space-y-2">
                            <Button
                                variant="primary"
                                size="sm"
                                className={PRIMARY_ACTION_CLASS}
                                onClick={confirmCancellation}
                            >
                                Si
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                className={OUTLINE_ACTION_CLASS}
                                onClick={() => setIsCancelModalOpen(false)}
                            >
                                No
                            </Button>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    )
}

export { MeetupCard }





