import * as React from "react"
import L from "leaflet"
import { Banknote, MapPin, QrCode, Search, Smartphone } from "lucide-react"
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet"

import { resolveChatMeetupEntryActionState } from "@/components/meetup/chat-meetup-entry-rules"
import { MeetupCard } from "@/components/meetup/meetup-card"
import { MeetupProposalFooter } from "@/components/meetup/meetup-proposal-footer"
import { MeetupProposalHeader } from "@/components/meetup/meetup-proposal-header"
import {
    buildReverseGeocodeUrl,
    resolveInitialProposalDateTimeValue,
    shouldApplyReverseGeocodeResult,
} from "@/components/meetup/wallapop-chat-workspace-utils"
import { MeetupWizardStepHeading } from "@/components/meetup/meetup-wizard-step-heading"
import { ChatComposer } from "@/components/ui/chat-composer"
import { ChatCounterpartCard } from "@/components/ui/chat-counterpart-card"
import { ChatListItem } from "@/components/ui/chat-list-item"
import { ChatMessageBubble } from "@/components/ui/chat-message-bubble"
import { ChatProductCard, type ChatProductCardViewerRole } from "@/components/ui/chat-product-card"
import { ChatSecurityBanner } from "@/components/ui/chat-security-banner"
import { CalendarPicker, toLocalDateValue } from "@/components/ui/calendar-picker"
import { InboxBottomNav } from "@/components/ui/inbox-bottom-nav"
import { Input } from "@/components/ui/input"
import { getOrCreateLocalChatUserId } from "@/lib/local-chat-user-id"
import { Select } from "@/components/ui/select"
import { WallapopIcon } from "@/components/ui/wallapop-icon"
import { getConvexHttpClient } from "@/lib/convex-client"
import { createMeetupMachine } from "@/meetup"
import { transitionMeetup } from "@/meetup/state-machine"
import type {
    ActorRole,
    MeetupChatContext,
    MeetupMachine,
    MeetupPaymentMethod,
} from "@/meetup/types"
import { api } from "../../../convex/_generated/api"

type Message = {
    id: string
    senderUserId?: string
    text: string
    variant: "sent" | "received"
    time: string
    createdAt: number
    deliveryState?: "sent" | "read"
}

type ConvexChatMessage = {
    conversationId: string
    clientMessageId: string
    senderUserId?: string
    text: string
    variant?: "sent" | "received"
    time: string
    createdAt?: number
    deliveryState?: "sent" | "read"
}

type ConversationTimelineEntry =
    | {
        id: string
        type: "message"
        createdAt: number
        message: Message
    }
    | {
        id: string
        type: "meetup"
        createdAt: number
        meetup: MeetupMachine
    }

type Conversation = {
    id: string
    userName: string
    itemPrice: string
    messageDate: string
    itemTitle: string
    messagePreview: string
    listingImageSrc?: string
    profileImageSrc?: string
    leadingIndicator?: "bookmark" | "deal"
    unreadCount?: number
    lastMessageDeliveryState?: "sent" | "read"
    meetupContext?: MeetupChatContext
    counterpartRating: number
    counterpartRatingCount: number
    counterpartDistanceLabel: string
    counterpartAttendanceRate: number
    counterpartAttendanceMeetups: number
    listingViewerRole: ChatProductCardViewerRole
    listingViews?: number
    listingLikes?: number
    listingStatusLabel?: string
}

type SafeMeetingPoint = {
    id: string
    name: string
    hint: string
    address: string
    distanceMeters: number
    completedSales: number
    lat: number
    lng: number
}

type ProposalStep = 1 | 2 | 3

type MapPoint = {
    lat: number
    lng: number
}

type ProposalSelectableOption = {
    id: string
    kind: "safe" | "custom"
    label: string
    address: string
    lat: number
    lng: number
    distanceMeters: number
    completedSales?: number
    safePointId?: string
}

type ProposalDraftState = {
    step: ProposalStep
    mapPickerOpen: boolean
    mapPickerPointId: string
    mapSearchValue: string
    mapCenter: MapPoint
    options: ProposalSelectableOption[]
    selectedOptionId: string
    customPoint: MapPoint | null
    customLocationLabel: string
    scheduledAt: string
    finalPrice: string
    paymentMethod: MeetupPaymentMethod | ""
    error: string
}

const DAC7_ALERT_THRESHOLD_EUR = 2000
const MAX_FINAL_PRICE_EUR = 99999
const DAY_MS = 24 * 60 * 60 * 1000

function parseFinalPrice(rawValue: string): number | null {
    const normalizedValue = rawValue.trim().replace(",", ".")
    if (!normalizedValue) {
        return null
    }

    const parsedValue = Number.parseFloat(normalizedValue)
    if (!Number.isFinite(parsedValue)) {
        return null
    }

    return parsedValue
}

const seedNow = Date.now()

function tsMinutesAgo(minutes: number): number {
    return seedNow - minutes * 60 * 1000
}

const initialConversations: Conversation[] = [
    {
        id: "conv-a-arrival",
        userName: "Laura M.",
        itemPrice: "240 EUR",
        messageDate: "Hoy",
        itemTitle: "Nintendo Switch OLED + dock",
        messagePreview: "Estoy llegando al punto, en 10 min estoy alli.",
        listingImageSrc:
            "https://images.pexels.com/photos/6993182/pexels-photo-6993182.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=400&h=400",
        profileImageSrc:
            "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=320&h=320",
        meetupContext: {
            conversationId: "conv-a-arrival",
            listingId: "listing-switch-001",
            sellerUserId: "user-seller-001",
            buyerUserId: "user-buyer-laura-001",
        },
        counterpartRating: 4.5,
        counterpartRatingCount: 110,
        counterpartDistanceLabel: "3,4km de ti",
        counterpartAttendanceRate: 96,
        counterpartAttendanceMeetups: 28,
        listingViewerRole: "seller",
        listingViews: 23,
        listingLikes: 4,
    },
    {
        id: "conv-b-seller-propose",
        userName: "Javi R.",
        itemPrice: "520 EUR",
        messageDate: "Hoy",
        itemTitle: "Bicicleta fixie Fuji",
        messagePreview: "Si te encaja, te envio propuesta de quedada ahora.",
        listingImageSrc:
            "https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=400&h=400",
        profileImageSrc:
            "https://images.pexels.com/photos/1758144/pexels-photo-1758144.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=320&h=320",
        meetupContext: {
            conversationId: "conv-b-seller-propose",
            listingId: "listing-bike-002",
            sellerUserId: "user-seller-javi-002",
            buyerUserId: "user-buyer-javi-001",
        },
        counterpartRating: 5,
        counterpartRatingCount: 84,
        counterpartDistanceLabel: "8,2km de ti",
        counterpartAttendanceRate: 92,
        counterpartAttendanceMeetups: 41,
        listingViewerRole: "seller",
        leadingIndicator: "bookmark",
        listingStatusLabel: "Reservado",
    },
    {
        id: "conv-c-buyer-incoming",
        userName: "Marta P.",
        itemPrice: "640 EUR",
        messageDate: "Hoy",
        itemTitle: "Camara Fujifilm X-T20",
        messagePreview: "Te acabo de enviar la propuesta con sitio y hora.",
        listingImageSrc:
            "https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=400&h=400",
        profileImageSrc:
            "https://images.pexels.com/photos/370799/pexels-photo-370799.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=320&h=320",
        unreadCount: 1,
        meetupContext: {
            conversationId: "conv-c-buyer-incoming",
            listingId: "listing-camera-003",
            sellerUserId: "user-seller-marta-003",
            buyerUserId: "user-buyer-me-001",
        },
        counterpartRating: 4,
        counterpartRatingCount: 57,
        counterpartDistanceLabel: "1,9km de ti",
        counterpartAttendanceRate: 88,
        counterpartAttendanceMeetups: 17,
        listingViewerRole: "buyer",
        listingViews: 56,
        listingLikes: 8,
    },
    {
        id: "conv-d-sold-closed",
        userName: "Carlos G.",
        itemPrice: "310 EUR",
        messageDate: "Ayer",
        itemTitle: "Silla gamer Secretlab",
        messagePreview: "Perfecto, gracias por todo. Venta cerrada.",
        leadingIndicator: "deal",
        listingImageSrc:
            "https://images.pexels.com/photos/13871156/pexels-photo-13871156.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=400&h=400",
        profileImageSrc:
            "https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=320&h=320",
        meetupContext: {
            conversationId: "conv-d-sold-closed",
            listingId: "listing-chair-004",
            sellerUserId: "user-seller-me-001",
            buyerUserId: "user-buyer-carlos-004",
        },
        counterpartRating: 4.5,
        counterpartRatingCount: 132,
        counterpartDistanceLabel: "2,7km de ti",
        counterpartAttendanceRate: 99,
        counterpartAttendanceMeetups: 52,
        listingViewerRole: "seller",
        listingViews: 41,
        listingLikes: 3,
        listingStatusLabel: "Vendido",
    },
    {
        id: "conv-e-low-attendance",
        userName: "Iker S.",
        itemPrice: "210 EUR",
        messageDate: "12 feb",
        itemTitle: "Monitor LG 27 pulgadas 144Hz",
        messagePreview: "Prefiero venderselo a otra persona por tranquilidad.",
        listingImageSrc:
            "https://images.pexels.com/photos/1038916/pexels-photo-1038916.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=400&h=400",
        profileImageSrc:
            "https://images.pexels.com/photos/301599/pexels-photo-301599.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=320&h=320",
        unreadCount: 0,
        meetupContext: {
            conversationId: "conv-e-low-attendance",
            listingId: "listing-monitor-005",
            sellerUserId: "user-seller-me-001",
            buyerUserId: "user-buyer-iker-005",
        },
        counterpartRating: 4,
        counterpartRatingCount: 21,
        counterpartDistanceLabel: "6,5km de ti",
        counterpartAttendanceRate: 41,
        counterpartAttendanceMeetups: 11,
        listingViewerRole: "seller",
        listingViews: 19,
        listingLikes: 2,
    },
]

