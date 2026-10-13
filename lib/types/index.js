/**
 * Node half of the global-prompt surface plugin: registers the durable
 * settings namespace and the global system-prompt section that renders it.
 * The browser half (`./client`) owns the settings-section UI over the same
 * namespace.
 */
import { settingsNamespace } from '@deepseek-ai/dsh-settings';
import { GLOBAL_PROMPT_SETTINGS_NAMESPACE, GlobalPromptSettingsSchema } from "./global-prompt-settings.js";
export { GLOBAL_PROMPT_ENABLED_FIELD, GLOBAL_PROMPT_TEXT_FIELD, GLOBAL_PROMPT_SETTINGS_NAMESPACE, } from "./global-prompt-settings.js";
/** Prompt section order: after the persona (0), before tool guidance (100+). */
const GLOBAL_PROMPT_ORDER = 5;
/** Prompt section name, unique on the global layer. */
const GLOBAL_PROMPT_SECTION = 'user:global-prompt';
/**
 * Register the durable section and the global prompt section when their Host
 * services are composed. Empty text drops the section at render, matching the
 * registry.
 * @param ctx - Host context whose settings and systemPrompt services own the section.
 */
export function apply(ctx) {
    ctx.inject(['settings', 'systemPrompt'], (scopeCtx) => {
        const scope = scopeCtx.settings.register(settingsNamespace(GLOBAL_PROMPT_SETTINGS_NAMESPACE), GlobalPromptSettingsSchema);
        scopeCtx.systemPrompt.section({
            name: GLOBAL_PROMPT_SECTION,
            order: GLOBAL_PROMPT_ORDER,
            text: () => {
                const section = scope.get();
                return section.enabled && section.text.trim().length > 0 ? section.text : '';
            },
        });
    });
}
//# sourceMappingURL=index.js.map