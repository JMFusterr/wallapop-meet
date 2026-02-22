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
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#253238]"
          onClick={onClose}
        >
          <WallapopIcon name="cross" size={22} />
        </button>
        <h2 className="font-wallie-chunky text-[18px] text-[#253238] md:text-[20px]">
          Paso {currentStep} de {totalSteps}
        </h2>
        <button
          type="button"
          onClick={onHelp}
          className="font-wallie-chunky text-[15px] text-[#038673] md:text-[16px]"
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
            className={`h-[5px] rounded-full ${
              stepItem.id <= currentStep ? "bg-[#253238]" : "bg-[#D3DEE2]"
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
