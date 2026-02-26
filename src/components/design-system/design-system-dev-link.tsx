import { navigateTo } from "@/lib/navigation"

function DesignSystemDevLink() {
    if (window.location.pathname === "/design-system") {
        return null
    }

    return (
        <button
            type="button"
            className="fixed right-5 bottom-4 z-50 hidden text-xs text-[color:var(--text-primary)]/45 underline decoration-[var(--text-primary)]/25 underline-offset-2 transition-colors hover:text-[color:var(--text-primary)]/70 lg:block"
            onClick={() => navigateTo("/design-system")}
        >
            Design System
        </button>
    )
}

export { DesignSystemDevLink }

