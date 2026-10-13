// @vitest-environment jsdom
import { Context, type Plugin } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { describe, it, expect, vi } from 'vitest'
import * as GlobalPrompt from '../src/client/index.ts'
import { officialClient } from './official-browser-fixture.ts'

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(done => { resolve = done })
  return { promise, resolve }
}
async function bench(options: { loopback?: boolean; loading?: boolean } = {}) {
  const ctx = new Context()
  let value = { enabled: true, text: 'Hello' }
  let revision = 0
  const subscriptions = new Map<string, Set<(...args: never[]) => void>>()
  const view = () => ({ ns: 'global-prompt', value, revision, autoGenerate: false, applies: 'live', secrets: [],
    schema: z.object({ enabled: z.boolean().default(false), text: z.string().default('') }).toJSON() })
  const answer = () => ({ ok: true, value: { writable: true, hasDocument: true, namespaces: [view()] } })
  const pending = deferred<ReturnType<typeof answer>>()
  const describeCall = vi.fn(() => options.loading ? pending.promise : Promise.resolve(answer()))
  const mutate = vi.fn(async (_ns: string, ops: Array<{ path: string[]; value: string | boolean }>, expected: number) => {
    expect(expected).toBe(revision)
    for (const op of ops) value = { ...value, [op.path[0]!]: op.value }
    revision++
    return { ok: true, value: view() }
  })
  const remote = {
    settings: { describe: describeCall, mutate }, $host: { isLoopback: options.loopback ?? true, home: undefined },
    $on(event: string, listener: (...args: never[]) => void) {
      let listeners = subscriptions.get(event)
      if (!listeners) subscriptions.set(event, listeners = new Set())
      listeners.add(listener)
      return () => { listeners!.delete(listener) }
    },
  }
  ctx.provide('remote', remote as never)
  ctx.provide('remote.settings', remote.settings)
  await ctx.plugin(officialClient('@deepseek-ai/dsh-client-ui-renderer') as Plugin.Object).await()
  await ctx.plugin(officialClient('@deepseek-ai/dsh-client-ui-settings') as Plugin.Object).await()
  await ctx.plugin(officialClient('@deepseek-ai/dsh-client-locale') as Plugin.Object).await()
  ctx.slots.register({ name: 'root', children: { 'settings.section': { kind: 'list', scope: 'root' } } }, () => null)
  const fiber = ctx.plugin(GlobalPrompt)
  await fiber.await()
  const entry = ctx.slots.entries('settings.section').find(row => row.options.id === 'global-prompt')!
  const face = (entry.inject as () => {
    hooks: { globalPrompt: ReturnType<typeof ctx.configForms.get<{ enabled: boolean; text: string }>> }
    setEnabled(value: boolean): Promise<boolean>
    setText(value: string): Promise<boolean>
  })()
  return { ctx, fiber, entry, face, mutate, describeCall, pending, answer, remote }
}
describe('official browser settings integration', () => {
  it('registers against actual released renderer, settings and locale factories', async () => {
    const b = await bench()
    try {
      await vi.waitFor(() => { expect(b.face.hooks.globalPrompt.getSnapshot().status).toBe('ready') })
      expect(b.entry.options).toMatchObject({ id: 'global-prompt', order: 30 })
      expect(b.face.hooks.globalPrompt.getSnapshot().value).toEqual({ enabled: true, text: 'Hello' })
      expect(b.ctx.locale.bind('settings.globalPrompt')('nav')).toMatch(/Global prompt|全局提示词/)
      await b.face.setEnabled(false)
      expect(b.mutate).toHaveBeenLastCalledWith('global-prompt', [{ op: 'set', path: ['enabled'], value: false }], 0)
      await b.face.setText('Updated')
      expect(b.face.hooks.globalPrompt.getSnapshot().value).toEqual({ enabled: false, text: 'Updated' })
    } finally { await b.ctx.fiber.dispose() }
  })
  it('exposes loading without enabling premature writes', async () => {
    const b = await bench({ loading: true })
    try {
      expect(b.face.hooks.globalPrompt.getSnapshot()).toMatchObject({ status: 'loading', writable: false })
      b.pending.resolve(b.answer())
      await vi.waitFor(() => { expect(b.face.hooks.globalPrompt.getSnapshot().status).toBe('ready') })
    } finally { await b.ctx.fiber.dispose() }
  })
  it('keeps non-loopback settings unavailable and skips Host writes', async () => {
    const b = await bench({ loopback: false })
    try {
      expect(b.face.hooks.globalPrompt.getSnapshot()).toMatchObject({ status: 'unavailable', writable: false, mode: 'memory' })
      expect(await b.face.setText('Remote')).toBe(false)
      expect(b.mutate).not.toHaveBeenCalled()
    } finally { await b.ctx.fiber.dispose() }
  })
  it('removes the section and localized dictionary on unload', async () => {
    const b = await bench()
    try {
      await b.fiber.dispose()
      expect(b.ctx.slots.entries('settings.section')).toHaveLength(0)
      expect(b.ctx.locale.bind('settings.globalPrompt')('nav')).toBe('nav')
    } finally { await b.ctx.fiber.dispose() }
  })
})
