import { GlobalPromptSection } from "./GlobalPromptSection.js";
import { createGlobalPromptSectionStore } from "./settings-store.js";
import { en, zh } from "./locales.js";
import { GLOBAL_PROMPT_ENABLED_FIELD, GLOBAL_PROMPT_SETTINGS_NAMESPACE, GLOBAL_PROMPT_TEXT_FIELD, } from "../global-prompt-settings.js";
/** Namespace owning this feature's settings copy. */
export const SETTINGS_NS = 'settings.globalPrompt';
/**
 * Required services: the settings transport (`connection` + `remote` feed
 * `settingsScope.bind`), the slot surface, and the locale registry.
 */
export const inject = ['slots', 'locale', 'connection', 'remote', 'settingsScope'];
/**
 * Bind the durable section and register the settings section once the
 * `settings.section` declaration is on the tree.
 * @param ctx - the browser plugin context.
 */
export function apply(ctx) {
    const scope = ctx.settingsScope.bind({ namespace: GLOBAL_PROMPT_SETTINGS_NAMESPACE });
    const store = createGlobalPromptSectionStore();
    let bound;
    const adopt = () => {
        const snap = scope.getSnapshot();
        bound?.sync(snap.value?.enabled ?? false, snap.value?.text ?? '', snap.status);
    };
    ctx.effect(() => scope.subscribe(adopt), 'ui-global-prompt: settings adoption');
    const injected = (actions) => {
        bound = actions;
        adopt();
        return {
            setEnabled: (enabled) => {
                bound?.setEnabled(enabled);
                void scope.set(GLOBAL_PROMPT_ENABLED_FIELD, enabled);
            },
            setText: (text) => {
                void scope.set(GLOBAL_PROMPT_TEXT_FIELD, text);
            },
        };
    };
    ctx.effect(() => ctx.locale.register(SETTINGS_NS, { zh, en }), 'ui-global-prompt: settings dictionaries');
    ctx.slots.inject('settings.section', () => ctx.slots.register({
        name: 'settings.section',
        id: 'global-prompt',
        order: 30,
        label: () => ctx.locale.bind(SETTINGS_NS)('nav'),
        locale: SETTINGS_NS,
        store,
        inject: injected,
    }, GlobalPromptSection));
}
//# sourceMappingURL=index.js.map