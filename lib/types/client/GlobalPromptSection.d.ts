import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots';
import type { createGlobalPromptSectionStore } from './settings-store.ts';
/** Injected business face: the two settings writes. */
export interface GlobalPromptSectionInjected {
    /** Persist the enabled flag. */
    setEnabled: (enabled: boolean) => void;
    /** Persist the prompt prose. */
    setText: (text: string) => void;
}
/** Full component props: runtime share + store share + locale seat + injected face. */
export type GlobalPromptSectionProps = PropsRuntime<'settings.section'> & PropsStore<ReturnType<typeof createGlobalPromptSectionStore>> & PropsLocale<'settings.globalPrompt'> & GlobalPromptSectionInjected;
/**
 * Render the global-prompt section.
 * @param props - composed slot props.
 * @returns the section element tree.
 */
export declare function GlobalPromptSection({ t, useStore, setEnabled, setText }: GlobalPromptSectionProps): import("react").JSX.Element;
//# sourceMappingURL=GlobalPromptSection.d.ts.map