## 2025-10-26 - Accessible Key-Value Metrics
**Learning:** For key-value data (like metrics), screen readers often treat the label and value as separate traversable elements, increasing cognitive load.
**Action:** Wrap the label and value in a parent `View` with `accessible={true}` and use a computed `accessibilityLabel` (e.g., "Average Cycle Length: 28 days") to present them as a single, cohesive unit.

## 2025-10-27 - Grouping Complex List Items
**Learning:** In FlatLists, items containing multiple text nodes (dates, tags, notes) force users to swipe repeatedly to parse a single entry, causing fatigue.
**Action:** Wrap the item's content in a container with `accessible={true}` and construct a comprehensive `accessibilityLabel` that joins all data points into a natural sentence.

## 2025-10-28 - Efficient Stepper Inputs
**Learning:** Default stepper inputs require repetitive tapping for large changes and manual deletion for replacing values, frustrating power users.
**Action:** Enable `selectTextOnFocus` on the input for one-tap replacement and implement `onLongPress` timers for rapid increment/decrement, significantly reducing interaction cost.

## 2025-10-29 - Tappable Settings Rows
**Learning:** Small toggle switches have poor touch targets, frustrating users and failing accessibility guidelines for motor impairments.
**Action:** Wrap the entire settings row (label + switch) in a `TouchableOpacity`. Apply `accessibilityRole="switch"` to the wrapper and hide the internal switch from accessibility (`accessible={false}`, `pointerEvents="none"`), creating a large, single touch target that behaves natively.

## 2025-10-30 - Visual Anchors in Lists
**Learning:** Dense lists of text-based key-value pairs are difficult to scan quickly, leading to increased cognitive load for sighted users.
**Action:** Prepend consistent icons (emojis) to labels to serve as visual anchors and conditionally render optional fields to reduce visual clutter, improving scannability without compromising accessibility.

## 2025-11-01 - Input Clear Button Pattern
**Learning:** Long text inputs (like chat or notes) are tedious to clear via backspace, especially on mobile.
**Action:** Implement an absolute-positioned "Clear" button inside the input container that only appears when text is present, ensuring it clears content and refocuses the field for immediate re-typing.

## 2025-11-02 - Chat Auto-Scroll Behavior
**Learning:** In chat interfaces, users expect new messages (especially streamed AI responses) to be immediately visible without manual scrolling.
**Action:** Use `onContentSizeChange` on the ScrollView to trigger `scrollToEnd({ animated: true })`, ensuring the view always follows the conversation flow as content grows.

## 2026-02-13 - Character Count Feedback
**Learning:** `maxLength` on inputs prevents excess text but leaves users guessing the limit until they hit it, causing frustration when typing long messages.
**Action:** Add a dynamic `current/max` character count indicator that appears on typing and changes color near the limit (90%) to provide proactive feedback and reduce frustration.
