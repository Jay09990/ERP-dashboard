# Palette's Journal - Critical UX & Accessibility Learnings

## 2025-05-18 - Accessible Custom Dropdown Menus and Escape Key Handling
**Learning:** Custom dropdown components in app bars require explicit ARIA attributes (`aria-haspopup="menu"`, `aria-expanded`, `role="menu"`, `role="menuitemradio"`) and keydown listeners (specifically `Escape` key with focus restoration) so screen readers and keyboard-only users can seamlessly navigate and dismiss popup menus.
**Action:** When creating custom dropdown overlay menus, always include ARIA popup/menu roles, `aria-checked` attributes for radio options, and an `Escape` key listener that restores focus to the toggle button.
