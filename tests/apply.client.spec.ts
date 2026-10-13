/** ui-global-prompt apply wiring: settings-scope binding, declaration-aware
 * section registration, snapshot projection into the section store, and face
 * write routing back to the settings transport. */
import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it, vi } from 'vitest'
import { SlotRegistry } from '@deepseek-ai/dsh-client-runtime/client'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { TestRemote } from '@deepseek-ai/dsh-client-test-runtime'
import { SettingsScopeBinder } from '@deepseek-ai/dsh-client-ui-settings/client'
import { apply, inject, SETTINGS_NS } from 'dsh-global-prompt/client'
import type { GlobalPromptSectionInjected } from 'dsh-global-prompt/client'
import { GLOBAL_PROMPT_SETTINGS_NAMESPACE, GlobalPromptSettingsSchema } from '../src/global-prompt-settings.ts'
import { GlobalPromptSection } from '../src/client/GlobalPromptSection.tsx'
import type { createGlobalPromptSectionStore } from '../src/client/settings-store.ts'

const SLOT = 'settings.section'

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => { resolve = done })
  return { promise, resolve }
}

async function bench(host: { enabled: boolean; text: string } = { enabled: false, text: '' }) {
  const ctx = new Context()
  await ctx.plugin(SlotRegistry).await()
  const locale = new LocaleRuntime(ctx)
  ctx.provide('locale', locale)
  const namespace = () => ({
    ns: GLOBAL_PROMPT_SETTINGS_NAMESPACE,
    schema: GlobalPromptSettingsSchema.toJSON(),
    value: { ...host },
    applies: 'live' as const,
    secrets: [],
    revision: 0,
  })
  const describe = vi.fn(() => Promise.resolve({
    rpcId: 'gp-describe' as never,
    result: { ok: true as const, value: { writable: true, hasDocument: true, namespaces: [namespace()] } },
  }))
  const mutate = vi.fn((request: { ops: { path: string[]; value: unknown }[] }) => {
    const op = request.ops[0]!
    host = { ...host, [op.path[0]!]: op.value } as never
    return Promise.resolve({
      rpcId: 'gp-mutate' as never,
      result: { ok: true as const, value: namespace() },
    })
  })
  ctx.provide('connection', { api: { settings: { describe, mutate } }, isLoopback: true } as never)
  new TestRemote(ctx)
  await ctx.plugin(SettingsScopeBinder).await()
  return { ctx, slots: ctx.get('slots') as SlotRegistry, locale, describe, mutate, host }
}

function declareSection(slots: SlotRegistry): () => void {
  return slots.register(
    { name: 'root', children: { [SLOT]: { kind: 'list', scope: 'root' } } } as never,
    () => null,
  )
}

function faceOf(slots: SlotRegistry) {
  const entry = slots.entries(SLOT).find(e => e.component === GlobalPromptSection)!
  const handle = entry.store as ReturnType<typeof createGlobalPromptSectionStore>
  const instance = handle.create()
  const face = (entry.inject as unknown as (a: typeof instance.actions) => GlobalPromptSectionInjected)(instance.actions)
  return { entry, instance, face }
}

describe('ui-global-prompt apply', () => {
  it('declares the settings transport and surface services', () => {
    expect(inject).toEqual(['slots', 'locale', 'connection', 'remote', 'settingsScope'])
  })

  it('registers localized copy and the section (declaration before apply)', async () => {
    const b = await bench()
    declareSection(b.slots)
    await b.ctx.plugin({ inject: [...inject], apply }).await()
    expect(b.locale.bind(SETTINGS_NS)('nav')).toBe('全局提示词')
    const entry = b.slots.entries(SLOT).find(e => e.component === GlobalPromptSection)!
    expect(entry.options).toMatchObject({ id: 'global-prompt', order: 30 })
    expect(entry.locale).toBe(SETTINGS_NS)
    const label = entry.options.label as () => string
    expect(label()).toBe('全局提示词')
  })

  it('adopts schema defaults while the settings scope is still loading', async () => {
    const b = await bench()
    const describe = b.describe.getMockImplementation()!
    const pending = deferred<Awaited<ReturnType<typeof describe>>>()
    b.describe.mockImplementationOnce(() => pending.promise)

    declareSection(b.slots)
    await b.ctx.plugin({ inject: [...inject], apply }).await()
    const { instance } = faceOf(b.slots)
    // adopt() ran against an undefined value: schema defaults, status loading.
    expect(instance.getSnapshot()).toMatchObject({ enabled: false, text: '', status: 'loading' })

    pending.resolve(await describe())
    await vi.waitFor(() => { expect(instance.getSnapshot().status).toBe('ready') })
  })

  it('projects the settings scope into the store and routes face writes back', async () => {
    const b = await bench({ enabled: true, text: 'Hello' })
    declareSection(b.slots)
    await b.ctx.plugin({ inject: [...inject], apply }).await()
    const { instance, face } = faceOf(b.slots)

    await vi.waitFor(() => { expect(instance.getSnapshot().status).toBe('ready') })
    expect(instance.getSnapshot().enabled).toBe(true)
    expect(instance.getSnapshot().text).toBe('Hello')

    face.setEnabled(false)
    expect(instance.getSnapshot().enabled).toBe(false)
    await vi.waitFor(() => { expect(b.mutate).toHaveBeenCalled() })
    expect(b.mutate).toHaveBeenLastCalledWith(expect.objectContaining({
      ns: GLOBAL_PROMPT_SETTINGS_NAMESPACE,
      ops: [{ op: 'set', path: ['enabled'], value: false }],
    }))

    face.setText('World')
    await vi.waitFor(() => { expect(b.mutate).toHaveBeenCalledTimes(2) })
  })

  it('teardown removes the section and its dictionaries', async () => {
    const b = await bench()
    declareSection(b.slots)
    const fiber = b.ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    expect(b.slots.entries(SLOT)).toHaveLength(1)
    await fiber.dispose()
    expect(b.slots.entries(SLOT)).toHaveLength(0)
    expect(b.locale.bind(SETTINGS_NS)('nav')).toBe('nav')
  })
})
