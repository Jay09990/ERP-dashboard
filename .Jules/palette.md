
## 2025-05-18 - Accessibility and Keyboard Navigation for Dropdown Menus
**Learning:** Dropdown menus in the header topbar (such as ThemeDropdown) lacked keyboard controls (`Escape` key listeners) and proper ARIA menu semantics (`role="menu"`, `role="menuitemradio"`, `aria-checked`, `aria-expanded`). Furthermore, backdrop click handlers should be semantic elements or buttons with `tabIndex={-1}` and `aria-hidden="true"` to satisfy accessibility linter rules (`useKeyWithClickEvents`).
**Action:** Always include keyboard event listeners for floating dropdowns, use proper ARIA role attributes for menu/menuitem states, and use compliant backdrop elements.

## 2025-05-19 - Explicit Label Associations & Submit Feedback
**Learning:** Auth form inputs wrapped inside container elements (like `.altrex-password-row`) were failing accessibility rules (`lint/a11y/noLabelWithoutControl`) and preventing screen readers from correctly reading label names upon input focus. Additionally, submit buttons lacked active loading visual states during network submission.
**Action:** Always associate `<label>` elements explicitly with inputs using matching `htmlFor` and `id` attributes, and provide active loading feedback (`Loader2` spinner and `aria-busy`) on primary action buttons during form submission.
