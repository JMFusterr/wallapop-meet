import * as React from "react"

import { MeetupLocationMap } from "@/components/meetup/meetup-location-map"
import { resolveChatMeetupEntryActionState } from "@/components/meetup/chat-meetup-entry-rules"
import { MeetupCard } from "@/components/meetup/meetup-card"
import { ChatComposer } from "@/components/ui/chat-composer"
import { ChatListItem } from "@/components/ui/chat-list-item"
import { ChatMessageBubble } from "@/components/ui/chat-message-bubble"
import { ChatSecurityBanner } from "@/components/ui/chat-security-banner"
import { InboxBottomNav } from "@/components/ui/inbox-bottom-nav"
import { WallapopIcon } from "@/components/ui/wallapop-icon"
import { createMeetupMachine } from "@/meetup"
import { transitionMeetup } from "@/meetup/state-machine"
import type {
    ActorRole,
    MeetupChatContext,
    MeetupMachine,
    MeetupPaymentMethod,
} from "@/meetup/types"
import productImage from "@/stories/assets/avif-test-image.avif"

type Message = {
    id: string
    text: string
    variant: "sent" | "received"
    time: string
    deliveryState?: "sent" | "read"
}

type Conversation = {
    id: string
    userName: string
    messageDate: string
    itemTitle: string
    messagePreview: string
    avatarSrc?: string
    unreadCount?: number
    lastMessageDeliveryState?: "sent" | "read"
    meetupContext?: MeetupChatContext
}

type SafeMeetingPoint = {
    id: string
    name: string
    hint: string
    lat: number
    lng: number
}

type ProposalStep = 1 | 2 | 3

type MapPoint = {
    lat: number
    lng: number
}

const conversations: Conversation[] = [
    {
        id: "conv-meetup-001",
        userName: "Lorena",
        messageDate: "18:35",
        itemTitle: "Nintendo Switch OLED",
        messagePreview: "Perfecto, podemos quedar manana?",
        avatarSrc: productImage,
        lastMessageDeliveryState: "read",
        meetupContext: {
            conversationId: "conv-meetup-001",
            listingId: "listing-switch-001",
            sellerUserId: "user-seller-001",
            buyerUserId: "user-buyer-lorena-001",
        },
    },
    {
        id: "conv-002",
        userName: "Daniel",
        messageDate: "17:24",
        itemTitle: "Figura Pickett Animales Fan",
        messagePreview: "Ya voy",
        unreadCount: 2,
        avatarSrc: productImage,
    },
    {
        id: "conv-003",
        userName: "Sira",
        messageDate: "12 feb",
        itemTitle: "Silent Hill f PS5 Juego",
        messagePreview: "Sira ha rechazado tu oferta.",
        avatarSrc: productImage,
    },
]

const initialMessagesByConversation: Record<string, Message[]> = {
    "conv-meetup-001": [
        {
            id: "m-1",
            text: "Hola! Te interesa la Switch?",
            variant: "sent",
            time: "17:42",
            deliveryState: "read",
        },
        {
            id: "m-2",
            text: "Si, me interesa. Podemos quedar manana?",
            variant: "received",
            time: "17:50",
        },
        {
            id: "m-3",
            text: "Perfecto. Si quieres, formalizamos la quedada desde aqui.",
            variant: "sent",
            time: "18:01",
            deliveryState: "sent",
        },
    ],
    "conv-002": [
        {
            id: "m-4",
            text: "Te la reservo hasta esta tarde.",
            variant: "sent",
            time: "16:03",
            deliveryState: "read",
        },
    ],
    "conv-003": [
        {
            id: "m-5",
            text: "Gracias por responder!",
            variant: "received",
            time: "12:10",
        },
    ],
}

