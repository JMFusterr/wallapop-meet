import type { Meta, StoryObj } from "@storybook/react-vite"

import { MeetupProposalFooter } from "@/components/meetup/meetup-proposal-footer"

const meta = {
  title: "Design System/Meetup Proposal Footer",
  component: MeetupProposalFooter,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[380px] overflow-hidden rounded-[18px] border border-[#E8ECEF] bg-white">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MeetupProposalFooter>

export default meta
type Story = StoryObj<typeof meta>

const baseArgs = {
  listingImageSrc:
    "https://images.pexels.com/photos/6993182/pexels-photo-6993182.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=400&h=400",
  itemTitle: "Nintendo Switch OLED + dock",
  userName: "Laura M.",
  onAction: () => undefined,
}

export const NextEnabled: Story = {
  args: {
    ...baseArgs,
    actionLabel: "Siguiente",
    actionTextTone: "dark",
    actionDisabled: false,
  },
}

export const NextDisabled: Story = {
  args: {
    ...baseArgs,
    actionLabel: "Siguiente",
    actionTextTone: "dark",
    actionDisabled: true,
  },
}

export const Submit: Story = {
  args: {
    ...baseArgs,
    actionLabel: "Proponer quedada",
    actionTextTone: "light",
    actionDisabled: false,
  },
}
