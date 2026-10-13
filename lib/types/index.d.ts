/** Live, profile-backed global instructions for DeepSeek Harness 0.2.1-alpha.2. */
import type { Context, Volatile } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
export { GLOBAL_PROMPT_ENABLED_FIELD, GLOBAL_PROMPT_TEXT_FIELD, GLOBAL_PROMPT_SETTINGS_NAMESPACE, type GlobalPromptSettings } from './global-prompt-settings.ts';
/** Live references updated by Cordis without remounting this plugin. */
export interface Config {
    enabled: Volatile<boolean>;
    text: Volatile<string>;
}
/** User-editable fields saved through the active profile's configuration editor. */
export declare const Config: z<Schemastery.ObjectS<NoInfer<{
    enabled: z<boolean, boolean, "volatile-defined">;
    text: z<string, string, "volatile-defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    enabled: z<boolean, boolean, "volatile-defined">;
    text: z<string, string, "volatile-defined">;
}>>, "plain">;
export declare const name = "dsh-global-prompt";
export declare const inject: string[];
/**
 * Install global literal instructions and notify cached request assemblers after live edits.
 * @param ctx Plugin-owned Host context.
 * @param config Validated live profile settings.
 */
export declare function apply(ctx: Context, config: Config): void;
//# sourceMappingURL=index.d.ts.map