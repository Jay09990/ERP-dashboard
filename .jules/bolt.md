# Bolt's Performance Journal

## 2025-05-21 - Memoizing Data Extraction and Lookup Maps in Form Re-renders
**Learning:** Unmemoized data extraction functions (like `extractList`) return new array references on every render. When used as dependencies in `useMemo` hooks for document total calculations, they invalidate the cache on every single keystroke. Combining memoized data extraction with O(1) Map lookups eliminates unnecessary recalculations and linear scans.
**Action:** Always memoize API array extraction results when used in hook dependency arrays or repeated search operations.
