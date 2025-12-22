## 2024-05-23 - Accessibility in React Native Lists
**Learning:** Custom toggle buttons mapped from lists often lack semantic context. Using `accessibilityRole="checkbox"` (or `radio`) combined with `accessibilityState={{ checked: ... }}` is critical for screen reader users to understand the component's behavior, not just its text content. Adding a descriptive `accessibilityLabel` (e.g., "Cramps symptom" vs "Cramps") helps disambiguate context in dense lists.
**Action:** Always wrap custom `TouchableOpacity` toggles with explicit accessibility props when they mimic native controls.

## 2024-05-23 - Async Feedback Loops
**Learning:** Async operations like `AsyncStorage` calls can be deceptively fast or slow. Users often double-tap buttons if there is no immediate visual feedback.
**Action:** Always implement a `try/finally` block with a loading state (`ActivityIndicator`) and `disabled` prop on the triggering button to ensure UI responsiveness and data integrity.
