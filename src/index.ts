/** Live, profile-backed global instructions for DeepSeek Harness 0.2.1-alpha.2. */
import type { Context, Volatile } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import type {} from '@deepseek-ai/dsh-system-prompt'
import type {} from '@deepseek-ai/dsh-settings'
import type {} from '@deepseek-ai/cordis-plugin-loader'
export { GLOBAL_PROMPT_ENABLED_FIELD, GLOBAL_PROMPT_TEXT_FIELD,
  GLOBAL_PROMPT_SETTINGS_NAMESPACE, type GlobalPromptSettings } from './global-prompt-settings.ts'

/** Live references updated by Cordis without remounting this plugin. */
export interface Config {
  enabled: Volatile<boolean>
  text: Volatile<string>
}

/** User-editable fields saved through the active profile's configuration editor. */
export const Config = z.object({
  enabled: z.boolean().default(false).volatile(),
  text: z.string().default('').volatile(),
})

export const name = 'dsh-global-prompt'
export const inject = ['systemPrompt']

/**
 * Install global literal instructions and notify cached request assemblers after live edits.
 * @param ctx Plugin-owned Host context.
 * @param config Validated live profile settings.
 */
export function apply(ctx: Context, config: Config): void {
  ctx.systemPrompt.section({
    name: 'user:global-prompt',
    order: ctx.systemPrompt.getSectionOrder('DEPLOYMENT_PERSONA_PREFIX') + 5,
    interpolate: false,
    text: () => {
      const text = config.text.get()
      return config.enabled.get() && text.trim().length > 0 ? text : ''
    },
  })
  ctx.on('loader/volatile-update', () => { ctx.emit('system-prompt/change') })
  ctx.inject(['settings'], (scope) => {
    scope.effect(() => scope.settings.configure({ auto: false }, ctx.fiber), 'global-prompt: custom settings page')
  })
}
