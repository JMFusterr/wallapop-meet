import * as React from "react"
import styles from "../../styles.json"
import { Button } from "@/components/ui/button"
import { navigateTo } from "@/lib/navigation"
import designSystemCatalog from "@/design-system/generated/design-system-catalog.json"

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
    tokenPath: string
    name: string
    aliasVar: string
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

type CatalogEntity = {
    id: string
    entityType: "component" | "pattern"
    title: string
    description: string
    storybookTitle: string
    states: string[]
}

const wallapopLogoUrl = "https://es.wallapop.com/favicon.ico"

const sectionEntries = [
    { id: "foundations-color", label: "Color" },
    { id: "foundations-semantic-colors", label: "Semantic Colors" },
    { id: "foundations-typography", label: "Typography" },
    { id: "foundations-spacing", label: "Spacing & Layout" },
    { id: "foundations-radius", label: "Corner Radius" },
    { id: "foundations-elevation", label: "Elevation" },
    { id: "components-playground", label: "Components" },
] as const

const storyModules = Object.values(
    import.meta.glob("../components/**/*.stories.tsx", {
        eager: true,
    })
) as Array<Record<string, unknown>>

function resolveStoryModuleByTitle(title: string): Record<string, unknown> | null {
    const module = storyModules.find((item) => {
        const meta = item.default as { title?: string } | undefined
        return meta?.title === title
    })
    return module ?? null
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

function toStartCase(input: string): string {
    return input
        .replaceAll("_", " ")
        .replaceAll("-", " ")
        .split(" ")
        .filter(Boolean)
        .map((chunk) => chunk[0].toUpperCase() + chunk.slice(1))
        .join(" ")
}

function normalizeSemanticColorItems(input: unknown): SemanticColorItem[] {
    if (!isRecord(input)) {
        return []
    }

    const result: SemanticColorItem[] = []
    const walk = (node: unknown, path: string) => {
        if (isTokenLeaf(node)) {
            const semanticSuffix = path.replace(/^tokens\.color\.semantic\./, "")
            result.push({
                tokenPath: path,
                name: toStartCase(semanticSuffix),
                aliasVar: `--wm-color-semantic-${semanticSuffix.replaceAll(".", "-").replaceAll("_", "-")}`,
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

    walk(input, "tokens.color.semantic")
    return result.sort((a, b) => a.tokenPath.localeCompare(b.tokenPath))
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

function resolveTokenColor(path: string): string {
    const value = getByPath(styles, path)
    if (isTokenLeaf(value)) {
        return String(resolveReference(value.value, styles))
    }
    if (typeof value === "string" || typeof value === "number") {
        return String(resolveReference(value, styles))
    }
    return ""
}

function getContrastTextHint(background: string): {
    label: "Texto Blanco" | "Texto Oscuro"
    textColor: string
    pillBackground: string
} {
    const light = resolveTokenColor("tokens.color.palette.neutral.0")
    const dark = resolveTokenColor("tokens.color.palette.neutral.900")
    const lightRatio = contrastRatio(background, light)
    const darkRatio = contrastRatio(background, dark)

    if (lightRatio === 0 && darkRatio === 0) {
        return {
            label: "Texto Oscuro",
            textColor: "var(--text-primary)",
            pillBackground: "var(--bg-surface)",
        }
    }

    if (lightRatio >= darkRatio) {
        return { label: "Texto Blanco", textColor: light, pillBackground: dark }
    }

    return { label: "Texto Oscuro", textColor: dark, pillBackground: light }
}

type StoryVariant = {
    key: string
    label: string
    args: Record<string, unknown>
    render?: (args: Record<string, unknown>) => React.ReactNode
}

type StoryMeta = {
    component?: React.ComponentType<Record<string, unknown>>
    args?: Record<string, unknown>
    argTypes?: Record<string, { options?: unknown[]; control?: unknown }>
}

function buildStoryVariants(module: Record<string, unknown>): StoryVariant[] {
    return Object.entries(module)
        .filter(([key, value]) => key !== "default" && typeof value === "object" && value !== null)
        .map(([key, value]) => {
            const story = value as { args?: Record<string, unknown>; render?: (args: Record<string, unknown>) => React.ReactNode }
            return {
                key,
                label: toStartCase(key),
                args: story.args ?? {},
                render: story.render,
            }
        })
}

function CatalogStoryCard({ entity }: { entity: CatalogEntity }) {
    const module = React.useMemo(() => resolveStoryModuleByTitle(entity.storybookTitle), [entity.storybookTitle])
    const meta = (module?.default ?? {}) as StoryMeta
    const variants = React.useMemo(() => (module ? buildStoryVariants(module) : []), [module])
    const [selectedVariantKey, setSelectedVariantKey] = React.useState(variants[0]?.key ?? "")
    const [argOverrides, setArgOverrides] = React.useState<Record<string, unknown>>({})

    React.useEffect(() => {
        setSelectedVariantKey(variants[0]?.key ?? "")
        setArgOverrides({})
    }, [entity.id, variants])

    if (!module) {
        return (
            <article className="rounded-[var(--wm-size-10)] border border-[color:var(--border-divider)] p-3">
                <p className="font-wallie-chunky text-[length:var(--wm-size-16)] text-[color:var(--text-primary)]">{entity.title}</p>
                <p className="mt-2 font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--feedback-error)]">
                    No hay story disponible para {entity.storybookTitle}.
                </p>
            </article>
        )
    }

    const selectedVariant = variants.find((variant) => variant.key === selectedVariantKey) ?? variants[0]
    const mergedArgs = {
        ...(meta.args ?? {}),
        ...(selectedVariant?.args ?? {}),
        ...argOverrides,
    }

    const argTypes = meta.argTypes ?? {}
    const selectableArgEntries = Object.entries(argTypes)
        .filter(([, config]) => Array.isArray(config.options) && config.options.length > 1)
        .slice(0, 3)

    const preview = selectedVariant?.render
        ? selectedVariant.render(mergedArgs)
        : meta.component
          ? React.createElement(meta.component, mergedArgs)
          : (
            <p className="font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--feedback-error)]">
                Story sin preview renderizable.
            </p>
          )

    return (
        <article className="rounded-[var(--wm-size-10)] border border-[color:var(--border-divider)] p-3">
            <p className="font-wallie-chunky text-[length:var(--wm-size-16)] text-[color:var(--text-primary)]">{entity.title}</p>
            <p className="font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-secondary)]">{entity.storybookTitle}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
                {entity.states.map((state) => (
                    <span
                        key={`${entity.id}-${state}`}
                        className="rounded-full border border-[color:var(--border-divider)] bg-[color:var(--bg-surface)] px-2 py-0.5 font-wallie-fit text-[length:var(--wm-size-11)] text-[color:var(--text-primary)]"
                    >
                        {state}
                    </span>
                ))}
            </div>
            {variants.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                    {variants.map((variant) => (
                        <button
                            key={variant.key}
                            type="button"
                            onClick={() => {
                                setSelectedVariantKey(variant.key)
                                setArgOverrides({})
                            }}
                            className={
                                selectedVariant?.key === variant.key
                                    ? "rounded-full border border-[color:var(--text-primary)] bg-[color:var(--text-primary)] px-2.5 py-1 font-wallie-fit text-[length:var(--wm-size-11)] text-[color:var(--text-inverse)]"
                                    : "rounded-full border border-[color:var(--border-divider)] bg-[color:var(--bg-surface)] px-2.5 py-1 font-wallie-fit text-[length:var(--wm-size-11)] text-[color:var(--text-primary)]"
                            }
                        >
                            {variant.label}
                        </button>
                    ))}
                </div>
            ) : null}
            {selectableArgEntries.length > 0 ? (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {selectableArgEntries.map(([propName, config]) => (
                        <label key={`${entity.id}-${propName}`} className="flex flex-col gap-1">
                            <span className="font-wallie-fit text-[length:var(--wm-size-11)] text-[color:var(--text-secondary)]">{propName}</span>
                            <select
                                value={String(argOverrides[propName] ?? mergedArgs[propName] ?? "")}
                                onChange={(event) => {
                                    const option = (config.options ?? []).find((entry) => String(entry) === event.target.value)
                                    setArgOverrides((previous) => ({
                                        ...previous,
                                        [propName]: option,
                                    }))
                                }}
                                className="rounded-[var(--wm-size-8)] border border-[color:var(--border-divider)] bg-white px-2 py-1 font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-primary)]"
                            >
                                {(config.options ?? []).map((option) => (
                                    <option key={`${propName}-${String(option)}`} value={String(option)}>
                                        {String(option)}
                                    </option>
                                ))}
                            </select>
                        </label>
                    ))}
                </div>
            ) : null}
            <div className="mt-3 rounded-[var(--wm-size-8)] border border-[color:var(--border-divider)] bg-white p-3">
                {preview}
            </div>
        </article>
    )
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
    const semanticColorItems = normalizeSemanticColorItems(colorRoot.semantic)
    const catalogEntities = (
        (designSystemCatalog as { entities?: CatalogEntity[] }).entities ?? []
    ).sort((a, b) => a.title.localeCompare(b.title))
    const catalogComponents = catalogEntities.filter((entity) => entity.entityType === "component")
    const [showAllSemanticColors, setShowAllSemanticColors] = React.useState(false)
    const semanticColorPreviewLimit = 12
    const visibleSemanticColors = showAllSemanticColors
        ? semanticColorItems
        : semanticColorItems.slice(0, semanticColorPreviewLimit)
    const typographyTokens = normalizeTypographyTokens(foundations.typography)
    const spacingTokens = normalizeSpacingTokens(foundations.spacing)
    const radiusTokens = normalizeRadiusTokens(foundations.radius)
    const shadowTokens = normalizeShadowTokens(foundations.shadow)

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
                            componentes base en un unico portal operativo.
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
                                                <div
                                                    className="px-2 py-1.5"
                                                    style={{
                                                        backgroundColor: item.value,
                                                        color: contrastHint.textColor,
                                                    }}
                                                >
                                                    <p className="font-wallie-fit text-[length:var(--wm-size-11)]">
                                                        {item.tokenPath.split(".").pop()}
                                                    </p>
                                                    <p className="font-wallie-fit text-[length:var(--wm-size-11)] opacity-85">{item.value}</p>
                                                    <span
                                                        className="mt-1 inline-flex rounded-full border px-1.5 py-0.5 font-wallie-fit text-[length:var(--wm-size-10)] leading-[1]"
                                                        style={{
                                                            backgroundColor: contrastHint.pillBackground,
                                                            color: contrastHint.textColor,
                                                            borderColor: contrastHint.textColor,
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
                            Inventario dinamico de <code>tokens.color.semantic.*</code>, sincronizado automaticamente desde <code>styles.json</code>.
                        </p>
                        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {visibleSemanticColors.map((item) => (
                                <article key={item.tokenPath} className="rounded-[var(--wm-size-10)] border border-[color:var(--border-divider)] p-3">
                                    <div className="h-12 rounded-[var(--wm-size-8)] border border-[color:var(--border-divider)]" style={{ backgroundColor: item.value }} />
                                    <p className="mt-2 font-wallie-chunky text-[length:var(--wm-size-14)] text-[color:var(--text-primary)]">{item.name}</p>
                                    <p className="mt-1 font-mono text-[length:var(--wm-size-11)] text-[color:var(--text-secondary)]">{item.tokenPath}</p>
                                    <p className="mt-2 font-mono text-[length:var(--wm-size-11)] text-[color:var(--text-primary)]">{`CSS: var(${item.aliasVar})`}</p>
                                    <p className="mt-1 font-wallie-fit text-[length:var(--wm-size-11)] text-[color:var(--text-secondary)]">{item.value}</p>
                                </article>
                            ))}
                        </div>
                        {semanticColorItems.length > semanticColorPreviewLimit ? (
                            <div className="mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAllSemanticColors((previous) => !previous)}
                                    className="rounded-full border border-[color:var(--border-divider)] bg-[color:var(--bg-surface)] px-3 py-1.5 font-wallie-fit text-[length:var(--wm-size-12)] text-[color:var(--text-primary)]"
                                >
                                    {showAllSemanticColors ? "Ver menos" : "Ver más"}
                                </button>
                            </div>
                        ) : null}
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
                        <h2 className="font-wallie-chunky text-[length:var(--wm-size-24)]">Components</h2>
                        <p className="mt-1 font-wallie-fit text-[length:var(--wm-size-14)] text-[color:var(--text-secondary)]">
                            Explora estados y propiedades de cada componente desde previews vivas.
                        </p>
                        <div className="mt-5 space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                {catalogComponents.map((entity) => (
                                    <CatalogStoryCard key={entity.id} entity={entity} />
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    )
}

export { DesignSystemPage }


