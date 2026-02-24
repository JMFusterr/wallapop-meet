import { navigateTo } from "@/lib/navigation"

function DesignSystemDevLink() {
    if (!import.meta.env.DEV) {
        return null
    }

    if (window.location.pathname === "/design-system") {
        return null
    }

    return (
        <button
            type="button"
            className="fixed right-5 bottom-4 z-50 hidden text-xs text-[#253238]/45 underline decoration-[#253238]/25 underline-offset-2 transition-colors hover:text-[#253238]/70 lg:block"
            onClick={() => navigateTo("/design-system")}
        >
            Design System
        </button>
    )
}

export { DesignSystemDevLink }