const initialMessagesByConversation: Record<string, Message[]> = {
    "conv-a-arrival": [
        {
            id: "m-a-1",
            text: "Hola, te la compro hoy si te viene bien.",
            variant: "received",
            time: formatTime(new Date(tsMinutesAgo(60))),
            createdAt: tsMinutesAgo(60),
        },
        {
            id: "m-a-2",
            text: "Genial, quedamos hoy. Llevo la Switch con caja y funda.",
            variant: "sent",
            time: formatTime(new Date(tsMinutesAgo(12))),
            createdAt: tsMinutesAgo(12),
            deliveryState: "read",
        },
    ],
    "conv-b-seller-propose": [
        {
            id: "m-b-1",
            text: "Sigue disponible la bici? Podria verla esta tarde.",
            variant: "received",
            time: formatTime(new Date(tsMinutesAgo(90))),
            createdAt: tsMinutesAgo(90),
        },
        {
            id: "m-b-2",
            text: "Si, la bici esta revisada, frenos y ruedas al dia.",
            variant: "sent",
            time: formatTime(new Date(tsMinutesAgo(72))),
            createdAt: tsMinutesAgo(72),
            deliveryState: "read",
        },
        {
            id: "m-b-3",
            text: "Perfecto, me cuadra. Cuando puedas mándame propuesta de quedada.",
            variant: "received",
            time: formatTime(new Date(tsMinutesAgo(14))),
            createdAt: tsMinutesAgo(14),
        },
    ],
    "conv-c-buyer-incoming": [
        {
            id: "m-c-1",
            text: "Hola, me interesa la camara. Te viene bien quedar hoy?",
            variant: "sent",
            time: formatTime(new Date(tsMinutesAgo(26))),
            createdAt: tsMinutesAgo(26),
            deliveryState: "read",
        },
        {
            id: "m-c-2",
            text: "Te acabo de enviar la solicitud de quedada con todos los datos.",
            variant: "received",
            time: formatTime(new Date(tsMinutesAgo(4))),
            createdAt: tsMinutesAgo(4),
        },
    ],
    "conv-d-sold-closed": [
        {
            id: "m-d-1",
            text: "Todo correcto, gracias por la silla.",
            variant: "received",
            time: formatTime(new Date(tsMinutesAgo(9 * 60))),
            createdAt: tsMinutesAgo(9 * 60),
        },
        {
            id: "m-d-2",
            text: "Silla entregada, todo perfecto. Gracias!",
            variant: "received",
            time: formatTime(new Date(tsMinutesAgo(8 * 60 + 40))),
            createdAt: tsMinutesAgo(8 * 60 + 40),
        },
    ],
    "conv-e-low-attendance": [
        {
            id: "m-e-0",
            text: "Me interesa el monitor, podemos cerrar hoy?",
            variant: "received",
            time: formatTime(new Date(tsMinutesAgo(2 * 24 * 60 + 20))),
            createdAt: tsMinutesAgo(2 * 24 * 60 + 20),
        },
        {
            id: "m-e-1",
            text: "Veo que tu tasa de asistencia es baja y prefiero venderselo a otra persona, lo siento.",
            variant: "sent",
            time: formatTime(new Date(tsMinutesAgo(2 * 24 * 60))),
            createdAt: tsMinutesAgo(2 * 24 * 60),
            deliveryState: "sent",
        },
    ],
}
const safeMeetingPoints: SafeMeetingPoint[] = [
    {
        id: "station",
        name: "Estacion de Sants",
        hint: "Zona principal con transito y camaras.",
        address: "Placa dels Paisos Catalans, Barcelona",
        distanceMeters: 320,
        completedSales: 241,
        lat: 41.37906,
        lng: 2.14006,
    },
    {
        id: "mall",
        name: "Centro comercial Arenas",
        hint: "Entrada principal, punto de informacion.",
        address: "Gran Via de les Corts Catalanes, 373, Barcelona",
        distanceMeters: 640,
        completedSales: 198,
        lat: 41.37617,
        lng: 2.14918,
    },
    {
        id: "police",
        name: "Comisaria Mossos - Les Corts",
        hint: "Punto seguro recomendado por proximidad.",
        address: "Travessera de les Corts, 319, Barcelona",
        distanceMeters: 1180,
        completedSales: 173,
        lat: 41.38762,
        lng: 2.13441,
    },
    {
        id: "library",
        name: "Biblioteca Joan Miro",
        hint: "Acceso principal bien iluminado.",
        address: "Carrer de Vilamari, 61, Barcelona",
        distanceMeters: 1450,
        completedSales: 109,
        lat: 41.37682,
        lng: 2.15281,
    },
    {
        id: "market",
        name: "Mercat de Sants",
        hint: "Entrada lateral con presencia continua.",
        address: "Carrer de Sant Jordi, 6, Barcelona",
        distanceMeters: 1720,
        completedSales: 147,
        lat: 41.37559,
        lng: 2.13363,
    },
    {
        id: "civic-center",
        name: "Centre Civic Cotxeres de Sants",
        hint: "Vestibulo vigilado en horario comercial.",
        address: "Carrer de Sants, 79, Barcelona",
        distanceMeters: 2040,
        completedSales: 126,
        lat: 41.37507,
        lng: 2.13699,
    },
]

const mapUserPosition: MapPoint = {
    lat: 41.3782,
    lng: 2.1459,
}

function toSafeOption(point: SafeMeetingPoint): ProposalSelectableOption {
    return {
        id: `safe:${point.id}`,
        kind: "safe",
        label: point.name,
        address: point.address,
        lat: point.lat,
        lng: point.lng,
        distanceMeters: point.distanceMeters,
        completedSales: point.completedSales,
        safePointId: point.id,
    }
}

function toCustomOption(lat: number, lng: number, address: string): ProposalSelectableOption {
    return {
        id: `custom:${lat.toFixed(5)}:${lng.toFixed(5)}:${Date.now()}`,
        kind: "custom",
        label: address,
        address,
        lat,
        lng,
        distanceMeters: distanceBetweenPointsMeters(mapUserPosition, { lat, lng }),
    }
}

function buildProposalDraftState(meetup: MeetupMachine | undefined): ProposalDraftState {
    const firstSafeOption = toSafeOption(safeMeetingPoints[0])
    const secondSafeOption = toSafeOption(safeMeetingPoints[1])

    if (!meetup) {
        return {
            step: 1,
            mapPickerOpen: false,
            mapPickerPointId: "",
            mapSearchValue: "",
            mapCenter: { lat: safeMeetingPoints[0].lat, lng: safeMeetingPoints[0].lng },
            options: [firstSafeOption, secondSafeOption],
            selectedOptionId: firstSafeOption.id,
            customPoint: null,
            customLocationLabel: "",
            scheduledAt: "",
            finalPrice: "",
            paymentMethod: "",
            error: "",
        }
    }

    const matchingPoint = safeMeetingPoints.find((point) => point.name === meetup.proposedLocation)
    const hasCustomLocation = Boolean(meetup.proposedLocation && !matchingPoint)

    if (matchingPoint) {
        const selectedOption = toSafeOption(matchingPoint)
        const fallbackPoint =
            safeMeetingPoints.find((point) => point.id !== matchingPoint.id) ?? safeMeetingPoints[0]
        const fallbackOption = toSafeOption(fallbackPoint)

        return {
            step: 1,
            mapPickerOpen: false,
            mapPickerPointId: matchingPoint.id,
            mapSearchValue: "",
            mapCenter: { lat: matchingPoint.lat, lng: matchingPoint.lng },
            options: [selectedOption, fallbackOption],
            selectedOptionId: selectedOption.id,
            customPoint: null,
            customLocationLabel: "",
            scheduledAt: resolveInitialProposalDateTimeValue(meetup),
            finalPrice: meetup.finalPrice !== undefined ? String(meetup.finalPrice) : "",
            paymentMethod: meetup.proposedPaymentMethod ?? "",
            error: "",
        }
    }

    if (hasCustomLocation) {
        const customLat = meetup.proposedLocationLat ?? mapUserPosition.lat
        const customLng = meetup.proposedLocationLng ?? mapUserPosition.lng
        const customAddress =
            meetup.proposedLocation ??
            customLocationLabelFromPoint(customLat, customLng)
        const customOption = toCustomOption(customLat, customLng, customAddress)

        return {
            step: 1,
            mapPickerOpen: false,
            mapPickerPointId: "custom",
            mapSearchValue: "",
            mapCenter: { lat: customLat, lng: customLng },
            options: [customOption, firstSafeOption],
            selectedOptionId: customOption.id,
            customPoint: { lat: customLat, lng: customLng },
            customLocationLabel: customAddress,
            scheduledAt: resolveInitialProposalDateTimeValue(meetup),
            finalPrice: meetup.finalPrice !== undefined ? String(meetup.finalPrice) : "",
            paymentMethod: meetup.proposedPaymentMethod ?? "",
            error: "",
        }
    }

    return {
        step: 1,
        mapPickerOpen: false,
        mapPickerPointId: "",
        mapSearchValue: "",
        mapCenter: { lat: safeMeetingPoints[0].lat, lng: safeMeetingPoints[0].lng },
        options: [firstSafeOption, secondSafeOption],
        selectedOptionId: firstSafeOption.id,
        customPoint: null,
        customLocationLabel: "",
        scheduledAt: resolveInitialProposalDateTimeValue(meetup),
        finalPrice: meetup.finalPrice !== undefined ? String(meetup.finalPrice) : "",
        paymentMethod: meetup.proposedPaymentMethod ?? "",
        error: "",
    }
}

function formatTime(date: Date): string {
    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    })
}

function formatConversationDate(createdAt: number): string {
    const date = new Date(createdAt)
    const now = new Date()
    const delta = now.getTime() - createdAt
    if (delta < DAY_MS && now.getDate() === date.getDate()) {
        return formatTime(date)
    }
    if (delta < 2 * DAY_MS) {
        return "Ayer"
    }
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })
}

function isReservedStatusLabel(statusLabel?: string): boolean {
    return statusLabel?.trim().toLowerCase().includes("reservad") ?? false
}

function isSoldStatusLabel(statusLabel?: string): boolean {
    return statusLabel?.trim().toLowerCase().includes("vendid") ?? false
}

function isSameCalendarDay(leftTimestamp: number, rightTimestamp: number): boolean {
    const left = new Date(leftTimestamp)
    const right = new Date(rightTimestamp)
    return (
        left.getFullYear() === right.getFullYear() &&
        left.getMonth() === right.getMonth() &&
        left.getDate() === right.getDate()
    )
}

function formatTimelineDayLabel(createdAt: number): string {
    const date = new Date(createdAt)
    const now = new Date()
    const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
    const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const dayDelta = Math.floor((startOfNow - startOfDate) / DAY_MS)

    if (dayDelta === 0) {
        return "Hoy"
    }
    if (dayDelta === 1) {
        return "Ayer"
    }

    return date.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "short",
    })
}

function resolveMeetupTimelineTimestamp(meetup: MeetupMachine): number | null {
    if (meetup.status === null) {
        return null
    }
    const timestamp =
        meetup.proposedAt ??
        meetup.confirmedAt ??
        meetup.arrivedAt ??
        meetup.completedAt ??
        meetup.cancelledAt ??
        meetup.expiredAt ??
        meetup.scheduledAt
    return timestamp.getTime()
}

function resolveMeetupTimelinePreview(meetup: MeetupMachine): string {
    switch (meetup.status) {
        case "PROPOSED":
            return "Propuesta de quedada enviada."
        case "COUNTER_PROPOSED":
            return "Se enviaron cambios en la propuesta de quedada."
        case "CONFIRMED":
            return "Quedada confirmada."
        case "ARRIVED":
            return "Una de las partes ya ha marcado llegada."
        case "COMPLETED":
            return "Quedada cerrada. Venta completada."
        case "EXPIRED":
            return "La solicitud de quedada ha expirado."
        case "CANCELLED":
            return "La quedada fue cancelada."
        default:
            return "Sin propuesta de quedada."
    }
}

function buildConversationTimelineEntries(
    messages: Message[],
    meetup: MeetupMachine | undefined
): ConversationTimelineEntry[] {
    const entries: ConversationTimelineEntry[] = messages.map((message) => ({
        id: `message:${message.id}`,
        type: "message",
        createdAt: message.createdAt,
        message,
    }))

    if (meetup) {
        const meetupTimestamp = resolveMeetupTimelineTimestamp(meetup)
        if (meetupTimestamp !== null) {
            entries.push({
                id: `meetup:${meetup.chatContext.conversationId}`,
                type: "meetup",
                createdAt: meetupTimestamp,
                meetup,
            })
        }
    }

    return entries.sort((a, b) => a.createdAt - b.createdAt)
}

function resolveConversationSummary(
    messages: Message[],
    meetup: MeetupMachine | undefined
): Pick<Conversation, "messageDate" | "messagePreview" | "lastMessageDeliveryState"> {
    const timeline = buildConversationTimelineEntries(messages, meetup)
    const latestEntry = timeline[timeline.length - 1]

    if (!latestEntry) {
        return {
            messageDate: "",
            messagePreview: "",
            lastMessageDeliveryState: undefined,
        }
    }

    if (latestEntry.type === "meetup") {
        return {
            messageDate: formatConversationDate(latestEntry.createdAt),
            messagePreview: resolveMeetupTimelinePreview(latestEntry.meetup),
            lastMessageDeliveryState: undefined,
        }
    }

    return {
        messageDate: formatConversationDate(latestEntry.createdAt),
        messagePreview: latestEntry.message.text,
        lastMessageDeliveryState:
            latestEntry.message.variant === "sent"
                ? (latestEntry.message.deliveryState ?? "sent")
                : undefined,
    }
}

function resolveConversationUnreadCount(
    unreadCount: number | undefined,
    messages: Message[],
    meetup: MeetupMachine | undefined
): number {
    const timeline = buildConversationTimelineEntries(messages, meetup)
    const latestEntry = timeline[timeline.length - 1]
    if (!latestEntry || latestEntry.type !== "message" || latestEntry.message.variant !== "received") {
        return 0
    }
    return unreadCount ?? 0
}

