export type DesignSystemEntityType = "component" | "pattern"

export type DesignSystemEntityStatus = "draft" | "ready" | "deprecated"

export type DesignSystemEntityMeta = {
    id: string
    entityType: DesignSystemEntityType
    title: string
    description: string
    status: DesignSystemEntityStatus
    states: string[]
    storybookTitle: `Design System/${string}`
    tokensUsed: string[]
}

