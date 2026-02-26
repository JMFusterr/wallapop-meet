import type { MeetupStatus } from "@/meetup/types"

const ORDERED_STATUSES: MeetupStatus[] = [
    "PROPOSED",
    "COUNTER_PROPOSED",
    "CONFIRMED",
    "ARRIVED",
    "COMPLETED",
    "EXPIRED",
    "CANCELLED",
]

const FINAL_STATUSES: MeetupStatus[] = ["COMPLETED", "EXPIRED", "CANCELLED"]

type MeetupTimelineProps = {
    currentStatus: MeetupStatus | null
}

function getStepAppearance(
    step: MeetupStatus,
    currentStatus: MeetupStatus | null
): "pending" | "active" | "done" | "terminal" {
    if (!currentStatus) {
        return "pending"
    }

    if (step === currentStatus) {
        return FINAL_STATUSES.includes(step) ? "terminal" : "active"
    }

    const stepIndex = ORDERED_STATUSES.indexOf(step)
    const currentIndex = ORDERED_STATUSES.indexOf(currentStatus)

    if (stepIndex >= 0 && currentIndex >= 0 && stepIndex < currentIndex) {
        return "done"
    }

    return "pending"
}

const stepClassName: Record<
    ReturnType<typeof getStepAppearance>,
    { dot: string; text: string }
> = {
    pending: {
        dot: "bg-[var(--border-strong)]",
        text: "text-[var(--text-secondary)]",
    },
    active: {
        dot: "bg-[var(--action-primary)]",
        text: "text-[var(--text-primary)]",
    },
    done: {
        dot: "bg-[var(--text-primary)]",
        text: "text-[var(--text-primary)]",
    },
    terminal: {
        dot: "bg-[var(--feedback-error)]",
        text: "text-[var(--text-primary)]",
    },
}

function MeetupTimeline({ currentStatus }: MeetupTimelineProps) {
    return (
        <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2" aria-label="Meetup timeline">
            {ORDERED_STATUSES.map((step) => {
                const appearance = getStepAppearance(step, currentStatus)
                const styles = stepClassName[appearance]
                return (
                    <li key={step} className="flex items-center gap-2">
                        <span
                            aria-hidden="true"
                            className={`inline-block size-2.5 rounded-full ${styles.dot}`}
                        />
                        <span className={`font-wallie-fit text-[13px] leading-5 ${styles.text}`}>
                            {step}
                        </span>
                    </li>
                )
            })}
        </ol>
    )
}

export { MeetupTimeline }
