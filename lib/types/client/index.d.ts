/** Settings section over the official shared ConfigForms service. */
import type { Context } from '@deepseek-ai/cordis';
import { type GlobalPromptKey } from './locales.ts';
export type { GlobalPromptSectionInjected, GlobalPromptSectionProps } from './GlobalPromptSection.tsx';
export type { GlobalPromptSettings } from '../global-prompt-settings.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        'settings.globalPrompt': GlobalPromptKey;
    }
}
export declare const inject: string[];
/**
 * Bind the shared namespace and register its localized settings section.
 * @param ctx Browser plugin context with official settings, locale and renderer services.
 */
export declare function apply(ctx: Context): void;
//# sourceMappingURL=index.d.ts.map