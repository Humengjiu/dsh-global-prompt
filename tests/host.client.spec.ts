import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it } from 'vitest'
import { SettingsProvider, settingsNamespace, type SettingsNamespace } from '@deepseek-ai/dsh-settings'
import SystemPrompt, { renderPrompt } from '@deepseek-ai/dsh-system-prompt'
import { apply, GLOBAL_PROMPT_SETTINGS_NAMESPACE } from 'dsh-global-prompt'

class MemorySettings extends SettingsProvider {
  readonly writable = true
  protected load(): Promise<Record<string, unknown>> { return Promise.resolve({}) }
  protected persist(_ns: SettingsNamespace, _section: Record<string, unknown>): Promise<void> {
    return Promise.resolve()
  }
}

describe('ui-global-prompt host', () => {
  it('registers the namespace with defaults and injects the section only when enabled', async () => {
    const ctx = new Context()
    await ctx.plugin(MemorySettings).await()
    await ctx.plugin(SystemPrompt, { persona: 'base persona' }).await()
    const fiber = ctx.plugin({ apply })
    await fiber.await()

    const ns = settingsNamespace(GLOBAL_PROMPT_SETTINGS_NAMESPACE)
    expect(ctx.settings.get(ns)).toEqual({ enabled: false, text: '' })

    // Disabled (the schema default) contributes nothing.
    expect(renderPrompt(await ctx.systemPrompt.assemble())).not.toContain('Hello global')

    await ctx.settings.update(ns, { enabled: true, text: 'Hello global' })
    expect(renderPrompt(await ctx.systemPrompt.assemble())).toContain('Hello global')

    await ctx.settings.update(ns, { enabled: false })
    expect(renderPrompt(await ctx.systemPrompt.assemble())).not.toContain('Hello global')

    await fiber.dispose()
    expect(ctx.settings.describe().map(row => row.ns)).not.toContain(ns)
  })

  it('drops whitespace-only prose from the rendered prompt', async () => {
    const ctx = new Context()
    await ctx.plugin(MemorySettings).await()
    await ctx.plugin(SystemPrompt, { persona: '', includeHarnessIdentity: false }).await()
    await ctx.plugin({ apply }).await()

    const ns = settingsNamespace(GLOBAL_PROMPT_SETTINGS_NAMESPACE)
    await ctx.settings.update(ns, { enabled: true, text: '   \n\t  ' })
    expect(renderPrompt(await ctx.systemPrompt.assemble())).toBe('')
  })
})
