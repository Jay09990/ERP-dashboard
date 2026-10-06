
## 2025-05-18 - Accessibility and Keyboard Navigation for Dropdown Menus
**Learning:** Dropdown menus in the header topbar (such as ThemeDropdown) lacked keyboard controls (`Escape` key listeners) and proper ARIA menu semantics (`role="menu"`, `role="menuitemradio"`, `aria-checked`, `aria-expanded`). Furthermore, backdrop click handlers should be semantic elements or buttons with `tabIndex={-1}` and `aria-hidden="true"` to satisfy accessibility linter rules (`useKeyWithClickEvents`).
**Action:** Always include keyboard event listeners for floating dropdowns, use proper ARIA role attributes for menu/menuitem states, and use compliant backdrop elements.

## 2025-05-19 - Skip to Main Content Link for AppShell Layouts
**Learning:** In AppShell navigation layouts with extensive sidebars and topbars, keyboard users have to tab through dozens of links before reaching page content. Adding a `.altrex-skip-link` at the top of the shell targeting `<main id="main-content" tabIndex={-1}>` enables WCAG 2.4.1 compliance and seamless keyboard navigation bypass.
**Action:** Include a focus-visible skip link in primary shell layouts and ensure the target main container has `id="main-content"` and `tabIndex={-1}`.
