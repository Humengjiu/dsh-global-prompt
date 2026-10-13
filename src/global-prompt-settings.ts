/** Shared identity and plain settings values projected to the browser. */
export const GLOBAL_PROMPT_SETTINGS_NAMESPACE = 'global-prompt'
export const GLOBAL_PROMPT_ENABLED_FIELD = 'enabled'
export const GLOBAL_PROMPT_TEXT_FIELD = 'text'

/** Accepted plain values of the live Host configuration. */
export interface GlobalPromptSettings {
  enabled: boolean
  text: string
}
