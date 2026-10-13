window.__ModuleLoader__.load({
	id: "dsh-global-prompt",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region \0global-prompt-css:.\src\client\GlobalPromptSection.module.css.mjs
		const css = ".ZxCwgW_panel{flex-direction:column;gap:14px;padding:2px;display:flex}.ZxCwgW_head{justify-content:space-between;align-items:center;gap:12px;display:flex}.ZxCwgW_title{color:var(--dsw-alias-label-primary);font-size:15px;font-weight:600}.ZxCwgW_description{color:var(--dsw-alias-label-secondary);margin:0;font-size:13px;line-height:1.55}.ZxCwgW_textLabel{color:var(--dsw-alias-label-primary);font-size:13px}.ZxCwgW_textarea{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);width:100%;min-height:200px;color:var(--dsw-alias-label-primary);font:inherit;resize:vertical;border-radius:8px;padding:10px 12px;line-height:1.6}.ZxCwgW_textarea:focus{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}.ZxCwgW_textarea:disabled{opacity:.55;cursor:not-allowed}.ZxCwgW_retry{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);cursor:pointer;border-radius:6px;align-self:flex-start;padding:6px 12px}";
		const tagId = "dsh-global-prompt/GlobalPromptSection.module.css";
		if (typeof document !== "undefined" && !document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]")) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-global-prompt";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var GlobalPromptSection_module_css_default = {
			"description": "ZxCwgW_description",
			"head": "ZxCwgW_head",
			"title": "ZxCwgW_title",
			"textLabel": "ZxCwgW_textLabel",
			"textarea": "ZxCwgW_textarea",
			"retry": "ZxCwgW_retry",
			"panel": "ZxCwgW_panel"
		};
		//#endregion
		//#region src/client/GlobalPromptSection.tsx
		/** Local typing draft over accepted profile values; failed edits remain recoverable. */
		/**
		* Render the toggle and prompt editor with explicit persistence failure feedback.
		* @param props Framework-bound settings hook, localized copy and field writers.
		* @returns Global prompt settings section.
		*/
		function GlobalPromptSection({ useGlobalPrompt, t, setEnabled, setText }) {
			const snapshot = useGlobalPrompt((value) => value);
			const enabled = snapshot.value?.enabled ?? false;
			const committed = snapshot.value?.text ?? "";
			const writable = snapshot.status === "ready" && snapshot.writable;
			const [draft, setDraft] = (0, react.useState)(committed);
			const [focused, setFocused] = (0, react.useState)(false);
			const [saving, setSaving] = (0, react.useState)(false);
			const [toggleBusy, setToggleBusy] = (0, react.useState)(false);
			const [textFailed, setTextFailed] = (0, react.useState)(false);
			const [toggleFailed, setToggleFailed] = (0, react.useState)(false);
			const textGeneration = (0, react.useRef)(0);
			(0, react.useEffect)(() => {
				if (!focused && !saving && !textFailed) setDraft(committed);
			}, [
				committed,
				focused,
				saving,
				textFailed
			]);
			const persistText = async (text) => {
				const generation = ++textGeneration.current;
				setSaving(true);
				setTextFailed(false);
				try {
					const accepted = await setText(text);
					if (textGeneration.current === generation) setTextFailed(!accepted);
				} catch {
					if (textGeneration.current === generation) setTextFailed(true);
				} finally {
					if (textGeneration.current === generation) setSaving(false);
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: GlobalPromptSection_module_css_default.panel,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: GlobalPromptSection_module_css_default.head,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: GlobalPromptSection_module_css_default.title,
							children: t("title")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Switch, {
							checked: enabled,
							disabled: !writable || toggleBusy,
							label: t("toggle"),
							onChange: (next) => {
								setToggleBusy(true);
								setToggleFailed(false);
								setEnabled(next).then((accepted) => {
									setToggleFailed(!accepted);
								}).catch(() => {
									setToggleFailed(true);
								}).finally(() => {
									setToggleBusy(false);
								});
							}
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: GlobalPromptSection_module_css_default.description,
						children: t("description")
					}),
					snapshot.status === "loading" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						role: "status",
						children: t("loading")
					}),
					snapshot.status !== "loading" && !writable && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						role: "status",
						children: t("unavailable")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
						className: GlobalPromptSection_module_css_default.textLabel,
						htmlFor: "global-prompt-text",
						children: t("textLabel")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
						id: "global-prompt-text",
						className: GlobalPromptSection_module_css_default.textarea,
						value: draft,
						placeholder: t("placeholder"),
						disabled: !writable || !enabled,
						onFocus: () => {
							setFocused(true);
						},
						onBlur: () => {
							setFocused(false);
						},
						onChange: (event) => {
							setDraft(event.target.value);
							persistText(event.target.value);
						}
					}),
					saving && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						role: "status",
						children: t("saving")
					}),
					(textFailed || toggleFailed) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						role: "alert",
						children: t("saveFailed")
					}),
					textFailed && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: GlobalPromptSection_module_css_default.retry,
						disabled: !writable || saving,
						onClick: () => {
							persistText(draft);
						},
						children: t("retry")
					})
				]
			});
		}
		//#endregion
		//#region src/client/locales.ts
		/** Localized copy owned by the global prompt settings section. */
		const zh = {
			nav: "全局提示词",
			title: "全局提示词",
			toggle: "启用全局提示词",
			description: "开启后，固定指令会原样加入所有会话后续请求的系统提示词。",
			textLabel: "提示词内容",
			placeholder: "输入希望跨会话生效的固定指令…",
			loading: "正在读取设置…",
			unavailable: "当前连接无法保存这项设置，请使用本机的 dsh 界面。",
			saving: "正在保存…",
			saveFailed: "保存未成功，修改尚未生效。文本草稿已保留，请重试。",
			retry: "重试保存"
		};
		const en = {
			nav: "Global prompt",
			title: "Global prompt",
			toggle: "Enable global prompt",
			description: "When enabled, your standing instructions are added literally to subsequent system prompts across sessions.",
			textLabel: "Prompt text",
			placeholder: "Enter your cross-session standing instructions…",
			loading: "Loading settings…",
			unavailable: "This connection cannot save this setting. Use the local dsh interface.",
			saving: "Saving…",
			saveFailed: "The change was not saved or applied. Your text draft is retained; please retry.",
			retry: "Retry saving"
		};
		//#endregion
		//#region src/global-prompt-settings.ts
		/** Shared identity and plain settings values projected to the browser. */
		const GLOBAL_PROMPT_SETTINGS_NAMESPACE = "global-prompt";
		//#endregion
		//#region src/client/index.ts
		const SETTINGS_NS = "settings.globalPrompt";
		const inject = [
			"slots",
			"locale",
			"configForms"
		];
		/**
		* Bind the shared namespace and register its localized settings section.
		* @param ctx Browser plugin context with official settings, locale and renderer services.
		*/
		function apply(ctx) {
			const form = ctx.configForms.get(GLOBAL_PROMPT_SETTINGS_NAMESPACE);
			ctx.effect(() => ctx.locale.register(SETTINGS_NS, {
				zh,
				en
			}), "global-prompt: dictionaries");
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "global-prompt",
				order: 30,
				label: () => ctx.locale.bind(SETTINGS_NS)("nav"),
				locale: SETTINGS_NS,
				inject: () => ({
					hooks: { globalPrompt: form },
					setEnabled: (enabled) => form.set("enabled", enabled),
					setText: (text) => form.set("text", text)
				})
			}, GlobalPromptSection));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map