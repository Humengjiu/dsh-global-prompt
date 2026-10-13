import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Local typing draft over accepted profile values; failed edits remain recoverable. */
import { useEffect, useRef, useState } from 'react';
import { Switch } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './GlobalPromptSection.module.css';
/**
 * Render the toggle and prompt editor with explicit persistence failure feedback.
 * @param props Framework-bound settings hook, localized copy and field writers.
 * @returns Global prompt settings section.
 */
export function GlobalPromptSection({ useGlobalPrompt, t, setEnabled, setText }) {
    const snapshot = useGlobalPrompt(value => value);
    const enabled = snapshot.value?.enabled ?? false;
    const committed = snapshot.value?.text ?? '';
    const writable = snapshot.status === 'ready' && snapshot.writable;
    const [draft, setDraft] = useState(committed);
    const [focused, setFocused] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toggleBusy, setToggleBusy] = useState(false);
    const [textFailed, setTextFailed] = useState(false);
    const [toggleFailed, setToggleFailed] = useState(false);
    const textGeneration = useRef(0);
    useEffect(() => {
        if (!focused && !saving && !textFailed)
            setDraft(committed);
    }, [committed, focused, saving, textFailed]);
    const persistText = async (text) => {
        const generation = ++textGeneration.current;
        setSaving(true);
        setTextFailed(false);
        try {
            const accepted = await setText(text);
            if (textGeneration.current === generation)
                setTextFailed(!accepted);
        }
        catch {
            if (textGeneration.current === generation)
                setTextFailed(true);
        }
        finally {
            if (textGeneration.current === generation)
                setSaving(false);
        }
    };
    return _jsxs("div", { className: css.panel, children: [_jsxs("div", { className: css.head, children: [_jsx("span", { className: css.title, children: t('title') }), _jsx(Switch, { checked: enabled, disabled: !writable || toggleBusy, label: t('toggle'), onChange: (next) => {
                            setToggleBusy(true);
                            setToggleFailed(false);
                            void setEnabled(next).then((accepted) => { setToggleFailed(!accepted); })
                                .catch(() => { setToggleFailed(true); }).finally(() => { setToggleBusy(false); });
                        } })] }), _jsx("p", { className: css.description, children: t('description') }), snapshot.status === 'loading' && _jsx("p", { role: "status", children: t('loading') }), snapshot.status !== 'loading' && !writable && _jsx("p", { role: "status", children: t('unavailable') }), _jsx("label", { className: css.textLabel, htmlFor: "global-prompt-text", children: t('textLabel') }), _jsx("textarea", { id: "global-prompt-text", className: css.textarea, value: draft, placeholder: t('placeholder'), disabled: !writable || !enabled, onFocus: () => { setFocused(true); }, onBlur: () => { setFocused(false); }, onChange: (event) => { setDraft(event.target.value); void persistText(event.target.value); } }), saving && _jsx("p", { role: "status", children: t('saving') }), (textFailed || toggleFailed) && _jsx("p", { role: "alert", children: t('saveFailed') }), textFailed && _jsx("button", { type: "button", className: css.retry, disabled: !writable || saving, onClick: () => { void persistText(draft); }, children: t('retry') })] });
}
//# sourceMappingURL=GlobalPromptSection.js.map