import { isWithinArrivalWindow } from "@/meetup/arrival-window"
import type { ActorRole, MeetupMachine } from "@/meetup/types"

type ArrivalActionState = {
    enabled: boolean
    message: string
}

type MeetupDayBannerVariant = "hidden" | "upcoming" | "in_window"
type MeetupCardCtaId =
    | "propose"
    | "edit"
    | "accept"
    | "counter"
    | "reject"
    | "accept-counter"
    | "repropose"
    | "arrived"
    | "calendar"
    | "complete"
    | "no-show"
    | "cancel"

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

export function resolveMeetupCardCtaIds(params: {
    meetup: MeetupMachine
    currentTime: Date
    actorRole: ActorRole
    hasEditProposalAction: boolean
}): MeetupCardCtaId[] {
    const { meetup, currentTime, actorRole, hasEditProposalAction } = params
    const actionIds: MeetupCardCtaId[] = []
    const inArrivalWindow = isWithinArrivalWindow(meetup.scheduledAt, currentTime)
    const arrivalAction = resolveArrivalActionState(meetup, currentTime, actorRole)

    if (meetup.status === null && actorRole === "SELLER") {
        actionIds.push("propose")
    }

    if (meetup.status === "PROPOSED" && actorRole === "BUYER") {
        actionIds.push("accept", "counter", "reject")
    }

    if (meetup.status === "COUNTER_PROPOSED" && actorRole === "SELLER") {
        actionIds.push("accept-counter", "repropose")
    }

    if (meetup.status === "CONFIRMED") {
        actionIds.push(inArrivalWindow ? "arrived" : "calendar")
    }

    if (meetup.status === "ARRIVED") {
        if (arrivalAction.enabled) {
            actionIds.push("arrived")
        }
        if (actorRole === "SELLER") {
            actionIds.push("complete", "no-show")
        }
    }

    const canShowCancel =
        meetup.status !== "COMPLETED" &&
        meetup.status !== "CANCELLED" &&
        meetup.status !== null &&
        !(meetup.status === "ARRIVED" && actorRole === "SELLER") &&
        !(meetup.status === "PROPOSED" && actorRole === "BUYER")

    if (canShowCancel) {
        actionIds.push("cancel")
    }

    const canEditProposal =
        hasEditProposalAction &&
        actorRole === "SELLER" &&
        (meetup.status === "PROPOSED" || meetup.status === "COUNTER_PROPOSED")

    if (canEditProposal) {
        actionIds.unshift("edit")
    }

    return actionIds
}

export type { MeetupCardCtaId }
