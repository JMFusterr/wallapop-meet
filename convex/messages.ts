import { v } from "convex/values"

import { mutation, query } from "./_generated/server"

export const saveUserTextMessage = mutation({
    args: {
        conversationId: v.string(),
        clientMessageId: v.string(),
        senderUserId: v.string(),
        text: v.string(),
        time: v.string(),
        deliveryState: v.optional(v.union(v.literal("sent"), v.literal("read"))),
        createdAt: v.number(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("chatMessages")
            .withIndex("by_client_message_id", (q) => q.eq("clientMessageId", args.clientMessageId))
            .first()

        if (existing) {
            return existing._id
        }

        return await ctx.db.insert("chatMessages", args)
    },
})

export const listByConversation = query({
    args: {
        conversationId: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("chatMessages")
            .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
            .collect()
    },
})
