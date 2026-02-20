import * as React from "react"

import { ChatMeetupEntry } from "@/components/meetup/chat-meetup-entry"
import { MeetupCard } from "@/components/meetup/meetup-card"
import { ChatComposer } from "@/components/ui/chat-composer"
import { ChatListItem } from "@/components/ui/chat-list-item"
import { ChatMessageBubble } from "@/components/ui/chat-message-bubble"
import { ChatSecurityBanner } from "@/components/ui/chat-security-banner"
import { InboxBottomNav } from "@/components/ui/inbox-bottom-nav"
import { WallapopIcon } from "@/components/ui/wallapop-icon"
import { createMeetupMachine } from "@/meetup"
import type { ActorRole, MeetupChatContext, MeetupMachine } from "@/meetup/types"
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
    onError,
    errorMessage,
}: ConversationPaneProps) {
    const currentTime = new Date()

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
                <ChatSecurityBanner
                    message="Mantente en Wallapop para una compraventa segura."
                    linkText="Mas informacion"
                />

                <div className="mt-5 space-y-3">
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

                {meetup ? (
                    <div className="mt-5 space-y-4">
                        <ChatMeetupEntry
                            meetup={meetup}
                            actorRole={actorRole}
                            currentTime={currentTime}
                            onMeetupChange={onMeetupChange}
                            onError={onError}
                        />

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

            {/* TODO: cuando se implemente "Proponer quedar", anadir CTA dedicado en composer y abrir overlay de configuracion. */}
            <ChatComposer onSubmit={onSubmitMessage} />
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

    const selectedConversation = React.useMemo(
        () => conversations.find((conversation) => conversation.id === selectedConversationId),
        [selectedConversationId]
    )

    if (!selectedConversation) {
        return null
    }

    const selectedMessages = messagesByConversation[selectedConversation.id] ?? []
    const selectedMeetup = meetupByConversation[selectedConversation.id]

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
                        onError={setLastError}
                        errorMessage={lastError}
                    />
                )}
            </section>
        </main>
    )
}

export { WallapopChatWorkspace }
