// Auditoria local de solo lectura. Ejecutar desde la raiz: node scripts/audit-inventory.mjs
// Importaciones resueltas por TypeScript, incluidos alias y reexports. No ejecuta e2e.
import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import ts from "typescript"

const root = process.cwd()
const relative = (file) => path.relative(root, file).split(path.sep).join("/")
const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (["__pycache__", ".pytest_cache", ".hypothesis"].includes(entry.name) || entry.name.endsWith(".egg-info"))
      return []
    const file = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(file) : [file]
  })
const files = ["src", "scripts", "tools", "docs", "supabase/migrations"].flatMap(walk).map(relative).sort()
const configFile = ts.readConfigFile("tsconfig.json", ts.sys.readFile)
const config = ts.parseJsonConfigFileContent(configFile.config, ts.sys, root)
const program = ts.createProgram(config.fileNames, config.options)
const checker = program.getTypeChecker()
const sourceFiles = program.getSourceFiles().filter((file) => relative(file.fileName).startsWith("src/"))
const canonical = (symbol) =>
  symbol && (symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol)
const importers = new Map()
for (const file of sourceFiles) {
  const visit = (node) => {
    // Incluye namespace imports y referencias JSX; se excluyen las definiciones locales.
    if (ts.isIdentifier(node)) {
      const symbol = canonical(checker.getSymbolAtLocation(node))
      if (symbol?.declarations?.some((d) => d.getSourceFile() !== file)) {
        const usedBy = importers.get(symbol) ?? new Set()
        usedBy.add(relative(file.fileName))
        importers.set(symbol, usedBy)
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(file)
}
const components = []
const serverActions = []
for (const file of sourceFiles) {
  const module = checker.getSymbolAtLocation(file)
  if (!module) continue
  for (const exported of checker.getExportsOfModule(module)) {
    const symbol = canonical(exported)
    const declaration = symbol.valueDeclaration
    if (!declaration || declaration.getSourceFile() !== file) continue
    const isFunction = ts.isFunctionDeclaration(declaration)
    const name = declaration.name?.getText(file) ?? exported.name
    const entry = {
      name,
      file: relative(file.fileName),
      line: file.getLineAndCharacterOfPosition(declaration.getStart(file)).line + 1,
      consumers: [...(importers.get(symbol) ?? [])].sort(),
    }
    if (isFunction && /^[A-Z]/.test(name) && file.fileName.endsWith(".tsx")) components.push(entry)
    if (isFunction && file.statements.some((s) => ts.isExpressionStatement(s) && s.expression.text === "use server"))
      serverActions.push(entry)
  }
}
const literalColors = []
const webglColors = []
for (const file of files.filter((f) => f.startsWith("src/") && /\.(tsx?|css)$/.test(f) && f !== "src/lib/colors.ts")) {
  const source = readFileSync(file, "utf8")
  // No cuenta rgb(var(...)), referencias a tokens. Cuenta apariciones, no solo lineas.
  for (const match of source.matchAll(/(?<![a-z])(?:rgb|rgba|hsl|hsla)\(\s*\d[^)]*\)|#[\da-f]{3,8}\b/gi)) {
    literalColors.push({ file, line: source.slice(0, match.index).split("\n").length, value: match[0] })
  }
  for (const match of source.matchAll(/const\s+(\w*COLOR\w*)\s*:\s*RGB\s*=\s*(\[[^\]]+\])/g)) {
    webglColors.push({ file, line: source.slice(0, match.index).split("\n").length, name: match[1], value: match[2] })
  }
}
const isFrameworkEntry = (file) => /\/(?:page|layout|not-found)\.tsx$/.test(file)
const unusedComponents = components.filter((c) => c.consumers.length === 0 && !isFrameworkEntry(c.file))
console.log(
  JSON.stringify(
    {
      files,
      components: components.sort((a, b) => a.name.localeCompare(b.name, "en") || a.file.localeCompare(b.file)),
      unusedComponents,
      testOnlyComponents: components.filter(
        (c) => c.consumers.length > 0 && c.consumers.every((f) => /\.test\./.test(f)),
      ),
      serverActions: serverActions.sort((a, b) => a.name.localeCompare(b.name, "en")),
      colorCounts: {
        functions: literalColors.filter((c) => !c.value.startsWith("#")).length,
        hex: literalColors.filter((c) => c.value.startsWith("#")).length,
        webgl: webglColors.length,
      },
      literalColors,
      webglColors,
    },
    null,
    2,
  ),
)
