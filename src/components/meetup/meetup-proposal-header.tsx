import { WallapopIcon } from "@/components/ui/wallapop-icon"

type MeetupProposalHeaderStep = {
  id: number
  label: string
  disabled?: boolean
}

type MeetupProposalHeaderProps = {
  currentStep: number
  totalSteps?: number
  steps: MeetupProposalHeaderStep[]
  onClose: () => void
  onStepChange: (stepId: number) => void
  onHelp?: () => void
  helpLabel?: string
}

function MeetupProposalHeader({
  currentStep,
  totalSteps = 3,
  steps,
  onClose,
  onStepChange,
  onHelp,
  helpLabel = "Dudas?",
}: MeetupProposalHeaderProps) {
  return (
    <div className="px-4 pt-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Cerrar configuracion de meetup"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--text-primary)]"
          onClick={onClose}
        >
          <WallapopIcon name="cross" size={22} />
        </button>
        <h2 className="font-wallie-chunky text-[length:var(--wm-size-18)] text-[color:var(--text-primary)] md:text-[length:var(--wm-size-20)]">
          Paso {currentStep} de {totalSteps}
        </h2>
        <button
          type="button"
          onClick={onHelp}
          className="font-wallie-chunky text-[length:var(--wm-size-15)] text-[color:var(--action-link)] hover:text-[color:var(--action-primary-pressed)] active:text-[color:var(--action-primary-pressed)] md:text-[length:var(--wm-size-16)]"
        >
          {helpLabel}
        </button>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {steps.map((stepItem) => (
          <button
            key={stepItem.id}
            type="button"
            onClick={() => onStepChange(stepItem.id)}
            disabled={stepItem.disabled}
            className={`h-[var(--wm-size-5)] rounded-full ${
              stepItem.id <= currentStep ? "bg-[color:var(--text-primary)]" : "bg-[color:var(--border-strong)]"
            }`}
            aria-label={`Paso ${stepItem.id}: ${stepItem.label}`}
          />
        ))}
      </div>
    </div>
  )
}

export { MeetupProposalHeader }
export type { MeetupProposalHeaderProps, MeetupProposalHeaderStep }


