/**
 * Node half of the global-prompt surface plugin: registers the durable
 * settings namespace and the global system-prompt section that renders it.
 * The browser half (`./client`) owns the settings-section UI over the same
 * namespace.
 */
import type { Context } from '@deepseek-ai/cordis';
export { GLOBAL_PROMPT_ENABLED_FIELD, GLOBAL_PROMPT_TEXT_FIELD, GLOBAL_PROMPT_SETTINGS_NAMESPACE, type GlobalPromptSettings, } from './global-prompt-settings.ts';
/**
 * Register the durable section and the global prompt section when their Host
 * services are composed. Empty text drops the section at render, matching the
 * registry.
 * @param ctx - Host context whose settings and systemPrompt services own the section.
 */
export declare function apply(ctx: Context): void;
//# sourceMappingURL=index.d.ts.map