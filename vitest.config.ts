import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'
import { defineConfig } from 'vitest/config'

const harness = process.env.DSH_HARNESS_DIR
if (!harness) throw new Error('Run npm test; its wrapper sets DSH_HARNESS_DIR.')
const { standardDecoratorPlugin, vitestExecArgv } = await import(pathToFileURL(resolve(harness, 'vitest.shared.ts')).href)
const base = ts.readConfigFile(resolve(harness, 'tsconfig.base.json'), ts.sys.readFile)
if (base.error) throw new Error(ts.flattenDiagnosticMessageText(base.error.messageText, '\n'))
const compilerOptions = ts.convertCompilerOptionsFromJson(base.config.compilerOptions, harness).options
compilerOptions.baseUrl = harness
const sourceResolver = {
  name: 'pinned-harness-source',
  enforce: 'pre' as const,
  resolveId(source: string, importer: string | undefined) {
    if (!source.startsWith('@deepseek-ai/')) return null
    const module = ts.resolveModuleName(source, importer?.split('?')[0] ?? resolve('src/index.ts'), compilerOptions, ts.sys).resolvedModule
    if (!module || module.resolvedFileName.endsWith('.d.ts')) return null
    return module.resolvedFileName
  },
}
export default defineConfig({
  plugins: [sourceResolver, standardDecoratorPlugin()],
  resolve: { alias: [
    { find: 'dsh-global-prompt/client', replacement: resolve('src/client/index.ts') },
    { find: 'dsh-global-prompt/invariant', replacement: resolve('src/invariant.ts') },
    { find: 'dsh-global-prompt', replacement: resolve('src/index.ts') },
  ] },
  test: { include: ['tests/**/*.spec.{ts,tsx}'], pool: 'forks', execArgv: vitestExecArgv },
})
