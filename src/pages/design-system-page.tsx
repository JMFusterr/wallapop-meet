import styles from "../../styles.json"
import { Banknote, MapPin, QrCode, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ChatProductCard } from "@/components/ui/chat-product-card"
import { ChatCounterpartCard } from "@/components/ui/chat-counterpart-card"
import { ChatListItem } from "@/components/ui/chat-list-item"
import { MeetupCard } from "@/components/meetup/meetup-card"
import { MeetupProposalHeader } from "@/components/meetup/meetup-proposal-header"
import { MeetupWizardStepHeading } from "@/components/meetup/meetup-wizard-step-heading"
import { MeetupProposalFooter } from "@/components/meetup/meetup-proposal-footer"
import { MeetupLocationMap } from "@/components/meetup/meetup-location-map"
import { ChatComposer } from "@/components/ui/chat-composer"
import { ChatMessageBubble } from "@/components/ui/chat-message-bubble"
import { ChatSecurityBanner } from "@/components/ui/chat-security-banner"
import { Toast } from "@/components/ui/toast"
import { CalendarPicker } from "@/components/ui/calendar-picker"
import { WallapopIcon, type WallapopIconName } from "@/components/ui/wallapop-icon"
import { navigateTo } from "@/lib/navigation"
import { createMeetupMachine, transitionMeetup } from "@/meetup"
import type { MeetupMachine } from "@/meetup/types"

type Primitive = string | number | boolean | null | undefined
type TokenLeaf = {
    value: Primitive
    type?: string
}

type ColorItem = {
    tokenPath: string
    value: string
    cssVar: string
    tailwindClass: string
}

type SemanticColorItem = {
    name: string
    description: string
    aliasVar: string
    aliasTailwindRoot: string
    value: string
}

type SpacingItem = {
    tokenPath: string
    value: string
    pixels: number
}

type TypographyItem = {
    tokenPath: string
    value: string
}

type ShadowItem = {
    tokenPath: string
    value: string
}

type RadiusItem = {
    tokenPath: string
    value: string
    pixels: number
}

type StatusLabelItem = {
    name: string
    label: string
    background: string
    border: string
    text: string
}

type IconShowcaseItem = {
    name: WallapopIconName
    mainAction: string
}

type ButtonShowcaseVariant = "primary" | "secondary" | "ghost" | "critical" | "tab" | "link"

const buttonShowcaseVariants: Array<{ variant: ButtonShowcaseVariant; label: string }> = [
    { variant: "primary", label: "Primary" },
    { variant: "secondary", label: "Secondary" },
    { variant: "ghost", label: "Ghost" },
    { variant: "critical", label: "Critical" },
    { variant: "tab", label: "Tab" },
    { variant: "link", label: "Link" },
]

const iconShowcaseItems: IconShowcaseItem[] = [
    { name: "arrow_left", mainAction: "Volver a la pantalla anterior" },
    { name: "burguer_menu", mainAction: "Abrir menu principal en cabecera" },
    { name: "chevron_right", mainAction: "Navegar entre pasos o meses" },
    { name: "cross", mainAction: "Cerrar modal o drawer" },
    { name: "edit", mainAction: "Editar anuncio o propuesta" },
    { name: "eye", mainAction: "Mostrar metricas de visualizaciones" },
    { name: "home", mainAction: "Ir a inicio desde navegacion inferior" },
    { name: "mail", mainAction: "Entrar en buzon de conversaciones" },
    { name: "user", mainAction: "Abrir perfil del usuario" },
    { name: "plus", mainAction: "Iniciar publicacion o accion de alta" },
    { name: "calendar", mainAction: "Iniciar propuesta de quedada" },
    { name: "paper_plane", mainAction: "Enviar mensaje en chat" },
    { name: "deal", mainAction: "Marcar trato o punto personalizado" },
    { name: "shield", mainAction: "Resaltar zona o punto seguro" },
    { name: "double_check", mainAction: "Indicar estado de entrega" },
    { name: "ellipsis_horizontal", mainAction: "Abrir acciones contextuales" },
    { name: "heart", mainAction: "Gestionar favoritos" },
    { name: "bookmark", mainAction: "Marcar reservado" },
]

const wallapopLogoUrl = "https://es.wallapop.com/favicon.ico"

const sectionEntries = [
    { id: "foundations-color", label: "Color" },
    { id: "foundations-semantic-colors", label: "Semantic Colors" },
    { id: "foundations-typography", label: "Typography" },
    { id: "foundations-spacing", label: "Spacing & Layout" },
    { id: "foundations-radius", label: "Corner Radius" },
    { id: "foundations-elevation", label: "Elevation" },
    { id: "components-playground", label: "Components" },
    { id: "patterns", label: "Patterns" },
] as const

const semanticColorDefinitions = [
    {
        name: "Background Base",
        description: "Fondo principal de tarjetas y paneles.",
        tokenPath: "tokens.color.semantic.background.base",
        aliasVar: "--bg-base",
        aliasTailwindRoot: "bg-base",
    },
    {
        name: "Background Surface",
        description: "Superficie general de app y layouts.",
        tokenPath: "tokens.color.semantic.background.surface",
        aliasVar: "--bg-surface",
        aliasTailwindRoot: "bg-surface",
    },
    {
        name: "Text Primary",
        description: "Texto principal en interfaz.",
        tokenPath: "tokens.color.semantic.text.primary",
        aliasVar: "--text-primary",
        aliasTailwindRoot: "text-primary",
    },
    {
        name: "Text Secondary",
        description: "Texto secundario y metadatos.",
        tokenPath: "tokens.color.semantic.text.secondary",
        aliasVar: "--text-secondary",
        aliasTailwindRoot: "text-secondary",
    },
    {
        name: "Text Inverse",
        description: "Texto sobre fondos oscuros o de marca.",
        tokenPath: "tokens.color.semantic.text.inverse",
        aliasVar: "--text-inverse",
        aliasTailwindRoot: "text-inverse",
    },
    {
        name: "Action Primary",
        description: "CTA principal y estados interactivos.",
        tokenPath: "tokens.color.semantic.action.primary",
        aliasVar: "--action-primary",
        aliasTailwindRoot: "action-primary",
    },
    {
        name: "Action Primary Hover",
        description: "Estado hover de accion principal.",
        tokenPath: "tokens.color.semantic.action.primary_hover",
        aliasVar: "--action-primary-hover",
        aliasTailwindRoot: "action-primary-hover",
    },
    {
        name: "Action Primary Pressed",
        description: "Estado pressed de accion principal.",
        tokenPath: "tokens.color.semantic.action.primary_pressed",
        aliasVar: "--action-primary-pressed",
        aliasTailwindRoot: "action-primary-pressed",
    },
    {
        name: "Action Disabled BG",
        description: "Fondo para acciones deshabilitadas.",
        tokenPath: "tokens.color.semantic.action.disabled_bg",
        aliasVar: "--action-disabled-bg",
        aliasTailwindRoot: "action-disabled-bg",
    },
    {
        name: "Action Disabled Text",
        description: "Texto para acciones deshabilitadas.",
        tokenPath: "tokens.color.semantic.action.disabled_text",
        aliasVar: "--action-disabled-text",
        aliasTailwindRoot: "action-disabled-text",
    },
    {
        name: "Border Divider",
        description: "Separadores y contornos de baja jerarquia.",
        tokenPath: "tokens.color.semantic.border.divider",
        aliasVar: "--border-divider",
        aliasTailwindRoot: "border-divider",
    },
    {
        name: "Border Focus",
        description: "Contorno de foco accesible.",
        tokenPath: "tokens.color.semantic.border.focus",
        aliasVar: "--border-focus",
        aliasTailwindRoot: "border-focus",
    },
    {
        name: "Border Error",
        description: "Contorno para estados de error.",
        tokenPath: "tokens.color.semantic.border.error",
        aliasVar: "--border-error",
        aliasTailwindRoot: "border-error",
    },
    {
        name: "Feedback Success",
        description: "Completado/confirmacion positiva.",
        tokenPath: "tokens.color.semantic.feedback.success",
        aliasVar: "--feedback-success",
        aliasTailwindRoot: "feedback-success",
    },
    {
        name: "Feedback Error",
        description: "Errores bloqueantes o fallos.",
        tokenPath: "tokens.color.semantic.feedback.error",
        aliasVar: "--feedback-error",
        aliasTailwindRoot: "feedback-error",
    },
    {
        name: "Feedback Info",
        description: "Informacion neutral o contextual.",
        tokenPath: "tokens.color.semantic.feedback.info",
        aliasVar: "--feedback-info",
        aliasTailwindRoot: "feedback-info",
    },
] as const