function resolveConversationCommercialStatus(
    conversation: Conversation,
    meetup: MeetupMachine | undefined
): Pick<Conversation, "leadingIndicator" | "listingStatusLabel"> {
    const isSold =
        conversation.leadingIndicator === "deal" ||
        isSoldStatusLabel(conversation.listingStatusLabel)
    if (isSold) {
        return {
            leadingIndicator: "deal",
            listingStatusLabel: "Vendido",
        }
    }

    const hasReservedState =
        conversation.leadingIndicator === "bookmark" ||
        isReservedStatusLabel(conversation.listingStatusLabel)
    const shouldForceReserved = meetup?.status === "CONFIRMED" || meetup?.status === "ARRIVED"
    const shouldClearReserved = meetup?.status === "CANCELLED" || meetup?.status === "EXPIRED"

    if (shouldForceReserved) {
        return {
            leadingIndicator: "bookmark",
            listingStatusLabel: "Reservado",
        }
    }

    if (shouldClearReserved && hasReservedState) {
        return {
            leadingIndicator: undefined,
            listingStatusLabel: undefined,
        }
    }

    return {
        leadingIndicator: conversation.leadingIndicator,
        listingStatusLabel: conversation.listingStatusLabel,
    }
}

function buildInitialMeetupState(): Record<string, MeetupMachine> {
    const state: Record<string, MeetupMachine> = {}
    const now = new Date()

    for (const conversation of initialConversations) {
        if (!conversation.meetupContext) {
            continue
        }

        const baseMeetup = createMeetupMachine({
            scheduledAt: new Date(now.getTime() + 30 * 60 * 1000),
            chatContext: conversation.meetupContext,
        })

        if (conversation.id === "conv-a-arrival") {
            const proposedDraft: MeetupMachine = {
                ...baseMeetup,
                scheduledAt: new Date(now.getTime() + 20 * 60 * 1000),
                proposedLocation: "Estacion de Sants - Acceso principal",
                proposedLocationLat: 41.37906,
                proposedLocationLng: 2.14006,
                finalPrice: 240,
                proposedPaymentMethod: "BIZUM",
            }
            const proposed = transitionMeetup(proposedDraft, {
                type: "PROPOSE",
                actorRole: "SELLER",
                occurredAt: new Date(now.getTime() - 50 * 60 * 1000),
            })
            if (!proposed.ok) {
                state[conversation.id] = proposedDraft
                continue
            }
            const confirmed = transitionMeetup(proposed.meetup, {
                type: "ACCEPT",
                actorRole: "BUYER",
                occurredAt: new Date(now.getTime() - 45 * 60 * 1000),
            })
            state[conversation.id] = confirmed.ok ? confirmed.meetup : proposed.meetup
            continue
        }

        if (conversation.id === "conv-c-buyer-incoming") {
            const incomingProposal: MeetupMachine = {
                ...baseMeetup,
                scheduledAt: new Date(now.getTime() + 90 * 60 * 1000),
                proposedLocation: "Estacion de Sants - Acceso principal",
                proposedLocationLat: 41.37906,
                proposedLocationLng: 2.14006,
                finalPrice: 640,
                proposedPaymentMethod: "BIZUM",
            }
            const proposedResult = transitionMeetup(incomingProposal, {
                type: "PROPOSE",
                actorRole: "SELLER",
                occurredAt: new Date(now.getTime() - 4 * 60 * 1000),
            })
            state[conversation.id] = proposedResult.ok ? proposedResult.meetup : incomingProposal
            continue
        }

        if (conversation.id === "conv-d-sold-closed") {
            const closedDraft: MeetupMachine = {
                ...baseMeetup,
                scheduledAt: new Date(now.getTime() - 9 * 60 * 60 * 1000),
                proposedLocation: "Centro comercial Arenas",
                proposedLocationLat: 41.37617,
                proposedLocationLng: 2.14918,
                finalPrice: 310,
                proposedPaymentMethod: "CASH",
            }
            const proposed = transitionMeetup(closedDraft, {
                type: "PROPOSE",
                actorRole: "SELLER",
                occurredAt: new Date(now.getTime() - 11 * 60 * 60 * 1000),
            })
            if (!proposed.ok) {
                state[conversation.id] = closedDraft
                continue
            }
            const confirmed = transitionMeetup(proposed.meetup, {
                type: "ACCEPT",
                actorRole: "BUYER",
                occurredAt: new Date(now.getTime() - 10 * 60 * 60 * 1000),
            })
            if (!confirmed.ok) {
                state[conversation.id] = proposed.meetup
                continue
            }
            const arrived = transitionMeetup(confirmed.meetup, {
                type: "MARK_ARRIVED",
                actorRole: "SELLER",
                occurredAt: new Date(now.getTime() - 9 * 60 * 60 * 1000 - 10 * 60 * 1000),
                distanceMeters: 25,
                withinSafeRadius: true,
            })
            if (!arrived.ok) {
                state[conversation.id] = confirmed.meetup
                continue
            }
            const completed = transitionMeetup(arrived.meetup, {
                type: "COMPLETE",
                actorRole: "SELLER",
                occurredAt: new Date(now.getTime() - 9 * 60 * 60 * 1000 + 5 * 60 * 1000),
            })
            state[conversation.id] = completed.ok ? completed.meetup : arrived.meetup
            continue
        }

        state[conversation.id] = baseMeetup
    }

    return state
}

function toLocalTimeValue(date: Date): string {
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")

    return `${hours}:${minutes}`
}

function parseLocalDateTimeValue(value: string): Date | null {
    if (value.trim().length === 0) {
        return null
    }

    const parsedDate = new Date(value)
    if (Number.isNaN(parsedDate.getTime())) {
        return null
    }

    return parsedDate
}

function formatDistance(distanceMeters: number): string {
    if (distanceMeters < 1000) {
        return `${distanceMeters} m`
    }

    return `${(distanceMeters / 1000).toFixed(1).replace(".", ",")} km`
}

function toRadians(value: number): number {
    return (value * Math.PI) / 180
}

function distanceBetweenPointsMeters(from: MapPoint, to: MapPoint): number {
    const earthRadius = 6371000
    const deltaLat = toRadians(to.lat - from.lat)
    const deltaLng = toRadians(to.lng - from.lng)
    const fromLat = toRadians(from.lat)
    const toLat = toRadians(to.lat)

    const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(fromLat) * Math.cos(toLat) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return Math.round(earthRadius * c)
}

function customLocationLabelFromPoint(lat: number, lng: number): string {
    return `Punto personalizado (${lat.toFixed(4)}, ${lng.toFixed(4)})`
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

function ProposalSelectionIndicator({ selected }: { selected: boolean }) {
    return (
        <span
            className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white ${selected ? "border-[8px] border-[#253238]" : "border-2 border-[#6E8792]"
                }`}
            aria-hidden
        />
    )
}

const safePointMarkerIcon = L.divIcon({
    className: "",
    html: `
        <span style="display:inline-flex;flex-direction:column;align-items:center;">
            <span style="display:flex;min-width:40px;height:30px;align-items:center;justify-content:center;border-radius:999px;background:#13C1AC;border:2px solid #FFFFFF;box-shadow:0 4px 10px rgba(37,50,56,0.22);padding:0 10px;">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"></path>
                </svg>
            </span>
            <svg viewBox="0 0 14 8" width="14" height="8" style="display:block;margin-top:-2px;" aria-hidden="true">
                <path d="M1 0H13L7 7Z" fill="#13C1AC"></path>
                <path d="M1 0L7 7L13 0" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
        </span>
    `,
    iconSize: [40, 37],
    iconAnchor: [20, 36],
})

const selectedSafePointMarkerIcon = L.divIcon({
    className: "",
    html: `
        <span style="display:inline-flex;flex-direction:column;align-items:center;">
            <span style="display:flex;min-width:40px;height:30px;align-items:center;justify-content:center;border-radius:999px;background:#038673;border:2px solid #FFFFFF;box-shadow:0 4px 10px rgba(37,50,56,0.28);padding:0 10px;">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"></path>
                </svg>
            </span>
            <svg viewBox="0 0 14 8" width="14" height="8" style="display:block;margin-top:-2px;" aria-hidden="true">
                <path d="M1 0H13L7 7Z" fill="#038673"></path>
                <path d="M1 0L7 7L13 0" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
        </span>
    `,
    iconSize: [40, 37],
    iconAnchor: [20, 36],
})

const userPositionIcon = L.divIcon({
    className: "",
    html: `
        <span style="display:block;height:16px;width:16px;border-radius:999px;background:#13C1AC;border:2px solid #FFFFFF;box-shadow:0 0 0 4px rgba(19,193,172,0.24);"></span>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
})

const customPointIcon = L.divIcon({
    className: "",
    html: `
        <span style="display:inline-flex;flex-direction:column;align-items:center;">
            <span style="display:flex;min-width:40px;height:30px;align-items:center;justify-content:center;border-radius:999px;background:#0D907A;border:2px solid #FFFFFF;box-shadow:0 4px 10px rgba(37,50,56,0.28);padding:0 10px;">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m11 17 2 2a1 1 0 1 0 3-3"></path>
                    <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"></path>
                    <path d="m21 3 1 11h-2"></path>
                    <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"></path>
                    <path d="M3 4h8"></path>
                </svg>
            </span>
            <svg viewBox="0 0 14 8" width="14" height="8" style="display:block;margin-top:-2px;" aria-hidden="true">
                <path d="M1 0H13L7 7Z" fill="#0D907A"></path>
                <path d="M1 0L7 7L13 0" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
        </span>
    `,
    iconSize: [40, 37],
    iconAnchor: [20, 36],
})

function ProposalMapCenterController({ center }: { center: MapPoint }) {
    const map = useMap()

    React.useEffect(() => {
        map.flyTo([center.lat, center.lng], map.getZoom(), { duration: 0.45 })
    }, [center, map])

    return null
}

function ProposalMapClickHandler({
    onMapClick,
}: {
    onMapClick: (lat: number, lng: number) => void
}) {
    useMapEvents({
        click: (event) => {
            onMapClick(event.latlng.lat, event.latlng.lng)
        },
    })

    return null
}

function MeetupMapPreviewModal({
    center,
    onClose,
}: {
    center: MapPoint
    onClose: () => void
}) {
    return (
        <div className="fixed inset-0 z-[60] bg-[#253238]/55 p-0 md:p-6">
            <section className="flex h-full w-full flex-col bg-white md:mx-auto md:h-[88vh] md:max-w-[760px] md:rounded-[18px]">
                <header className="flex items-center justify-between border-b border-[#E8ECEF] px-4 py-3">
                    <p className="font-wallie-chunky text-[18px] text-[#253238]">Mapa de la quedada</p>
                    <button
                        type="button"
                        aria-label="Cerrar mapa"
                        onClick={onClose}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F6F8] text-[#253238]"
                    >
                        <WallapopIcon name="cross" size="small" />
                    </button>
                </header>
                <div className="min-h-0 flex-1">
                    <MapContainer
                        center={[center.lat, center.lng]}
                        zoom={15}
                        className="h-full w-full"
                        attributionControl={false}
                        zoomControl={false}
                        scrollWheelZoom={false}
                        dragging={true}
                        doubleClickZoom={false}
                        touchZoom={true}
                        keyboard={false}
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={[center.lat, center.lng]} icon={customPointIcon} />
                    </MapContainer>
                </div>
            </section>
        </div>
    )
}

function SafeShieldGlyph({ className = "" }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        </svg>
    )
}

type MeetupProposalOverlayProps = {
    conversation: Conversation
    step: ProposalStep
    errorMessage: string
    canAccessStepTwo: boolean
    canAccessStepThree: boolean
    mapPickerOpen: boolean
    mapCenter: MapPoint
    mapPickerPointId: string
    allSafePoints: SafeMeetingPoint[]
    selectableOptions: ProposalSelectableOption[]
    selectedOptionId: string
    customPoint: MapPoint | null
    customLocationLabel: string
    customDistanceMeters: number | null
    mapSearchValue: string
    dateTimeValue: string
    finalPriceValue: string
    paymentMethod: MeetupPaymentMethod | ""
    onDateTimeChange: (nextValue: string) => void
    onSelectPoint: (optionId: string) => void
    onFinalPriceChange: (nextValue: string) => void
    onPaymentMethodChange: (nextValue: MeetupPaymentMethod) => void
    onOpenMapPicker: () => void
    onCloseMapPicker: () => void
    onMapSearchChange: (nextValue: string) => void
    onMapClick: (lat: number, lng: number) => void
    onSelectMapPickerPoint: (pointId: string) => void
    onConfirmMapPickerPoint: () => void
    onStepChange: (nextStep: ProposalStep) => void
    onCancel: () => void
    onBack: () => void
    onNext: () => void
    onSubmit: () => void
}

