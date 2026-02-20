import { isWithinArrivalWindow } from "@/meetup/arrival-window"
import type { MeetupMachine } from "@/meetup/types"

type ArrivalActionState = {
    enabled: boolean
    message: string
}

export function resolveArrivalActionState(
    meetup: MeetupMachine,
    currentTime: Date
): ArrivalActionState {
    if (meetup.status !== "CONFIRMED") {
        return {
            enabled: false,
            message: "La accion de llegada solo aplica a meetups confirmados.",
        }
    }

    const inWindow = isWithinArrivalWindow(meetup.scheduledAt, currentTime)
    if (inWindow) {
        return {
            enabled: true,
            message: "Ya puedes marcar que has llegado.",
        }
    }

    return {
        enabled: false,
        message: "Disponible entre 15 minutos antes y 2 horas despues de la cita.",
    }
}

export function resolveMeetupDayBannerVariant(
    meetup: MeetupMachine,
    currentTime: Date
): "default" | "arrival_window" | "expired" {
    if (meetup.status === "EXPIRED") {
        return "expired"
    }

    if (
        meetup.status === "CONFIRMED" &&
        isWithinArrivalWindow(meetup.scheduledAt, currentTime)
    ) {
        return "arrival_window"
    }

    return "default"
}
