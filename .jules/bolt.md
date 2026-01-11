## 2024-05-22 - State Synchronization vs Derivation
**Learning:** Avoid synchronizing state with `useEffect` when values can be derived. In `HomeScreen`, predictions were calculated in an effect and stored in state, causing an extra render and missing dependencies (luteal phase).
**Action:** Use `useMemo` to derive expensive data directly during render. This ensures consistency and reduces render passes.

## 2026-01-02 - Date Sorting Performance
**Learning:** Parsing strings into `Date` objects inside a `sort` comparison function is extremely expensive (O(N log N) allocations). For ISO 8601 strings, lexicographical string comparison is equivalent and much faster.
**Action:** Use `string.localeCompare()` or standard string operators for sorting ISO dates instead of `new Date() - new Date()`.

## 2026-01-06 - Memoization in Render Props
**Learning:** `React.memo` only prevents re-renders if props are shallowly equal. Even with `React.memo`, if a component re-renders (e.g. due to a prop change like theme color), expensive calculations inside the body (like `Date` parsing or string joining) still run.
**Action:** Use `useMemo` for derived values inside components, especially for list items, to ensure expensive operations are skipped during re-renders where the underlying data hasn't changed.

## 2026-01-14 - AsyncStorage Fetch Optimization
**Learning:** Repeatedly fetching and parsing the same JSON data from `AsyncStorage` (e.g., on screen focus) causes unnecessary object re-creation and re-renders, even if the data hasn't changed.
**Action:** Use a `useRef` to store the last fetched raw string. Compare the new fetch result with the ref; if they are identical, skip `JSON.parse` and state updates.

## 2026-01-25 - Inline Component Memoization
**Learning:** Extracting sub-components to separate files isn't always necessary for performance. Wrapping expensive JSX (like mapped lists) in `useMemo` within the parent component achieves the same re-render prevention (skipping reconciliation) when other state (like text input) changes, while keeping related code co-located.
**Action:** Use `useMemo` for static or semi-static UI sections (like option lists) inside complex screens to prevent them from re-rendering during high-frequency updates (e.g. typing).

## 2026-02-04 - Stabilizing Callbacks with State Refs
**Learning:** When a callback depends on a frequently changing state (e.g., a text input), adding that state to the dependency array causes the callback to be recreated on every keystroke. This invalidates any `React.memo` or `useMemo` in child components that receive this callback.
**Action:** Use a `useRef` to track the current state value inside the hook/component. The callback can then read from `ref.current` and remain stable (empty dependency array), allowing child components to successfully skip re-renders.
