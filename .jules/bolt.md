# Bolt's Performance Journal

## 2025-05-24 - Single-Pass Statistics and Grouping Memoization
**Learning:** Performing separate `filter` and `every` passes over large item arrays in component render bodies causes redundant $O(N)$ allocations and loop iterations on every state update or keystroke. Combining array grouping and statistics calculation into a single pass inside `useMemo` avoids redundant traversals and temporary array creations.
**Action:** Consolidate array statistics and grouping logic into a single $O(N)$ pass within `useMemo`.

## 2025-05-23 - Defining Component Data Extractor Helpers at Module Scope
**Learning:** Defining helper functions (such as field extractors `getCategoryId` or `getParentId`) inline inside component bodies creates new function references on every render. When these functions are included in `useMemo` dependency arrays or passed as props to `React.memo` child components, they invalidate the `useMemo` cache and break child component memoization on every state update (e.g., input typing). Extracting pure helper functions to static module scope preserves reference identity and prevents unnecessary re-rendering and tree recalculations.
**Action:** Always place pure object property extractors at module scope outside component render bodies.

## 2025-05-22 - Caching Permission Sets in WeakMap for Rapid UI Permission Checks
**Learning:** Checking permissions for 50+ navigation items on every render or search keystroke using linear array scans (`Array.includes`) and object array normalization creates redundant allocations and O(M * N) overhead. A `WeakMap<object, Set<string>>` cache normalizes array references once and allows O(1) membership checks with zero garbage collection overhead.
**Action:** Use `WeakMap` caches for objects or arrays evaluated frequently across UI trees to avoid re-parsing and linear searches.

## 2025-05-21 - Memoizing Data Extraction and Lookup Maps in Form Re-renders
**Learning:** Unmemoized data extraction functions (like `extractList`) return new array references on every render. When used as dependencies in `useMemo` hooks for document total calculations, they invalidate the cache on every single keystroke. Combining memoized data extraction with O(1) Map lookups eliminates unnecessary recalculations and linear scans.
**Action:** Always memoize API array extraction results when used in hook dependency arrays or repeated search operations.
