import type { Meta, StoryObj } from "@storybook/react-vite"

import { Input } from "@/components/ui/input"

const meta = {
    title: "Design System/Input",
    component: Input,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    args: {
        label: "Precio final",
        placeholder: "Ej. 25 €",
        hint: "Usa el importe acordado en el chat.",
        maxLength: 50,
    },
    decorators: [
        (Story) => (
            <div className="w-[var(--wm-size-360)]">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Error: Story = {
    args: {
        error: "El precio es obligatorio.",
    },
}

export const Disabled: Story = {
    args: {
        disabled: true,
    },
}

export const Success: Story = {
    args: {
        state: "success",
        defaultValue: "25",
        hint: "Precio validado correctamente.",
    },
}
