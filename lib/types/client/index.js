import { GlobalPromptSection } from "./GlobalPromptSection.js";
import { en, zh } from "./locales.js";
import { GLOBAL_PROMPT_SETTINGS_NAMESPACE } from "../global-prompt-settings.js";
const SETTINGS_NS = 'settings.globalPrompt';
export const inject = ['slots', 'locale', 'configForms'];
/**
 * Bind the shared namespace and register its localized settings section.
 * @param ctx Browser plugin context with official settings, locale and renderer services.
 */
export function apply(ctx) {
    const form = ctx.configForms.get(GLOBAL_PROMPT_SETTINGS_NAMESPACE);
    ctx.effect(() => ctx.locale.register(SETTINGS_NS, { zh, en }), 'global-prompt: dictionaries');
    ctx.slots.inject('settings.section', () => ctx.slots.register({
        name: 'settings.section', id: 'global-prompt', order: 30,
        label: () => ctx.locale.bind(SETTINGS_NS)('nav'), locale: SETTINGS_NS,
        inject: () => ({
            hooks: { globalPrompt: form },
            setEnabled: enabled => form.set('enabled', enabled),
            setText: text => form.set('text', text),
        }),
    }, GlobalPromptSection));
}
//# sourceMappingURL=index.js.map