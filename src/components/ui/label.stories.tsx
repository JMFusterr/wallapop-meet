import type { Meta, StoryObj } from "@storybook/react-vite"
import { CheckCircle2, CircleDashed, Clock, Handshake, MapPin, XCircle } from "lucide-react"

import { Label } from "@/components/ui/label"

const meta = {
    title: "Design System/Label",
    component: Label,
    tags: ["autodocs"],
    args: {
        children: "pendiente",
        tone: "pending",
    },
    argTypes: {
        tone: {
            control: "inline-radio",
            options: ["pending", "confirmed", "arrived", "completed", "cancelled"],
        },
    },
    parameters: {
        docs: {
            description: {
                component:
                    "En `MeetupCard`, cada tono se muestra con icono Lucide a la izquierda (mapeo completo en `components-spec-v1` seccion 15). La story `WithLeadingIcon` muestra el patron de composicion; el resto son texto solo para tonos de color.",
            },
        },
    },
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Pending: Story = {
    args: { children: "pendiente", tone: "pending" },
}

export const Confirmed: Story = {
    args: { children: "confirmada", tone: "confirmed" },
}

export const Arrived: Story = {
    args: { children: "has llegado", tone: "arrived" },
}

export const Completed: Story = {
    args: { children: "completada", tone: "completed" },
}

export const Cancelled: Story = {
    args: { children: "cancelada", tone: "cancelled" },
}

/** Patron de chip con icono como en `MeetupCard` (ver mapeo `statusPill`). */
export const WithLeadingIcon: Story = {
    render: () => (
        <div className="flex flex-wrap gap-2">
            <Label tone="pending" className="items-center gap-1">
                <Clock className="size-[var(--wm-size-12)] shrink-0" aria-hidden />
                pendiente
            </Label>
            <Label tone="confirmed" className="items-center gap-1">
                <CheckCircle2 className="size-[var(--wm-size-12)] shrink-0" aria-hidden />
                confirmada
            </Label>
            <Label tone="arrived" className="items-center gap-1">
                <MapPin className="size-[var(--wm-size-12)] shrink-0" aria-hidden />
                has llegado
            </Label>
            <Label tone="completed" className="items-center gap-1">
                <Handshake className="size-[var(--wm-size-12)] shrink-0" aria-hidden />
                completada
            </Label>
            <Label tone="cancelled" className="items-center gap-1">
                <XCircle className="size-[var(--wm-size-12)] shrink-0" aria-hidden />
                cancelada
            </Label>
            <Label tone="pending" className="items-center gap-1">
                <CircleDashed className="size-[var(--wm-size-12)] shrink-0" aria-hidden />
                sin propuesta
            </Label>
        </div>
    ),
}
