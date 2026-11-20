# Bolt's Performance Journal

## 2025-05-27 - Eliminating Dead Duplicate Statistics Computation Hooks
**Learning:** Duplicate `useMemo` statistics computation blocks that calculate unused metrics create redundant $O(N)$ array traversals and object allocations on every data update or render frame. Identifying and removing unused duplicate computation hooks eliminates wasted CPU cycles and reduces garbage collection pressure without affecting component output.
**Action:** Always audit component `useMemo` hooks to verify that returned statistics or computed objects are actively consumed in JSX or downstream hooks.

## 2025-05-26 - Memoizing Recursive Query Data Traversals and Hoisting Static Table Formatters
**Learning:** Executing recursive data extraction (`records(...)`) directly in component bodies without `useMemo` forces deep object graph traversals on every state update or input keystroke. In addition, constructing `Intl.DateTimeFormat` instances and status transition dictionary objects inside cell formatting functions and table `.map()` iterations causes severe garbage collection churn and unnecessary allocation overhead per frame.
**Action:** Always wrap recursive query response extractors in `useMemo` and extract static `Intl.DateTimeFormat` instances and status transition dictionaries to module scope.

## 2025-05-25 - Hoisting Search Lowercasing and Fast-Pathing Empty Queries in Array Filter Hooks
**Learning:** Re-evaluating `search.toLowerCase()` inside array `.filter()` callbacks causes $O(N)$ string lowercasing operations per render. Moreover, filtering over large arrays when search is empty or whitespace-only executes redundant string lowercasing and `.includes("")` comparisons across all elements. Hoisting query normalization outside the loop and returning the array directly when empty provides an $O(1)$ fast-path and eliminates $O(N)$ redundant string allocations.
**Action:** Always compute normalized search queries outside `.filter()` callbacks and return early if the search string is empty.

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
