import styles from "../../styles.json"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ChatProductCard } from "@/components/ui/chat-product-card"
import { ChatMeetupEntry } from "@/components/meetup/chat-meetup-entry"
import { MeetupCard } from "@/components/meetup/meetup-card"
import { ChatComposer } from "@/components/ui/chat-composer"
import { ChatMessageBubble } from "@/components/ui/chat-message-bubble"
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

type ButtonShowcaseVariant = "primary" | "secondary" | "ghost" | "critical" | "tab" | "link"

const buttonShowcaseVariants: Array<{ variant: ButtonShowcaseVariant; label: string }> = [
    { variant: "primary", label: "Primary" },
    { variant: "secondary", label: "Secondary" },
    { variant: "ghost", label: "Ghost" },
    { variant: "critical", label: "Critical" },
    { variant: "tab", label: "Tab" },
    { variant: "link", label: "Link" },
]

const sectionEntries = [
    { id: "foundations-color", label: "Color" },
    { id: "foundations-typography", label: "Typography" },
    { id: "foundations-spacing", label: "Spacing & Layout" },
    { id: "foundations-elevation", label: "Elevation" },
    { id: "components-playground", label: "Components" },
    { id: "patterns", label: "Patterns" },
] as const

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

function DesignSystemPage() {
    const colorTokens = (styles as Record<string, unknown>)["tokens"]
    const foundations = isRecord(colorTokens) ? colorTokens : {}
    const colorRoot = isRecord(foundations.color) ? foundations.color : {}
    const brandColors = normalizeColorTokenGroup("tokens.color.brand", colorRoot.brand)
    const neutralColors = normalizeColorTokenGroup("tokens.color.neutral", colorRoot.neutral)
    const semanticColors = normalizeColorTokenGroup("tokens.color.semantic", colorRoot.semantic)
    const paletteRoot = isRecord(colorRoot.palette) ? colorRoot.palette : {}
    const brandScale = normalizeColorTokenGroup("tokens.color.palette.brand", paletteRoot.brand)
    const reserveScale = normalizeColorTokenGroup("tokens.color.palette.reserve", paletteRoot.reserve)
    const soldScale = normalizeColorTokenGroup("tokens.color.palette.sold", paletteRoot.sold)
    const neutralScale = normalizeColorTokenGroup("tokens.color.palette.neutral", paletteRoot.neutral)
    const typographyTokens = normalizeTypographyTokens(foundations.typography)
    const spacingTokens = normalizeSpacingTokens(foundations.spacing)
    const shadowTokens = normalizeShadowTokens(foundations.shadow)

    const fontPrimary = typographyTokens.find((item) => item.tokenPath.includes("family.primary"))?.value ?? "Wallie"
    const size300 = typographyTokens.find((item) => item.tokenPath.endsWith("size.300"))?.value ?? "16px"
    const size500 = typographyTokens.find((item) => item.tokenPath.endsWith("size.500"))?.value ?? "20px"
    const lineHeight200 = typographyTokens.find((item) => item.tokenPath.endsWith("line_height.200"))?.value ?? "1.4"
    const lineHeight300 = typographyTokens.find((item) => item.tokenPath.endsWith("line_height.300"))?.value ?? "1.5"
    const weightRegular = typographyTokens.find((item) => item.tokenPath.endsWith("weight.regular"))?.value ?? "400"
    const weightBold = typographyTokens.find((item) => item.tokenPath.endsWith("weight.bold"))?.value ?? "700"
    const proposedPatternMeetup = createPatternMeetupMachine("PROPOSED")
    const confirmedPatternMeetup = createPatternMeetupMachine("CONFIRMED")
    const now = new Date()

    return (
        <main className="min-h-dvh bg-[#F5F7F8] text-[#253238]">
            <div className="mx-auto flex w-full max-w-[1400px] gap-8 px-6 py-8">
                <aside className="sticky top-6 hidden h-[calc(100dvh-48px)] w-72 flex-col rounded-[12px] border border-[#D3DEE2] bg-white p-4 lg:flex">
                    <div className="mb-4 border-b border-[#E8ECEF] pb-3">
                        <p className="font-wallie-chunky text-[18px] leading-6">Wallapop Meet</p>
                        <p className="font-wallie-fit text-[12px] text-[#4A5A63]">Living Design System</p>
                    </div>
                    <nav className="space-y-1">
                        {sectionEntries.map((entry) => (
                            <a
                                key={entry.id}
                                href={`#${entry.id}`}
                                className="block rounded-[8px] px-3 py-2 font-wallie-fit text-[13px] text-[#4A5A63] transition-colors hover:bg-[#E9FAF7] hover:text-[#253238]"
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
                    <header className="rounded-[16px] border border-[#D3DEE2] bg-white p-6">
                        <p className="font-wallie-fit text-[12px] uppercase tracking-[0.08em] text-[#4A5A63]">
                            Documentacion viva
                        </p>
                        <h1 className="mt-1 font-wallie-chunky text-[34px] leading-[1.1] text-[#253238]">
                            Design System Viewer
                        </h1>
                        <p className="mt-3 max-w-[65ch] font-wallie-fit text-[15px] leading-6 text-[#4A5A63]">
                            Esta pagina consume tokens de <code>styles.json</code> para documentar foundations,
                            componentes base y patrones de producto en un unico portal operativo.
                        </p>
                    </header>

                    <section id="foundations-color" className="rounded-[16px] border border-[#D3DEE2] bg-white p-6">
                        <h2 className="font-wallie-chunky text-[24px]">Foundations - Color</h2>
                        <p className="mt-1 font-wallie-fit text-[14px] text-[#4A5A63]">
                            Tokens de color con valor resuelto, variable CSS y utilidad Tailwind sugerida.
                        </p>
                        <div className="mt-5 space-y-6">
                            {[
                                { title: "Brand", items: brandColors },
                                { title: "Neutral", items: neutralColors },
                                { title: "Semantic", items: semanticColors },
                            ].map((group) => (
                                <div key={group.title}>
                                    <h3 className="mb-3 font-wallie-chunky text-[18px]">{group.title}</h3>
                                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                        {group.items.map((item) => (
                                            <article
                                                key={item.tokenPath}
                                                className="overflow-hidden rounded-[12px] border border-[#E8ECEF]"
                                            >
                                                <div className="h-16 w-full" style={{ background: item.value }} />
                                                <div className="space-y-1 p-3">
                                                    <p className="font-wallie-fit text-[12px] text-[#253238]">{item.tokenPath}</p>
                                                    <p className="font-wallie-fit text-[12px] text-[#4A5A63]">{item.value}</p>
                                                    <p className="font-wallie-fit text-[11px] text-[#4A5A63]/90">{item.cssVar}</p>
                                                    <p className="font-wallie-fit text-[11px] text-[#4A5A63]/90">{item.tailwindClass}</p>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 space-y-6 border-t border-[#E8ECEF] pt-6">
                            <h3 className="font-wallie-chunky text-[20px]">Official Palette Scales (50-900)</h3>
                            {[
                                { title: "Brand Scale", items: brandScale },
                                { title: "Reserve Purple Scale", items: reserveScale },
                                { title: "Sold Pink Scale", items: soldScale },
                                { title: "Neutral Scale", items: neutralScale },
                            ].map((group) => (
                                <div key={group.title}>
                                    <h4 className="mb-3 font-wallie-chunky text-[17px]">{group.title}</h4>
                                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                        {group.items.map((item) => (
                                            <article key={item.tokenPath} className="overflow-hidden rounded-[12px] border border-[#E8ECEF]">
                                                <div className="h-14 w-full" style={{ background: item.value }} />
                                                <div className="space-y-1 p-3">
                                                    <p className="font-wallie-fit text-[12px] text-[#253238]">{item.tokenPath}</p>
                                                    <p className="font-wallie-fit text-[12px] text-[#4A5A63]">{item.value}</p>
                                                    <p className="font-wallie-fit text-[11px] text-[#4A5A63]/90">{item.cssVar}</p>
                                                    <p className="font-wallie-fit text-[11px] text-[#4A5A63]/90">{item.tailwindClass}</p>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section id="foundations-typography" className="rounded-[16px] border border-[#D3DEE2] bg-white p-6">
                        <h2 className="font-wallie-chunky text-[24px]">Foundations - Typography</h2>
                        <div className="mt-5 grid gap-4 lg:grid-cols-2">
                            <article className="rounded-[12px] border border-[#E8ECEF] p-4">
                                <p className="font-wallie-fit text-[12px] text-[#4A5A63]">Familia primaria</p>
                                <p style={{ fontFamily: fontPrimary }} className="mt-2 text-[28px] leading-tight">
                                    Wallie / Wallapop Meet
                                </p>
                                <p className="mt-2 font-wallie-fit text-[12px] text-[#4A5A63]">{fontPrimary}</p>
                            </article>
                            <article className="rounded-[12px] border border-[#E8ECEF] p-4">
                                <p className="font-wallie-fit text-[12px] text-[#4A5A63]">Escalas tipograficas</p>
                                <p className="mt-2 font-wallie-chunky" style={{ fontSize: size500, lineHeight: lineHeight200 }}>
                                    Heading (H1/H2)
                                </p>
                                <p className="mt-2 font-wallie-fit" style={{ fontSize: size300, lineHeight: lineHeight300 }}>
                                    Body de referencia para copy y contenido de interfaz.
                                </p>
                                <p className="mt-3 font-wallie-fit text-[12px] text-[#4A5A63]">
                                    Pesos: regular {weightRegular} - bold {weightBold}
                                </p>
                            </article>
                        </div>
                    </section>

                    <section id="foundations-spacing" className="rounded-[16px] border border-[#D3DEE2] bg-white p-6">
                        <h2 className="font-wallie-chunky text-[24px]">Foundations - Spacing & Layout</h2>
                        <p className="mt-1 font-wallie-fit text-[14px] text-[#4A5A63]">
                            Escala basada en incrementos de 4px y 8px, consumida desde tokens.
                        </p>
                        <div className="mt-5 grid gap-3">
                            {spacingTokens.map((item) => (
                                <div key={item.tokenPath} className="flex items-center gap-3 rounded-[10px] border border-[#E8ECEF] p-3">
                                    <div className="h-3 rounded-[999px] bg-[#13C1AC]" style={{ width: `${Math.max(item.pixels, 2)}px` }} />
                                    <p className="w-[190px] font-wallie-fit text-[12px]">{item.tokenPath}</p>
                                    <p className="font-wallie-fit text-[12px] text-[#4A5A63]">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section id="foundations-elevation" className="rounded-[16px] border border-[#D3DEE2] bg-white p-6">
                        <h2 className="font-wallie-chunky text-[24px]">Foundations - Elevation</h2>
                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            {shadowTokens.map((item) => (
                                <article key={item.tokenPath} className="rounded-[12px] border border-[#E8ECEF] bg-white p-4">
                                    <div className="h-20 rounded-[10px] bg-white" style={{ boxShadow: item.value }} />
                                    <p className="mt-3 font-wallie-fit text-[12px]">{item.tokenPath}</p>
                                    <p className="font-wallie-fit text-[12px] text-[#4A5A63]">{item.value}</p>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section id="components-playground" className="rounded-[16px] border border-[#D3DEE2] bg-white p-6">
                        <h2 className="font-wallie-chunky text-[24px]">Components - Playground</h2>
                        <div className="mt-5 space-y-6">
                            <article className="rounded-[12px] border border-[#E8ECEF] p-4">
                                <p className="mb-3 font-wallie-chunky text-[18px]">Button</p>
                                <p className="mb-3 font-wallie-fit text-[12px] text-[#4A5A63]">
                                    Estados visuales simulados: default, hover, active, disabled.
                                </p>
                                <div className="overflow-auto rounded-[10px] border border-[#E8ECEF]">
                                    <div className="grid min-w-[860px] grid-cols-[160px_repeat(4,minmax(150px,1fr))]">
                                        <div className="border-b border-r border-[#E8ECEF] bg-[#F5F7F8] px-3 py-2 font-wallie-fit text-[12px] text-[#4A5A63]">
                                            Variante
                                        </div>
                                        <div className="border-b border-r border-[#E8ECEF] bg-[#F5F7F8] px-3 py-2 text-center font-wallie-fit text-[12px] text-[#4A5A63]">Default</div>
                                        <div className="border-b border-r border-[#E8ECEF] bg-[#F5F7F8] px-3 py-2 text-center font-wallie-fit text-[12px] text-[#4A5A63]">Hover</div>
                                        <div className="border-b border-r border-[#E8ECEF] bg-[#F5F7F8] px-3 py-2 text-center font-wallie-fit text-[12px] text-[#4A5A63]">Active</div>
                                        <div className="border-b border-[#E8ECEF] bg-[#F5F7F8] px-3 py-2 text-center font-wallie-fit text-[12px] text-[#4A5A63]">Disabled</div>
                                        {buttonShowcaseVariants.map((entry) => {
                                            const hoverClass =
                                                entry.variant === "secondary"
                                                    ? "bg-[#F5FFFD]"
                                                    : entry.variant === "ghost"
                                                      ? "text-[#4A5A63]"
                                                      : entry.variant === "link"
                                                        ? "text-[#0FA896]"
                                                        : entry.variant === "tab"
                                                          ? "bg-[rgba(16,42,67,0.06)]"
                                                          : "brightness-[0.98]"
                                            const activeClass =
                                                entry.variant === "secondary"
                                                    ? "bg-[#E9FAF7]"
                                                    : entry.variant === "ghost"
                                                      ? "text-[#253238]"
                                                      : entry.variant === "link"
                                                        ? "text-[#0C8E7E]"
                                                        : entry.variant === "tab"
                                                          ? "bg-[rgba(16,42,67,0.12)]"
                                                          : "brightness-95"
                                            const disabledLabel =
                                                entry.variant === "link" ? "Link" : entry.label

                                            return (
                                                <div key={entry.variant} className="contents">
                                                    <div className="border-r border-b border-[#E8ECEF] px-3 py-3 font-wallie-fit text-[12px] text-[#253238]">
                                                        {entry.label}
                                                    </div>
                                                    <div className="border-r border-b border-[#E8ECEF] px-3 py-3 text-center">
                                                        <Button variant={entry.variant} size="sm">
                                                            {entry.label}
                                                        </Button>
                                                    </div>
                                                    <div className="border-r border-b border-[#E8ECEF] px-3 py-3 text-center">
                                                        <Button variant={entry.variant} size="sm" className={hoverClass}>
                                                            {entry.label}
                                                        </Button>
                                                    </div>
                                                    <div className="border-r border-b border-[#E8ECEF] px-3 py-3 text-center">
                                                        <Button variant={entry.variant} size="sm" className={activeClass}>
                                                            {entry.label}
                                                        </Button>
                                                    </div>
                                                    <div className="border-b border-[#E8ECEF] px-3 py-3 text-center">
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

                            <article className="rounded-[12px] border border-[#E8ECEF] p-4">
                                <p className="mb-3 font-wallie-chunky text-[18px]">Link Text</p>
                                <div className="flex flex-wrap items-center gap-4">
                                    <Button variant="link" size="sm">
                                        Mas informacion
                                    </Button>
                                    <Button variant="link" size="sm">
                                        Ver condiciones
                                    </Button>
                                    <Button variant="link" size="sm" disabled>
                                        Enlace deshabilitado
                                    </Button>
                                </div>
                            </article>

                            <article className="rounded-[12px] border border-[#E8ECEF] p-4">
                                <p className="mb-3 font-wallie-chunky text-[18px]">Input</p>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Input label="Default" placeholder="Escribe algo" hint="Helper text" maxLength={80} defaultValue="" />
                                    <Input label="Error" defaultValue="Valor invalido" error="Error de validacion" />
                                    <Input label="Success" defaultValue="Valor correcto" state="success" hint="Campo validado" />
                                    <Input label="Disabled" defaultValue="Solo lectura" disabled />
                                </div>
                            </article>

                            <article className="rounded-[12px] border border-[#E8ECEF] p-4">
                                <p className="mb-3 font-wallie-chunky text-[18px]">Select + Badge</p>
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
                                <div className="mt-4 flex items-center gap-2">
                                    <Badge variant="unread" value={8} />
                                    <Badge variant="success" value="OK" />
                                    <Badge variant="error" value="!" />
                                </div>
                            </article>
                        </div>
                    </section>

                    <section id="patterns" className="rounded-[16px] border border-[#D3DEE2] bg-white p-6">
                        <h2 className="font-wallie-chunky text-[24px]">Patterns</h2>
                        <p className="mt-1 font-wallie-fit text-[14px] text-[#4A5A63]">
                            Ensamblado de componentes complejos para casos de negocio reales.
                        </p>
                        <div className="mt-5 grid gap-4 xl:grid-cols-2">
                            <ChatProductCard
                                imageSrc="https://images.pexels.com/photos/6993182/pexels-photo-6993182.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=640&h=460"
                                imageAlt="Consola de ejemplo"
                                title="Nintendo Switch OLED + dock"
                                price="240 EUR"
                                stats="Publicado hace 2 horas"
                                viewsCount={28}
                                likesCount={7}
                                onReserve={() => {}}
                                onSold={() => {}}
                                onEdit={() => {}}
                                statusLabel="Reservado"
                            />
                            <article className="rounded-[12px] border border-[#E8ECEF] bg-white p-4">
                                <h3 className="mb-3 font-wallie-chunky text-[18px]">Chat to Entry Pattern</h3>
                                <ChatMeetupEntry
                                    meetup={proposedPatternMeetup}
                                    actorRole="SELLER"
                                    currentTime={now}
                                    onMeetupChange={() => {}}
                                    onError={() => {}}
                                />
                            </article>
                            <article className="rounded-[12px] border border-[#E8ECEF] bg-white p-4">
                                <h3 className="mb-3 font-wallie-chunky text-[18px]">Meetup Card Pattern</h3>
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
                            </article>
                            <article className="rounded-[12px] border border-[#E8ECEF] bg-white p-4">
                                <h3 className="mb-3 font-wallie-chunky text-[18px]">Conversation Block Pattern</h3>
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
                                <div className="mt-3">
                                    <ChatComposer
                                        defaultValue=""
                                        onSubmit={() => {}}
                                        onSecondaryAction={() => {}}
                                        secondaryActionLabel="Adjuntar"
                                    />
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
