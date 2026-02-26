import { WallapopIcon } from "@/components/ui/wallapop-icon"

type MeetupWizardStepHeadingProps = {
  caption: string
  title?: string
  onBack: () => void
}

function MeetupWizardStepHeading({
  caption,
  title,
  onBack,
}: MeetupWizardStepHeadingProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Volver al paso anterior"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-surface)] text-[var(--text-primary)]"
          onClick={onBack}
        >
          <WallapopIcon name="arrow_left" size="small" />
        </button>
        <span className="font-wallie-fit text-[13px] text-[var(--text-secondary)]">{caption}</span>
      </div>
      {title ? (
        <h3 className="font-wallie-chunky text-[20px] leading-[1.12] text-[var(--text-primary)] md:text-[22px]">
          {title}
        </h3>
      ) : null}
    </div>
  )
}

export { MeetupWizardStepHeading }
export type { MeetupWizardStepHeadingProps }
