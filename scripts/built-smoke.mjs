import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { runInNewContext } from 'node:vm'
import { renderPrompt } from '@deepseek-ai/dsh-system-prompt'
import { profileFixture } from '../tests/profile-fixture.ts'

const module = await import(pathToFileURL(resolve('lib/index.js')).href)
assert.equal('default' in module, false)
let b = await profileFixture(module)
try {
  assert.deepEqual(b.ctx.settings.describe().find(row => row.ns === 'global-prompt').value, { enabled: false, text: '' })
  await b.ctx.settings.update('global-prompt', { enabled: true, text: 'LITERAL {{unregistered}} ACCEPTANCE' })
  assert.ok(renderPrompt(await b.ctx.systemPrompt.assemble()).includes('LITERAL {{unregistered}} ACCEPTANCE'))
  assert.ok((await readFile(b.patchPath, 'utf8')).includes('ACCEPTANCE'))
} finally { await b.ctx.fiber.dispose() }
b = await profileFixture(module, b)
try {
  assert.ok(renderPrompt(await b.ctx.systemPrompt.assemble()).includes('ACCEPTANCE'))
  await b.ctx.settings.update('global-prompt', { enabled: false })
  assert.ok(!renderPrompt(await b.ctx.systemPrompt.assemble()).includes('ACCEPTANCE'))
} finally { await b.ctx.fiber.dispose() }

let registration
runInNewContext(await readFile('lib/client.js', 'utf8'), {
  window: { __ModuleLoader__: { load(entry) { registration = entry } } },
})
assert.equal(registration.id, 'dsh-global-prompt')
assert.equal(typeof registration.factory, 'function')
console.log('Latest released npm artifacts: Host Loader/profile persistence/restart, literal prompt injection and browser factory registration passed.')
