## 2024-05-22 - State Synchronization vs Derivation
**Learning:** Avoid synchronizing state with `useEffect` when values can be derived. In `HomeScreen`, predictions were calculated in an effect and stored in state, causing an extra render and missing dependencies (luteal phase).
**Action:** Use `useMemo` to derive expensive data directly during render. This ensures consistency and reduces render passes.
