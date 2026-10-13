import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PIN = 'efdbb6694b639cf9bf7aeac727d7c0a79a18c0b6'
const harness = resolve(process.env.DSH_HARNESS_DIR || join(project, '.work/harness'))
const command = process.argv[2] || 'check'
const env = { ...process.env, DSH_HARNESS_DIR: harness }

function run(executable, args, cwd = project, capture = false) {
  const result = spawnSync(executable, args, {
    cwd, env, encoding: 'utf8', stdio: capture ? 'pipe' : 'inherit',
    shell: process.platform === 'win32' && executable === 'pnpm',
    windowsHide: true,
  })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(executable + ' failed with exit code ' + result.status)
  return result.stdout?.trim()
}

function assertSnapshot() {
  if (!existsSync(join(harness, '.git'))) throw new Error('Run npm run setup first or set DSH_HARNESS_DIR to the supported checkout.')
  const head = run('git', ['rev-parse', 'HEAD'], harness, true)
  if (head !== PIN) throw new Error('Unsupported harness commit: ' + head + '. Required: ' + PIN)
  if (run('git', ['status', '--porcelain', '--untracked-files=no'], harness, true)) {
    throw new Error('The supported harness checkout has tracked changes; use a clean dependency checkout.')
  }
}

function linkDependency(name, candidates) {
  const target = candidates.find(path => existsSync(join(path, 'package.json')))
  if (!target) throw new Error('Missing dependency ' + name + '; run npm run setup.')
  const destination = join(project, 'node_modules', name)
  if (existsSync(destination)) {
    if (realpathSync(destination) !== realpathSync(target)) throw new Error('Existing dependency differs: ' + name)
    return
  }
  mkdirSync(dirname(destination), { recursive: true })
  symlinkSync(target, destination, process.platform === 'win32' ? 'junction' : 'dir')
}

function linkDependencies() {
  const paths = {
    '@deepseek-ai/cordis': 'vendor/cordis',
    '@deepseek-ai/schemastery': 'vendor/schemastery',
    '@deepseek-ai/dsh-settings': 'packages/settings/settings',
    '@deepseek-ai/dsh-system-prompt': 'packages/core/system-prompt',
    '@deepseek-ai/dsh-invariants': 'packages/runtime-diagnostics/invariants',
    '@deepseek-ai/dsh-client-runtime': 'packages/client/runtime',
    '@deepseek-ai/dsh-client-ui-slots': 'packages/client/ui-slots',
    '@deepseek-ai/dsh-client-ui-settings': 'packages/client/ui-settings',
    '@deepseek-ai/dsh-client-locale': 'packages/client/locale',
    '@deepseek-ai/dsh-client-connection': 'packages/client/connection',
    '@deepseek-ai/dsh-api-remotes': 'packages/api/remotes',
    '@deepseek-ai/dsh-client-test-runtime': 'packages/test-support/client-runtime',
    '@deepseek-ai/dsh-client-web-react': 'packages/client/web-react',
  }
  for (const [name, path] of Object.entries(paths)) linkDependency(name, [join(harness, path)])
  for (const name of ['react', '@types/react', 'vite-tsconfig-paths', 'vitest', 'typescript', 'tsdown', 'lightningcss', 'jsdom', '@testing-library/react', '@testing-library/dom']) {
    linkDependency(name, [
      join(harness, 'node_modules', name),
      join(harness, 'packages/client/ui-global-prompt/node_modules', name),
    ])
  }
}

function tool(name, args) {
  const manifest = JSON.parse(readFileSync(join(project, 'node_modules', name, 'package.json'), 'utf8'))
  const bin = typeof manifest.bin === 'string' ? manifest.bin : manifest.bin[Object.keys(manifest.bin)[0]]
  run(process.execPath, [join(project, 'node_modules', name, bin), ...args])
}

function prepareTypes() {
  if (!existsSync(join(harness, 'packages/interaction/commands/lib/typert.remote-client.d.ts'))) {
    run('pnpm', ['run', 'build:lib:host'], harness)
  }
  run('pnpm', ['exec', 'tsc', '-b', 'packages/client/ui-global-prompt/tsconfig.json'], harness)
}

function build() {
  prepareTypes()
  tool('typescript', ['-p', 'tsconfig.json'])
  tool('tsdown', ['--config', 'tsdown.config.ts'])
  const client = join(project, 'lib/client.js')
  writeFileSync(client, readFileSync(client, 'utf8').replaceAll(project, '.').replaceAll(project.replaceAll('\\', '/'), '.'), 'utf8')
}

try {
  if (command === 'setup') {
    if (!existsSync(join(harness, '.git'))) {
      if (existsSync(harness)) throw new Error('Refusing to clone over an existing non-Git directory.')
      mkdirSync(dirname(harness), { recursive: true })
      run('git', ['clone', '--depth', '1', '--branch', 'feat/global-prompt-settings',
        'https://github.com/Humengjiu/deepseek-harness.git', harness])
    }
    assertSnapshot()
    run('pnpm', ['install', '--frozen-lockfile'], harness)
    linkDependencies()
  } else {
    assertSnapshot()
    linkDependencies()
    if (command === 'test' || command === 'check') tool('vitest', ['run', '--config', 'vitest.config.ts'])
    if (command === 'build' || command === 'check') build()
    if (command === 'smoke' || command === 'check') run(process.execPath, ['scripts/built-smoke.mjs'])
    if (command === 'pack') {
      for (const path of ['lib/index.js', 'lib/invariant.js', 'lib/client.js', 'lib/types/index.d.ts']) {
        if (!existsSync(join(project, path))) throw new Error('Missing build artifact: ' + path + '; run npm run build.')
      }
      mkdirSync(join(project, 'dist'), { recursive: true })
      run('pnpm', ['pack', '--pack-destination', 'dist'])
    }
    if (!['setup', 'test', 'build', 'smoke', 'pack', 'check'].includes(command)) throw new Error('Unknown command: ' + command)
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
