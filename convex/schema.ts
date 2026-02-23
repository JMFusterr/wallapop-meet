import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
    chatMessages: defineTable({
        conversationId: v.string(),
        clientMessageId: v.string(),
        senderUserId: v.optional(v.string()),
        text: v.string(),
        variant: v.optional(v.union(v.literal("sent"), v.literal("received"))),
        time: v.string(),
        deliveryState: v.optional(v.union(v.literal("sent"), v.literal("read"))),
        createdAt: v.number(),
    })
        .index("by_conversation", ["conversationId"])
        .index("by_client_message_id", ["clientMessageId"]),
})