function MeetupProposalOverlay({
    conversation,
    step,
    errorMessage,
    canAccessStepTwo,
    canAccessStepThree,
    mapPickerOpen,
    mapCenter,
    mapPickerPointId,
    allSafePoints,
    selectableOptions,
    selectedOptionId,
    customPoint,
    customLocationLabel,
    customDistanceMeters,
    mapSearchValue,
    dateTimeValue,
    finalPriceValue,
    paymentMethod,
    onDateTimeChange,
    onSelectPoint,
    onFinalPriceChange,
    onPaymentMethodChange,
    onOpenMapPicker,
    onCloseMapPicker,
    onMapSearchChange,
    onMapClick,
    onSelectMapPickerPoint,
    onConfirmMapPickerPoint,
    onStepChange,
    onCancel,
    onBack,
    onNext,
    onSubmit,
}: MeetupProposalOverlayProps) {
    const stepLabels: Array<{ id: ProposalStep; label: string }> = [
        { id: 1, label: "Punto de encuentro" },
        { id: 2, label: "Dia y hora" },
        { id: 3, label: "Preferencia de pago" },
    ]
    const mapSelectedPoint = allSafePoints.find((point) => point.id === mapPickerPointId)
    const isCustomPointSelected = mapPickerPointId === "custom" && customPoint
    const visibleOptions = selectableOptions.slice(0, 2)
    const initialNow = React.useMemo(() => new Date(), [])
    const minDateValue = toLocalDateValue(initialNow)
    const minTimeValue = toLocalTimeValue(initialNow)
    const [selectedDateValue, setSelectedDateValue] = React.useState(() => {
        const [dateValue] = dateTimeValue.split("T")
        return dateValue ?? ""
    })
    const [selectedTimeValue, setSelectedTimeValue] = React.useState(() => {
        const [, timeValue = ""] = dateTimeValue.split("T")
        return timeValue.slice(0, 5)
    })
    const [visibleCalendarMonth, setVisibleCalendarMonth] = React.useState(() => {
        if (selectedDateValue) {
            const [year, month] = selectedDateValue.split("-")
            return new Date(Number(year), Number(month) - 1, 1)
        }
        return new Date(initialNow.getFullYear(), initialNow.getMonth(), 1)
    })

    React.useEffect(() => {
        const [dateValue = ""] = dateTimeValue.split("T")
        const [, timeValue = ""] = dateTimeValue.split("T")
        setSelectedDateValue(dateValue)
        setSelectedTimeValue(timeValue.slice(0, 5))
        if (dateValue) {
            const [year, month] = dateValue.split("-")
            setVisibleCalendarMonth(new Date(Number(year), Number(month) - 1, 1))
        } else {
            setVisibleCalendarMonth(new Date(initialNow.getFullYear(), initialNow.getMonth(), 1))
        }
    }, [dateTimeValue, initialNow])

    const timeOptions = React.useMemo(() => {
        const options: string[] = []
        for (let hour = 0; hour <= 23; hour += 1) {
            for (let minute = 0; minute < 60; minute += 15) {
                options.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`)
            }
        }
        return options
    }, [])
    const updateDateTimeValue = (nextDateValue: string, nextTimeValue: string) => {
        if (!nextDateValue || !nextTimeValue) {
            onDateTimeChange("")
            return
        }
        onDateTimeChange(`${nextDateValue}T${nextTimeValue}`)
    }

    const handleDateSelection = (nextDateValue: string) => {
        let nextTimeValue = selectedTimeValue
        if (nextDateValue === minDateValue && selectedTimeValue && selectedTimeValue < minTimeValue) {
            nextTimeValue = ""
            setSelectedTimeValue("")
        }
        setSelectedDateValue(nextDateValue)
        updateDateTimeValue(nextDateValue, nextTimeValue)
    }

    const handleTimeSelection = (nextTimeValue: string) => {
        setSelectedTimeValue(nextTimeValue)
        updateDateTimeValue(selectedDateValue, nextTimeValue)
    }
    const hasMissingFieldsError = errorMessage === "Faltan campos por rellenar"
    const isStepTwoDateMissing = step === 2 && hasMissingFieldsError && !selectedDateValue
    const isStepTwoTimeMissing = step === 2 && hasMissingFieldsError && !selectedTimeValue
    const hasFinalPriceValue = finalPriceValue.trim().length > 0
    const parsedFinalPriceValue = parseFinalPrice(finalPriceValue)
    const isFinalPriceAboveMaximum =
        parsedFinalPriceValue !== null && parsedFinalPriceValue > MAX_FINAL_PRICE_EUR
    const isFinalPriceValueInvalid =
        hasFinalPriceValue &&
        (parsedFinalPriceValue === null || parsedFinalPriceValue < 0 || isFinalPriceAboveMaximum)
    const isStepThreePriceMissing =
        step === 3 && hasMissingFieldsError && (!hasFinalPriceValue || isFinalPriceValueInvalid)
    const isStepThreePaymentMissing =
        step === 3 && hasMissingFieldsError && !paymentMethod
    const shouldShowDac7Alert =
        parsedFinalPriceValue !== null && parsedFinalPriceValue > DAC7_ALERT_THRESHOLD_EUR
    const priceInputError =
        isStepThreePriceMissing
            ? "Introduce un importe de 0 € o superior."
            : isFinalPriceAboveMaximum
                ? `El importe maximo permitido es ${MAX_FINAL_PRICE_EUR} €.`
                : undefined
    const priceInputAlertText =
        "Has excedido el importe maximo anual y Wallapop debera informar a Hacienda bajo la normativa DAC7."

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#253238]/50 p-0 md:items-center md:p-6">
            <section className="flex h-[94vh] w-full max-h-[94vh] flex-col rounded-t-[22px] bg-white shadow-[0_16px_48px_rgba(37,50,56,0.22)] md:h-[88vh] md:max-h-[88vh] md:max-w-[760px] md:rounded-[20px]">
                {mapPickerOpen ? (
                    <div className="flex min-h-0 flex-1 flex-col">
                        <div className="border-b border-[#E8ECEF] px-4 py-3">
                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    aria-label="Volver al paso anterior"
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#253238]"
                                    onClick={onCloseMapPicker}
                                >
                                    <WallapopIcon name="arrow_left" size={20} />
                                </button>
                                <h2 className="font-wallie-chunky text-[22px] text-[#253238] md:text-[24px]">Elige un punto</h2>
                                <span className="h-10 w-10" aria-hidden />
                            </div>
                            <label className="mt-3 flex items-center gap-2 rounded-full border border-[#9BB0B9] bg-[#F3F6F8] px-4 py-2.5">
                                <Search size={16} className="text-[#9BB0B9]" aria-hidden />
                                <input
                                    type="text"
                                    value={mapSearchValue}
                                    onChange={(event) => onMapSearchChange(event.target.value)}
                                    placeholder="¿Donde?"
                                    className="w-full bg-transparent font-wallie-fit text-[16px] text-[#4A5A63] outline-none placeholder:text-[#9BB0B9]"
                                />
                            </label>
                        </div>

                        <div className="relative min-h-0 flex-1 overflow-hidden">
                            <MapContainer
                                center={[mapCenter.lat, mapCenter.lng]}
                                zoom={14}
                                scrollWheelZoom
                                zoomControl={false}
                                className="z-0 h-full w-full"
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <ProposalMapCenterController center={mapCenter} />
                                <ProposalMapClickHandler onMapClick={onMapClick} />
                                <Marker position={[mapUserPosition.lat, mapUserPosition.lng]} icon={userPositionIcon} />
                                {allSafePoints.map((point) => (
                                    <Marker
                                        key={point.id}
                                        position={[point.lat, point.lng]}
                                        icon={mapPickerPointId === point.id ? selectedSafePointMarkerIcon : safePointMarkerIcon}
                                        eventHandlers={{
                                            click: (event) => {
                                                event.originalEvent.stopPropagation()
                                                onSelectMapPickerPoint(point.id)
                                            },
                                        }}
                                    />
                                ))}
                                {customPoint ? (
                                    <Marker
                                        position={[customPoint.lat, customPoint.lng]}
                                        icon={customPointIcon}
                                        eventHandlers={{
                                            click: (event) => {
                                                event.originalEvent.stopPropagation()
                                                onSelectMapPickerPoint("custom")
                                            },
                                        }}
                                    />
                                ) : null}
                            </MapContainer>

                            {mapSelectedPoint || isCustomPointSelected ? (
                                <div className="absolute inset-x-3 bottom-3 z-1200 rounded-[16px] bg-white p-4 shadow-[0_10px_28px_rgba(37,50,56,0.2)]">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="font-wallie-chunky text-[20px] text-[#253238] md:text-[22px]">
                                                {mapSelectedPoint ? mapSelectedPoint.name : "Punto personalizado"}
                                            </p>
                                            <p className="mt-1 font-wallie-fit text-[14px] text-[#4A5A63]">
                                                {mapSelectedPoint ? mapSelectedPoint.address : customLocationLabel}
                                            </p>
                                        </div>
                                        <div className="shrink-0 whitespace-nowrap rounded-full bg-[#E6FAF6] px-3 py-1">
                                            <p className="whitespace-nowrap font-wallie-chunky text-[15px] text-[#038673]">
                                                {mapSelectedPoint
                                                    ? formatDistance(mapSelectedPoint.distanceMeters)
                                                    : formatDistance(customDistanceMeters ?? 0)}
                                            </p>
                                        </div>
                                    </div>
                                    {mapSelectedPoint ? (
                                        <p className="mt-2 rounded-[8px] bg-[#E6FAF6] px-2 py-1 font-wallie-fit text-[13px] text-[#038673]">
                                            {mapSelectedPoint.completedSales} ventas completadas en este punto seguro.
                                        </p>
                                    ) : (
                                        <p className="mt-2 rounded-[8px] bg-[#FFF4E8] px-2 py-1 font-wallie-fit text-[13px] text-[#8A4A00]">
                                            Este punto no es un punto seguro verificado.
                                        </p>
                                    )}
                                    <button
                                        type="button"
                                        className="mt-4 w-full rounded-full bg-[#13C1AC] py-3 font-wallie-chunky text-[17px] text-[#0F252B]"
                                        onClick={onConfirmMapPickerPoint}
                                    >
                                        Seleccionar
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                ) : (
                    <>
                        <MeetupProposalHeader
                            currentStep={step}
                            totalSteps={3}
                            steps={stepLabels.map((stepItem) => ({
                                id: stepItem.id,
                                label: stepItem.label,
                                disabled:
                                    (stepItem.id === 2 && !canAccessStepTwo) ||
                                    (stepItem.id === 3 && !canAccessStepThree),
                            }))}
                            onStepChange={(stepId) => onStepChange(stepId as ProposalStep)}
                            onClose={onCancel}
                        />
                        {errorMessage ? (
                            <p className="mx-4 mt-3 rounded-[8px] bg-[#FDEBEC] px-3 py-2 font-wallie-fit text-[13px] text-[#A81F2D]">
                                {errorMessage}
                            </p>
                        ) : null}

                        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
                            {step === 1 ? (
                                <div className="mt-4 space-y-4">
                                    <h3 className="font-wallie-chunky text-[20px] leading-[1.12] text-[#253238] md:text-[22px]">
                                        Seleccionar punto de encuentro
                                    </h3>
                                    {visibleOptions.map((option) => {
                                        const isSelected = selectedOptionId === option.id
                                        return (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => onSelectPoint(option.id)}
                                                className={`w-full rounded-[18px] border px-4 py-4 text-left ${isSelected
                                                    ? "border-[#253238] shadow-[inset_0_0_0_1px_#253238]"
                                                    : "border-[#B8C9CF]"
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    {option.kind === "safe" ? (
                                                        <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#E6FAF6] text-[#038673]">
                                                            <SafeShieldGlyph />
                                                        </span>
                                                    ) : (
                                                        <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#E8F0FF] text-[#2F6DF6]">
                                                            <MapPin size={16} />
                                                        </span>
                                                    )}
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-wallie-chunky text-[18px] leading-tight text-[#253238] md:text-[19px]">
                                                            {option.label}
                                                        </p>
                                                        <p className="mt-1 font-wallie-fit text-[13px] text-[#4A5A63]">
                                                            {option.address}
                                                        </p>
                                                        <div className="mt-1 flex items-center gap-2">
                                                            {option.kind === "safe" ? (
                                                                <>
                                                                    <span className="rounded-full bg-[#E6FAF6] px-2 py-0.5 font-wallie-fit text-[12px] text-[#038673]">
                                                                        Punto seguro
                                                                    </span>
                                                                    <span className="rounded-full bg-[#EEF3F5] px-2 py-0.5 font-wallie-fit text-[12px] text-[#4A5A63]">
                                                                        {option.completedSales ?? 0} ventas
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <span className="rounded-full bg-[#EEF3F5] px-2 py-0.5 font-wallie-fit text-[12px] text-[#4A5A63]">
                                                                    Personalizado
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className="mt-0.5">
                                                        <ProposalSelectionIndicator selected={isSelected} />
                                                    </span>
                                                </div>
                                            </button>
                                        )
                                    })}

                                    <button
                                        type="button"
                                        onClick={onOpenMapPicker}
                                        className="w-full rounded-[18px] border border-[#B8C9CF] px-4 py-4 text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F3F6F8] text-[#253238]">
                                                <WallapopIcon name="plus" size={16} />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-wallie-chunky text-[18px] text-[#253238] md:text-[19px]">
                                                    Elige un punto
                                                </p>
                                                <p className="font-wallie-fit text-[13px] text-[#6E8792]">
                                                    Puede ser un punto personalizado u otro punto seguro.
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            ) : null}

                            {step === 2 ? (
                                <div className="mt-4 space-y-4">
                                    <MeetupWizardStepHeading
                                        caption="Paso anterior"
                                        title="Seleccionar dia y hora"
                                        onBack={onBack}
                                    />
                                    <CalendarPicker
                                        label="Dia"
                                        monthDate={visibleCalendarMonth}
                                        selectedDateValue={selectedDateValue}
                                        minDateValue={minDateValue}
                                        onMonthChange={setVisibleCalendarMonth}
                                        onSelectDate={handleDateSelection}
                                        state={isStepTwoDateMissing ? "error" : "default"}
                                        error={
                                            isStepTwoDateMissing
                                                ? "Selecciona un dia para continuar."
                                                : undefined
                                        }
                                    />
                                    <Select
                                        label="Hora"
                                        value={selectedTimeValue}
                                        placeholder="Selecciona hora"
                                        onValueChange={handleTimeSelection}
                                        error={
                                            isStepTwoTimeMissing
                                                ? "Selecciona una hora para continuar."
                                                : undefined
                                        }
                                        state={isStepTwoTimeMissing ? "error" : "default"}
                                        maxVisibleOptions={6}
                                        dropdownDirection="up"
                                        options={[
                                            { value: "", label: "Selecciona hora", disabled: true },
                                            ...timeOptions.map((timeOption) => ({
                                                value: timeOption,
                                                label: timeOption,
                                                disabled:
                                                    selectedDateValue === minDateValue &&
                                                    timeOption < minTimeValue,
                                            })),
                                        ]}
                                        className="rounded-[10px] bg-white px-3 py-2 font-wallie-fit text-[14px] text-[#253238] focus:border-[#3DD2BA]"
                                    />
                                </div>
                            ) : null}

                            {step === 3 ? (
                                <div className="mt-4 space-y-4">
                                    <MeetupWizardStepHeading
                                        caption="Paso anterior"
                                        title="Selecciona la preferencia de pago"
                                        onBack={onBack}
                                    />
                                    <Input
                                        label="Importe final acordado (€)"
                                        type="text"
                                        inputMode="decimal"
                                        min="0"
                                        max={`${MAX_FINAL_PRICE_EUR}`}
                                        maxLength={8}
                                        value={finalPriceValue}
                                        onChange={(event) => onFinalPriceChange(event.target.value)}
                                        placeholder="Ej: 220"
                                        error={priceInputError}
                                        state={priceInputError ? "error" : "default"}
                                        showCharCounter={false}
                                    />
                                    {shouldShowDac7Alert ? (
                                        <p className="rounded-[8px] bg-[#FFF4E8] px-2 py-2 font-wallie-fit text-[13px] text-[#8A4A00]">
                                            {priceInputAlertText}{" "}
                                            <a
                                                href="https://ayuda.wallapop.com/hc/es-es/articles/19093732048785--Qu%C3%A9-es-DAC7-y-a-que-vendedores-de-Wallapop-les-afecta"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-wallie-chunky underline"
                                            >
                                                Más información
                                            </a>
                                        </p>
                                    ) : null}

                                    <fieldset>
                                        <legend className="mb-2 font-wallie-fit text-[13px] text-[#253238]">
                                            Preferencia de pago
                                        </legend>
                                        <div className="grid gap-3 sm:grid-cols-3">
                                            {(
                                                [
                                                    { method: "CASH", icon: () => <Banknote size={16} /> },
                                                    {
                                                        method: "BIZUM",
                                                        icon: () => <Smartphone size={16} />,
                                                    },
                                                    { method: "WALLET", icon: () => <QrCode size={16} /> },
                                                ] as Array<{
                                                    method: MeetupPaymentMethod
                                                    icon: () => React.ReactNode
                                                }>
                                            ).map(({ method, icon }) => {
                                                const isSelected = paymentMethod === method
                                                return (
                                                    <button
                                                        key={method}
                                                        type="button"
                                                        onClick={() => onPaymentMethodChange(method)}
                                                        className={`rounded-[18px] border px-4 py-3 text-left ${isStepThreePaymentMissing
                                                            ? "border-2 border-[var(--wm-color-input-ring-error)]"
                                                            : isSelected
                                                                ? "border-[#253238] shadow-[inset_0_0_0_1px_#253238]"
                                                                : "border-[var(--wm-color-input-ring-default)]"
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F3F6F8] text-[#253238]">
                                                                {icon()}
                                                            </span>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="font-wallie-fit text-[14px] leading-[1.2] text-[#253238] md:text-[15px]">
                                                                    {paymentMethodLabel(method)}
                                                                </p>
                                                            </div>
                                                            <ProposalSelectionIndicator selected={isSelected} />
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                        {isStepThreePaymentMissing ? (
                                            <p className="mt-2 text-[12px] leading-[1.4] text-[var(--wm-color-input-ring-error)]">
                                                Selecciona un metodo de pago para continuar.
                                            </p>
                                        ) : null}
                                    </fieldset>
                                </div>
                            ) : null}
                        </div>

                        <MeetupProposalFooter
                            listingImageSrc={conversation.listingImageSrc}
                            itemTitle={conversation.itemTitle}
                            userName={conversation.userName}
                            actionLabel={step < 3 ? "Siguiente" : "Enviar propuesta"}
                            actionTextTone="dark"
                            actionDisabled={false}
                            onAction={step < 3 ? onNext : onSubmit}
                        />
                    </>
                )}
            </section>
        </div>
    )
}

type InboxPaneProps = {
    conversations: Conversation[]
    selectedConversationId: string
    onSelectConversation: (conversationId: string) => void
    showBottomNav: boolean
    highlightSelectedConversation?: boolean
}

function InboxPane({
    conversations,
    selectedConversationId,
    onSelectConversation,
    showBottomNav,
    highlightSelectedConversation = true,
}: InboxPaneProps) {
    return (
        <section className="flex h-full min-h-0 flex-col bg-white">
            <div className="border-b border-[#E8ECEF] px-4 py-4">
                <div className="flex items-center">
                    <h1 className="font-wallie-chunky text-[22px] text-[#253238]">Buzon</h1>
                </div>
                <div
                    role="tablist"
                    aria-label="Secciones de inbox"
                    className="mt-4 flex items-center gap-2"
                >
                    <button
                        type="button"
                        className="rounded-full bg-[#253238] px-4 py-2 font-wallie-chunky text-[14px] text-white"
                    >
                        Mensajes
                    </button>
                    <button
                        type="button"
                        className="rounded-full bg-[#F3F6F8] px-4 py-2 font-wallie-fit text-[14px] text-[#253238]"
                    >
                        Notificaciones
                    </button>
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
                {conversations.map((conversation) => (
                    <ChatListItem
                        key={conversation.id}
                        userName={conversation.userName}
                        messageDate={conversation.messageDate}
                        itemTitle={conversation.itemTitle}
                        messagePreview={conversation.messagePreview}
                        avatarSrc={conversation.listingImageSrc}
                        avatarAlt={conversation.itemTitle}
                        leadingIndicator={conversation.leadingIndicator}
                        unreadCount={conversation.unreadCount}
                        selected={
                            highlightSelectedConversation &&
                            conversation.id === selectedConversationId
                        }
                        lastMessageDeliveryState={conversation.lastMessageDeliveryState}
                        onClick={() => onSelectConversation(conversation.id)}
                    />
                ))}
            </div>

            {showBottomNav ? (
                <div className="border-t border-[#E8ECEF]">
                    <InboxBottomNav activeItemId="inbox" />
                </div>
            ) : null}
        </section>
    )
}

type ConversationPaneProps = {
    actorRole: ActorRole
    conversation: Conversation
    timelineEntries: ConversationTimelineEntry[]
    meetup: MeetupMachine | undefined
    onBackToInbox?: () => void
    onSubmitMessage: (value: string) => void
    onMeetupChange: (next: MeetupMachine) => void
    onMeetupRedZoneCancel: () => void
    onOpenMeetupProposal: () => void
    onOpenMeetupMapPreview: (meetup: MeetupMachine) => void
    onError: (message: string) => void
    errorMessage: string
}

function ConversationPane({
    actorRole,
    conversation,
    timelineEntries,
    meetup,
    onBackToInbox,
    onSubmitMessage,
    onMeetupChange,
    onMeetupRedZoneCancel,
    onOpenMeetupProposal,
    onOpenMeetupMapPreview,
    onError,
    errorMessage,
}: ConversationPaneProps) {
    const currentTime = new Date()
    const proposalActionState = meetup
        ? resolveChatMeetupEntryActionState(meetup, actorRole)
        : null
    const canShowProposalAction = proposalActionState?.visible === true

    return (
        <section className="flex h-full min-h-0 flex-col bg-white">
            <header className="flex items-center gap-3 border-b border-[#E8ECEF] bg-white px-4 py-3">
                {onBackToInbox ? (
                    <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center text-[#253238]"
                        aria-label="Volver a conversaciones"
                        onClick={onBackToInbox}
                    >
                        <WallapopIcon name="arrow_left" size="small" />
                    </button>
                ) : null}
                <img
                    src={conversation.listingImageSrc}
                    alt={conversation.itemTitle}
                    className="h-11 w-11 rounded-[12px] object-cover"
                />
                <div className="min-w-0">
                    <p className="truncate font-wallie-chunky text-[16px] text-[#253238]">
                        {conversation.itemPrice}
                    </p>
                    <p className="truncate font-wallie-fit text-[13px] text-[#6E8792]">
                        {conversation.itemTitle}
                    </p>
                </div>
                <img
                    src={conversation.profileImageSrc}
                    alt={`Foto de perfil de ${conversation.userName}`}
                    className="ml-auto h-9 w-9 rounded-full border border-[#D3DEE2] object-cover"
                />
                <button
                    type="button"
                    aria-label={`Mas opciones de la conversacion con ${conversation.userName}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#6E8792] hover:bg-[#F3F6F8]"
                >
                    <WallapopIcon name="ellipsis_horizontal" size={16} strokeWidth={1.8} />
                </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5">
                <div className="space-y-3">
                    {timelineEntries.map((entry, entryIndex) => {
                        const previousEntry = entryIndex > 0 ? timelineEntries[entryIndex - 1] : null
                        const showDateSeparator =
                            previousEntry === null ||
                            !isSameCalendarDay(previousEntry.createdAt, entry.createdAt)

                        if (entry.type === "message") {
                            const message = entry.message
                            return (
                                <div key={entry.id} className="space-y-2">
                                    {showDateSeparator ? (
                                        <div className="flex justify-center">
                                            <span className="inline-flex rounded-full bg-[#D7E1E6] px-4 py-1 font-wallie-fit text-[13px] text-[#6E8792]">
                                                {formatTimelineDayLabel(entry.createdAt)}
                                            </span>
                                        </div>
                                    ) : null}
                                    <div
                                        className={
                                            message.variant === "sent"
                                                ? "flex justify-end"
                                                : "flex justify-start"
                                        }
                                    >
                                        <ChatMessageBubble
                                            variant={message.variant}
                                            time={message.time}
                                            deliveryState={message.deliveryState}
                                        >
                                            {message.text}
                                        </ChatMessageBubble>
                                    </div>
                                </div>
                            )
                        }

                        return (
                            <div key={entry.id} className="space-y-2 pt-2">
                                {showDateSeparator ? (
                                    <div className="flex justify-center">
                                        <span className="inline-flex rounded-full bg-[#D7E1E6] px-4 py-1 font-wallie-fit text-[13px] text-[#6E8792]">
                                            {formatTimelineDayLabel(entry.createdAt)}
                                        </span>
                                    </div>
                                ) : null}
                                <div className={actorRole === "SELLER" ? "flex justify-end" : "flex justify-start"}>
                                    <MeetupCard
                                        meetup={entry.meetup}
                                        actorRole={actorRole}
                                        currentTime={currentTime}
                                        onMeetupChange={onMeetupChange}
                                        counterpartName={conversation.userName}
                                        onRedZoneCancelConfirmed={onMeetupRedZoneCancel}
                                        onError={onError}
                                        onEditProposal={onOpenMeetupProposal}
                                        onOpenMapPreview={() => onOpenMeetupMapPreview(entry.meetup)}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
                {timelineEntries.length === 0 && meetup && meetup.status !== null ? (
                    <div className="mt-5 space-y-4">
                        <div className={actorRole === "SELLER" ? "flex justify-end" : "flex justify-start"}>
                            <MeetupCard
                                meetup={meetup}
                                actorRole={actorRole}
                                currentTime={currentTime}
                                onMeetupChange={onMeetupChange}
                                counterpartName={conversation.userName}
                                onRedZoneCancelConfirmed={onMeetupRedZoneCancel}
                                onError={onError}
                                onEditProposal={onOpenMeetupProposal}
                                onOpenMapPreview={() => onOpenMeetupMapPreview(meetup)}
                            />
                        </div>
                    </div>
                ) : null}

                {errorMessage ? (
                    <p className="mt-4 rounded-[8px] bg-[#FDEBEC] px-3 py-2 font-wallie-fit text-[13px] text-[#A81F2D]">
                        {errorMessage}
                    </p>
                ) : null}
            </div>

            <div className="shrink-0 border-t border-[#E8ECEF] bg-white">
                <div className="px-3 pt-1 sm:px-4">
                    <ChatSecurityBanner
                        message="Quedate en Wallapop. Mas facil, mas seguro."
                        linkText="Mas informacion"
                        className="px-0 pt-1 pb-1"
                    />
                </div>
                <ChatComposer
                    onSubmit={onSubmitMessage}
                    secondaryActionLabel={canShowProposalAction ? "Proponer quedar" : undefined}
                    secondaryActionAriaLabel="Proponer quedar"
                    secondaryActionIconName="calendar"
                    secondaryActionDisabled={
                        canShowProposalAction ? !proposalActionState?.enabled : undefined
                    }
                    onSecondaryAction={
                        canShowProposalAction
                            ? () => {
                                if (!proposalActionState) {
                                    return
                                }

                                if (!proposalActionState.enabled) {
                                    onError(proposalActionState.message)
                                    return
                                }

                                onError("")
                                onOpenMeetupProposal()
                            }
                            : undefined
                    }
                />
            </div>
        </section>
    )
}

function DesktopConversationSidebar({
    conversation,
    onToggleReserve,
}: {
    conversation: Conversation
    onToggleReserve: () => void
}) {
    const sidebarStatusLabel =
        conversation.listingStatusLabel ??
        (conversation.leadingIndicator === "bookmark"
            ? "Reservado"
            : conversation.leadingIndicator === "deal"
                ? "Vendido"
                : undefined)

    return (
        <aside className="hidden h-full min-h-0 flex-col gap-4 overflow-y-auto bg-[#F3F6F8] p-4 lg:flex">
            <ChatCounterpartCard
                name={conversation.userName}
                rating={conversation.counterpartRating}
                ratingCount={conversation.counterpartRatingCount}
                distanceLabel={conversation.counterpartDistanceLabel}
                attendanceRate={conversation.counterpartAttendanceRate}
                attendanceMeetups={conversation.counterpartAttendanceMeetups}
                profileImageSrc={conversation.profileImageSrc}
            />
            <ChatProductCard
                imageSrc={conversation.listingImageSrc ?? conversation.profileImageSrc ?? ""}
                imageAlt={conversation.itemTitle}
                title={conversation.itemTitle}
                price={conversation.itemPrice}
                viewerRole={conversation.listingViewerRole}
                statusLabel={sidebarStatusLabel}
                viewsCount={conversation.listingViews}
                likesCount={conversation.listingLikes}
                onEdit={
                    conversation.listingViewerRole === "seller"
                        ? () => undefined
                        : undefined
                }
                onReserve={
                    conversation.listingViewerRole === "seller"
                        ? onToggleReserve
                        : undefined
                }
                onSold={
                    conversation.listingViewerRole === "seller"
                        ? () => undefined
                        : undefined
                }
            />
        </aside>
    )
}

function WallapopChatWorkspace() {
    const localChatUserId = React.useMemo(() => getOrCreateLocalChatUserId(), [])
    const [conversationsState, setConversationsState] = React.useState<Conversation[]>(
        initialConversations
    )
    const [selectedConversationId, setSelectedConversationId] = React.useState<string>(
        "conv-a-arrival"
    )
    const [mobileView, setMobileView] = React.useState<"inbox" | "conversation">("inbox")
    const [messagesByConversation, setMessagesByConversation] = React.useState<
        Record<string, Message[]>
    >(() =>
        Object.fromEntries(
            Object.entries(initialMessagesByConversation).map(([conversationId, messages]) => [
                conversationId,
                messages.map((message) => ({
                    ...message,
                    senderUserId:
                        message.variant === "sent" ? localChatUserId : `counterpart:${conversationId}`,
                })),
            ])
        )
    )
    const [meetupByConversation, setMeetupByConversation] = React.useState<
        Record<string, MeetupMachine>
    >(buildInitialMeetupState)
    const [lastError, setLastError] = React.useState("")
    const [isProposalOverlayOpen, setIsProposalOverlayOpen] = React.useState(false)
    const [proposalStep, setProposalStep] = React.useState<ProposalStep>(1)
    const [proposalMapPickerOpen, setProposalMapPickerOpen] = React.useState(false)
    const [proposalMapPickerPointId, setProposalMapPickerPointId] = React.useState("")
    const [proposalMapSearchValue, setProposalMapSearchValue] = React.useState("")
    const [proposalMapCenter, setProposalMapCenter] = React.useState<MapPoint>({
        lat: safeMeetingPoints[0].lat,
        lng: safeMeetingPoints[0].lng,
    })
    const [proposalOptions, setProposalOptions] = React.useState<ProposalSelectableOption[]>([
        toSafeOption(safeMeetingPoints[0]),
        toSafeOption(safeMeetingPoints[1]),
    ])
    const [proposalSelectedOptionId, setProposalSelectedOptionId] = React.useState<string>(
        `safe:${safeMeetingPoints[0].id}`
    )
    const [proposalCustomPoint, setProposalCustomPoint] = React.useState<MapPoint | null>(null)
    const [proposalCustomLocationLabel, setProposalCustomLocationLabel] = React.useState("")
    const [proposalScheduledAt, setProposalScheduledAt] = React.useState("")
    const [proposalFinalPrice, setProposalFinalPrice] = React.useState("")
    const [proposalPaymentMethod, setProposalPaymentMethod] = React.useState<
        MeetupPaymentMethod | ""
    >("")
    const [proposalError, setProposalError] = React.useState("")
    const [mapPreviewOpen, setMapPreviewOpen] = React.useState(false)
    const [mapPreviewCenter, setMapPreviewCenter] = React.useState<MapPoint>({
        lat: safeMeetingPoints[0].lat,
        lng: safeMeetingPoints[0].lng,
    })
    const proposalCustomPointRef = React.useRef<MapPoint | null>(null)
    const reverseGeocodeRequestIdRef = React.useRef(0)
    const convexHydrationRequestIdRef = React.useRef(0)

    const selectedConversation = React.useMemo(
        () =>
            conversationsState.find((conversation) => conversation.id === selectedConversationId),
        [conversationsState, selectedConversationId]
    )

    const selectedMessages = React.useMemo<Message[]>(() => {
        if (!selectedConversation) {
            return []
        }
        return messagesByConversation[selectedConversation.id] ?? []
    }, [messagesByConversation, selectedConversation])
    const selectedMeetup = selectedConversation
        ? meetupByConversation[selectedConversation.id]
        : undefined
    const selectedTimelineEntries = React.useMemo<ConversationTimelineEntry[]>(
        () => buildConversationTimelineEntries(selectedMessages, selectedMeetup),
        [selectedMeetup, selectedMessages]
    )
    const selectedActorRole: ActorRole =
        selectedConversation?.listingViewerRole === "buyer" ? "BUYER" : "SELLER"

    React.useEffect(() => {
        setConversationsState((previous) =>
            previous.map((conversation) => {
                const conversationMessages = messagesByConversation[conversation.id] ?? []
                const conversationMeetup = meetupByConversation[conversation.id]
                const summary = resolveConversationSummary(conversationMessages, conversationMeetup)
                const unreadCount = resolveConversationUnreadCount(
                    conversation.unreadCount,
                    conversationMessages,
                    conversationMeetup
                )
                const commercialStatus = resolveConversationCommercialStatus(
                    conversation,
                    conversationMeetup
                )
                return {
                    ...conversation,
                    ...summary,
                    unreadCount,
                    ...commercialStatus,
                }
            })
        )
    }, [messagesByConversation, meetupByConversation])

    const applyProposalDraftState = React.useCallback((draft: ProposalDraftState) => {
        setProposalStep(draft.step)
        setProposalMapPickerOpen(draft.mapPickerOpen)
        setProposalMapPickerPointId(draft.mapPickerPointId)
        setProposalMapSearchValue(draft.mapSearchValue)
        setProposalMapCenter(draft.mapCenter)
        setProposalOptions(draft.options)
        setProposalSelectedOptionId(draft.selectedOptionId)
        setProposalCustomPoint(draft.customPoint)
        setProposalCustomLocationLabel(draft.customLocationLabel)
        setProposalScheduledAt(draft.scheduledAt)
        setProposalFinalPrice(draft.finalPrice)
        setProposalPaymentMethod(draft.paymentMethod)
        setProposalError(draft.error)
    }, [])

    React.useEffect(() => {
        if (!selectedMeetup) {
            applyProposalDraftState(buildProposalDraftState(undefined))
            setIsProposalOverlayOpen(false)
            return
        }

        applyProposalDraftState(buildProposalDraftState(selectedMeetup))
    }, [selectedConversationId, selectedMeetup, applyProposalDraftState])

    React.useEffect(() => {
        proposalCustomPointRef.current = proposalCustomPoint
    }, [proposalCustomPoint])

    const hydrateConversationMessagesFromConvex = React.useCallback(async (conversationId: string) => {
        const convexClient = getConvexHttpClient()
        if (!convexClient) {
            return
        }

        const requestId = convexHydrationRequestIdRef.current + 1
        convexHydrationRequestIdRef.current = requestId

        try {
            const persistedMessages = (await convexClient.query(
                (api as any).messages.listByConversation,
                { conversationId }
            )) as ConvexChatMessage[]

            if (convexHydrationRequestIdRef.current !== requestId) {
                return
            }

            setMessagesByConversation((previous) => {
                const existingMessages = previous[conversationId] ?? []
                const existingIds = new Set(existingMessages.map((message) => message.id))

                const nextMessages = [...existingMessages]
                for (const persistedMessage of persistedMessages) {
                    if (existingIds.has(persistedMessage.clientMessageId)) {
                        continue
                    }
                    const createdAt = persistedMessage.createdAt ?? Date.now()
                    nextMessages.push({
                        id: persistedMessage.clientMessageId,
                        senderUserId: persistedMessage.senderUserId,
                        text: persistedMessage.text,
                        variant:
                            persistedMessage.senderUserId === localChatUserId
                                ? "sent"
                                : persistedMessage.variant ?? "received",
                        time: persistedMessage.time,
                        createdAt,
                        deliveryState: persistedMessage.deliveryState,
                    })
                    existingIds.add(persistedMessage.clientMessageId)
                }

                return {
                    ...previous,
                    [conversationId]: nextMessages,
                }
            })
        } catch {
            setLastError("No se pudieron recuperar los mensajes guardados en Convex.")
        }
    }, [localChatUserId])

    React.useEffect(() => {
        if (!selectedConversation) {
            return
        }
        void hydrateConversationMessagesFromConvex(selectedConversation.id)
    }, [hydrateConversationMessagesFromConvex, selectedConversation])

    const resolveCustomPointAddress = React.useCallback(async (lat: number, lng: number) => {
        const requestId = reverseGeocodeRequestIdRef.current + 1
        reverseGeocodeRequestIdRef.current = requestId
        const requestedPoint: MapPoint = { lat, lng }

        try {
            const response = await fetch(buildReverseGeocodeUrl(requestedPoint))
            if (!response.ok) {
                return
            }
            const data = (await response.json()) as { display_name?: string }
            if (
                shouldApplyReverseGeocodeResult({
                    requestId,
                    latestRequestId: reverseGeocodeRequestIdRef.current,
                    requestedPoint,
                    currentPoint: proposalCustomPointRef.current,
                    responseAddress: data.display_name,
                })
            ) {
                setProposalCustomLocationLabel(data.display_name ?? "")
            }
        } catch {
            // Fallback silencioso: se mantienen coordenadas.
        }
    }, [])

    const proposalCustomDistanceMeters = React.useMemo(() => {
        if (!proposalCustomPoint) {
            return null
        }
        return distanceBetweenPointsMeters(mapUserPosition, proposalCustomPoint)
    }, [proposalCustomPoint])

    const markConversationAsRead = React.useCallback((conversationId: string) => {
        setConversationsState((previous) =>
            previous.map((conversation) =>
                conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation
            )
        )
        setMessagesByConversation((previous) => {
            const nextMessages = [...(previous[conversationId] ?? [])]
            for (let index = nextMessages.length - 1; index >= 0; index -= 1) {
                if (nextMessages[index].variant === "received") {
                    nextMessages[index] = {
                        ...nextMessages[index],
                        deliveryState: "read",
                    }
                    break
                }
            }
            return {
                ...previous,
                [conversationId]: nextMessages,
            }
        })
    }, [])

    React.useEffect(() => {
        markConversationAsRead(selectedConversationId)
    }, [markConversationAsRead, selectedConversationId])

    if (!selectedConversation) {
        return null
    }

    const openConversation = (conversationId: string) => {
        setSelectedConversationId(conversationId)
        setLastError("")
        setMobileView("conversation")
        markConversationAsRead(conversationId)
    }

    const appendOutgoingMessage = (text: string) => {
        const trimmedText = text.trim()
        if (!trimmedText) {
            return
        }
        const nowMs = Date.now()
        const nextMessage: Message = {
            id: `m-${nowMs}`,
            senderUserId: localChatUserId,
            text: trimmedText,
            variant: "sent",
            time: formatTime(new Date(nowMs)),
            createdAt: nowMs,
            deliveryState: "sent",
        }

        setMessagesByConversation((previous) => ({
            ...previous,
            [selectedConversation.id]: [...(previous[selectedConversation.id] ?? []), nextMessage],
        }))

        const convexClient = getConvexHttpClient()
        if (!convexClient) {
            return
        }

        void convexClient
            .mutation((api as any).messages.saveUserTextMessage, {
                conversationId: selectedConversation.id,
                clientMessageId: nextMessage.id,
                senderUserId: localChatUserId,
                text: nextMessage.text,
                time: nextMessage.time,
                deliveryState: nextMessage.deliveryState,
                createdAt: nextMessage.createdAt,
            })
            .catch(async () => {
                try {
                    await convexClient.mutation((api as any).messages.saveUserTextMessage, {
                        conversationId: selectedConversation.id,
                        clientMessageId: nextMessage.id,
                        text: nextMessage.text,
                        variant: nextMessage.variant,
                        time: nextMessage.time,
                        deliveryState: nextMessage.deliveryState,
                        createdAt: nextMessage.createdAt,
                    })
                } catch {
                    setLastError("No se pudo guardar el mensaje en Convex.")
                }
            })
    }

    const appendSystemMessage = (text: string) => {
        const nowMs = Date.now()
        const nextMessage: Message = {
            id: `sys-${nowMs}`,
            senderUserId: localChatUserId,
            text,
            variant: "sent",
            time: formatTime(new Date(nowMs)),
            createdAt: nowMs,
            deliveryState: "sent",
        }

        setMessagesByConversation((previous) => ({
            ...previous,
            [selectedConversation.id]: [...(previous[selectedConversation.id] ?? []), nextMessage],
        }))
    }

    const appendCounterpartMessage = (text: string) => {
        const nowMs = Date.now()
        const nextMessage: Message = {
            id: `cp-${nowMs}`,
            senderUserId: `counterpart:${selectedConversation.id}`,
            text,
            variant: "received",
            time: formatTime(new Date(nowMs)),
            createdAt: nowMs,
        }

        setMessagesByConversation((previous) => ({
            ...previous,
            [selectedConversation.id]: [...(previous[selectedConversation.id] ?? []), nextMessage],
        }))
    }

    const handleMeetupRedZoneCancel = () => {
        appendSystemMessage(
            "Cancelaste en los ultimos 30 min. Se notifico de forma prioritaria a la otra persona."
        )
        appendCounterpartMessage(
            "He recibido la cancelacion de la quedada. Busquemos otra hora si te encaja."
        )
    }

    const updateSelectedMeetup = (next: MeetupMachine) => {
        setMeetupByConversation((previous) => ({
            ...previous,
            [selectedConversation.id]: next,
        }))

        if (next.status === "CONFIRMED") {
            setConversationsState((previous) =>
                previous.map((conversation) => {
                    if (conversation.id !== selectedConversation.id) {
                        return conversation
                    }
                    const isSold =
                        conversation.leadingIndicator === "deal" ||
                        isSoldStatusLabel(conversation.listingStatusLabel)
                    if (isSold) {
                        return conversation
                    }
                    return {
                        ...conversation,
                        leadingIndicator: "bookmark",
                        listingStatusLabel: "Reservado",
                    }
                })
            )
        }
    }

    const toggleSelectedConversationReserve = () => {
        setConversationsState((previous) =>
            previous.map((conversation) => {
                if (conversation.id !== selectedConversation.id) {
                    return conversation
                }

                const isSold =
                    conversation.leadingIndicator === "deal" ||
                    isSoldStatusLabel(conversation.listingStatusLabel)
                if (isSold) {
                    return conversation
                }

                const isReserved =
                    conversation.leadingIndicator === "bookmark" ||
                    isReservedStatusLabel(conversation.listingStatusLabel)

                if (isReserved) {
                    return {
                        ...conversation,
                        leadingIndicator: undefined,
                        listingStatusLabel: undefined,
                    }
                }

                return {
                    ...conversation,
                    leadingIndicator: "bookmark",
                    listingStatusLabel: "Reservado",
                }
            })
        )
    }

    const openMeetupProposal = () => {
        if (!selectedMeetup) {
            return
        }

        applyProposalDraftState(buildProposalDraftState(selectedMeetup))
        setIsProposalOverlayOpen(true)
    }

    const openMeetupMapPreview = (meetup: MeetupMachine) => {
        const hasPoint =
            typeof meetup.proposedLocationLat === "number" &&
            typeof meetup.proposedLocationLng === "number"

        if (hasPoint) {
            setMapPreviewCenter({
                lat: meetup.proposedLocationLat as number,
                lng: meetup.proposedLocationLng as number,
            })
            setMapPreviewOpen(true)
            return
        }

        const matchingPoint = safeMeetingPoints.find(
            (point) =>
                point.name === meetup.proposedLocation || point.address === meetup.proposedLocation
        )
        if (matchingPoint) {
            setMapPreviewCenter({ lat: matchingPoint.lat, lng: matchingPoint.lng })
            setMapPreviewOpen(true)
            return
        }

        setLastError("No hay un punto de mapa disponible para esta propuesta.")
    }

    const closeMeetupProposal = () => {
        setProposalError("")
        setProposalMapPickerOpen(false)
        setIsProposalOverlayOpen(false)
    }

    const pushProposalOption = (nextOption: ProposalSelectableOption) => {
        setProposalOptions((previous) => {
            const withoutSame = previous.filter((option) => option.id !== nextOption.id)
            return [nextOption, ...withoutSame].slice(0, 2)
        })
        setProposalSelectedOptionId(nextOption.id)
    }

    const selectSafePoint = (pointId: string, options?: { pushToTop?: boolean }) => {
        const selected = safeMeetingPoints.find((point) => point.id === pointId)
        if (!selected) {
            return
        }
        const safeOption = toSafeOption(selected)
        if (options?.pushToTop) {
            pushProposalOption(safeOption)
        } else {
            setProposalSelectedOptionId(safeOption.id)
        }
        setProposalMapPickerPointId(pointId)
        setProposalMapCenter({ lat: selected.lat, lng: selected.lng })
        setProposalCustomPoint(null)
        setProposalCustomLocationLabel("")
        setProposalError("")
    }

    const selectCustomPoint = (lat: number, lng: number) => {
        setProposalCustomPoint({ lat, lng })
        setProposalCustomLocationLabel(customLocationLabelFromPoint(lat, lng))
        setProposalMapPickerPointId("custom")
        setProposalMapCenter({ lat, lng })
        setProposalError("")
        void resolveCustomPointAddress(lat, lng)
    }

    const openMapPicker = () => {
        setProposalMapPickerOpen(true)
        setProposalError("")
        if (!proposalMapPickerPointId) {
            const selectedOption = proposalOptions.find((option) => option.id === proposalSelectedOptionId)
            if (selectedOption?.kind === "safe" && selectedOption.safePointId) {
                setProposalMapPickerPointId(selectedOption.safePointId)
                setProposalMapCenter({ lat: selectedOption.lat, lng: selectedOption.lng })
            } else if (selectedOption?.kind === "custom") {
                setProposalMapPickerPointId("custom")
                setProposalMapCenter({ lat: selectedOption.lat, lng: selectedOption.lng })
            } else {
                setProposalMapPickerPointId(safeMeetingPoints[0].id)
                setProposalMapCenter({ lat: safeMeetingPoints[0].lat, lng: safeMeetingPoints[0].lng })
            }
        }
    }

    const closeMapPicker = () => {
        setProposalMapPickerOpen(false)
    }

    const selectMapPickerPoint = (pointId: string) => {
        setProposalMapPickerPointId(pointId)
        if (pointId === "custom") {
            if (!proposalCustomPoint) {
                selectCustomPoint(proposalMapCenter.lat, proposalMapCenter.lng)
            }
            return
        }
        const selected = safeMeetingPoints.find((point) => point.id === pointId)
        if (!selected) {
            return
        }
        setProposalCustomPoint(null)
        setProposalCustomLocationLabel("")
        setProposalMapCenter({ lat: selected.lat, lng: selected.lng })
    }

    const confirmMapPickerPoint = () => {
        if (!proposalMapPickerPointId) {
            setProposalError("Selecciona un punto de encuentro seguro.")
            return
        }
        if (proposalMapPickerPointId === "custom") {
            if (!proposalCustomPoint) {
                setProposalError("Selecciona un punto personalizado en el mapa.")
                return
            }
            const customOption = toCustomOption(
                proposalCustomPoint.lat,
                proposalCustomPoint.lng,
                proposalCustomLocationLabel || customLocationLabelFromPoint(proposalCustomPoint.lat, proposalCustomPoint.lng)
            )
            pushProposalOption(customOption)
            setProposalMapPickerOpen(false)
            setProposalError("")
            return
        }
        selectSafePoint(proposalMapPickerPointId, { pushToTop: true })
        setProposalMapPickerOpen(false)
    }

    const validateProposalStepOne = () => {
        if (proposalSelectedOptionId.trim().length === 0) {
            setProposalError("Selecciona un punto de encuentro en el mapa.")
            return false
        }
        setProposalError("")
        return true
    }

    const validateProposalStepTwo = () => {
        if (!validateProposalStepOne()) {
            return false
        }

        const [selectedDateValue = "", selectedTimeValue = ""] = proposalScheduledAt.split("T")
        if (!selectedDateValue) {
            setProposalError("Faltan campos por rellenar")
            return false
        }
        if (!selectedTimeValue) {
            setProposalError("Faltan campos por rellenar")
            return false
        }
        const scheduledAt = parseLocalDateTimeValue(proposalScheduledAt)
        if (!scheduledAt) {
            setProposalError("Faltan campos por rellenar")
            return false
        }
        setProposalError("")
        return true
    }

    const goToNextProposalStep = () => {
        if (proposalStep === 1) {
            if (!validateProposalStepOne()) {
                return
            }
            setProposalStep(2)
            return
        }

        if (proposalStep === 2) {
            if (!validateProposalStepTwo()) {
                return
            }
            setProposalStep(3)
        }
    }

    const goToPreviousProposalStep = () => {
        setProposalError("")
        setProposalStep((previous) => (previous > 1 ? ((previous - 1) as ProposalStep) : previous))
    }

    const goToProposalStep = (nextStep: ProposalStep) => {
        if (nextStep === 2 && !validateProposalStepOne()) {
            return
        }
        if (nextStep === 3 && !validateProposalStepTwo()) {
            return
        }
        setProposalError("")
        setProposalStep(nextStep)
    }

    const canAccessProposalStepTwo = proposalSelectedOptionId.trim().length > 0
    const canAccessProposalStepThree =
        canAccessProposalStepTwo && parseLocalDateTimeValue(proposalScheduledAt) !== null

    const confirmMeetupProposal = () => {
        if (!selectedMeetup) {
            setProposalError("No existe contexto de meetup en esta conversacion.")
            return
        }

        const [selectedDateValue = "", selectedTimeValue = ""] = proposalScheduledAt.split("T")
        if (!selectedDateValue) {
            setProposalError("Faltan campos por rellenar")
            return
        }
        if (!selectedTimeValue) {
            setProposalError("Faltan campos por rellenar")
            return
        }
        const scheduledAt = parseLocalDateTimeValue(proposalScheduledAt)
        if (!scheduledAt) {
            setProposalError("Faltan campos por rellenar")
            return
        }

        const selectedOption = proposalOptions.find((option) => option.id === proposalSelectedOptionId)
        const resolvedLocation = selectedOption?.address ?? ""

        if (!resolvedLocation) {
            setProposalError("Selecciona un punto de encuentro seguro.")
            return
        }

        const trimmedFinalPrice = proposalFinalPrice.trim()
        if (!trimmedFinalPrice && !proposalPaymentMethod) {
            setProposalError("Faltan campos por rellenar")
            return
        }
        if (!trimmedFinalPrice) {
            setProposalError("Faltan campos por rellenar")
            return
        }
        if (!proposalPaymentMethod) {
            setProposalError("Faltan campos por rellenar")
            return
        }

        const parsedFinalPrice = parseFinalPrice(trimmedFinalPrice)
        if (parsedFinalPrice === null || parsedFinalPrice < 0) {
            setProposalError("Faltan campos por rellenar")
            return
        }
        if (parsedFinalPrice > MAX_FINAL_PRICE_EUR) {
            setProposalError(`El importe maximo permitido es ${MAX_FINAL_PRICE_EUR} €.`)
            return
        }

        const draftMeetup: MeetupMachine = {
            ...selectedMeetup,
            scheduledAt,
            proposedLocation: resolvedLocation,
            proposedLocationLat: selectedOption?.lat,
            proposedLocationLng: selectedOption?.lng,
            finalPrice: Number(parsedFinalPrice.toFixed(2)),
            proposedPaymentMethod: proposalPaymentMethod,
        }

        if (selectedMeetup.status === "PROPOSED" && selectedActorRole === "SELLER") {
            updateSelectedMeetup(draftMeetup)
            setProposalError("")
            setProposalStep(1)
            setIsProposalOverlayOpen(false)
            return
        }

        if (selectedMeetup.status === "PROPOSED" && selectedActorRole === "BUYER") {
            const counterResult = transitionMeetup(draftMeetup, {
                type: "COUNTER_PROPOSE",
                actorRole: selectedActorRole,
                occurredAt: new Date(),
            })

            if (!counterResult.ok) {
                setProposalError(counterResult.reason)
                return
            }

            updateSelectedMeetup(counterResult.meetup)
            setProposalError("")
            setProposalStep(1)
            setIsProposalOverlayOpen(false)
            return
        }

        if (
            selectedMeetup.status !== null &&
            selectedMeetup.status !== "COUNTER_PROPOSED" &&
            selectedMeetup.status !== "CANCELLED"
        ) {
            setProposalError("Esta propuesta ya no se puede editar.")
            return
        }

        if (selectedMeetup.status === null) {
            const eligibility = resolveChatMeetupEntryActionState(selectedMeetup, selectedActorRole)
            if (!eligibility.enabled) {
                setProposalError(eligibility.message)
                return
            }
        }

        const result = transitionMeetup(
            draftMeetup,
            {
                type: "PROPOSE",
                actorRole: selectedActorRole,
                occurredAt: new Date(),
            }
        )

        if (!result.ok) {
            setProposalError(result.reason)
            return
        }

        updateSelectedMeetup(result.meetup)
        setProposalError("")
        setProposalStep(1)
        setIsProposalOverlayOpen(false)
    }

    return (
        <main className="h-[100dvh] w-full overflow-hidden bg-white">
            <section className="hidden h-full overflow-hidden border-x border-[#D3DEE2] md:grid md:grid-cols-[360px_1fr] lg:grid-cols-[360px_1fr_320px]">
                <div className="min-h-0 border-r border-[#E8ECEF]">
                    <InboxPane
                        conversations={conversationsState}
                        selectedConversationId={selectedConversationId}
                        onSelectConversation={openConversation}
                        showBottomNav={false}
                        highlightSelectedConversation={true}
                    />
                </div>
                <div className="min-h-0">
                    <ConversationPane
                        actorRole={selectedActorRole}
                        conversation={selectedConversation}
                        timelineEntries={selectedTimelineEntries}
                        meetup={selectedMeetup}
                        onSubmitMessage={appendOutgoingMessage}
                        onMeetupChange={updateSelectedMeetup}
                        onMeetupRedZoneCancel={handleMeetupRedZoneCancel}
                        onOpenMeetupProposal={openMeetupProposal}
                        onOpenMeetupMapPreview={openMeetupMapPreview}
                        onError={setLastError}
                        errorMessage={lastError}
                    />
                </div>
                <DesktopConversationSidebar
                    conversation={selectedConversation}
                    onToggleReserve={toggleSelectedConversationReserve}
                />
            </section>

            <section className="h-full min-h-0 md:hidden">
                {mobileView === "inbox" ? (
                    <InboxPane
                        conversations={conversationsState}
                        selectedConversationId={selectedConversationId}
                        onSelectConversation={openConversation}
                        showBottomNav={true}
                        highlightSelectedConversation={false}
                    />
                ) : (
                    <ConversationPane
                        actorRole={selectedActorRole}
                        conversation={selectedConversation}
                        timelineEntries={selectedTimelineEntries}
                        meetup={selectedMeetup}
                        onBackToInbox={() => setMobileView("inbox")}
                        onSubmitMessage={appendOutgoingMessage}
                        onMeetupChange={updateSelectedMeetup}
                        onMeetupRedZoneCancel={handleMeetupRedZoneCancel}
                        onOpenMeetupProposal={openMeetupProposal}
                        onOpenMeetupMapPreview={openMeetupMapPreview}
                        onError={setLastError}
                        errorMessage={lastError}
                    />
                )}
            </section>

            {isProposalOverlayOpen && selectedMeetup ? (
                <MeetupProposalOverlay
                    conversation={selectedConversation}
                    step={proposalStep}
                    errorMessage={proposalError}
                    canAccessStepTwo={canAccessProposalStepTwo}
                    canAccessStepThree={canAccessProposalStepThree}
                    mapPickerOpen={proposalMapPickerOpen}
                    mapPickerPointId={proposalMapPickerPointId}
                    allSafePoints={safeMeetingPoints}
                    selectableOptions={proposalOptions}
                    selectedOptionId={proposalSelectedOptionId}
                    customPoint={proposalCustomPoint}
                    customLocationLabel={proposalCustomLocationLabel}
                    customDistanceMeters={proposalCustomDistanceMeters}
                    mapSearchValue={proposalMapSearchValue}
                    mapCenter={proposalMapCenter}
                    dateTimeValue={proposalScheduledAt}
                    finalPriceValue={proposalFinalPrice}
                    paymentMethod={proposalPaymentMethod}
                    onDateTimeChange={(nextValue) => {
                        setProposalScheduledAt(nextValue)
                        setProposalError("")
                    }}
                    onSelectPoint={(optionId) => {
                        const option = proposalOptions.find((entry) => entry.id === optionId)
                        if (!option) {
                            return
                        }
                        setProposalSelectedOptionId(option.id)
                        if (option.kind === "safe" && option.safePointId) {
                            setProposalMapPickerPointId(option.safePointId)
                        } else {
                            setProposalMapPickerPointId("custom")
                            setProposalCustomPoint({ lat: option.lat, lng: option.lng })
                            setProposalCustomLocationLabel(option.address)
                        }
                        setProposalMapCenter({ lat: option.lat, lng: option.lng })
                        setProposalError("")
                    }}
                    onOpenMapPicker={openMapPicker}
                    onCloseMapPicker={closeMapPicker}
                    onMapSearchChange={setProposalMapSearchValue}
                    onMapClick={selectCustomPoint}
                    onSelectMapPickerPoint={selectMapPickerPoint}
                    onConfirmMapPickerPoint={confirmMapPickerPoint}
                    onFinalPriceChange={(nextValue) => {
                        const normalizedValue = nextValue.replace(",", ".")
                        if (normalizedValue === "") {
                            setProposalFinalPrice("")
                            setProposalError("")
                            return
                        }
                        if (!/^\d{0,5}(\.\d{0,2})?$/.test(normalizedValue)) {
                            return
                        }

                        const parsedValue = Number.parseFloat(normalizedValue)
                        if (Number.isFinite(parsedValue) && parsedValue > MAX_FINAL_PRICE_EUR) {
                            setProposalFinalPrice(String(MAX_FINAL_PRICE_EUR))
                            setProposalError("")
                            return
                        }

                        setProposalFinalPrice(normalizedValue)
                        setProposalError("")
                    }}
                    onPaymentMethodChange={(nextValue) => {
                        setProposalPaymentMethod(nextValue)
                        setProposalError("")
                    }}
                    onStepChange={goToProposalStep}
                    onCancel={closeMeetupProposal}
                    onBack={goToPreviousProposalStep}
                    onNext={goToNextProposalStep}
                    onSubmit={confirmMeetupProposal}
                />
            ) : null}

            {mapPreviewOpen ? (
                <MeetupMapPreviewModal
                    center={mapPreviewCenter}
                    onClose={() => setMapPreviewOpen(false)}
                />
            ) : null}
        </main>
    )
}

export { WallapopChatWorkspace }
