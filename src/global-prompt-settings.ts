/** Durable global-prompt section shared by the Host schema and the browser scope. */

import z from '@deepseek-ai/schemastery'

/** Settings namespace owned by the global-prompt plugin. */
export const GLOBAL_PROMPT_SETTINGS_NAMESPACE = 'global-prompt'

/** Field carrying the enabled flag. */
export const GLOBAL_PROMPT_ENABLED_FIELD = 'enabled'

/** Field carrying the injected prompt prose. */
export const GLOBAL_PROMPT_TEXT_FIELD = 'text'

/** Durable global-prompt section. */
export interface GlobalPromptSettings {
  /** Whether the prose is injected into every model step. */
  enabled: boolean
  /** The prose injected while enabled. */
  text: string
}

/** Durable schema; also the wire envelope the browser scope validates against. */
export const GlobalPromptSettingsSchema: z<GlobalPromptSettings> = z.object({
  [GLOBAL_PROMPT_ENABLED_FIELD]: z.boolean().default(false),
  [GLOBAL_PROMPT_TEXT_FIELD]: z.string().default(''),
})