const safeMeetingPoints: SafeMeetingPoint[] = [
    {
        id: "station",
        name: "Estacion de Sants",
        hint: "Zona principal con transito y camaras.",
        lat: 41.37906,
        lng: 2.14006,
    },
    {
        id: "mall",
        name: "Centro comercial Arenas",
        hint: "Entrada principal, punto de informacion.",
        lat: 41.37617,
        lng: 2.14918,
    },
    {
        id: "police",
        name: "Comisaria Mossos - Les Corts",
        hint: "Punto seguro recomendado por proximidad.",
        lat: 41.38762,
        lng: 2.13441,
    },
]

function formatTime(date: Date): string {
    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    })
}

function buildInitialMeetupState(): Record<string, MeetupMachine> {
    const scheduledAt = new Date(Date.now() + 30 * 60 * 1000)
    const state: Record<string, MeetupMachine> = {}

    for (const conversation of conversations) {
        if (!conversation.meetupContext) {
            continue
        }
        state[conversation.id] = createMeetupMachine({
            scheduledAt,
            chatContext: conversation.meetupContext,
        })
    }

    return state
}

function toLocalDateTimeValue(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")

    return `${year}-${month}-${day}T${hours}:${minutes}`
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

function mapClickToLocationLabel(lat: number, lng: number): string {
    return `Punto seleccionado en mapa (${lat.toFixed(5)}, ${lng.toFixed(5)})`
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

type MeetupProposalOverlayProps = {
    conversation: Conversation
    step: ProposalStep
    searchValue: string
    mapCenter: MapPoint
    customPoint: MapPoint | null
    dateTimeValue: string
    selectedPointId: string
    finalPriceValue: string
    paymentMethod: MeetupPaymentMethod | ""
    selectedLocationLabel: string
    onSearchChange: (nextValue: string) => void
    onMapSelect: (lat: number, lng: number) => void
    onDateTimeChange: (nextValue: string) => void
    onSelectPoint: (pointId: string) => void
    onFinalPriceChange: (nextValue: string) => void
    onPaymentMethodChange: (nextValue: MeetupPaymentMethod) => void
    onSearchLocation: () => void
    onStepChange: (nextStep: ProposalStep) => void
    onCancel: () => void
    onBack: () => void
    onNext: () => void
    onSubmit: () => void
}

function MeetupProposalOverlay({
    conversation,
    step,
    searchValue,
    mapCenter,
    customPoint,
    dateTimeValue,
    selectedPointId,
    finalPriceValue,
    paymentMethod,
    selectedLocationLabel,
    onSearchChange,
    onMapSelect,
    onDateTimeChange,
    onSelectPoint,
    onFinalPriceChange,
    onPaymentMethodChange,
    onSearchLocation,
    onStepChange,
    onCancel,
    onBack,
    onNext,
    onSubmit,
}: MeetupProposalOverlayProps) {
    const stepLabels: Array<{ id: ProposalStep; label: string }> = [
        { id: 1, label: "Lugar" },
        { id: 2, label: "Fecha y hora" },
        { id: 3, label: "Pago" },
    ]
    const canContinueStepOne = selectedLocationLabel.trim().length > 0

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#253238]/50 p-0 md:items-center md:p-6 motion-safe:animate-in motion-safe:fade-in-0">
            <section className="flex h-[92vh] w-full max-h-[92vh] flex-col rounded-t-[22px] bg-white p-4 shadow-[0_16px_48px_rgba(37,50,56,0.22)] motion-safe:animate-in motion-safe:slide-in-from-bottom-10 md:h-[86vh] md:max-h-[86vh] md:max-w-[760px] md:rounded-[20px] md:p-5 md:motion-safe:zoom-in-95">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="font-wallie-fit text-[12px] text-[#6E8792]">Proponer queddada</p>
                        <h2 className="font-wallie-chunky text-[20px] text-[#253238]">
                            {conversation.userName}
                        </h2>
                    </div>
                    <button
                        type="button"
                        aria-label="Cerrar configuracion de meetup"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F6F8] text-[#253238]"
                        onClick={onCancel}
                    >
                        <WallapopIcon name="cross" size="small" />
                    </button>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 rounded-[12px] bg-[#F3F6F8] p-2">
                    {stepLabels.map((stepItem) => (
                        <button
                            key={stepItem.id}
                            type="button"
                            onClick={() => onStepChange(stepItem.id)}
                            className={`rounded-[10px] px-3 py-2 text-center font-wallie-fit text-[13px] ${
                                stepItem.id === step
                                    ? "bg-white text-[#253238] shadow-[0_1px_2px_rgba(37,50,56,0.1)]"
                                    : stepItem.id < step
                                      ? "bg-[#E6FAF6] text-[#038673]"
                                      : "text-[#6E8792]"
                            }`}
                        >
                            {stepItem.id}. {stepItem.label}
                        </button>
                    ))}
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                {step === 1 ? (
                    <div className="mt-4 space-y-4">
                        <p className="font-wallie-fit text-[13px] text-[#4A5A63]">
                            Selecciona el punto de encuentro sobre el mapa o usando el buscador.
                        </p>

                        <label className="block">
                            <span className="mb-2 block font-wallie-fit text-[13px] text-[#253238]">
                                Buscar ubicacion
                            </span>
                            <input
                                type="text"
                                value={searchValue}
                                onChange={(event) => onSearchChange(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        event.preventDefault()
                                        onSearchLocation()
                                    }
                                }}
                                placeholder="Ej: estacion, centro comercial, comisaria"
                                className="w-full rounded-[10px] border border-[#D3DEE2] px-3 py-2 font-wallie-fit text-[14px] text-[#253238] outline-none focus:border-[#3DD2BA]"
                            />
                            <button
                                type="button"
                                onClick={onSearchLocation}
                                className="mt-2 rounded-full border border-[#D3DEE2] px-3 py-1.5 font-wallie-fit text-[13px] text-[#253238]"
                            >
                                Buscar en mapa
                            </button>
                        </label>

                        <MeetupLocationMap
                            center={mapCenter}
                            safePoints={safeMeetingPoints}
                            selectedPointId={selectedPointId}
                            selectedCustomPoint={selectedPointId === "custom" ? customPoint : null}
                            onMapClick={onMapSelect}
                            onSafePointClick={onSelectPoint}
                        />

                        {selectedLocationLabel ? (
                            <p className="rounded-[10px] bg-[#F3F6F8] px-3 py-2 font-wallie-fit text-[13px] text-[#253238]">
                                Ubicacion seleccionada: {selectedLocationLabel}
                            </p>
                        ) : null}
                    </div>
                ) : null}

                {step === 2 ? (
                    <div className="mt-4 space-y-4">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                aria-label="Volver al paso anterior"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F6F8] text-[#253238]"
                                onClick={onBack}
                            >
                                <WallapopIcon name="arrow_left" size="small" />
                            </button>
                            <p className="font-wallie-fit text-[13px] text-[#4A5A63]">
                                Selecciona fecha y hora para la quedada.
                            </p>
                        </div>
                        <label className="block">
                            <span className="mb-2 block font-wallie-fit text-[13px] text-[#253238]">
                                Fecha y hora
                            </span>
                            <input
                                type="datetime-local"
                                value={dateTimeValue}
                                min={toLocalDateTimeValue(new Date())}
                                onChange={(event) => onDateTimeChange(event.target.value)}
                                className="w-full rounded-[10px] border border-[#D3DEE2] px-3 py-2 font-wallie-fit text-[14px] text-[#253238] outline-none focus:border-[#3DD2BA]"
                            />
                        </label>
                    </div>
                ) : null}

                {step === 3 ? (
                    <div className="mt-4 space-y-4">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                aria-label="Volver al paso anterior"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F6F8] text-[#253238]"
                                onClick={onBack}
                            >
                                <WallapopIcon name="arrow_left" size="small" />
                            </button>
                            <p className="font-wallie-fit text-[13px] text-[#4A5A63]">
                                Define el pago final y la preferencia de cobro.
                            </p>
                        </div>
                        <label className="block">
                            <span className="mb-2 block font-wallie-fit text-[13px] text-[#253238]">
                                Importe final acordado (EUR)
                            </span>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={finalPriceValue}
                                onChange={(event) => onFinalPriceChange(event.target.value)}
                                placeholder="Ej: 220"
                                className="w-full rounded-[10px] border border-[#D3DEE2] px-3 py-2 font-wallie-fit text-[14px] text-[#253238] outline-none focus:border-[#3DD2BA]"
                            />
                        </label>

                        <fieldset>
                            <legend className="mb-2 font-wallie-fit text-[13px] text-[#253238]">
                                Preferencia de cobro
                            </legend>
                            <div className="grid gap-2 sm:grid-cols-3">
                                {(["CASH", "BIZUM", "WALLET"] as MeetupPaymentMethod[]).map((method) => (
                                    <button
                                        key={method}
                                        type="button"
                                        onClick={() => onPaymentMethodChange(method)}
                                        className={`rounded-[12px] border px-3 py-2 font-wallie-fit text-[13px] ${
                                            paymentMethod === method
                                                ? "border-[#3DD2BA] bg-[#E6FAF6] text-[#253238]"
                                                : "border-[#D3DEE2] bg-white text-[#4A5A63]"
                                        }`}
                                    >
                                        {paymentMethodLabel(method)}
                                    </button>
                                ))}
                            </div>
                        </fieldset>
                    </div>
                ) : null}
                </div>

                <div className="mt-4 flex justify-end gap-2">
                    {step < 3 ? (
                        <>
                        <button
                            type="button"
                            className="rounded-full border border-[#D3DEE2] px-4 py-2 font-wallie-fit text-[14px] text-[#253238]"
                            onClick={onCancel}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className={`rounded-full px-4 py-2 font-wallie-chunky text-[14px] text-white ${
                                step === 1 && !canContinueStepOne
                                    ? "cursor-not-allowed bg-[#B6C4CB]"
                                    : "bg-[#13C1AC]"
                            }`}
                            onClick={onNext}
                            disabled={step === 1 && !canContinueStepOne}
                        >
                            Siguiente
                        </button>
                        </>
                    ) : (
                        <>
                        <button
                            type="button"
                            className="rounded-full border border-[#D3DEE2] px-4 py-2 font-wallie-fit text-[14px] text-[#253238]"
                            onClick={onCancel}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className="rounded-full bg-[#13C1AC] px-4 py-2 font-wallie-chunky text-[14px] text-white"
                            onClick={onSubmit}
                        >
                            Proponer quedada
                        </button>
                        </>
                    )}
                </div>
            </section>
        </div>
    )
}

type InboxPaneProps = {
    selectedConversationId: string
    onSelectConversation: (conversationId: string) => void
    showBottomNav: boolean
}

function InboxPane({
    selectedConversationId,
    onSelectConversation,
    showBottomNav,
}: InboxPaneProps) {
    return (
        <section className="flex h-full min-h-0 flex-col bg-white">
            <div className="border-b border-[#E8ECEF] px-4 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="font-wallie-chunky text-[22px] text-[#253238]">Buzon</h1>
                    <button
                        type="button"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F6F8] text-[#253238]"
                        aria-label="Menu"
                    >
                        <WallapopIcon name="burguer_menu" size="small" />
                    </button>
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
                        avatarSrc={conversation.avatarSrc}
                        unreadCount={conversation.unreadCount}
                        selected={conversation.id === selectedConversationId}
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
    messages: Message[]
    meetup: MeetupMachine | undefined
    onBackToInbox?: () => void
    onSubmitMessage: (value: string) => void
    onMeetupChange: (next: MeetupMachine) => void
    onOpenMeetupProposal: () => void
    onError: (message: string) => void
    errorMessage: string
}

function ConversationPane({
    actorRole,
    conversation,
    messages,
    meetup,
    onBackToInbox,
    onSubmitMessage,
    onMeetupChange,
    onOpenMeetupProposal,
    onError,
    errorMessage,
}: ConversationPaneProps) {
    const currentTime = new Date()
    const proposalActionState = meetup
        ? resolveChatMeetupEntryActionState(meetup, actorRole)
        : null

    return (
        <section className="flex h-full min-h-0 flex-col bg-[#F7FAFB]">
            <header className="flex items-center gap-3 border-b border-[#E8ECEF] bg-white px-4 py-3">
                {onBackToInbox ? (
                    <button
                        type="button"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F6F8] text-[#253238]"
                        aria-label="Volver a conversaciones"
                        onClick={onBackToInbox}
                    >
                        <WallapopIcon name="arrow_left" size="small" />
                    </button>
                ) : null}
                <img
                    src={conversation.avatarSrc ?? productImage}
                    alt={conversation.userName}
                    className="h-11 w-11 rounded-[12px] object-cover"
                />
                <div className="min-w-0">
                    <p className="truncate font-wallie-chunky text-[16px] text-[#253238]">
                        {conversation.userName}
                    </p>
                    <p className="truncate font-wallie-fit text-[13px] text-[#6E8792]">
                        {conversation.itemTitle}
                    </p>
                </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5">
                <div className="space-y-3">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={message.variant === "sent" ? "flex justify-end" : "flex justify-start"}
                        >
                            <ChatMessageBubble
                                variant={message.variant}
                                time={message.time}
                                deliveryState={message.deliveryState}
                            >
                                {message.text}
                            </ChatMessageBubble>
                        </div>
                    ))}
                </div>

                {meetup && meetup.status !== null ? (
                    <div className="mt-5 space-y-4">
                        <MeetupCard
                            meetup={meetup}
                            actorRole={actorRole}
                            currentTime={currentTime}
                            onMeetupChange={onMeetupChange}
                            onError={onError}
                        />
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
                    secondaryActionLabel={proposalActionState?.visible ? "Proponer quedar" : undefined}
                    secondaryActionAriaLabel="Proponer quedar"
                    secondaryActionIconName="calendar"
                    secondaryActionDisabled={!proposalActionState?.enabled}
                    onSecondaryAction={() => {
                        if (!proposalActionState) {
                            return
                        }

                        if (!proposalActionState.enabled) {
                            onError(proposalActionState.message)
                            return
                        }

                        onError("")
                        onOpenMeetupProposal()
                    }}
                />
            </div>
        </section>
    )
}

function WallapopChatWorkspace() {
    const actorRole: ActorRole = "SELLER"
    const [selectedConversationId, setSelectedConversationId] = React.useState<string>(
        conversations[0].id
    )
    const [mobileView, setMobileView] = React.useState<"inbox" | "conversation">("inbox")
    const [messagesByConversation, setMessagesByConversation] = React.useState<
        Record<string, Message[]>
    >(initialMessagesByConversation)
    const [meetupByConversation, setMeetupByConversation] = React.useState<
        Record<string, MeetupMachine>
    >(buildInitialMeetupState)
    const [lastError, setLastError] = React.useState("")
    const [isProposalOverlayOpen, setIsProposalOverlayOpen] = React.useState(false)
    const [proposalStep, setProposalStep] = React.useState<ProposalStep>(1)
    const [proposalSearch, setProposalSearch] = React.useState("")
    const [proposalMapCenter, setProposalMapCenter] = React.useState<MapPoint>({
        lat: safeMeetingPoints[0].lat,
        lng: safeMeetingPoints[0].lng,
    })
    const [proposalCustomPoint, setProposalCustomPoint] = React.useState<MapPoint | null>(null)
    const [proposalScheduledAt, setProposalScheduledAt] = React.useState("")
    const [proposalPointId, setProposalPointId] = React.useState("")
    const [proposalCustomLocationLabel, setProposalCustomLocationLabel] = React.useState("")
    const [proposalFinalPrice, setProposalFinalPrice] = React.useState("")
    const [proposalPaymentMethod, setProposalPaymentMethod] = React.useState<
        MeetupPaymentMethod | ""
    >("")

    const selectedConversation = React.useMemo(
        () => conversations.find((conversation) => conversation.id === selectedConversationId),
        [selectedConversationId]
    )

    const selectedMessages = selectedConversation
        ? (messagesByConversation[selectedConversation.id] ?? [])
        : []
    const selectedMeetup = selectedConversation
        ? meetupByConversation[selectedConversation.id]
        : undefined

    React.useEffect(() => {
        if (!selectedMeetup) {
            setProposalStep(1)
            setProposalSearch("")
            setProposalMapCenter({ lat: safeMeetingPoints[0].lat, lng: safeMeetingPoints[0].lng })
            setProposalCustomPoint(null)
            setProposalScheduledAt("")
            setProposalPointId("")
            setProposalCustomLocationLabel("")
            setProposalFinalPrice("")
            setProposalPaymentMethod("")
            setIsProposalOverlayOpen(false)
            return
        }

        setProposalScheduledAt(toLocalDateTimeValue(selectedMeetup.scheduledAt))
        const matchingPoint = safeMeetingPoints.find(
            (point) => point.name === selectedMeetup.proposedLocation
        )
        const initialPoint = matchingPoint?.id ?? (selectedMeetup.proposedLocation ? "custom" : "")
        setProposalPointId(initialPoint)
        if (matchingPoint) {
            setProposalMapCenter({ lat: matchingPoint.lat, lng: matchingPoint.lng })
            setProposalCustomPoint(null)
            setProposalCustomLocationLabel("")
        } else if (selectedMeetup.proposedLocation) {
            setProposalCustomLocationLabel(selectedMeetup.proposedLocation)
            setProposalCustomPoint({ lat: safeMeetingPoints[0].lat, lng: safeMeetingPoints[0].lng })
        } else {
            setProposalCustomLocationLabel("")
            setProposalCustomPoint(null)
        }
        setProposalFinalPrice(
            selectedMeetup.finalPrice !== undefined ? String(selectedMeetup.finalPrice) : ""
        )
        setProposalPaymentMethod(selectedMeetup.proposedPaymentMethod ?? "")
    }, [selectedConversationId, selectedMeetup])

    if (!selectedConversation) {
        return null
    }

    const openConversation = (conversationId: string) => {
        setSelectedConversationId(conversationId)
        setLastError("")
        setMobileView("conversation")
    }

    const appendOutgoingMessage = (text: string) => {
        const nextMessage: Message = {
            id: `m-${Date.now()}`,
            text,
            variant: "sent",
            time: formatTime(new Date()),
            deliveryState: "sent",
        }

        setMessagesByConversation((previous) => ({
            ...previous,
            [selectedConversation.id]: [...(previous[selectedConversation.id] ?? []), nextMessage],
        }))
    }

    const updateSelectedMeetup = (next: MeetupMachine) => {
        setMeetupByConversation((previous) => ({
            ...previous,
            [selectedConversation.id]: next,
        }))
    }

    const openMeetupProposal = () => {
        if (!selectedMeetup) {
            return
        }

        setProposalStep(1)
        setProposalSearch("")
        setProposalMapCenter({ lat: safeMeetingPoints[0].lat, lng: safeMeetingPoints[0].lng })
        setProposalCustomPoint(null)
        setProposalScheduledAt(toLocalDateTimeValue(selectedMeetup.scheduledAt))
        const matchingPoint = safeMeetingPoints.find(
            (point) => point.name === selectedMeetup.proposedLocation
        )
        const initialPoint = matchingPoint?.id ?? (selectedMeetup.proposedLocation ? "custom" : "")
        setProposalPointId(initialPoint)
        if (matchingPoint) {
            setProposalMapCenter({ lat: matchingPoint.lat, lng: matchingPoint.lng })
            setProposalCustomLocationLabel("")
            setProposalCustomPoint(null)
        } else if (selectedMeetup.proposedLocation) {
            setProposalCustomLocationLabel(selectedMeetup.proposedLocation)
            setProposalCustomPoint({ lat: safeMeetingPoints[0].lat, lng: safeMeetingPoints[0].lng })
        } else {
            setProposalCustomLocationLabel("")
            setProposalCustomPoint(null)
        }
        setProposalFinalPrice(
            selectedMeetup.finalPrice !== undefined ? String(selectedMeetup.finalPrice) : ""
        )
        setProposalPaymentMethod(selectedMeetup.proposedPaymentMethod ?? "")
        setIsProposalOverlayOpen(true)
    }

    const closeMeetupProposal = () => {
        setIsProposalOverlayOpen(false)
    }

    const selectPointFromMap = (lat: number, lng: number) => {
        setProposalPointId("custom")
        setProposalCustomPoint({ lat, lng })
        setProposalMapCenter({ lat, lng })
        setProposalCustomLocationLabel(mapClickToLocationLabel(lat, lng))
    }

    const selectSafePoint = (pointId: string) => {
        setProposalPointId(pointId)
        const selected = safeMeetingPoints.find((point) => point.id === pointId)
        if (!selected) {
            return
        }
        setProposalMapCenter({ lat: selected.lat, lng: selected.lng })
        setProposalCustomPoint(null)
        setProposalCustomLocationLabel("")
    }

    const searchLocationOnMap = async () => {
        const query = proposalSearch.trim()
        if (!query) {
            return
        }

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`
            )
            if (!response.ok) {
                setLastError("No se pudo buscar la ubicacion ahora mismo.")
                return
            }
            const data = (await response.json()) as Array<{ lat: string; lon: string; display_name: string }>
            if (data.length === 0) {
                setLastError("No se encontraron resultados para esa busqueda.")
                return
            }
            const lat = Number.parseFloat(data[0].lat)
            const lng = Number.parseFloat(data[0].lon)
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                setLastError("Resultado de busqueda invalido.")
                return
            }
            setProposalPointId("custom")
            setProposalCustomPoint({ lat, lng })
            setProposalMapCenter({ lat, lng })
            setProposalCustomLocationLabel(data[0].display_name)
            setLastError("")
        } catch {
            setLastError("No se pudo buscar la ubicacion. Reintenta.")
        }
    }

    const goToNextProposalStep = () => {
        if (proposalStep === 1) {
            if (proposalPointId.trim().length === 0) {
                setLastError("Selecciona un punto de encuentro en el mapa.")
                return
            }
            setLastError("")
            setProposalStep(2)
            return
        }

        if (proposalStep === 2) {
            const scheduledAt = parseLocalDateTimeValue(proposalScheduledAt)
            if (!scheduledAt) {
                setLastError("Selecciona una fecha y hora validas para continuar.")
                return
            }
            setLastError("")
            setProposalStep(3)
        }
    }

    const goToPreviousProposalStep = () => {
        setProposalStep((previous) => (previous > 1 ? ((previous - 1) as ProposalStep) : previous))
    }

    const goToProposalStep = (nextStep: ProposalStep) => {
        setProposalStep(nextStep)
    }

    const selectedLocationLabel = React.useMemo(() => {
        const selectedPoint = safeMeetingPoints.find((point) => point.id === proposalPointId)
        if (selectedPoint) {
            return `${selectedPoint.name} (Punto seguro)`
        }
        if (proposalPointId === "custom" && proposalCustomLocationLabel) {
            return proposalCustomLocationLabel
        }
        return ""
    }, [proposalCustomLocationLabel, proposalPointId])

    const confirmMeetupProposal = () => {
        if (!selectedMeetup) {
            setLastError("No existe contexto de meetup en esta conversacion.")
            return
        }

        const scheduledAt = parseLocalDateTimeValue(proposalScheduledAt)
        if (!scheduledAt) {
            setLastError("Selecciona una fecha y hora validas para la propuesta.")
            return
        }

        const selectedPoint = safeMeetingPoints.find((point) => point.id === proposalPointId)
        const resolvedLocation =
            selectedPoint?.name ??
            (proposalPointId === "custom" ? proposalCustomLocationLabel : "")

        if (!resolvedLocation) {
            setLastError("Selecciona un punto de encuentro seguro.")
            return
        }

        const parsedFinalPrice = Number.parseFloat(proposalFinalPrice)
        if (!Number.isFinite(parsedFinalPrice) || parsedFinalPrice <= 0) {
            setLastError("Introduce un precio final valido mayor que cero.")
            return
        }
        if (!proposalPaymentMethod) {
            setLastError("Selecciona una preferencia de cobro para la propuesta.")
            return
        }

        const eligibility = resolveChatMeetupEntryActionState(selectedMeetup, actorRole)
        if (!eligibility.enabled) {
            setLastError(eligibility.message)
            return
        }

        const result = transitionMeetup(
            {
                ...selectedMeetup,
                scheduledAt,
                proposedLocation: resolvedLocation,
                finalPrice: Number(parsedFinalPrice.toFixed(2)),
                proposedPaymentMethod: proposalPaymentMethod,
            },
            {
                type: "PROPOSE",
                actorRole,
                occurredAt: new Date(),
            }
        )

        if (!result.ok) {
            setLastError(result.reason)
            return
        }

        updateSelectedMeetup(result.meetup)
        setLastError("")
        setProposalStep(1)
        setIsProposalOverlayOpen(false)
    }

    return (
        <main className="mx-auto h-[100dvh] w-full max-w-[1200px] bg-white">
            <section className="hidden h-full overflow-hidden border-x border-[#D3DEE2] md:grid md:grid-cols-[360px_1fr]">
                <div className="min-h-0 border-r border-[#E8ECEF]">
                    <InboxPane
                        selectedConversationId={selectedConversationId}
                        onSelectConversation={openConversation}
                        showBottomNav={false}
                    />
                </div>
                <div className="min-h-0">
                    <ConversationPane
                        actorRole={actorRole}
                        conversation={selectedConversation}
                        messages={selectedMessages}
                        meetup={selectedMeetup}
                        onSubmitMessage={appendOutgoingMessage}
                        onMeetupChange={updateSelectedMeetup}
                        onOpenMeetupProposal={openMeetupProposal}
                        onError={setLastError}
                        errorMessage={lastError}
                    />
                </div>
            </section>

            <section className="h-full md:hidden">
                {mobileView === "inbox" ? (
                    <InboxPane
                        selectedConversationId={selectedConversationId}
                        onSelectConversation={openConversation}
                        showBottomNav={true}
                    />
                ) : (
                    <ConversationPane
                        actorRole={actorRole}
                        conversation={selectedConversation}
                        messages={selectedMessages}
                        meetup={selectedMeetup}
                        onBackToInbox={() => setMobileView("inbox")}
                        onSubmitMessage={appendOutgoingMessage}
                        onMeetupChange={updateSelectedMeetup}
                        onOpenMeetupProposal={openMeetupProposal}
                        onError={setLastError}
                        errorMessage={lastError}
                    />
                )}
            </section>

            {isProposalOverlayOpen && selectedMeetup ? (
                <MeetupProposalOverlay
                    conversation={selectedConversation}
                    step={proposalStep}
                    searchValue={proposalSearch}
                    mapCenter={proposalMapCenter}
                    customPoint={proposalCustomPoint}
                    dateTimeValue={proposalScheduledAt}
                    selectedPointId={proposalPointId}
                    finalPriceValue={proposalFinalPrice}
                    paymentMethod={proposalPaymentMethod}
                    selectedLocationLabel={selectedLocationLabel}
                    onSearchChange={setProposalSearch}
                    onSearchLocation={searchLocationOnMap}
                    onMapSelect={selectPointFromMap}
                    onDateTimeChange={setProposalScheduledAt}
                    onSelectPoint={selectSafePoint}
                    onFinalPriceChange={setProposalFinalPrice}
                    onPaymentMethodChange={setProposalPaymentMethod}
                    onStepChange={goToProposalStep}
                    onCancel={closeMeetupProposal}
                    onBack={goToPreviousProposalStep}
                    onNext={goToNextProposalStep}
                    onSubmit={confirmMeetupProposal}
                />
            ) : null}
        </main>
    )
}

export { WallapopChatWorkspace }
