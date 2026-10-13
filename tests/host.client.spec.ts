import { describe, it, expect } from 'vitest'
import { readFile } from 'node:fs/promises'
import { renderPrompt } from '@deepseek-ai/dsh-system-prompt'
import * as GlobalPrompt from '../src/index.ts'
import { profileFixture } from './profile-fixture.ts'

describe('official 0.2.1-alpha.2 Host', () => {
  it('projects disabled defaults and owns a custom settings page', async () => {
    const b = await profileFixture(GlobalPrompt)
    try {
      expect(b.ctx.settings.describe().find(row => row.ns === 'global-prompt'))
        .toMatchObject({ autoGenerate: false, value: { enabled: false, text: '' } })
      expect(renderPrompt(await b.ctx.systemPrompt.assemble())).toBe('BASE_PERSONA')
    } finally { await b.ctx.fiber.dispose() }
  })

  it('updates live references without remount, preserves literal braces and signals prompt change', async () => {
    const b = await profileFixture(GlobalPrompt)
    try {
      const entry = [...b.ctx.loader.entries()].find(row => row.options.id === 'global-prompt')!
      const original = entry.fiber
      let changed = 0
      b.ctx.on('system-prompt/change', () => { changed++ })
      const text = 'Keep {{unknown_variable}} and {{}} literally.\n  preserve whitespace  '
      await b.ctx.settings.update('global-prompt', { enabled: true, text })
      expect(entry.fiber).toBe(original)
      const assembled = await b.ctx.systemPrompt.assemble()
      expect(assembled.sections.find(section => section.name === 'user:global-prompt')).toMatchObject({ text, interpolate: false })
      expect(renderPrompt(assembled)).toContain(text)
      expect(renderPrompt(assembled).indexOf('BASE_PERSONA')).toBeLessThan(renderPrompt(assembled).indexOf(text))
      expect(changed).toBeGreaterThan(0)
      expect(await readFile(b.patchPath, 'utf8')).toContain('unknown_variable')
      await b.ctx.settings.update('global-prompt', { enabled: false })
      expect(renderPrompt(await b.ctx.systemPrompt.assemble())).not.toContain(text)
      await b.ctx.settings.update('global-prompt', { enabled: true, text: ' \n\t ' })
      expect(renderPrompt(await b.ctx.systemPrompt.assemble())).toBe('BASE_PERSONA')
    } finally { await b.ctx.fiber.dispose() }
  })

  it('restores persisted instructions on restart and honors revision conflicts', async () => {
    let b = await profileFixture(GlobalPrompt)
    await b.ctx.settings.update('global-prompt', { enabled: true, text: 'SAVED' })
    await b.ctx.fiber.dispose()
    b = await profileFixture(GlobalPrompt, b)
    try {
      expect(renderPrompt(await b.ctx.systemPrompt.assemble())).toContain('SAVED')
      const revision = b.ctx.settings.describe().find(row => row.ns === 'global-prompt')!.revision
      await b.ctx.settings.update('global-prompt', { text: 'NEW' }, revision)
      await expect(b.ctx.settings.update('global-prompt', { text: 'STALE' }, revision)).rejects.toMatchObject({ code: 'SETTINGS_CONFLICT' })
      expect(renderPrompt(await b.ctx.systemPrompt.assemble())).toContain('NEW')
    } finally { await b.ctx.fiber.dispose() }
  })

  it('removes the global section when its owning Loader entry is disposed', async () => {
    const b = await profileFixture(GlobalPrompt)
    try {
      await b.ctx.settings.update('global-prompt', { enabled: true, text: 'UNLOAD' })
      const entry = [...b.ctx.loader.entries()].find(row => row.options.id === 'global-prompt')!
      await entry.parent.tree.remove(entry.options.id)
      await b.ctx.loader.await()
      expect(renderPrompt(await b.ctx.systemPrompt.assemble())).not.toContain('UNLOAD')
    } finally { await b.ctx.fiber.dispose() }
  })
})