const proposalHeaderSteps = [
    { id: 1, label: "Punto de encuentro" },
    { id: 2, label: "Dia y hora" },
    { id: 3, label: "Preferencia de pago", disabled: true },
]

const patternSafePoints = [
    { id: "station", name: "Estacion de Sants", lat: 41.37906, lng: 2.14006 },
    { id: "mall", name: "Centro comercial Arenas", lat: 41.37617, lng: 2.14918 },
    { id: "police", name: "Comisaria Mossos - Les Corts", lat: 41.38762, lng: 2.13441 },
]

function createPatternMeetupMachine(status: "PROPOSED" | "CONFIRMED"): MeetupMachine {
    const base = createMeetupMachine({
        scheduledAt: new Date(Date.now() + 45 * 60 * 1000),
        chatContext: {
            conversationId: "conv-design-system",
            listingId: "listing-switch-001",
            sellerUserId: "user-seller-001",
            buyerUserId: "user-buyer-001",
        },
    })

    const enrichedBase: MeetupMachine = {
        ...base,
        proposedLocation: "Estacion de Sants, acceso principal",
        proposedLocationLat: 41.37906,
        proposedLocationLng: 2.14006,
        finalPrice: 240,
        proposedPaymentMethod: "BIZUM",
    }

    const proposedResult = transitionMeetup(enrichedBase, {
        type: "PROPOSE",
        actorRole: "SELLER",
        occurredAt: new Date(),
    })

    if (!proposedResult.ok) {
        return enrichedBase
    }

    if (status === "PROPOSED") {
        return proposedResult.meetup
    }

    const confirmedResult = transitionMeetup(proposedResult.meetup, {
        type: "ACCEPT",
        actorRole: "BUYER",
        occurredAt: new Date(),
    })

    return confirmedResult.ok ? confirmedResult.meetup : proposedResult.meetup
}

function SafeShieldGlyph({ className = "" }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        </svg>
    )
}

