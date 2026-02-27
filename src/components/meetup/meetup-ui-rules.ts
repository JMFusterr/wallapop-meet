import { isWithinArrivalWindow } from "@/meetup/arrival-window"
import type { ActorRole, MeetupMachine } from "@/meetup/types"

type ArrivalActionState = {
    enabled: boolean
    message: string
}

type MeetupDayBannerVariant = "hidden" | "upcoming" | "in_window"

export function resolveArrivalActionState(
    meetup: MeetupMachine,
    currentTime: Date,
    actorRole?: ActorRole
): ArrivalActionState {
    if (meetup.status !== "CONFIRMED" && meetup.status !== "ARRIVED") {
        return {
            enabled: false,
            message: "La accion de llegada solo aplica a meetups confirmados o en curso.",
        }
    }

    const inWindow = isWithinArrivalWindow(meetup.scheduledAt, currentTime)
    if (!inWindow) {
        return {
            enabled: false,
            message: "",
        }
    }

    if (actorRole && meetup.arrivalCheckins?.[actorRole]) {
        return {
            enabled: false,
            message: "Ya has marcado que has llegado.",
        }
    }

    return {
        enabled: true,
        message:
            "Acercate a menos de 100 metros del punto de encuentro para indicar que has llegado.",
    }
}

export function resolveMeetupDayBannerVariant(
    meetup: MeetupMachine,
    currentTime: Date
): MeetupDayBannerVariant {
    if (meetup.status !== "CONFIRMED" && meetup.status !== "ARRIVED") {
        return "hidden"
    }

    return isWithinArrivalWindow(meetup.scheduledAt, currentTime)
        ? "in_window"
        : "upcoming"
}
