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
    if (actorRole !== "SELLER") {
        return {
            visible: false,
            enabled: false,
            message: "Solo el vendedor puede iniciar una propuesta de meetup.",
        }
    }

    if (meetup.status === null || meetup.status === "CANCELLED") {
        return {
            visible: true,
            enabled: true,
            message: "Inicia la propuesta desde esta conversacion con el comprador.",
        }
    }

    return {
        visible: false,
        enabled: false,
        message: "Ya existe una propuesta activa en este chat.",
    }
}
