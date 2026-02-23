const CHAT_USER_ID_STORAGE_KEY = "wm_chat_user_id"

function buildFallbackUserId(): string {
    return `user-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function getOrCreateLocalChatUserId(): string {
    if (typeof window === "undefined") {
        return buildFallbackUserId()
    }

    const current = window.localStorage.getItem(CHAT_USER_ID_STORAGE_KEY)
    if (current && current.trim().length > 0) {
        return current
    }

    const generated =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : buildFallbackUserId()

    window.localStorage.setItem(CHAT_USER_ID_STORAGE_KEY, generated)
    return generated
}
