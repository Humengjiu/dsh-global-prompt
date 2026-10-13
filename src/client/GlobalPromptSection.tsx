/**
 * Global-prompt settings section: an enable switch plus the prompt textarea.
 * The switch follows the persisted flag; the textarea keeps a local draft so
 * typing is immediate, and adopts the committed value when not being edited.
 */
import { useEffect, useRef, useState } from 'react'
import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
// Type-only: the settings shell's SlotMap merge (the 'settings.section' entry).
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { createGlobalPromptSectionStore } from './settings-store.ts'
import css from './GlobalPromptSection.module.css'

/** Injected business face: the two settings writes. */
export interface GlobalPromptSectionInjected {
  /** Persist the enabled flag. */
  setEnabled: (enabled: boolean) => void
  /** Persist the prompt prose. */
  setText: (text: string) => void
}

/** Full component props: runtime share + store share + locale seat + injected face. */
export type GlobalPromptSectionProps =
  PropsRuntime<'settings.section'> & PropsStore<ReturnType<typeof createGlobalPromptSectionStore>>
  & PropsLocale<'settings.globalPrompt'> & GlobalPromptSectionInjected

/**
 * Render the global-prompt section.
 * @param props - composed slot props.
 * @returns the section element tree.
 */
export function GlobalPromptSection({ t, useStore, setEnabled, setText }: GlobalPromptSectionProps) {
  const enabled = useStore(s => s.enabled)
  const committed = useStore(s => s.text)
  const status = useStore(s => s.status)
  const ready = status === 'ready'

  const [draft, setDraft] = useState(committed)
  const focusedRef = useRef(false)

  useEffect(() => {
    if (!focusedRef.current) setDraft(committed)
  }, [committed])

  return (
    <div className={css.panel}>
      <div className={css.head}>
        <span className={css.title}>{t('title')}</span>
        <label className={css.switch}>
          <input
            type="checkbox"
            checked={enabled}
            disabled={!ready}
            aria-label={t('toggle')}
            onChange={(event) => { setEnabled(event.target.checked) }}
          />
          <span className={css.slider} />
        </label>
      </div>
      <p className={css.description}>{t('description')}</p>
      <textarea
        className={css.textarea}
        value={draft}
        placeholder={t('placeholder')}
        disabled={!ready || !enabled}
        onFocus={() => { focusedRef.current = true }}
        onBlur={() => { focusedRef.current = false; setDraft(committed) }}
        onChange={(event) => {
          setDraft(event.target.value)
          setText(event.target.value)
        }}
      />
    </div>
  )
}
