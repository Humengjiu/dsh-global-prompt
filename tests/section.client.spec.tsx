// @vitest-environment jsdom
/** GlobalPromptSection behavior: switch follows the persisted flag, typing
 * drives setText through a local draft, blur adopts the committed value. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createSnapshotStore, type SessionListState, type WorkspaceListState } from '@deepseek-ai/dsh-client-runtime/client'
import { bindSnapshotSelector } from '@deepseek-ai/dsh-client-web-react'
import { GlobalPromptSection } from '../src/client/GlobalPromptSection.tsx'
import type { GlobalPromptSectionProps } from '../src/client/GlobalPromptSection.tsx'
import { createGlobalPromptSectionStore } from '../src/client/settings-store.ts'

afterEach(cleanup)

const COPY: Record<string, string> = {
  'title': 'Title',
  'description': 'Description',
  'placeholder': 'Placeholder',
  'toggle': 'Toggle',
}

function emptySessions() {
  const store = createSnapshotStore<SessionListState>(
    { ids: [], byId: {}, current: undefined, phase: 'ready', subagentsByParent: {}, jobsBySession: {}, currentAddress: undefined })
  return bindSnapshotSelector(store)
}

function emptyWorkspaces() {
  const store = createSnapshotStore<WorkspaceListState>({
    items: [], archivedSessionIds: [], state: 'idle', phase: 'ready', error: null,
    baselinesReady: true, recentWorkspaceId: undefined,
  })
  return bindSnapshotSelector(store)
}

function mount(enabled = false, text = '') {
  const store = createGlobalPromptSectionStore().create()
  store.actions.sync(enabled, text, 'ready')
  const setEnabled = vi.fn()
  const setText = vi.fn()
  const props: GlobalPromptSectionProps = {
    close: () => {},
    useSessions: emptySessions(),
    useWorkspaces: emptyWorkspaces(),
    useStore: bindSnapshotSelector(store),
    actions: store.actions,
    t: (key: string) => COPY[key] ?? key,
    setEnabled,
    setText,
  }
  render(<GlobalPromptSection {...props} />)
  return { store, setEnabled, setText }
}

const toggle = (): HTMLInputElement => screen.getByLabelText('Toggle') as HTMLInputElement
const textarea = (): HTMLTextAreaElement => screen.getByPlaceholderText('Placeholder') as HTMLTextAreaElement

describe('GlobalPromptSection', () => {
  it('renders the title, description, and reflects the persisted flag and text', () => {
    mount(true, 'Hello')
    expect(screen.getByText('Title')).toBeDefined()
    expect(screen.getByText('Description')).toBeDefined()
    expect(toggle().checked).toBe(true)
    expect(textarea().value).toBe('Hello')
  })

  it('disables the switch while the settings scope is loading', () => {
    const store = createGlobalPromptSectionStore().create()
    store.actions.sync(false, '', 'loading')
    const props: GlobalPromptSectionProps = {
      close: () => {},
      useSessions: emptySessions(),
      useWorkspaces: emptyWorkspaces(),
      useStore: bindSnapshotSelector(store),
      actions: store.actions,
      t: (key: string) => COPY[key] ?? key,
      setEnabled: vi.fn(),
      setText: vi.fn(),
    }
    render(<GlobalPromptSection {...props} />)
    expect(toggle().disabled).toBe(true)
    expect(textarea().disabled).toBe(true)
  })

  it('toggle drives setEnabled', () => {
    const b = mount(false)
    fireEvent.click(toggle())
    expect(b.setEnabled).toHaveBeenCalledWith(true)
  })

  it('typing drives setText through a local draft', () => {
    const b = mount(false)
    fireEvent.change(textarea(), { target: { value: 'abc' } })
    expect(b.setText).toHaveBeenCalledWith('abc')
    expect(textarea().value).toBe('abc')
  })

  it('keeps the draft while focused and adopts the committed value on blur', () => {
    const b = mount(true, 'committed')
    fireEvent.focus(textarea())
    fireEvent.change(textarea(), { target: { value: 'draft' } })
    expect(textarea().value).toBe('draft')

    act(() => { b.store.actions.sync(true, 'external', 'ready') })
    expect(textarea().value).toBe('draft')

    fireEvent.blur(textarea())
    expect(textarea().value).toBe('external')
  })
})
