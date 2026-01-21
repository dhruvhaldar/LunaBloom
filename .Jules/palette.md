## 2025-10-26 - Accessible Key-Value Metrics
**Learning:** For key-value data (like metrics), screen readers often treat the label and value as separate traversable elements, increasing cognitive load.
**Action:** Wrap the label and value in a parent `View` with `accessible={true}` and use a computed `accessibilityLabel` (e.g., "Average Cycle Length: 28 days") to present them as a single, cohesive unit.

## 2025-10-27 - Input Clearing Patterns
**Learning:** Text inputs with character limits often frustrate users if they need to rewrite content completely. Adding a clear button (visible only when content exists) significantly improves recovery speed.
**Action:** When implementing long-form inputs, wrap them in a container that conditionally renders a clear button based on input length, ensuring the button itself is accessible.
