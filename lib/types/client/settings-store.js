/**
 * Global-prompt section store: a mirror of the settings-scope snapshot. The
 * apply-world scope listener is the only writer; the section component reads
 * via props.useStore.
 */
import { defineStore } from '@deepseek-ai/dsh-client-runtime/client';
/**
 * Declares the global-prompt section state and write surface.
 * @returns the store handle.
 */
export function createGlobalPromptSectionStore() {
    return defineStore({
        init: () => ({ enabled: false, text: '', status: 'loading' }),
        actions: {
            sync: (d, enabled, text, status) => {
                d.enabled = enabled;
                d.text = text;
                d.status = status;
            },
            setEnabled: (d, enabled) => {
                d.enabled = enabled;
            },
        },
    });
}
//# sourceMappingURL=settings-store.js.map