/** Local typing draft over accepted profile values; failed edits remain recoverable. */
import { useEffect, useRef, useState } from 'react'
import { Switch } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { ConfigFormSnapshot } from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { GlobalPromptSettings } from '../global-prompt-settings.ts'
import css from './GlobalPromptSection.module.css'

/** Accepted settings observable and ordered write operations supplied by ConfigForms. */
export interface GlobalPromptSectionInjected {
  hooks: { globalPrompt: ObservableSnapshot<ConfigFormSnapshot<GlobalPromptSettings>> }
  setEnabled(enabled: boolean): Promise<boolean>
  setText(text: string): Promise<boolean>
}
export type GlobalPromptSectionProps = PropsRuntime<'settings.section'>
  & PropsLocale<'settings.globalPrompt'> & InjectFace<GlobalPromptSectionInjected>

/**
 * Render the toggle and prompt editor with explicit persistence failure feedback.
 * @param props Framework-bound settings hook, localized copy and field writers.
 * @returns Global prompt settings section.
 */
export function GlobalPromptSection({ useGlobalPrompt, t, setEnabled, setText }: GlobalPromptSectionProps) {
  const snapshot = useGlobalPrompt(value => value)
  const enabled = snapshot.value?.enabled ?? false
  const committed = snapshot.value?.text ?? ''
  const writable = snapshot.status === 'ready' && snapshot.writable
  const [draft, setDraft] = useState(committed)
  const [focused, setFocused] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toggleBusy, setToggleBusy] = useState(false)
  const [textFailed, setTextFailed] = useState(false)
  const [toggleFailed, setToggleFailed] = useState(false)
  const textGeneration = useRef(0)

  useEffect(() => {
    if (!focused && !saving && !textFailed) setDraft(committed)
  }, [committed, focused, saving, textFailed])

  const persistText = async (text: string): Promise<void> => {
    const generation = ++textGeneration.current
    setSaving(true)
    setTextFailed(false)
    try {
      const accepted = await setText(text)
      if (textGeneration.current === generation) setTextFailed(!accepted)
    } catch {
      if (textGeneration.current === generation) setTextFailed(true)
    } finally {
      if (textGeneration.current === generation) setSaving(false)
    }
  }
  return <div className={css.panel}>
    <div className={css.head}>
      <span className={css.title}>{t('title')}</span>
      <Switch checked={enabled} disabled={!writable || toggleBusy} label={t('toggle')}
        onChange={(next) => {
          setToggleBusy(true)
          setToggleFailed(false)
          void setEnabled(next).then((accepted) => { setToggleFailed(!accepted) })
            .catch(() => { setToggleFailed(true) }).finally(() => { setToggleBusy(false) })
        }} />
    </div>
    <p className={css.description}>{t('description')}</p>
    {snapshot.status === 'loading' && <p role="status">{t('loading')}</p>}
    {snapshot.status !== 'loading' && !writable && <p role="status">{t('unavailable')}</p>}
    <label className={css.textLabel} htmlFor="global-prompt-text">{t('textLabel')}</label>
    <textarea id="global-prompt-text" className={css.textarea} value={draft}
      placeholder={t('placeholder')} disabled={!writable || !enabled}
      onFocus={() => { setFocused(true) }} onBlur={() => { setFocused(false) }}
      onChange={(event) => { setDraft(event.target.value); void persistText(event.target.value) }} />
    {saving && <p role="status">{t('saving')}</p>}
    {(textFailed || toggleFailed) && <p role="alert">{t('saveFailed')}</p>}
    {textFailed && <button type="button" className={css.retry} disabled={!writable || saving}
      onClick={() => { void persistText(draft) }}>{t('retry')}</button>}
  </div>
}