function ProposalSelectionIndicator({ selected }: { selected: boolean }) {
    return (
        <span
            className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white ${
                selected ? "border-[var(--wm-size-8)] border-[color:var(--text-primary)]" : "border-2 border-[color:var(--text-secondary)]"
            }`}
            aria-hidden
        />
    )
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null
}

function isTokenLeaf(value: unknown): value is TokenLeaf {
    return isRecord(value) && "value" in value
}

function getByPath(source: unknown, path: string): unknown {
    if (!path) {
        return source
    }
    const segments = path.split(".")
    let cursor: unknown = source
    for (const segment of segments) {
        if (!isRecord(cursor) || !(segment in cursor)) {
            return undefined
        }
        cursor = cursor[segment]
    }
    return cursor
}

function resolveReference(value: Primitive, source: unknown, depth = 0): Primitive {
    if (typeof value !== "string") {
        return value
    }
    const match = value.match(/^\{(.+)\}$/)
    if (!match || depth > 8) {
        return value
    }
    const target = getByPath(source, match[1] ?? "")
    if (isTokenLeaf(target)) {
        return resolveReference(target.value, source, depth + 1)
    }
    if (typeof target === "string" || typeof target === "number") {
        return resolveReference(target, source, depth + 1)
    }
    return value
}

function toCssVar(tokenPath: string): string {
    return `--wm-${tokenPath.replace(/^tokens\./, "").replace(/\./g, "-")}`
}

function normalizeColorTokenGroup(groupPath: string, input: unknown): ColorItem[] {
    if (!isRecord(input)) {
        return []
    }

    const result: ColorItem[] = []
    const walk = (node: unknown, path: string) => {
        if (isTokenLeaf(node)) {
            const resolved = resolveReference(node.value, styles)
            result.push({
                tokenPath: path,
                value: String(resolved),
                cssVar: toCssVar(path),
                tailwindClass: `bg-[var(${toCssVar(path)})]`,
            })
            return
        }
        if (!isRecord(node)) {
            return
        }
        for (const [key, child] of Object.entries(node)) {
            walk(child, `${path}.${key}`)
        }
    }

    walk(input, groupPath)
    return result
}

function normalizeSemanticColorItems(): SemanticColorItem[] {
    return semanticColorDefinitions.map((item) => ({
        name: item.name,
        description: item.description,
        aliasVar: item.aliasVar,
        aliasTailwindRoot: item.aliasTailwindRoot,
        value: String(resolveReference(`{${item.tokenPath}}`, styles)),
    }))
}

function hexToRgb(value: string): { r: number; g: number; b: number } | null {
    const clean = value.trim()
    const match = clean.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
    if (!match) {
        return null
    }

    const hex = match[1] ?? ""
    if (hex.length === 3) {
        return {
            r: Number.parseInt(hex[0] + hex[0], 16),
            g: Number.parseInt(hex[1] + hex[1], 16),
            b: Number.parseInt(hex[2] + hex[2], 16),
        }
    }

    return {
        r: Number.parseInt(hex.slice(0, 2), 16),
        g: Number.parseInt(hex.slice(2, 4), 16),
        b: Number.parseInt(hex.slice(4, 6), 16),
    }
}

function toRelativeLuminance(color: { r: number; g: number; b: number }): number {
    const normalize = (channel: number) => {
        const sRGB = channel / 255
        return sRGB <= 0.03928 ? sRGB / 12.92 : ((sRGB + 0.055) / 1.055) ** 2.4
    }

    const r = normalize(color.r)
    const g = normalize(color.g)
    const b = normalize(color.b)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(background: string, foreground: string): number {
    const bg = hexToRgb(background)
    const fg = hexToRgb(foreground)
    if (!bg || !fg) {
        return 0
    }

    const bgLuminance = toRelativeLuminance(bg)
    const fgLuminance = toRelativeLuminance(fg)
    const lighter = Math.max(bgLuminance, fgLuminance)
    const darker = Math.min(bgLuminance, fgLuminance)
    return (lighter + 0.05) / (darker + 0.05)
}

function getContrastTextHint(background: string): { label: "Texto Blanco" | "Texto Oscuro"; color: string } {
    const white = "var(--text-inverse)"
    const dark = "var(--text-primary)"
    const whiteRatio = contrastRatio(background, white)
    const darkRatio = contrastRatio(background, dark)

    if (whiteRatio >= darkRatio) {
        return { label: "Texto Blanco", color: white }
    }

    return { label: "Texto Oscuro", color: dark }
}

function normalizeSpacingTokens(input: unknown): SpacingItem[] {
    if (!isRecord(input)) {
        return []
    }

    return Object.entries(input)
        .map(([key, token]) => {
            if (!isTokenLeaf(token)) {
                return null
            }
            const resolved = String(resolveReference(token.value, styles))
            const pixels = Number.parseFloat(resolved.replace("px", ""))
            return {
                tokenPath: `tokens.spacing.${key}`,
                value: resolved,
                pixels: Number.isFinite(pixels) ? pixels : 0,
            }
        })
        .filter((item): item is SpacingItem => item !== null)
        .sort((a, b) => a.pixels - b.pixels)
}

function normalizeTypographyTokens(input: unknown): TypographyItem[] {
    if (!isRecord(input)) {
        return []
    }

    const result: TypographyItem[] = []
    const walk = (node: unknown, path: string) => {
        if (isTokenLeaf(node)) {
            result.push({
                tokenPath: path,
                value: String(resolveReference(node.value, styles)),
            })
            return
        }
        if (!isRecord(node)) {
            return
        }
        for (const [key, child] of Object.entries(node)) {
            walk(child, `${path}.${key}`)
        }
    }

    walk(input, "tokens.typography")
    return result
}

function normalizeShadowTokens(input: unknown): ShadowItem[] {
    if (!isRecord(input)) {
        return []
    }

    return Object.entries(input)
        .map(([key, token]) => {
            if (!isTokenLeaf(token)) {
                return null
            }
            return {
                tokenPath: `tokens.shadow.${key}`,
                value: String(resolveReference(token.value, styles)),
            }
        })
        .filter((item): item is ShadowItem => item !== null)
}

function normalizeRadiusTokens(input: unknown): RadiusItem[] {
    if (!isRecord(input)) {
        return []
    }

    return Object.entries(input)
        .map(([key, token]) => {
            if (!isTokenLeaf(token)) {
                return null
            }
            const resolved = String(resolveReference(token.value, styles))
            const parsed = Number.parseFloat(resolved.replace("px", ""))
            return {
                tokenPath: `tokens.radius.${key}`,
                value: resolved,
                pixels: Number.isFinite(parsed) ? parsed : 999,
            }
        })
        .filter((item): item is RadiusItem => item !== null)
        .sort((a, b) => a.pixels - b.pixels)
}

function buildStatusLabelItems(): StatusLabelItem[] {
    const statuses = [
        { name: "pending", label: "pendiente" },
        { name: "confirmed", label: "confirmada" },
        { name: "arrived", label: "llegada" },
        { name: "completed", label: "completada" },
        { name: "expired", label: "expirada" },
        { name: "cancelled", label: "cancelada" },
    ] as const

    return statuses.map((status) => ({
        name: status.name,
        label: status.label,
        background: String(resolveReference(`{tokens.color.meetup_status.${status.name}.background}`, styles)),
        border: String(resolveReference(`{tokens.color.meetup_status.${status.name}.border}`, styles)),
        text: String(resolveReference(`{tokens.color.meetup_status.${status.name}.text}`, styles)),
    }))
}

function DesignSystemPage() {
    const colorTokens = (styles as Record<string, unknown>)["tokens"]
    const foundations = isRecord(colorTokens) ? colorTokens : {}
    const colorRoot = isRecord(foundations.color) ? foundations.color : {}
    const paletteRoot = isRecord(colorRoot.palette) ? colorRoot.palette : {}
    const brandScale = normalizeColorTokenGroup("tokens.color.palette.brand", paletteRoot.brand)
    const reserveScale = normalizeColorTokenGroup("tokens.color.palette.reserve", paletteRoot.reserve)
    const soldScale = normalizeColorTokenGroup("tokens.color.palette.sold", paletteRoot.sold)
    const neutralScale = normalizeColorTokenGroup("tokens.color.palette.neutral", paletteRoot.neutral)
    const warningScale = normalizeColorTokenGroup("tokens.color.palette.warning", paletteRoot.warning)
    const errorScale = normalizeColorTokenGroup("tokens.color.palette.error", paletteRoot.error)
    const semanticColorItems = normalizeSemanticColorItems()
    const typographyTokens = normalizeTypographyTokens(foundations.typography)
    const spacingTokens = normalizeSpacingTokens(foundations.spacing)
    const radiusTokens = normalizeRadiusTokens(foundations.radius)
    const shadowTokens = normalizeShadowTokens(foundations.shadow)
    const statusLabelItems = buildStatusLabelItems()

    const fontPrimary = typographyTokens.find((item) => item.tokenPath.includes("family.primary"))?.value ?? "Wallie"
    const fontFallback =
        String(getByPath(styles, "brand.typography.family.fallback") ?? "system-ui, sans-serif")
    const size100 = typographyTokens.find((item) => item.tokenPath.endsWith("size.100"))?.value ?? "12px"
    const size300 = typographyTokens.find((item) => item.tokenPath.endsWith("size.300"))?.value ?? "16px"
    const size500 = typographyTokens.find((item) => item.tokenPath.endsWith("size.500"))?.value ?? "20px"
    const lineHeight200 = typographyTokens.find((item) => item.tokenPath.endsWith("line_height.200"))?.value ?? "1.4"
    const lineHeight300 = typographyTokens.find((item) => item.tokenPath.endsWith("line_height.300"))?.value ?? "1.5"
    const weightRegular = typographyTokens.find((item) => item.tokenPath.endsWith("weight.regular"))?.value ?? "400"
    const weightMedium = typographyTokens.find((item) => item.tokenPath.endsWith("weight.medium"))?.value ?? "500"
    const weightBold = typographyTokens.find((item) => item.tokenPath.endsWith("weight.bold"))?.value ?? "700"
    const proposedPatternMeetup = createPatternMeetupMachine("PROPOSED")
    const confirmedPatternMeetup = createPatternMeetupMachine("CONFIRMED")
    const now = new Date()

    return (
        <main className="min-h-dvh bg-[color:var(--bg-surface)] text-[color:var(--text-primary)]">
            <div className="mx-auto flex w-full max-w-[var(--wm-size-1400)] gap-8 px-6 py-8">
                <aside className="sticky top-6 hidden h-[calc(100dvh-48px)] w-72 flex-col rounded-[var(--wm-size-12)] border border-[color:var(--border-strong)] bg-white p-4 lg:flex">
                    <div className="mb-4 border-b border-[color:var(--border-divider)] pb-3">
                        <div className="flex items-center gap-3">
                            <img
                                src={wallapopLogoUrl}
                                alt="Logo de Wallapop"
                                className="h-10 w-auto"
                                loading="lazy"
                            />
                            <div>
                                <p className="font-wallie-chunky text-[length:var(--wm-size-18)] leading-6">Wallapop Meet</p>
                                <p className="font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">Living Design System</p>
                            </div>
                        </div>
                    </div>
                    <nav className="space-y-1">
                        {sectionEntries.map((entry) => (
                            <a
                                key={entry.id}
                                href={`#${entry.id}`}
                                className="block rounded-[var(--wm-size-8)] px-3 py-2 font-wallie-fit text-[length:var(--wm-size-13)] text-[color:var(--text-secondary)] transition-colors hover:bg-[color:var(--bg-accent-subtle)] hover:text-[color:var(--text-primary)]"
                            >
                                {entry.label}
                            </a>
                        ))}
                    </nav>
                    <div className="mt-auto pt-4">
                        <Button variant="secondary" size="sm" className="w-full" onClick={() => navigateTo("/")}>
                            Volver al chat
                        </Button>
                    </div>
                </aside>

                <div className="min-w-0 flex-1 space-y-10">
                    <header className="rounded-[var(--wm-size-16)] border border-[color:var(--border-strong)] bg-white p-6">
                        <p className="font-wallie-fit text-[length:var(--wm-size-12)] uppercase tracking-[0.08em] text-[color:var(--text-secondary)]">
                            Documentacion viva
                        </p>
                        <h1 className="mt-1 font-wallie-chunky text-[length:var(--wm-size-34)] leading-[1.1] text-[color:var(--text-primary)]">
                            Design System Viewer
                        </h1>
                        <p className="mt-3 max-w-[65ch] font-wallie-fit text-[length:var(--wm-size-15)] leading-6 text-[color:var(--text-secondary)]">
                            Esta pagina consume tokens de <code>styles.json</code> para documentar foundations,
                            componentes base y patrones de producto en un unico portal operativo.
                        </p>
                    </header>

                    <section id="foundations-color" className="rounded-[var(--wm-size-16)] border border-[color:var(--border-strong)] bg-white p-6">
                        <h2 className="font-wallie-chunky text-[length:var(--wm-size-24)]">Color</h2>
                        <p className="mt-1 font-wallie-fit text-[length:var(--wm-size-14)] text-[color:var(--text-secondary)]">
                            Paletas oficiales en escala 50-900.
                        </p>
                        <div className="mt-6 space-y-6">
                            {[
                                { title: "Brand Scale", items: brandScale },
                                { title: "Reserve Purple Scale", items: reserveScale },
                                { title: "Sold Pink Scale", items: soldScale },
                                { title: "Warning Scale", items: warningScale },
                                { title: "Error Scale", items: errorScale },
                                { title: "Neutral Scale", items: neutralScale },
                            ].map((group) => (
                                <div key={group.title}>
                                    <h4 className="mb-3 font-wallie-chunky text-[length:var(--wm-size-17)]">{group.title}</h4>
                                    <div className="overflow-x-auto rounded-[var(--wm-size-10)] border border-[color:var(--border-divider)] p-2">
                                        <div className="flex min-w-max gap-2">
                                        {group.items.map((item) => {
                                            const contrastHint = getContrastTextHint(item.value)
                                            return (
                                            <article key={item.tokenPath} className="w-[var(--wm-size-110)] shrink-0 overflow-hidden rounded-[var(--wm-size-8)] border border-[color:var(--border-divider)]">
                                                <div className="h-14 w-full" style={{ background: item.value }} />
                                                <div className="px-2 py-1.5">
                                                    <p className="font-wallie-fit text-[length:var(--wm-size-11)] text-[color:var(--text-primary)]">
                                                        {item.tokenPath.split(".").pop()}
                                                    </p>
                                                    <p className="font-wallie-fit text-[length:var(--wm-size-11)] text-[color:var(--text-secondary)]">{item.value}</p>
                                                    <span
                                                        className="mt-1 inline-flex rounded-full border px-1.5 py-0.5 font-wallie-fit text-[length:var(--wm-size-10)] leading-[1]"
                                                        style={{
                                                            backgroundColor: contrastHint.color,
                                                            color: contrastHint.color === "var(--text-inverse)" ? "var(--text-primary)" : "var(--text-inverse)",
                                                            borderColor: contrastHint.color,
                                                        }}
                                                    >
                                                        {contrastHint.label}
                                                    </span>
                                                </div>
                                            </article>
                                            )
                                        })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section id="foundations-semantic-colors" className="rounded-[var(--wm-size-16)] border border-[color:var(--border-strong)] bg-white p-6">
                        <h2 className="font-wallie-chunky text-[length:var(--wm-size-24)]">Semantic Colors</h2>
                        <p className="mt-1 font-wallie-fit text-[length:var(--wm-size-14)] text-[color:var(--text-secondary)]">
                            Copia directa de alias oficiales: una variable CSS corta y una raiz unica para Tailwind.
                        </p>
                        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {semanticColorItems.map((item) => (
                                <article key={item.aliasVar} className="rounded-[var(--wm-size-10)] border border-[color:var(--border-divider)] p-3">
                                    <div className="h-12 rounded-[var(--wm-size-8)] border border-[color:var(--border-divider)]" style={{ backgroundColor: item.value }} />
                                    <p className="mt-2 font-wallie-chunky text-[length:var(--wm-size-14)] text-[color:var(--text-primary)]">{item.name}</p>
                                    <p className="mt-1 font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">{item.description}</p>
                                    <p className="mt-2 font-mono text-[length:var(--wm-size-11)] text-[color:var(--text-primary)]">{`CSS: var(${item.aliasVar})`}</p>
                                    <p className="font-mono text-[length:var(--wm-size-11)] text-[color:var(--text-secondary)]">{`Tailwind: text-/bg-/border-${item.aliasTailwindRoot}`}</p>
                                    <p className="mt-1 font-wallie-fit text-[length:var(--wm-size-11)] text-[color:var(--text-secondary)]">{item.value}</p>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section id="foundations-typography" className="rounded-[var(--wm-size-16)] border border-[color:var(--border-strong)] bg-white p-6">
                        <h2 className="font-wallie-chunky text-[length:var(--wm-size-24)]">Typography</h2>
                        <p className="mt-1 font-wallie-fit text-[length:var(--wm-size-14)] text-[color:var(--text-secondary)]">
                            Guia tipografica propuesta para Wallapop Meet basada en proporciones reales del producto. Familia principal: <code>{fontPrimary}</code>, fallbacks: <code>{fontFallback}</code>.
                        </p>
                        <div className="mt-5 space-y-4">
                            <article className="rounded-[var(--wm-size-12)] border border-[color:var(--border-divider)] p-4">
                                <div className="grid gap-4 md:grid-cols-[190px_1fr] md:items-start">
                                    <div>
                                        <p className="font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">Display / Hero</p>
                                        <p className="font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">20px · LH 1.4</p>
                                        <p className="font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">Peso 700</p>
                                    </div>
                                    <div>
                                        <p
                                            className="text-[color:var(--text-primary)]"
                                            style={{
                                                fontFamily: fontPrimary,
                                                fontSize: size500,
                                                lineHeight: lineHeight200,
                                                fontWeight: Number(weightBold),
                                            }}
                                        >
                                            Quedada confirmada con Laura M.
                                        </p>
                                        <p className="mt-2 font-wallie-fit text-[length:var(--wm-size-13)] text-[color:var(--text-secondary)]">
                                            Para encabezados de bloque, títulos de card y puntos de entrada principales.
                                        </p>
                                    </div>
                                </div>
                            </article>
                            <article className="rounded-[var(--wm-size-12)] border border-[color:var(--border-divider)] p-4">
                                <div className="grid gap-4 md:grid-cols-[190px_1fr] md:items-start">
                                    <div>
                                        <p className="font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">Section / Heading</p>
                                        <p className="font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">16px · LH 1.5</p>
                                        <p className="font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">Peso 600</p>
                                    </div>
                                    <div>
                                        <p
                                            className="text-[color:var(--text-primary)]"
                                            style={{
                                                fontFamily: fontPrimary,
                                                fontSize: size300,
                                                lineHeight: lineHeight300,
                                                fontWeight: 600,
                                            }}
                                        >
                                            Punto de encuentro y metodo de pago
                                        </p>
                                        <p className="mt-2 font-wallie-fit text-[length:var(--wm-size-13)] text-[color:var(--text-secondary)]">
                                            Para subtitulos, grupos de formulario y jerarquias internas de pantalla.
                                        </p>
                                    </div>
                                </div>
                            </article>
                            <article className="rounded-[var(--wm-size-12)] border border-[color:var(--border-divider)] p-4">
                                <div className="grid gap-4 md:grid-cols-[190px_1fr] md:items-start">
                                    <div>
                                        <p className="font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">Body / Reading</p>
                                        <p className="font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">14px · LH 1.5</p>
                                        <p className="font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">Peso 400</p>
                                    </div>
                                    <div>
                                        <p
                                            className="text-[color:var(--text-primary)]"
                                            style={{
                                                fontFamily: fontPrimary,
                                                fontSize: "14px",
                                                lineHeight: lineHeight300,
                                                fontWeight: Number(weightRegular),
                                            }}
                                        >
                                            Nos vemos a las 18:30 en la entrada principal. Lleva efectivo o Bizum.
                                        </p>
                                        <p className="mt-2 font-wallie-fit text-[length:var(--wm-size-13)] text-[color:var(--text-secondary)]">
                                            Tamaño base para contenido de conversación, mensajes y descripción funcional.
                                        </p>
                                    </div>
                                </div>
                            </article>
                            <article className="rounded-[var(--wm-size-12)] border border-[color:var(--border-divider)] p-4">
                                <div className="grid gap-4 md:grid-cols-[190px_1fr] md:items-start">
                                    <div>
                                        <p className="font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">Caption / Label</p>
                                        <p className="font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">12px · LH 1.2</p>
                                        <p className="font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">Peso 500-700</p>
                                    </div>
                                    <div>
                                        <p
                                            className="text-[color:var(--text-primary)]"
                                            style={{
                                                fontFamily: fontPrimary,
                                                fontSize: size100,
                                                lineHeight: "1.2",
                                                fontWeight: Number(weightMedium),
                                            }}
                                        >
                                            Estado: pendiente · actualizado hace 2 min
                                        </p>
                                        <p className="mt-2 font-wallie-fit text-[length:var(--wm-size-13)] text-[color:var(--text-secondary)]">
                                            Para metadatos, etiquetas de estado y ayudas breves sin perder legibilidad.
                                        </p>
                                    </div>
                                </div>
                            </article>
                        </div>
                    </section>

                    <section id="foundations-spacing" className="rounded-[var(--wm-size-16)] border border-[color:var(--border-strong)] bg-white p-6">
                        <h2 className="font-wallie-chunky text-[length:var(--wm-size-24)]">Spacing & Layout</h2>
                        <p className="mt-1 font-wallie-fit text-[length:var(--wm-size-14)] text-[color:var(--text-secondary)]">
                            Escala basada en incrementos de 4px y 8px, consumida desde tokens.
                        </p>
                        <div className="mt-5 grid gap-3">
                            {spacingTokens.map((item) => (
                                <div key={item.tokenPath} className="flex items-center gap-3 rounded-[var(--wm-size-10)] border border-[color:var(--border-divider)] p-3">
                                    <div className="h-3 rounded-[var(--wm-size-999)] bg-[color:var(--action-primary)]" style={{ width: `${Math.max(item.pixels, 2)}px` }} />
                                    <p className="w-[var(--wm-size-190)] font-wallie-fit text-[length:var(--wm-size-12)]">{item.tokenPath}</p>
                                    <p className="font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section id="foundations-radius" className="rounded-[var(--wm-size-16)] border border-[color:var(--border-strong)] bg-white p-6">
                        <h2 className="font-wallie-chunky text-[length:var(--wm-size-24)]">Corner Radius</h2>
                        <p className="mt-1 font-wallie-fit text-[length:var(--wm-size-14)] text-[color:var(--text-secondary)]">
                            Escala de radios para esquinas y pills.
                        </p>
                        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {radiusTokens.map((item) => (
                                <article key={item.tokenPath} className="rounded-[var(--wm-size-12)] border border-[color:var(--border-divider)] p-3">
                                    <div className="h-14 w-full border border-[color:var(--border-strong)] bg-[color:var(--bg-surface)]" style={{ borderRadius: item.value }} />
                                    <p className="mt-2 font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-primary)]">{item.tokenPath}</p>
                                    <p className="font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">{item.value}</p>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section id="foundations-elevation" className="rounded-[var(--wm-size-16)] border border-[color:var(--border-strong)] bg-white p-6">
                        <h2 className="font-wallie-chunky text-[length:var(--wm-size-24)]">Elevation</h2>
                        <p className="mt-1 font-wallie-fit text-[length:var(--wm-size-14)] text-[color:var(--text-secondary)]">
                            Niveles de sombra para separar superficies y jerarquia visual.
                        </p>
                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            {shadowTokens.map((item) => (
                                <article key={item.tokenPath} className="rounded-[var(--wm-size-12)] border border-[color:var(--border-divider)] bg-white p-4">
                                    <div className="h-20 rounded-[var(--wm-size-10)] bg-white" style={{ boxShadow: item.value }} />
                                    <p className="mt-3 font-wallie-fit text-[length:var(--wm-size-12)]">{item.tokenPath}</p>
                                    <p className="font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">{item.value}</p>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section id="components-playground" className="rounded-[var(--wm-size-16)] border border-[color:var(--border-strong)] bg-white p-6">
                        <h2 className="font-wallie-chunky text-[length:var(--wm-size-24)]">Components - Playground</h2>
                        <p className="mt-1 font-wallie-fit text-[length:var(--wm-size-14)] text-[color:var(--text-secondary)]">
                            Catalogo interactivo de componentes base y sus variantes clave.
                        </p>
                        <div className="mt-5 space-y-6">
                            <article className="rounded-[var(--wm-size-12)] border border-[color:var(--border-divider)] p-4">
                                <p className="mb-3 font-wallie-chunky text-[length:var(--wm-size-18)]">Button</p>
                                <p className="mb-3 font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">
                                    Estados visuales simulados: default, hover, active, disabled.
                                </p>
                                <div className="overflow-auto rounded-[var(--wm-size-10)] border border-[color:var(--border-divider)]">
                                    <div className="grid min-w-[var(--wm-size-860)] grid-cols-[160px_repeat(4,minmax(150px,1fr))]">
                                        <div className="border-b border-r border-[color:var(--border-divider)] bg-[color:var(--bg-surface)] px-3 py-2 font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">
                                            Variante
                                        </div>
                                        <div className="border-b border-r border-[color:var(--border-divider)] bg-[color:var(--bg-surface)] px-3 py-2 text-center font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">Default</div>
                                        <div className="border-b border-r border-[color:var(--border-divider)] bg-[color:var(--bg-surface)] px-3 py-2 text-center font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">Hover</div>
                                        <div className="border-b border-r border-[color:var(--border-divider)] bg-[color:var(--bg-surface)] px-3 py-2 text-center font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">Pressed</div>
                                        <div className="border-b border-[color:var(--border-divider)] bg-[color:var(--bg-surface)] px-3 py-2 text-center font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">Disabled</div>
                                        {buttonShowcaseVariants.map((entry) => {
                                            const hoverClass =
                                                entry.variant === "secondary"
                                                    ? "bg-[color:var(--bg-accent-subtle)]"
                                                    : entry.variant === "ghost"
                                                      ? "text-[color:var(--text-secondary)]"
                                                      : entry.variant === "link"
                                                        ? "text-[color:var(--action-primary-hover)]"
                                                        : entry.variant === "tab"
                                                          ? "bg-[color:var(--wm-surface-overlay-hover)]"
                                                          : "brightness-[0.98]"
                                            const activeClass =
                                                entry.variant === "secondary"
                                                    ? "bg-[color:var(--bg-accent-subtle)]"
                                                    : entry.variant === "ghost"
                                                      ? "text-[color:var(--text-primary)]"
                                                      : entry.variant === "link"
                                                        ? "text-[color:var(--action-primary-pressed)]"
                                                        : entry.variant === "tab"
                                                          ? "bg-[color:var(--wm-surface-overlay-pressed)]"
                                                          : "brightness-95"
                                            const disabledLabel =
                                                entry.variant === "link" ? "Link" : entry.label

                                            return (
                                                <div key={entry.variant} className="contents">
                                                    <div className="border-r border-b border-[color:var(--border-divider)] px-3 py-3 font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-primary)]">
                                                        {entry.label}
                                                    </div>
                                                    <div className="border-r border-b border-[color:var(--border-divider)] px-3 py-3 text-center">
                                                        <Button variant={entry.variant} size="sm">
                                                            {entry.label}
                                                        </Button>
                                                    </div>
                                                    <div className="border-r border-b border-[color:var(--border-divider)] px-3 py-3 text-center">
                                                        <Button variant={entry.variant} size="sm" className={hoverClass}>
                                                            {entry.label}
                                                        </Button>
                                                    </div>
                                                    <div className="border-r border-b border-[color:var(--border-divider)] px-3 py-3 text-center">
                                                        <Button variant={entry.variant} size="sm" className={activeClass}>
                                                            {entry.label}
                                                        </Button>
                                                    </div>
                                                    <div className="border-b border-[color:var(--border-divider)] px-3 py-3 text-center">
                                                        <Button variant={entry.variant} size="sm" disabled>
                                                            {disabledLabel}
                                                        </Button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </article>

                            <article className="rounded-[var(--wm-size-12)] border border-[color:var(--border-divider)] p-4">
                                <p className="mb-3 font-wallie-chunky text-[length:var(--wm-size-18)]">Input</p>
                                <p className="mb-3 font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">
                                    Campo de texto con estados de validacion y ayuda contextual.
                                </p>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Input label="Default" placeholder="Escribe algo" hint="Helper text" maxLength={80} defaultValue="" />
                                    <Input label="Error" defaultValue="Valor invalido" error="Error de validacion" />
                                    <Input label="Success" defaultValue="Valor correcto" state="success" hint="Campo validado" />
                                    <Input label="Disabled" defaultValue="Solo lectura" disabled />
                                </div>
                            </article>

                            <article className="rounded-[var(--wm-size-12)] border border-[color:var(--border-divider)] p-4">
                                <p className="mb-3 font-wallie-chunky text-[length:var(--wm-size-18)]">Labels</p>
                                <p className="mb-3 font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">
                                    Labels de estado usados en cards de meetup (fuente: tokens `tokens.color.meetup_status.*`).
                                </p>
                                <div className="grid gap-3 md:grid-cols-2">
                                    {statusLabelItems.map((item) => (
                                        <article key={item.name} className="rounded-[var(--wm-size-10)] border border-[color:var(--border-divider)] p-3">
                                            <p className="font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">{item.name}</p>
                                            <span
                                                className="mt-2 inline-flex rounded-full border px-2.5 py-1 font-wallie-fit text-[length:var(--wm-size-11)] leading-[1]"
                                                style={{
                                                    backgroundColor: item.background,
                                                    borderColor: item.border,
                                                    color: item.text,
                                                }}
                                            >
                                                {item.label}
                                            </span>
                                            <p className="mt-2 font-wallie-fit text-[length:var(--wm-size-11)] text-[color:var(--text-secondary)]">{`bg ${item.background}`}</p>
                                            <p className="font-wallie-fit text-[length:var(--wm-size-11)] text-[color:var(--text-secondary)]">{`border ${item.border}`}</p>
                                            <p className="font-wallie-fit text-[length:var(--wm-size-11)] text-[color:var(--text-secondary)]">{`text ${item.text}`}</p>
                                        </article>
                                    ))}
                                </div>
                            </article>

                            <article className="rounded-[var(--wm-size-12)] border border-[color:var(--border-divider)] p-4">
                                <p className="mb-3 font-wallie-chunky text-[length:var(--wm-size-18)]">Select</p>
                                <p className="mb-3 font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">
                                    Selector desplegable para decisiones de una opcion con soporte de error.
                                </p>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Select
                                        label="Categoria"
                                        defaultValue="electronics"
                                        options={[
                                            { value: "electronics", label: "Electronica" },
                                            { value: "home", label: "Hogar" },
                                            { value: "other", label: "Otros" },
                                        ]}
                                    />
                                    <Select
                                        label="Validacion"
                                        state="error"
                                        error="Seleccion requerida"
                                        options={[
                                            { value: "", label: "Selecciona una opcion" },
                                            { value: "one", label: "Opcion uno" },
                                        ]}
                                    />
                                </div>
                            </article>

                            <article className="rounded-[var(--wm-size-12)] border border-[color:var(--border-divider)] p-4">
                                <p className="mb-3 font-wallie-chunky text-[length:var(--wm-size-18)]">Badge</p>
                                <p className="mb-3 font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">
                                    Indicadores compactos para conteo y alertas de estado puntual.
                                </p>
                                <div className="mt-4 flex items-center gap-2">
                                    <Badge variant="unread" value={8} />
                                    <Badge variant="error" value="!" />
                                </div>
                            </article>

                            <article className="rounded-[var(--wm-size-12)] border border-[color:var(--border-divider)] p-4">
                                <p className="mb-3 font-wallie-chunky text-[length:var(--wm-size-18)]">Toast / Snackbar</p>
                                <p className="mb-3 font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">
                                    Alertas efimeras con variantes <code>success</code>, <code>error</code> e <code>info</code>, consumiendo tokens semanticos.
                                </p>
                                <div className="grid gap-3 md:grid-cols-3">
                                    <Toast
                                        variant="success"
                                        title="Has llegado al punto de encuentro"
                                        description="La otra persona ya puede verlo en el chat."
                                    />
                                    <Toast
                                        variant="error"
                                        title="No se pudo confirmar la llegada"
                                        description="Comprueba la conexion e intentalo de nuevo."
                                    />
                                    <Toast
                                        variant="info"
                                        title="Quedada confirmada para hoy"
                                        description="Te avisaremos 15 minutos antes."
                                    />
                                </div>
                            </article>

                            <article className="rounded-[var(--wm-size-12)] border border-[color:var(--border-divider)] p-4">
                                <p className="mb-1 font-wallie-chunky text-[length:var(--wm-size-18)]">Iconografia</p>
                                <p className="mb-3 font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">
                                    Inventario base de iconos con su nombre tecnico y accion principal en producto.
                                </p>
                                <div className="grid gap-3 md:grid-cols-2">
                                    {iconShowcaseItems.map((item) => (
                                        <article key={item.name} className="rounded-[var(--wm-size-10)] border border-[color:var(--border-divider)] p-3">
                                            <div className="flex items-center gap-3">
                                                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--bg-surface)] text-[color:var(--text-primary)]">
                                                    <WallapopIcon name={item.name} size="small" />
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="font-mono text-[length:var(--wm-size-12)] text-[color:var(--text-primary)]">{item.name}</p>
                                                    <p className="font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">{item.mainAction}</p>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </article>
                        </div>
                    </section>

                    <section id="patterns" className="rounded-[var(--wm-size-16)] border border-[color:var(--border-strong)] bg-white p-6">
                        <h2 className="font-wallie-chunky text-[length:var(--wm-size-24)]">Patterns</h2>
                        <p className="mt-1 font-wallie-fit text-[length:var(--wm-size-14)] text-[color:var(--text-secondary)]">
                            Ensamblado de componentes complejos para casos de negocio reales.
                        </p>
                        <div className="mt-5 space-y-4">
                            <article className="rounded-[var(--wm-size-12)] border border-[color:var(--border-divider)] bg-white p-4">
                                <h3 className="mb-3 font-wallie-chunky text-[length:var(--wm-size-18)]">Chat Product Card Pattern</h3>
                                <p className="mb-3 font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">
                                    Versiones clave por rol: vendedor (acciones comerciales) y comprador (estado del anuncio).
                                </p>
                                <div className="overflow-x-auto">
                                    <div className="flex min-w-max gap-4">
                                        <div className="w-[var(--wm-size-360)] shrink-0">
                                            <p className="mb-2 font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">Seller / available</p>
                                            <ChatProductCard
                                                imageSrc="https://images.pexels.com/photos/6993182/pexels-photo-6993182.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=640&h=460"
                                                imageAlt="Consola de ejemplo"
                                                title="Nintendo Switch OLED + dock"
                                                price="240 €"
                                                stats="Publicado hace 2 horas"
                                                viewsCount={28}
                                                likesCount={7}
                                                onReserve={() => {}}
                                                onSold={() => {}}
                                                onEdit={() => {}}
                                            />
                                        </div>
                                        <div className="w-[var(--wm-size-360)] shrink-0">
                                            <p className="mb-2 font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">Buyer / reserved</p>
                                            <ChatProductCard
                                                imageSrc="https://images.pexels.com/photos/6993182/pexels-photo-6993182.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=640&h=460"
                                                imageAlt="Consola de ejemplo"
                                                title="Nintendo Switch OLED + dock"
                                                price="240 €"
                                                viewerRole="buyer"
                                                statusLabel="Reservado"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </article>
                            <article className="rounded-[var(--wm-size-12)] border border-[color:var(--border-divider)] bg-white p-4">
                                <h3 className="mb-3 font-wallie-chunky text-[length:var(--wm-size-18)]">Meetup Card Pattern</h3>
                                <p className="mb-3 font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">
                                    Tarjeta transaccional con variantes por estado para validar jerarquia y acciones.
                                </p>
                                <div className="overflow-x-auto">
                                    <div className="flex min-w-max gap-4">
                                        <div className="w-[var(--wm-size-460)] shrink-0">
                                            <p className="mb-2 font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">PROPOSED / buyer</p>
                                            <MeetupCard
                                                meetup={proposedPatternMeetup}
                                                actorRole="BUYER"
                                                currentTime={now}
                                                onMeetupChange={() => {}}
                                                onError={() => {}}
                                                counterpartName="Laura M."
                                                onEditProposal={() => {}}
                                                onOpenMapPreview={() => {}}
                                                onRedZoneCancelConfirmed={() => {}}
                                            />
                                        </div>
                                        <div className="w-[var(--wm-size-460)] shrink-0">
                                            <p className="mb-2 font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">CONFIRMED / seller</p>
                                            <MeetupCard
                                                meetup={confirmedPatternMeetup}
                                                actorRole="SELLER"
                                                currentTime={now}
                                                onMeetupChange={() => {}}
                                                onError={() => {}}
                                                counterpartName="Laura M."
                                                onEditProposal={() => {}}
                                                onOpenMapPreview={() => {}}
                                                onRedZoneCancelConfirmed={() => {}}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </article>
                            <article className="rounded-[var(--wm-size-12)] border border-[color:var(--border-divider)] bg-white p-4">
                                <h3 className="mb-3 font-wallie-chunky text-[length:var(--wm-size-18)]">Conversation Block Pattern</h3>
                                <p className="mb-3 font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">
                                    Bloque base de conversacion del proyecto: burbujas, banner de seguridad y composer con CTA secundaria por rol.
                                </p>
                                <div className="space-y-2">
                                    <ChatMessageBubble variant="received" time="18:02">
                                        Te va bien quedar hoy en Sants?
                                    </ChatMessageBubble>
                                    <div className="text-right">
                                        <ChatMessageBubble variant="sent" time="18:04" deliveryState="read">
                                            Si, perfecto. Te envio la propuesta.
                                        </ChatMessageBubble>
                                    </div>
                                </div>
                                <div className="mt-3 border-y border-[color:var(--border-divider)] px-1 py-1">
                                    <ChatSecurityBanner
                                        message="Quedate en Wallapop. Mas facil, mas seguro."
                                        linkText="Mas informacion"
                                    />
                                </div>
                                <div className="mt-3">
                                    <ChatComposer
                                        defaultValue=""
                                        onSubmit={() => {}}
                                        onSecondaryAction={() => {}}
                                        secondaryActionLabel="Proponer quedar"
                                        secondaryActionAriaLabel="Proponer quedar"
                                        secondaryActionIconName="calendar"
                                    />
                                </div>
                            </article>
                            <article className="rounded-[var(--wm-size-12)] border border-[color:var(--border-divider)] bg-white p-4">
                                <h3 className="mb-3 font-wallie-chunky text-[length:var(--wm-size-18)]">Counterpart Context Pattern</h3>
                                <p className="mb-3 font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">
                                    Card de contexto del interlocutor para sidebar de conversacion (rating, distancia y asistencia).
                                </p>
                                <div className="w-full max-w-[var(--wm-size-380)] rounded-[var(--wm-size-12)] border border-[color:var(--border-divider)] bg-white p-3">
                                    <p className="mb-2 font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">ChatCounterpartCard</p>
                                    <ChatCounterpartCard
                                        name="Lorena"
                                        rating={4.5}
                                        ratingCount={110}
                                        distanceLabel="42km de ti"
                                        attendanceRate={94}
                                        attendanceMeetups={26}
                                        profileImageSrc="https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=320&h=320"
                                    />
                                </div>
                            </article>
                            <article className="rounded-[var(--wm-size-12)] border border-[color:var(--border-divider)] bg-white p-4">
                                <h3 className="mb-3 font-wallie-chunky text-[length:var(--wm-size-18)]">Inbox Conversation Preview Pattern</h3>
                                <p className="mb-3 font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">
                                    Vista previa de conversacion en buzon con miniatura de articulo y estado comercial.
                                </p>
                                <div className="overflow-x-auto">
                                    <div className="flex min-w-max gap-4">
                                        <div className="w-[var(--wm-size-360)] shrink-0 overflow-hidden rounded-[var(--wm-size-12)] border border-[color:var(--border-divider)] bg-white">
                                            <p className="border-b border-[color:var(--border-divider)] px-3 py-2 font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">
                                                ChatListItem - reservado
                                            </p>
                                            <ChatListItem
                                                userName="Marta"
                                                messageDate="Ayer"
                                                itemTitle="iPhone 13 128GB"
                                                messagePreview="Perfecto, me va bien en el metro."
                                                unreadCount={2}
                                                leadingIndicator="bookmark"
                                                lastMessageDeliveryState="read"
                                                avatarSrc="https://images.pexels.com/photos/6993182/pexels-photo-6993182.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=400&h=400"
                                            />
                                        </div>
                                        <div className="w-[var(--wm-size-360)] shrink-0 overflow-hidden rounded-[var(--wm-size-12)] border border-[color:var(--border-divider)] bg-white">
                                            <p className="border-b border-[color:var(--border-divider)] px-3 py-2 font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">
                                                ChatListItem - vendido
                                            </p>
                                            <ChatListItem
                                                userName="Pau"
                                                messageDate="Hoy"
                                                itemTitle="MacBook Air M2"
                                                messagePreview="Gracias! Queda vendido."
                                                leadingIndicator="deal"
                                                lastMessageDeliveryState="sent"
                                                avatarSrc="https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&fit=crop&w=400&h=400"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </article>
                            <article className="rounded-[var(--wm-size-12)] border border-[color:var(--border-divider)] bg-white p-4">
                                <h3 className="mb-3 font-wallie-chunky text-[length:var(--wm-size-18)]">Proposal Overlay Building Blocks</h3>
                                <p className="mb-3 font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">
                                    Componentes base del overlay al configurar una quedada (header, step heading y footer).
                                </p>
                                <div className="space-y-3 overflow-hidden rounded-[var(--wm-size-12)] border border-[color:var(--border-divider)] bg-white p-3">
                                    <MeetupProposalHeader
                                        currentStep={2}
                                        totalSteps={3}
                                        steps={proposalHeaderSteps}
                                        onClose={() => {}}
                                        onStepChange={() => {}}
                                    />
                                    <div className="px-2">
                                        <MeetupWizardStepHeading
                                            caption="Paso anterior"
                                            title="Seleccionar dia y hora"
                                            onBack={() => {}}
                                        />
                                    </div>
                                    <MeetupProposalFooter
                                        listingImageSrc="https://images.pexels.com/photos/6993182/pexels-photo-6993182.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=400&h=400"
                                        itemTitle="Nintendo Switch OLED + dock"
                                        userName="Laura M."
                                        attendanceRate={94}
                                        attendanceMeetups={26}
                                        actionLabel="Siguiente"
                                        onAction={() => {}}
                                    />
                                </div>
                            </article>
                            <article className="rounded-[var(--wm-size-12)] border border-[color:var(--border-divider)] bg-white p-4">
                                <h3 className="mb-3 font-wallie-chunky text-[length:var(--wm-size-18)]">Proposal Step 1 Pattern</h3>
                                <p className="mb-3 font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">
                                    Seleccion de punto de encuentro con mapa y cards de opciones visibles.
                                </p>
                                <div className="space-y-4">
                                    <div className="overflow-x-auto rounded-[var(--wm-size-12)] border border-[color:var(--border-divider)] p-3">
                                        <div className="flex min-w-max gap-4">
                                            <div className="w-[var(--wm-size-360)] shrink-0 rounded-[var(--wm-size-12)] border border-[color:var(--border-divider)] p-3">
                                                <p className="mb-2 font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">
                                                    Seleccionar punto de encuentro - mapa
                                                </p>
                                                <MeetupLocationMap
                                                    center={{ lat: patternSafePoints[0].lat, lng: patternSafePoints[0].lng }}
                                                    safePoints={patternSafePoints}
                                                    selectedPointId="station"
                                                    selectedCustomPoint={null}
                                                    onMapClick={() => {}}
                                                    onSafePointClick={() => {}}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="rounded-[var(--wm-size-12)] border border-[color:var(--border-divider)] p-3">
                                        <p className="mb-2 font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">
                                            Seleccionar punto de encuentro - opciones
                                        </p>
                                        <div className="overflow-x-auto">
                                            <div className="flex min-w-max gap-3">
                                                <button
                                                    type="button"
                                                    className="w-[var(--wm-size-300)] rounded-[var(--wm-size-18)] border border-[color:var(--text-primary)] px-4 py-4 text-left shadow-[inset_0_0_0_1px_var(--text-primary)]"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <span className="mt-0.5 inline-flex text-[color:var(--text-primary)]">
                                                            <SafeShieldGlyph />
                                                        </span>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-wallie-chunky text-[length:var(--wm-size-18)] leading-tight text-[color:var(--text-primary)]">
                                                                Estacion de Sants
                                                            </p>
                                                            <p className="mt-1 font-wallie-fit text-[length:var(--wm-size-13)] text-[color:var(--text-secondary)]">
                                                                Barcelona, acceso principal
                                                            </p>
                                                            <div className="mt-1 flex items-center gap-2">
                                                                <span className="rounded-full bg-[color:var(--bg-accent-subtle)] px-2 py-0.5 font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--action-primary-pressed)]">
                                                                    Punto seguro
                                                                </span>
                                                                <span className="rounded-full bg-[color:var(--bg-surface)] px-2 py-0.5 font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">
                                                                    824 ventas
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <span className="mt-0.5">
                                                            <ProposalSelectionIndicator selected={true} />
                                                        </span>
                                                    </div>
                                                </button>
                                                <button
                                                    type="button"
                                                    className="w-[var(--wm-size-300)] rounded-[var(--wm-size-18)] border border-[color:var(--border-strong)] px-4 py-4 text-left"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <span className="mt-0.5 inline-flex text-[color:var(--text-primary)]">
                                                            <MapPin size={16} />
                                                        </span>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-wallie-chunky text-[length:var(--wm-size-18)] leading-tight text-[color:var(--text-primary)]">
                                                                Carrer de Tarragona, 95
                                                            </p>
                                                            <p className="mt-1 font-wallie-fit text-[length:var(--wm-size-13)] text-[color:var(--text-secondary)]">
                                                                Punto personalizado
                                                            </p>
                                                        </div>
                                                        <span className="mt-0.5">
                                                            <ProposalSelectionIndicator selected={false} />
                                                        </span>
                                                    </div>
                                                </button>
                                                <button
                                                    type="button"
                                                    className="w-[var(--wm-size-300)] rounded-[var(--wm-size-18)] border border-[color:var(--border-strong)] px-4 py-4 text-left"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--bg-surface)] text-[color:var(--text-primary)]">
                                                            <WallapopIcon name="plus" size={16} />
                                                        </span>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-wallie-chunky text-[length:var(--wm-size-18)] text-[color:var(--text-primary)]">
                                                                Elige un punto
                                                            </p>
                                                            <p className="font-wallie-fit text-[length:var(--wm-size-13)] text-[color:var(--text-secondary)]">
                                                                Puede ser un punto personalizado u otro punto seguro.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                            <article className="rounded-[var(--wm-size-12)] border border-[color:var(--border-divider)] bg-white p-4">
                                <h3 className="mb-3 font-wallie-chunky text-[length:var(--wm-size-18)]">Proposal Step 2 Pattern</h3>
                                <p className="mb-3 font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">
                                    Seleccion de dia y hora con estados de validacion para cada campo.
                                </p>
                                <div className="overflow-x-auto rounded-[var(--wm-size-12)] border border-[color:var(--border-divider)] p-3">
                                    <div className="flex min-w-max gap-4">
                                        <div className="w-[var(--wm-size-360)] shrink-0 space-y-3 rounded-[var(--wm-size-12)] border border-[color:var(--border-divider)] p-3">
                                            <p className="font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">
                                                Seleccionar dia y hora - estado default
                                            </p>
                                            <CalendarPicker
                                                label="Dia"
                                                monthDate={new Date()}
                                                selectedDateValue={new Date().toISOString().slice(0, 10)}
                                                minDateValue={new Date().toISOString().slice(0, 10)}
                                                onMonthChange={() => {}}
                                                onSelectDate={() => {}}
                                            />
                                            <Select
                                                label="Hora"
                                                defaultValue="18:30"
                                                options={[
                                                    { value: "17:30", label: "17:30" },
                                                    { value: "18:00", label: "18:00" },
                                                    { value: "18:30", label: "18:30" },
                                                    { value: "19:00", label: "19:00" },
                                                ]}
                                                dropdownDirection="up"
                                            />
                                        </div>
                                        <div className="w-[var(--wm-size-360)] shrink-0 space-y-3 rounded-[var(--wm-size-12)] border border-[color:var(--border-divider)] p-3">
                                            <p className="font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">
                                                Seleccionar dia y hora - estado error
                                            </p>
                                            <CalendarPicker
                                                label="Dia"
                                                monthDate={new Date()}
                                                selectedDateValue=""
                                                minDateValue={new Date().toISOString().slice(0, 10)}
                                                onMonthChange={() => {}}
                                                onSelectDate={() => {}}
                                                state="error"
                                                error="Selecciona un dia para continuar."
                                            />
                                            <Select
                                                label="Hora"
                                                placeholder="Selecciona hora"
                                                state="error"
                                                error="Selecciona una hora para continuar."
                                                options={[
                                                    { value: "", label: "Selecciona hora", disabled: true },
                                                    { value: "17:30", label: "17:30" },
                                                    { value: "18:00", label: "18:00" },
                                                    { value: "18:30", label: "18:30" },
                                                ]}
                                                dropdownDirection="up"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </article>
                            <article className="rounded-[var(--wm-size-12)] border border-[color:var(--border-divider)] bg-white p-4">
                                <h3 className="mb-3 font-wallie-chunky text-[length:var(--wm-size-18)]">Proposal Step 3 Pattern</h3>
                                <p className="mb-3 font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">
                                    Importe final y preferencia de pago con tres metodos como en el flujo real.
                                </p>
                                <div className="space-y-3 rounded-[var(--wm-size-12)] border border-[color:var(--border-divider)] p-3">
                                    <Input
                                        label="Importe final acordado (€)"
                                        value="220"
                                        onChange={() => {}}
                                        placeholder="Ej: 220"
                                    />
                                    <p className="font-wallie-fit text-[length:var(--wm-size-13)] text-[color:var(--text-primary)]">Preferencia de pago</p>
                                    <div className="overflow-x-auto">
                                        <div className="flex min-w-max gap-3">
                                            <button
                                                type="button"
                                                className="w-[var(--wm-size-180)] rounded-[var(--wm-size-18)] border border-[color:var(--border-strong)] px-4 py-3 text-left"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--bg-surface)] text-[color:var(--text-primary)]">
                                                        <Banknote size={16} />
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-wallie-fit text-[length:var(--wm-size-14)] leading-[1.2] text-[color:var(--text-primary)]">Efectivo</p>
                                                    </div>
                                                    <ProposalSelectionIndicator selected={false} />
                                                </div>
                                            </button>
                                            <button
                                                type="button"
                                                className="w-[var(--wm-size-180)] rounded-[var(--wm-size-18)] border border-[color:var(--text-primary)] px-4 py-3 text-left shadow-[inset_0_0_0_1px_var(--text-primary)]"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--bg-surface)] text-[color:var(--text-primary)]">
                                                        <Smartphone size={16} />
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-wallie-fit text-[length:var(--wm-size-14)] leading-[1.2] text-[color:var(--text-primary)]">Bizum</p>
                                                    </div>
                                                    <ProposalSelectionIndicator selected={true} />
                                                </div>
                                            </button>
                                            <button
                                                type="button"
                                                className="w-[var(--wm-size-180)] rounded-[var(--wm-size-18)] border border-[color:var(--border-strong)] px-4 py-3 text-left"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--bg-surface)] text-[color:var(--text-primary)]">
                                                        <QrCode size={16} />
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-wallie-fit text-[length:var(--wm-size-14)] leading-[1.2] text-[color:var(--text-primary)]">Wallapop Wallet</p>
                                                    </div>
                                                    <ProposalSelectionIndicator selected={false} />
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    )
}

export { DesignSystemPage }


