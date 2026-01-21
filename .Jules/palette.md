## 2025-10-26 - Accessible Key-Value Metrics
**Learning:** For key-value data (like metrics), screen readers often treat the label and value as separate traversable elements, increasing cognitive load.
**Action:** Wrap the label and value in a parent `View` with `accessible={true}` and use a computed `accessibilityLabel` (e.g., "Average Cycle Length: 28 days") to present them as a single, cohesive unit.

## 2025-10-27 - Grouped List Item Content
**Learning:** Navigating complex list items with multiple separate text fields is tedious for screen reader users, requiring multiple swipes per item.
**Action:** Wrap related text content in a parent `View` with `accessible={true}` and a consolidated `accessibilityLabel` to present the item's details as a single, cohesive unit, while keeping interactive actions (like delete) separate.
