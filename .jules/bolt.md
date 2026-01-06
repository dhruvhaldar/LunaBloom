## 2024-05-22 - State Synchronization vs Derivation
**Learning:** Avoid synchronizing state with `useEffect` when values can be derived. In `HomeScreen`, predictions were calculated in an effect and stored in state, causing an extra render and missing dependencies (luteal phase).
**Action:** Use `useMemo` to derive expensive data directly during render. This ensures consistency and reduces render passes.

## 2026-01-02 - Date Sorting Performance
**Learning:** Parsing strings into `Date` objects inside a `sort` comparison function is extremely expensive (O(N log N) allocations). For ISO 8601 strings, lexicographical string comparison is equivalent and much faster.
**Action:** Use `string.localeCompare()` or standard string operators for sorting ISO dates instead of `new Date() - new Date()`.

## 2026-01-06 - Memoization in Render Props
**Learning:** `React.memo` only prevents re-renders if props are shallowly equal. Even with `React.memo`, if a component re-renders (e.g. due to a prop change like theme color), expensive calculations inside the body (like `Date` parsing or string joining) still run.
**Action:** Use `useMemo` for derived values inside components, especially for list items, to ensure expensive operations are skipped during re-renders where the underlying data hasn't changed.
