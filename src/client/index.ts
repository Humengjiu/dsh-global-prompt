/** Settings section over the official shared ConfigForms service. */
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import { GlobalPromptSection, type GlobalPromptSectionInjected } from './GlobalPromptSection.tsx'
import { en, zh, type GlobalPromptKey } from './locales.ts'
import { GLOBAL_PROMPT_SETTINGS_NAMESPACE, type GlobalPromptSettings } from '../global-prompt-settings.ts'
export type { GlobalPromptSectionInjected, GlobalPromptSectionProps } from './GlobalPromptSection.tsx'
export type { GlobalPromptSettings } from '../global-prompt-settings.ts'

const SETTINGS_NS = 'settings.globalPrompt'
declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap { 'settings.globalPrompt': GlobalPromptKey }
}
export const inject = ['slots', 'locale', 'configForms']

/**
 * Bind the shared namespace and register its localized settings section.
 * @param ctx Browser plugin context with official settings, locale and renderer services.
 */
export function apply(ctx: Context): void {
  const form = ctx.configForms.get<GlobalPromptSettings>(GLOBAL_PROMPT_SETTINGS_NAMESPACE)
  ctx.effect(() => ctx.locale.register(SETTINGS_NS, { zh, en }), 'global-prompt: dictionaries')
  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section', id: 'global-prompt', order: 30,
    label: () => ctx.locale.bind(SETTINGS_NS)('nav'), locale: SETTINGS_NS,
    inject: (): GlobalPromptSectionInjected => ({
      hooks: { globalPrompt: form },
      setEnabled: enabled => form.set('enabled', enabled),
      setText: text => form.set('text', text),
    }),
  }, GlobalPromptSection))
}
