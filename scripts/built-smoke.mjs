import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mkdtemp, readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve, join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { runInNewContext } from 'node:vm'

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const harness = process.env.DSH_HARNESS_DIR
if (!harness) throw new Error('Run npm run smoke through the dependency wrapper.')
const importBuilt = async path => import(pathToFileURL(resolve(harness, path)).href)
const { Context } = await importBuilt('vendor/cordis/lib/index.js')
const { default: Loader } = await importBuilt('vendor/loader/lib/index.js')
const { default: Include } = await importBuilt('vendor/include/lib/index.js')
const { renderPrompt } = await importBuilt('packages/core/system-prompt/lib/index.js')
const plugin = await import(pathToFileURL(join(project, 'lib/index.js')).href)
assert.equal('default' in plugin, false, 'function plugin must expose named exports')
await mkdir(join(project, '.work'), { recursive: true })
const fixture = await mkdtemp(join(project, '.work/acceptance-'))
const settingsPath = join(fixture, 'settings.yaml')
const configPath = join(fixture, 'cordis.yml')
const moduleUrl = path => pathToFileURL(resolve(harness, path)).href
await writeFile(configPath, [
  '- id: settings',
  '  name: ' + JSON.stringify(moduleUrl('packages/settings/settings-file/lib/index.js')),
  '  config:',
  '    path: ' + JSON.stringify(settingsPath),
  '    watch: false',
  '- id: system-prompt',
  '  name: ' + JSON.stringify(moduleUrl('packages/core/system-prompt/lib/index.js')),
  '  config:',
  '    persona: BASE_PERSONA_ACCEPTANCE',
  '    includeHarnessIdentity: false',
  '- id: ui-global-prompt',
  '  name: ' + JSON.stringify(pathToFileURL(join(project, 'lib/index.js')).href),
  '',
].join('\n'))

async function boot() {
  const ctx = new Context()
  ctx.baseUrl = pathToFileURL(fixture).href + '/'
  try {
    await ctx.plugin(Loader).await()
    ctx.loader.builtins.include = Include
    await ctx.loader.create({ name: 'cordis:include', config: { path: pathToFileURL(configPath).href } })
    await ctx.loader.await()
    assert.ok(ctx.get('settings'))
    assert.ok(ctx.get('systemPrompt'))
    return ctx
  } catch (error) {
    await ctx.fiber.dispose()
    throw error
  }
}

const prose = 'COMMUNITY_GLOBAL_PROMPT_ACCEPTANCE'
let ctx = await boot()
try {
  assert.deepEqual(ctx.settings.get('global-prompt'), { enabled: false, text: '' })
  await ctx.settings.update('global-prompt', { enabled: true, text: prose })
  const prompt = renderPrompt(await ctx.systemPrompt.assemble())
  assert.ok(prompt.includes(prose))
  assert.ok(prompt.indexOf('BASE_PERSONA_ACCEPTANCE') < prompt.indexOf(prose))
  assert.ok((await readFile(settingsPath, 'utf8')).includes(prose))
} finally {
  await ctx.fiber.dispose()
}
ctx = await boot()
try {
  assert.equal(ctx.settings.get('global-prompt').text, prose)
  assert.ok(renderPrompt(await ctx.systemPrompt.assemble()).includes(prose))
  await ctx.settings.update('global-prompt', { enabled: false })
  assert.ok(!renderPrompt(await ctx.systemPrompt.assemble()).includes(prose))
  await ctx.settings.update('global-prompt', { enabled: true, text: ' \n\t ' })
  assert.equal(renderPrompt(await ctx.systemPrompt.assemble()).trim(), 'BASE_PERSONA_ACCEPTANCE')
  await ctx.settings.update('global-prompt', { text: prose })
  const entry = [...ctx.loader.entries()].find(row => row.options.id === 'ui-global-prompt')
  assert.ok(entry, 'community plugin entry must be present in the composed Loader tree')
  await entry.parent.tree.remove(entry.options.id)
  await ctx.loader.await()
  assert.ok(!ctx.settings.describe().some(row => row.ns === 'global-prompt'))
  assert.ok(!renderPrompt(await ctx.systemPrompt.assemble()).includes(prose))
} finally {
  await ctx.fiber.dispose()
}

let registered
const styles = []
const document = {
  querySelector() { return null },
  createElement() { return { dataset: {}, textContent: '' } },
  head: { appendChild(tag) { styles.push(tag) } },
}
const require = createRequire(join(project, 'package.json'))
runInNewContext(await readFile(join(project, 'lib/client.js'), 'utf8'), {
  window: { __ModuleLoader__: { load(entry) { registered = entry } } },
  document,
})
assert.equal(registered?.id, 'dsh-global-prompt')
const browserExports = registered.factory(specifier => {
  if (specifier === '@deepseek-ai/dsh-client-runtime/client') return { defineStore() { throw new Error('Unexpected store execution during factory load') } }
  if (specifier === 'react' || specifier === 'react/jsx-runtime') return require(specifier)
  throw new Error('Unexpected browser external: ' + specifier)
})
assert.equal(typeof browserExports.apply, 'function')
assert.deepEqual(Array.from(browserExports.inject), ['slots', 'locale', 'connection', 'remote', 'settingsScope'])
assert.ok(styles.some(tag => tag.dataset.plugin === 'dsh-global-prompt' && tag.textContent.length > 0))
console.log('Built artifact smoke passed: Loader composition, prompt order, file persistence/restart, disable/blank filtering, unload cleanup, browser factory id/CSS.')
