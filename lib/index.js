import z from "@deepseek-ai/schemastery";
//#region lib/types/global-prompt-settings.js
/** Shared identity and plain settings values projected to the browser. */
const GLOBAL_PROMPT_SETTINGS_NAMESPACE = "global-prompt";
const GLOBAL_PROMPT_ENABLED_FIELD = "enabled";
const GLOBAL_PROMPT_TEXT_FIELD = "text";
//#endregion
//#region lib/types/index.js
/** User-editable fields saved through the active profile's configuration editor. */
const Config = z.object({
	enabled: z.boolean().default(false).volatile(),
	text: z.string().default("").volatile()
});
const name = "dsh-global-prompt";
const inject = ["systemPrompt"];
/**
* Install global literal instructions and notify cached request assemblers after live edits.
* @param ctx Plugin-owned Host context.
* @param config Validated live profile settings.
*/
function apply(ctx, config) {
	ctx.systemPrompt.section({
		name: "user:global-prompt",
		order: ctx.systemPrompt.getSectionOrder("DEPLOYMENT_PERSONA_PREFIX") + 5,
		interpolate: false,
		text: () => {
			const text = config.text.get();
			return config.enabled.get() && text.trim().length > 0 ? text : "";
		}
	});
	ctx.on("loader/volatile-update", () => {
		ctx.emit("system-prompt/change");
	});
	ctx.inject(["settings"], (scope) => {
		scope.effect(() => scope.settings.configure({ auto: false }, ctx.fiber), "global-prompt: custom settings page");
	});
}
//#endregion
export { Config, GLOBAL_PROMPT_ENABLED_FIELD, GLOBAL_PROMPT_SETTINGS_NAMESPACE, GLOBAL_PROMPT_TEXT_FIELD, apply, inject, name };
