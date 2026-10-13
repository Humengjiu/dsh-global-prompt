/** `settings.globalPrompt` namespace dictionaries (the section's copy). */

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'nav': '全局提示词',
  'title': '全局提示词',
  'description': '开启后，下方内容会被注入到每个会话的 system prompt 中，立即生效。',
  'placeholder': '在此输入要注入的全局提示词…',
  'toggle': '启用全局提示词',
} satisfies Record<string, string>

/** The settings.globalPrompt namespace key union. */
export type GlobalPromptKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'nav': 'Global prompt',
  'title': 'Global prompt',
  'description': 'When enabled, the text below is injected into every session\'s system prompt.',
  'placeholder': 'Enter the global prompt to inject…',
  'toggle': 'Enable the global prompt',
} satisfies Record<GlobalPromptKey, string>
