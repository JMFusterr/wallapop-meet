import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs"
import path from "node:path"

const rootDir = process.cwd()
const srcDir = path.join(rootDir, "src")
const baselinePath = path.join(rootDir, ".design-system-audit-baseline.json")
const configPath = path.join(rootDir, ".design-system-audit.config.json")

const isUpdateMode = process.argv.includes("--update-baseline")

const defaultConfig = {
    ignoreFiles: [
        "src/index.css",
        "src/App.css",
    ],
    ignorePathPrefixes: [
        "src/assets/",
        "src/stories/assets/",
    ],
    ignoreLinePatterns: [
        "https://",
        "http://",
    ],
}

function loadJson(filePath, fallback) {
    try {
        return JSON.parse(readFileSync(filePath, "utf8"))
    } catch {
        return fallback
    }
}

function walkFiles(dir, out = []) {
    for (const entry of readdirSync(dir)) {
        const fullPath = path.join(dir, entry)
        const st = statSync(fullPath)
        if (st.isDirectory()) {
            walkFiles(fullPath, out)
            continue
        }
        if (!/\.(ts|tsx|css)$/.test(entry)) {
            continue
        }
        out.push(fullPath)
    }
    return out
}

function toProjectPath(filePath) {
    return path.relative(rootDir, filePath).replaceAll("\\", "/")
}

function isIgnoredLine(line, config) {
    return config.ignoreLinePatterns.some((pattern) => line.includes(pattern))
}

function findViolations(filePath, config) {
    const projectPath = toProjectPath(filePath)
    if (config.ignoreFiles.includes(projectPath)) {
        return []
    }
    if ((config.ignorePathPrefixes ?? []).some((prefix) => projectPath.startsWith(prefix))) {
        return []
    }

    const lines = readFileSync(filePath, "utf8").split(/\r?\n/)
    const violations = []
    const colorHardcodeRegex = /#(?:[0-9a-fA-F]{3,8})\b|rgba?\(|hsla?\(/g
    const arbitraryPxRegex = /\[[0-9]+px\]/g

    for (let lineNumber = 1; lineNumber <= lines.length; lineNumber++) {
        const line = lines[lineNumber - 1] ?? ""
        if (isIgnoredLine(line, config)) {
            continue
        }

        if (colorHardcodeRegex.test(line)) {
            violations.push({
                file: projectPath,
                line: lineNumber,
                type: "color-hardcode",
                text: line.trim(),
            })
        }

        if (arbitraryPxRegex.test(line)) {
            violations.push({
                file: projectPath,
                line: lineNumber,
                type: "arbitrary-px",
                text: line.trim(),
            })
        }
    }

    return violations
}

function keyOf(v) {
    return `${v.file}:${v.line}:${v.type}:${v.text}`
}

const config = loadJson(configPath, defaultConfig)
const files = walkFiles(srcDir)
const violations = files.flatMap((file) => findViolations(file, config))

if (isUpdateMode) {
    writeFileSync(baselinePath, JSON.stringify(violations, null, 2) + "\n")
    console.log(`Baseline actualizada con ${violations.length} incidencias.`)
    process.exit(0)
}

const baseline = loadJson(baselinePath, [])
const baselineKeys = new Set(baseline.map(keyOf))
const newViolations = violations.filter((v) => !baselineKeys.has(keyOf(v)))

if (newViolations.length > 0) {
    console.error("Nueva deuda de Design System detectada:")
    for (const issue of newViolations.slice(0, 80)) {
        console.error(`- ${issue.file}:${issue.line} [${issue.type}] ${issue.text}`)
    }
    if (newViolations.length > 80) {
        console.error(`... y ${newViolations.length - 80} incidencias mas.`)
    }
    process.exit(1)
}

console.log(
    `Audit OK. Incidencias totales=${violations.length}. Nuevas incidencias=${newViolations.length}.`
)
