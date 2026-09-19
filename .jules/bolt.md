# Bolt's Performance Journal

## 2025-05-22 - Caching Permission Sets in WeakMap for Rapid UI Permission Checks
**Learning:** Checking permissions for 50+ navigation items on every render or search keystroke using linear array scans (`Array.includes`) and object array normalization creates redundant allocations and O(M * N) overhead. A `WeakMap<object, Set<string>>` cache normalizes array references once and allows O(1) membership checks with zero garbage collection overhead.
**Action:** Use `WeakMap` caches for objects or arrays evaluated frequently across UI trees to avoid re-parsing and linear searches.

## 2025-05-21 - Memoizing Data Extraction and Lookup Maps in Form Re-renders
**Learning:** Unmemoized data extraction functions (like `extractList`) return new array references on every render. When used as dependencies in `useMemo` hooks for document total calculations, they invalidate the cache on every single keystroke. Combining memoized data extraction with O(1) Map lookups eliminates unnecessary recalculations and linear scans.
**Action:** Always memoize API array extraction results when used in hook dependency arrays or repeated search operations.
