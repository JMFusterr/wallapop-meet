export const NAVIGATION_EVENT_NAME = "wm:navigate"

export function navigateTo(pathname: string): void {
    if (window.location.pathname === pathname) {
        return
    }

    window.history.pushState({}, "", pathname)
    window.dispatchEvent(new Event(NAVIGATION_EVENT_NAME))
}
