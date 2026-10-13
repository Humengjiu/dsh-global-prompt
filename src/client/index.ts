/**
 * Global-prompt surface plugin, browser half: bind the durable settings
 * namespace and register the settings section (enable switch + textarea).
 * The Host settings scope loads and stores the section in the user-settings
 * document; the feature owns its own settings surface.
 */
import type { BoundActions } from '@deepseek-ai/dsh-client-ui-slots'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: the settings scope Context merge (ctx.settingsScope).
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
// Type-only: the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
import { GlobalPromptSection } from './GlobalPromptSection.tsx'
import type { GlobalPromptSectionInjected } from './GlobalPromptSection.tsx'
import { createGlobalPromptSectionStore } from './settings-store.ts'
import { en, zh, type GlobalPromptKey } from './locales.ts'
import {
  GLOBAL_PROMPT_ENABLED_FIELD, GLOBAL_PROMPT_SETTINGS_NAMESPACE, GLOBAL_PROMPT_TEXT_FIELD,
  type GlobalPromptSettings,
} from '../global-prompt-settings.ts'

export type { GlobalPromptSectionInjected, GlobalPromptSectionProps } from './GlobalPromptSection.tsx'
export type { GlobalPromptSectionState } from './settings-store.ts'
export type { GlobalPromptKey } from './locales.ts'
export type { GlobalPromptSettings } from '../global-prompt-settings.ts'

/** Namespace owning this feature's settings copy. */
export const SETTINGS_NS = 'settings.globalPrompt'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** The global-prompt settings section's copy. */
    'settings.globalPrompt': GlobalPromptKey
  }
}

/**
 * Required services: the settings transport (`connection` + `remote` feed
 * `settingsScope.bind`), the slot surface, and the locale registry.
 */
export const inject = ['slots', 'locale', 'connection', 'remote', 'settingsScope']

/**
 * Bind the durable section and register the settings section once the
 * `settings.section` declaration is on the tree.
 * @param ctx - the browser plugin context.
 */
export function apply(ctx: ClientContext): void {
  const scope = ctx.settingsScope.bind<GlobalPromptSettings>({ namespace: GLOBAL_PROMPT_SETTINGS_NAMESPACE })
  const store = createGlobalPromptSectionStore()
  let bound: BoundActions<typeof store> | undefined

  const adopt = (): void => {
    const snap = scope.getSnapshot()
    bound?.sync(snap.value?.enabled ?? false, snap.value?.text ?? '', snap.status)
  }

  ctx.effect(() => scope.subscribe(adopt), 'ui-global-prompt: settings adoption')

  const injected = (actions: BoundActions<typeof store>): GlobalPromptSectionInjected => {
    bound = actions
    adopt()
    return {
      setEnabled: (enabled: boolean) => {
        bound?.setEnabled(enabled)
        void scope.set(GLOBAL_PROMPT_ENABLED_FIELD, enabled)
      },
      setText: (text: string) => {
        void scope.set(GLOBAL_PROMPT_TEXT_FIELD, text)
      },
    }
  }

  ctx.effect(() => ctx.locale.register(SETTINGS_NS, { zh, en }), 'ui-global-prompt: settings dictionaries')

  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'global-prompt',
    order: 30,
    label: () => ctx.locale.bind(SETTINGS_NS)('nav'),
    locale: SETTINGS_NS,
    store,
    inject: injected,
  }, GlobalPromptSection))
}
