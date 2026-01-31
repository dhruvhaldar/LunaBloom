## 2025-10-26 - Accessible Key-Value Metrics
**Learning:** For key-value data (like metrics), screen readers often treat the label and value as separate traversable elements, increasing cognitive load.
**Action:** Wrap the label and value in a parent `View` with `accessible={true}` and use a computed `accessibilityLabel` (e.g., "Average Cycle Length: 28 days") to present them as a single, cohesive unit.

## 2025-10-27 - Grouping Complex List Items
**Learning:** In FlatLists, items containing multiple text nodes (dates, tags, notes) force users to swipe repeatedly to parse a single entry, causing fatigue.
**Action:** Wrap the item's content in a container with `accessible={true}` and construct a comprehensive `accessibilityLabel` that joins all data points into a natural sentence.

## 2025-10-28 - Efficient Stepper Inputs
**Learning:** Default stepper inputs require repetitive tapping for large changes and manual deletion for replacing values, frustrating power users.
**Action:** Enable `selectTextOnFocus` on the input for one-tap replacement and implement `onLongPress` timers for rapid increment/decrement, significantly reducing interaction cost.

## 2025-10-29 - Loading States for Async Data
**Learning:** Initial empty states (like "No Entries Yet") can be jarring if shown before data fetching completes, causing a "flash of empty content".
**Action:** Implement an explicit `isLoading` state (initialized to `true`) and conditionally render a loading indicator until the async fetch completes (in `finally`), preserving the empty state for when data is truly absent.
