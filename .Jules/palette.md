## 2025-09-12 - Accessible Dropdown Menu Controls
**Learning:** Custom dropdown triggers and popovers (like `ThemeDropdown`) lack native menu accessibility. Adding proper WAI-ARIA roles (`aria-haspopup="menu"`, `aria-expanded`, `role="menu"`, `role="menuitemradio"`, `aria-checked`), keyboard dismissal (`Escape`), and hiding decorative symbols (`aria-hidden="true"`) greatly enhances screen reader & keyboard user experience.
**Action:** Always include menu accessibility attributes and an `Escape` key listener on custom toggle popover menus across apps.
