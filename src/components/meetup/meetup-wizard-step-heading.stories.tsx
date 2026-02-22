import type { Meta, StoryObj } from "@storybook/react-vite"

import { MeetupWizardStepHeading } from "@/components/meetup/meetup-wizard-step-heading"

const meta = {
  title: "Design System/Meetup Wizard Step Heading",
  component: MeetupWizardStepHeading,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[360px] rounded-[18px] border border-[#E8ECEF] bg-white p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MeetupWizardStepHeading>

export default meta
type Story = StoryObj<typeof meta>

export const WithTitle: Story = {
  args: {
    caption: "Paso anterior",
    title: "Seleccionar dia y hora",
    onBack: () => undefined,
  },
}

export const CaptionOnly: Story = {
  args: {
    caption: "Define el pago final y la preferencia de pago.",
    onBack: () => undefined,
  },
}
