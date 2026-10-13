import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Global-prompt settings section: an enable switch plus the prompt textarea.
 * The switch follows the persisted flag; the textarea keeps a local draft so
 * typing is immediate, and adopts the committed value when not being edited.
 */
import { useEffect, useRef, useState } from 'react';
import css from './GlobalPromptSection.module.css';
/**
 * Render the global-prompt section.
 * @param props - composed slot props.
 * @returns the section element tree.
 */
export function GlobalPromptSection({ t, useStore, setEnabled, setText }) {
    const enabled = useStore(s => s.enabled);
    const committed = useStore(s => s.text);
    const status = useStore(s => s.status);
    const ready = status === 'ready';
    const [draft, setDraft] = useState(committed);
    const focusedRef = useRef(false);
    useEffect(() => {
        if (!focusedRef.current)
            setDraft(committed);
    }, [committed]);
    return (_jsxs("div", { className: css.panel, children: [_jsxs("div", { className: css.head, children: [_jsx("span", { className: css.title, children: t('title') }), _jsxs("label", { className: css.switch, children: [_jsx("input", { type: "checkbox", checked: enabled, disabled: !ready, "aria-label": t('toggle'), onChange: (event) => { setEnabled(event.target.checked); } }), _jsx("span", { className: css.slider })] })] }), _jsx("p", { className: css.description, children: t('description') }), _jsx("textarea", { className: css.textarea, value: draft, placeholder: t('placeholder'), disabled: !ready || !enabled, onFocus: () => { focusedRef.current = true; }, onBlur: () => { focusedRef.current = false; setDraft(committed); }, onChange: (event) => {
                    setDraft(event.target.value);
                    setText(event.target.value);
                } })] }));
}
//# sourceMappingURL=GlobalPromptSection.js.map