import { ConvexHttpClient } from "convex/browser"

const convexUrl = import.meta.env.VITE_CONVEX_URL

let convexHttpClient: ConvexHttpClient | null = null

export function getConvexHttpClient(): ConvexHttpClient | null {
    if (!convexUrl) {
        return null
    }

    if (!convexHttpClient) {
        convexHttpClient = new ConvexHttpClient(convexUrl)
    }

    return convexHttpClient
}
