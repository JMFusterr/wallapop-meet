import { describe, expect, it } from "vitest"

import {
    buildReverseGeocodeUrl,
    resolveProposalScheduledAtValue,
    shouldApplyReverseGeocodeResult,
} from "@/components/meetup/wallapop-chat-workspace-utils"
import { createMeetupMachine } from "@/meetup"
import type { MeetupChatContext } from "@/meetup/types"

describe("wallapop chat workspace utils", () => {
    const chatContext: MeetupChatContext = {
        conversationId: "conv-utils-001",
        listingId: "listing-utils-001",
        sellerUserId: "user-seller-utils-001",
        buyerUserId: "user-buyer-utils-001",
    }

    it("preload scheduledAt as local datetime value for proposal overlay", () => {
        const scheduledAt = new Date("2026-02-20T18:45:00.000Z")
        const meetup = createMeetupMachine({ scheduledAt, chatContext })

        const value = resolveProposalScheduledAtValue(meetup)

        expect(value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
        expect(new Date(value).getTime()).toBe(meetup.scheduledAt.getTime())
    })

    it("build reverse geocode URL with encoded coordinates", () => {
        const url = buildReverseGeocodeUrl({ lat: 41.37617, lng: 2.14918 })

        expect(url).toContain("nominatim.openstreetmap.org/reverse")
        expect(url).toContain("format=jsonv2")
        expect(url).toContain("lat=41.37617")
        expect(url).toContain("lon=2.14918")
    })

    it("apply reverse geocode result only when request is latest and point still matches", () => {
        const shouldApply = shouldApplyReverseGeocodeResult({
            requestId: 2,
            latestRequestId: 2,
            requestedPoint: { lat: 41.37617, lng: 2.14918 },
            currentPoint: { lat: 41.37617, lng: 2.14918 },
            responseAddress: "Gran Via de les Corts Catalanes, 373, Barcelona",
        })

        expect(shouldApply).toBe(true)
    })

    it("ignore reverse geocode result when request is stale", () => {
        const shouldApply = shouldApplyReverseGeocodeResult({
            requestId: 1,
            latestRequestId: 2,
            requestedPoint: { lat: 41.37617, lng: 2.14918 },
            currentPoint: { lat: 41.37617, lng: 2.14918 },
            responseAddress: "Gran Via de les Corts Catalanes, 373, Barcelona",
        })

        expect(shouldApply).toBe(false)
    })

    it("ignore reverse geocode result when selected point changed", () => {
        const shouldApply = shouldApplyReverseGeocodeResult({
            requestId: 2,
            latestRequestId: 2,
            requestedPoint: { lat: 41.37617, lng: 2.14918 },
            currentPoint: { lat: 41.38762, lng: 2.13441 },
            responseAddress: "Gran Via de les Corts Catalanes, 373, Barcelona",
        })

        expect(shouldApply).toBe(false)
    })
})
