import type { Meta, StoryObj } from "@storybook/react-vite"

import { ChatCounterpartCard } from "@/components/ui/chat-counterpart-card"
import sampleProfile from "@/stories/assets/avif-test-image.avif"

const meta = {
    title: "Design System/Chat Counterpart Card",
    component: ChatCounterpartCard,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    args: {
        name: "Lorena",
        rating: 4.5,
        ratingCount: 110,
        distanceLabel: "42km de ti",
        attendanceRate: 94,
        attendanceMeetups: 26,
        profileImageSrc: sampleProfile,
    },
} satisfies Meta<typeof ChatCounterpartCard>

export default meta
type Story = StoryObj<typeof meta>

export const AttendanceHigh: Story = {
    args: {
        attendanceRate: 94,
        attendanceMeetups: 26,
    },
}

export const AttendanceMedium: Story = {
    args: {
        attendanceRate: 82,
        attendanceMeetups: 19,
    },
}

export const AttendanceLow: Story = {
    args: {
        attendanceRate: 61,
        attendanceMeetups: 9,
    },
}

export const AttendanceEmptyHistory: Story = {
    args: {
        attendanceRate: 0,
        attendanceMeetups: 0,
    },
}

export const ZeroRatingsProfile: Story = {
    args: {
        name: "Perfil sin valoraciones",
        rating: 0,
        ratingCount: 0,
        distanceLabel: "5,1km de ti",
        attendanceRate: 0,
        attendanceMeetups: 0,
    },
}
