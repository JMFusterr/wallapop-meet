const semanticColorVars = {
    "bg.base": "--bg-base",
    "bg.surface": "--bg-surface",
    "bg.accentSubtle": "--bg-accent-subtle",
    "text.primary": "--text-primary",
    "text.secondary": "--text-secondary",
    "text.inverse": "--text-inverse",
    "text.onAction": "--text-on-action",
    "action.primary": "--action-primary",
    "action.primaryHover": "--action-primary-hover",
    "action.primaryPressed": "--action-primary-pressed",
    "action.disabledBg": "--action-disabled-bg",
    "action.disabledText": "--action-disabled-text",
    "border.divider": "--border-divider",
    "border.strong": "--border-strong",
    "border.focus": "--border-focus",
    "border.error": "--border-error",
    "feedback.success": "--feedback-success",
    "feedback.warning": "--feedback-warning",
    "feedback.error": "--feedback-error",
    "feedback.info": "--feedback-info",
    "status.reserved": "--status-reserved",
    "status.sold": "--status-sold",
    "overlay.scrim": "--overlay-scrim",
} as const

type TokenName = keyof typeof semanticColorVars

function tokenVar(token: TokenName): `var(${string})` {
    return `var(${semanticColorVars[token]})`
}

function tokenVarArbitrary(token: TokenName): `[var(${string})]` {
    return `[var(${semanticColorVars[token]})]`
}

export { semanticColorVars, tokenVar, tokenVarArbitrary }
export type { TokenName }
