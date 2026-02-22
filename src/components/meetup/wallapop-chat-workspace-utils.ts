import type { MeetupMachine } from "@/meetup/types"

export function resolveProposalScheduledAtValue(meetup: MeetupMachine): string {
    const year = meetup.scheduledAt.getFullYear()
    const month = String(meetup.scheduledAt.getMonth() + 1).padStart(2, "0")
    const day = String(meetup.scheduledAt.getDate()).padStart(2, "0")
    const hours = String(meetup.scheduledAt.getHours()).padStart(2, "0")
    const minutes = String(meetup.scheduledAt.getMinutes()).padStart(2, "0")

    return `${year}-${month}-${day}T${hours}:${minutes}`
}
