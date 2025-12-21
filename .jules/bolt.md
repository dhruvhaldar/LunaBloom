## 2024-05-23 - Render Optimization in HomeScreen
**Learning:** `useEffect` + `setState` for deriving data from props/state causes double renders. Replacing it with `useMemo` avoids the extra render and improves performance.
**Action:** Always prefer `useMemo` for derived state over `useEffect`.
