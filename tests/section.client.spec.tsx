// @vitest-environment jsdom
import { useSyncExternalStore } from 'react'
import { afterEach, describe, it, expect, vi } from 'vitest'
import { act, cleanup, render, screen, fireEvent, waitFor } from '@testing-library/react'
import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'
import type { ConfigFormSnapshot } from '@deepseek-ai/dsh-client-ui-settings/client'
import type { GlobalPromptSettings } from '../src/global-prompt-settings.ts'
import { GlobalPromptSection, type GlobalPromptSectionProps } from '../src/client/GlobalPromptSection.tsx'
import { en, type GlobalPromptKey } from '../src/client/locales.ts'
afterEach(cleanup)

function mount(options: { enabled?: boolean; status?: 'loading' | 'ready' | 'unavailable'; writable?: boolean; text?: string } = {}) {
  const store = createSnapshotStore<ConfigFormSnapshot<GlobalPromptSettings>>({
    status: options.status ?? 'ready', writable: options.writable ?? true,
    value: { enabled: options.enabled ?? true, text: options.text ?? 'saved' },
    mode: 'host', base: undefined, user: undefined, revision: 0,
  })
  const sync = (patch: Partial<GlobalPromptSettings>) => {
    store.update(draft => { draft.value = { ...draft.value!, ...patch } })
  }
  const setEnabled = vi.fn(async (enabled: boolean) => { sync({ enabled }); return true })
  const setText = vi.fn(async (text: string) => { sync({ text }); return true })
  const props = {
    close: () => {},
    useGlobalPrompt: <T,>(select: (s: ConfigFormSnapshot<GlobalPromptSettings>) => T) =>
      select(useSyncExternalStore(store.subscribe, store.getSnapshot)),
    t: (key: GlobalPromptKey) => en[key], setEnabled, setText,
  } as GlobalPromptSectionProps
  render(<GlobalPromptSection {...props} />)
  return { store, sync, setEnabled, setText }
}
const editor = () => screen.getByLabelText(en.textLabel) as HTMLTextAreaElement
describe('GlobalPromptSection latest UI', () => {
  it('renders accepted values and switches via the official Switch atom', async () => {
    const b = mount({ enabled: false })
    expect(editor().disabled).toBe(true)
    fireEvent.click(screen.getByRole('switch', { name: en.toggle }))
    await waitFor(() => { expect(editor().disabled).toBe(false) })
    expect(b.setEnabled).toHaveBeenCalledWith(true)
  })
  it.each(['loading', 'unavailable'] as const)('disables controls when %s', (status) => {
    mount({ status, writable: false })
    expect((screen.getByRole('switch') as HTMLButtonElement).disabled).toBe(true)
    expect(editor().disabled).toBe(true)
    expect(screen.getByRole('status')).toBeDefined()
  })
  it('disables a read-only Host even when its accepted values are available', () => {
    mount({ writable: false })
    expect(editor().disabled).toBe(true)
    expect((screen.getByRole('switch') as HTMLButtonElement).disabled).toBe(true)
  })
  it('keeps a focused draft and adopts external committed changes after blur', () => {
    const b = mount()
    fireEvent.focus(editor())
    act(() => { b.sync({ text: 'external' }) })
    expect(editor().value).toBe('saved')
    fireEvent.blur(editor())
    expect(editor().value).toBe('external')
  })
  it('retains text after a rejected save, displays the failure and supports retry', async () => {
    const b = mount()
    b.setText.mockResolvedValueOnce(false)
    fireEvent.focus(editor())
    fireEvent.change(editor(), { target: { value: 'unsaved' } })
    fireEvent.blur(editor())
    await waitFor(() => { expect(screen.getByRole('alert').textContent).toBe(en.saveFailed) })
    expect(editor().value).toBe('unsaved')
    fireEvent.click(screen.getByRole('button', { name: en.retry }))
    await waitFor(() => { expect(screen.queryByRole('alert')).toBeNull() })
    expect(b.setText).toHaveBeenLastCalledWith('unsaved')
    expect(editor().value).toBe('unsaved')
  })
  it('handles transport errors without an unhandled rejection or discarded draft', async () => {
    const b = mount()
    b.setText.mockRejectedValueOnce(new Error('offline'))
    fireEvent.change(editor(), { target: { value: 'offline draft' } })
    await waitFor(() => { expect(screen.getByRole('alert')).toBeDefined() })
    expect(editor().value).toBe('offline draft')
  })
  it('reports a refused toggle while retaining the accepted switch value', async () => {
    const b = mount()
    b.setEnabled.mockResolvedValueOnce(false)
    fireEvent.click(screen.getByRole('switch'))
    await waitFor(() => { expect(screen.getByRole('alert')).toBeDefined() })
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true')
  })
})
