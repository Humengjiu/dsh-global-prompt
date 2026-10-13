import { spawnSync } from 'node:child_process'
import { existsSync, lstatSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
const project = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const output = resolve(project, 'lib')
if (output !== join(project, 'lib') || existsSync(output) && lstatSync(output).isSymbolicLink()) {
  throw new Error('Refusing to clear an unexpected build output path.')
}
if (existsSync(output)) rmSync(output, { recursive: true })
for (const [tool, args] of [['typescript/bin/tsc', ['-p', 'tsconfig.json']], ['tsdown/dist/run.mjs', ['--config', 'tsdown.config.ts']]]) {
  const result = spawnSync(process.execPath, [join(project, 'node_modules', tool), ...args], { cwd: project, stdio: 'inherit', windowsHide: true })
  if (result.status !== 0) process.exit(result.status ?? 1)
}
const client = join(output, 'client.js')
writeFileSync(client, readFileSync(client, 'utf8').replaceAll(project, '.').replaceAll(project.replaceAll('\\', '/'), '.'), 'utf8')
