import { Button } from "@/components/ui/button"
import { getArrivalWindow } from "@/meetup/arrival-window"
import type { MeetupMachine } from "@/meetup/types"

import { resolveArrivalActionState, resolveMeetupDayBannerVariant } from "@/components/meetup/meetup-ui-rules"

type MeetupDayBannerProps = {
    meetup: MeetupMachine
    currentTime: Date
    onNavigate?: () => void
    onMarkArrived?: () => void
}

function MeetupDayBanner({
    meetup,
    currentTime,
    onNavigate,
    onMarkArrived,
}: MeetupDayBannerProps) {
    const variant = resolveMeetupDayBannerVariant(meetup, currentTime)
    const arrivalAction = resolveArrivalActionState(meetup, currentTime)
    const { opensAt, closesAt } = getArrivalWindow(meetup.scheduledAt)

    const containerClassName =
        variant === "expired"
            ? "border-[#F6C1C5] bg-[#FFF2F3]"
            : variant === "arrival_window"
              ? "border-[#99E6D9] bg-[#E9FAF7]"
              : "border-[#D3DEE2] bg-[#F5F7F8]"

    return (
        <section
            className={`rounded-[12px] border px-4 py-3 ${containerClassName}`}
            aria-label="Banner meetup del dia"
        >
            <p className="font-wallie-fit text-[12px] text-[#4A5A63]">Meetup del dia</p>
            <p className="font-wallie-fit text-[14px] text-[#253238]">
                Hora pactada: {meetup.scheduledAt.toLocaleString()}
            </p>
            <p className="font-wallie-fit text-[12px] text-[#4A5A63]">
                Ventana de llegada: {opensAt.toLocaleTimeString()} - {closesAt.toLocaleTimeString()}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="inline_action" size="sm" onClick={onNavigate}>
                    Ver detalles
                </Button>
                {meetup.status === "CONFIRMED" ? (
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={onMarkArrived}
                        disabled={!arrivalAction.enabled}
                    >
                        I'm here
                    </Button>
                ) : null}
            </div>

            <p className="mt-2 font-wallie-fit text-[12px] text-[#4A5A63]">{arrivalAction.message}</p>
        </section>
    )
}

export { MeetupDayBanner }
