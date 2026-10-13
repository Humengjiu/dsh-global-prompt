import z from '@deepseek-ai/schemastery';
export { GLOBAL_PROMPT_ENABLED_FIELD, GLOBAL_PROMPT_TEXT_FIELD, GLOBAL_PROMPT_SETTINGS_NAMESPACE } from "./global-prompt-settings.js";
/** User-editable fields saved through the active profile's configuration editor. */
export const Config = z.object({
    enabled: z.boolean().default(false).volatile(),
    text: z.string().default('').volatile(),
});
export const name = 'dsh-global-prompt';
export const inject = ['systemPrompt'];
/**
 * Install global literal instructions and notify cached request assemblers after live edits.
 * @param ctx Plugin-owned Host context.
 * @param config Validated live profile settings.
 */
export function apply(ctx, config) {
    ctx.systemPrompt.section({
        name: 'user:global-prompt',
        order: ctx.systemPrompt.getSectionOrder('DEPLOYMENT_PERSONA_PREFIX') + 5,
        interpolate: false,
        text: () => {
            const text = config.text.get();
            return config.enabled.get() && text.trim().length > 0 ? text : '';
        },
    });
    ctx.on('loader/volatile-update', () => { ctx.emit('system-prompt/change'); });
    ctx.inject(['settings'], (scope) => {
        scope.effect(() => scope.settings.configure({ auto: false }, ctx.fiber), 'global-prompt: custom settings page');
    });
}
//# sourceMappingURL=index.js.map