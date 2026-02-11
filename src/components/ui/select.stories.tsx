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
      <div className="w-[360px]">
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
