import type { Meta, StoryObj } from "@storybook/react-vite"

import { Select } from "@/components/ui/select"

const meta = {
  title: "Design System/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    label: "Punto de encuentro",
    hint: "Selecciona una ubicación sugerida.",
    defaultValue: "",
    size: "md",
  },
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["md", "lg"],
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[var(--wm-size-360)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

const locationOptions = (
  <>
    <option value="" disabled>
      Selecciona un lugar
    </option>
    <option value="estacion-sants">Estación de Sants</option>
    <option value="cc-glories">Centro Comercial Glòries</option>
    <option value="comisaria-les-corts">Comisaría Les Corts</option>
  </>
)

export const Playground: Story = {
  render: (args) => <Select {...args}>{locationOptions}</Select>,
}

export const Error: Story = {
  args: {
    error: "Debes elegir un punto de encuentro.",
  },
  render: (args) => <Select {...args}>{locationOptions}</Select>,
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => <Select {...args}>{locationOptions}</Select>,
}

export const CompactScrollableUpward: Story = {
  args: {
    label: "Hora",
    placeholder: "Selecciona hora",
    dropdownDirection: "up",
    maxVisibleOptions: 6,
    options: [
      { value: "", label: "Selecciona hora", disabled: true },
      ...Array.from({ length: 20 }, (_, index) => {
        const baseHour = 8 + Math.floor(index / 2)
        const minutes = index % 2 === 0 ? "00" : "30"
        const label = `${String(baseHour).padStart(2, "0")}:${minutes}`
        return { value: label, label }
      }),
    ],
  },
  render: (args) => <Select {...args} />,
}
