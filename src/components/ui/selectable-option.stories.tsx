import type { Meta, StoryObj } from "@storybook/react-vite"

import { SelectableOption } from "@/components/ui/selectable-option"

const meta = {
    title: "Design System/Selectable Option",
    component: SelectableOption,
    tags: ["autodocs"],
} satisfies Meta<typeof SelectableOption>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        selected: false,
        children: "Punto de encuentro personalizado",
    },
}

export const Selected: Story = {
    args: {
        selected: true,
        children: "Punto seguro seleccionado",
    },
}

export const Disabled: Story = {
    args: {
        selected: true,
        children: "Opcion deshabilitada",
    },
    render: (args) => (
        <SelectableOption {...args} selected className="opacity-60">
            Opcion deshabilitada
        </SelectableOption>
    ),
}
