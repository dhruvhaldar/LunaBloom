## 2025-10-26 - Accessible Key-Value Metrics
**Learning:** For key-value data (like metrics), screen readers often treat the label and value as separate traversable elements, increasing cognitive load.
**Action:** Wrap the label and value in a parent `View` with `accessible={true}` and use a computed `accessibilityLabel` (e.g., "Average Cycle Length: 28 days") to present them as a single, cohesive unit.

## 2025-10-27 - Grouping List Item Content
**Learning:** Complex list items with multiple text fields are tedious to navigate line-by-line with screen readers.
**Action:** Wrap content in a container with `accessible={true}` and a constructed `accessibilityLabel` to present the item as a single cohesive unit.
