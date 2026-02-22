import type { MeetupMachine } from "@/meetup/types"

type MapPoint = {
    lat: number
    lng: number
}

type ShouldApplyReverseGeocodeResultInput = {
    requestId: number
    latestRequestId: number
    requestedPoint: MapPoint
    currentPoint: MapPoint | null
    responseAddress: string | undefined
}

export function resolveProposalScheduledAtValue(meetup: MeetupMachine): string {
    const year = meetup.scheduledAt.getFullYear()
    const month = String(meetup.scheduledAt.getMonth() + 1).padStart(2, "0")
    const day = String(meetup.scheduledAt.getDate()).padStart(2, "0")
    const hours = String(meetup.scheduledAt.getHours()).padStart(2, "0")
    const minutes = String(meetup.scheduledAt.getMinutes()).padStart(2, "0")

    return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function buildReverseGeocodeUrl(point: MapPoint): string {
    const lat = encodeURIComponent(String(point.lat))
    const lng = encodeURIComponent(String(point.lng))
    return `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
}

function arePointsEquivalent(first: MapPoint, second: MapPoint): boolean {
    const epsilon = 0.00001
    return (
        Math.abs(first.lat - second.lat) <= epsilon &&
        Math.abs(first.lng - second.lng) <= epsilon
    )
}

export function shouldApplyReverseGeocodeResult({
    requestId,
    latestRequestId,
    requestedPoint,
    currentPoint,
    responseAddress,
}: ShouldApplyReverseGeocodeResultInput): boolean {
    if (requestId !== latestRequestId) {
        return false
    }
    if (!currentPoint) {
        return false
    }
    if (!responseAddress || responseAddress.trim().length === 0) {
        return false
    }
    return arePointsEquivalent(requestedPoint, currentPoint)
}
