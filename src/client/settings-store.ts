/**
 * Global-prompt section store: a mirror of the settings-scope snapshot. The
 * apply-world scope listener is the only writer; the section component reads
 * via props.useStore.
 */
import { defineStore, type EngineStoreHandle } from '@deepseek-ai/dsh-client-runtime/client'

/** Store state mirrored from the settings scope. */
export interface GlobalPromptSectionState {
  /** Persisted enabled flag. */
  enabled: boolean
  /** Persisted prompt prose (the committed value; the textarea keeps its own draft). */
  text: string
  /** Scope sync status. */
  status: 'loading' | 'ready' | 'unavailable'
}

/** Declared action shape giving the exported factory a stable return type. */
type GlobalPromptSectionActions = {
  sync: (draft: GlobalPromptSectionState, enabled: boolean, text: string, status: GlobalPromptSectionState['status']) => void
  setEnabled: (draft: GlobalPromptSectionState, enabled: boolean) => void
}

/**
 * Declares the global-prompt section state and write surface.
 * @returns the store handle.
 */
export function createGlobalPromptSectionStore(): EngineStoreHandle<GlobalPromptSectionState, GlobalPromptSectionActions> {
  return defineStore({
    init: (): GlobalPromptSectionState => ({ enabled: false, text: '', status: 'loading' }),
    actions: {
      sync: (d, enabled, text, status) => {
        d.enabled = enabled
        d.text = text
        d.status = status
      },
      setEnabled: (d, enabled) => {
        d.enabled = enabled
      },
    },
  })
}
