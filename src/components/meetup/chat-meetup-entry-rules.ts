import type { ActorRole, MeetupMachine } from "@/meetup/types"

export type ChatMeetupEntryActionState = {
    visible: boolean
    enabled: boolean
    message: string
}

export function resolveChatMeetupEntryActionState(
    meetup: MeetupMachine,
    actorRole: ActorRole
): ChatMeetupEntryActionState {
    if (meetup.status !== null) {
        return {
            visible: false,
            enabled: false,
            message: "Ya existe una propuesta activa en este chat.",
        }
    }

    if (actorRole !== "SELLER") {
        return {
            visible: true,
            enabled: false,
            message: "Solo el vendedor puede iniciar una propuesta de meetup.",
        }
    }

    return {
        visible: true,
        enabled: true,
        message: "Inicia la propuesta desde esta conversación con el comprador.",
    }
}

