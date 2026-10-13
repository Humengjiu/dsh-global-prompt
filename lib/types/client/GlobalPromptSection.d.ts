import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store';
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { ConfigFormSnapshot } from '@deepseek-ai/dsh-client-ui-settings/client';
import type { GlobalPromptSettings } from '../global-prompt-settings.ts';
/** Accepted settings observable and ordered write operations supplied by ConfigForms. */
export interface GlobalPromptSectionInjected {
    hooks: {
        globalPrompt: ObservableSnapshot<ConfigFormSnapshot<GlobalPromptSettings>>;
    };
    setEnabled(enabled: boolean): Promise<boolean>;
    setText(text: string): Promise<boolean>;
}
export type GlobalPromptSectionProps = PropsRuntime<'settings.section'> & PropsLocale<'settings.globalPrompt'> & InjectFace<GlobalPromptSectionInjected>;
/**
 * Render the toggle and prompt editor with explicit persistence failure feedback.
 * @param props Framework-bound settings hook, localized copy and field writers.
 * @returns Global prompt settings section.
 */
export declare function GlobalPromptSection({ useGlobalPrompt, t, setEnabled, setText }: GlobalPromptSectionProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=GlobalPromptSection.d.ts.map