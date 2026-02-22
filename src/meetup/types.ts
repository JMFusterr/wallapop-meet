export const MEETUP_STATUSES = [
    "PROPOSED",
    "COUNTER_PROPOSED",
    "CONFIRMED",
    "ARRIVED",
    "COMPLETED",
    "EXPIRED",
    "CANCELLED",
] as const

export type MeetupStatus = (typeof MEETUP_STATUSES)[number]

export type ActorRole = "SELLER" | "BUYER"
export type MeetupPaymentMethod = "CASH" | "BIZUM" | "WALLET"

export type MeetupChatContext = {
    conversationId: string
    listingId: string
    sellerUserId: string
    buyerUserId: string
}

export type CreateMeetupMachineInput = {
    scheduledAt: Date
    chatContext: MeetupChatContext
}

export type MeetupMachine = {
    status: MeetupStatus | null
    scheduledAt: Date
    proposedLocation?: string
    proposedLocationLat?: number
    proposedLocationLng?: number
    finalPrice?: number
    proposedPaymentMethod?: MeetupPaymentMethod
    chatContext: MeetupChatContext
    proposedAt?: Date
    confirmedAt?: Date
    arrivedAt?: Date
    completedAt?: Date
    expiredAt?: Date
    cancelledAt?: Date
}

export type MeetupEvent =
    | { type: "PROPOSE"; actorRole: ActorRole; occurredAt?: Date }
    | { type: "COUNTER_PROPOSE"; actorRole: ActorRole; occurredAt?: Date }
    | { type: "ACCEPT"; actorRole: ActorRole; occurredAt?: Date }
    | { type: "MARK_ARRIVED"; actorRole: ActorRole; occurredAt: Date }
    | { type: "COMPLETE"; actorRole: ActorRole; occurredAt?: Date }
    | { type: "CANCEL"; actorRole: ActorRole; occurredAt?: Date }
    | { type: "EXPIRE"; occurredAt?: Date }

export type TransitionSuccess = {
    ok: true
    meetup: MeetupMachine
}

export type TransitionFailure = {
    ok: false
    reason: string
}

export type TransitionResult = TransitionSuccess | TransitionFailure
