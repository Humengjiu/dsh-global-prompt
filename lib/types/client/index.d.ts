import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import { type GlobalPromptKey } from './locales.ts';
export type { GlobalPromptSectionInjected, GlobalPromptSectionProps } from './GlobalPromptSection.tsx';
export type { GlobalPromptSectionState } from './settings-store.ts';
export type { GlobalPromptKey } from './locales.ts';
export type { GlobalPromptSettings } from '../global-prompt-settings.ts';
/** Namespace owning this feature's settings copy. */
export declare const SETTINGS_NS = "settings.globalPrompt";
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** The global-prompt settings section's copy. */
        'settings.globalPrompt': GlobalPromptKey;
    }
}
/**
 * Required services: the settings transport (`connection` + `remote` feed
 * `settingsScope.bind`), the slot surface, and the locale registry.
 */
export declare const inject: string[];
/**
 * Bind the durable section and register the settings section once the
 * `settings.section` declaration is on the tree.
 * @param ctx - the browser plugin context.
 */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map