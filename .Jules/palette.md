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

## 2026-02-26 - Animated Micro-Interactions
**Learning:** Static checkbox/radio selection states can feel lifeless and lack immediate visual feedback, leading to uncertainty about whether the action was registered.
**Action:** Implement a spring-based scale animation for the selection indicator (icon) to provide delightful visual confirmation, and add `accessibilityHint` to clarify the action's effect (e.g., "Logs this symptom").

## 2026-03-01 - Haptic Limit Feedback
**Learning:** Visual-only character limits (like red text) are missed by users focused on the keyboard or when typing quickly.
**Action:** Combine visual feedback (color change) with distinct haptic feedback (e.g., `Haptics.notificationAsync(Warning)`) when the user attempts to type past the limit to reinforce the constraint.

## 2026-03-10 - Feedback for Input Overflow
**Learning:** Setting `maxLength` on a TextInput prevents the `onChangeText` event from firing when the user attempts to type beyond the limit, making it impossible to trigger feedback (like haptics or animation) for the overflow attempt.
**Action:** Remove the `maxLength` prop and manually handle text truncation within the `onChangeText` handler. This allows detecting when the input length exceeds the limit, enabling immediate feedback (shake animation, haptics) before clamping the text.

## 2026-03-22 - Reframing Fertility Indicators
**Learning:** Using warning icons (red triangles) for "Ovulation Day" in health apps can miscommunicate danger instead of a natural, positive biological event, causing unnecessary alarm.
**Action:** Replace "warning" semantics with celebratory or neutral "success" indicators (e.g., sparkles, teal/gold colors) for peak fertility days to align with user goals (tracking health/conception) and reduce anxiety.

## 2026-02-28 - Date Picker Affordance
**Learning:** Custom date picker triggers can often look like static text or generic buttons, making it unintuitive for users to realize they are interactive fields.
**Action:** Add standard icons (like a calendar) and horizontal alignment (gap: 6) to date picker buttons to significantly improve visual scannability and intuitive affordance.
## 2026-03-02 - Accessible Async Button States
**Learning:** Conditionally rendering a separate `<ActivityIndicator>` instead of a `<TouchableOpacity>` during an async action (like a file download) causes the focused element to disappear, breaking keyboard/screen reader focus and leading to a jarring user experience.
**Action:** Embed the `<ActivityIndicator>` directly inside the `<TouchableOpacity>`, set `disabled={isLoading}`, and use `accessibilityState={{ busy: isLoading, disabled: isLoading }}` to provide continuous, semantic feedback without breaking focus.

## 2026-03-03 - Past Date Context in Predictions
**Learning:** In prediction summaries, calculating the difference between a past date and today without a handler for negative values results in an empty status string, leaving users confused about the timeline of past events.
**Action:** Always provide explicit relative time labels for both future ("in X days") and past ("X days ago") predictions, ensuring continuity and immediate context for all timeline events.

## 2026-03-12 - Settings Helper Text
**Learning:** Medical or technical app settings (like "Luteal Phase Calculation") are confusing to average users without context, leading to hesitation in using helpful features. Relying solely on a post-toggle alert forces the user to interact blindly.
**Action:** Always provide inline helper text or subtitles for complex settings, ensuring users understand the value and purpose before they decide to interact with the control.
## 2026-03-14 - Interactive Component Feedback with Pressable\n**Learning:** The `Collapsible` component was using `TouchableOpacity`, which lacks robust hover and focus states on the web. In React Native Web, using `Pressable` with a function-based `style` prop (e.g., `({ pressed, hovered, focused }) => [...]`) allows for explicit visual feedback, such as applying `outlineStyle` for keyboard focus accessibility and a distinct background color for mouse hover. Temporary test files added to Expo Router's `app/` directory become live routes; they must be removed before submission.\n**Action:** Always prefer `Pressable` over `TouchableOpacity` for interactive elements that require cross-platform accessibility, ensuring explicit `hovered`, `focused`, and `pressed` styles are defined. Also, ensure temporary verification files are deleted from the routing tree.

## 2026-03-15 - Dynamic Accessibility Hints for Toggles
**Learning:** Static `accessibilityHint`s on toggleable elements (like custom checkboxes or radio buttons) fail to convey the exact outcome of interacting with the element in its *current* state. A generic hint like "Toggles this symptom" leaves screen reader users guessing the action's direction.
**Action:** Always use dynamic `accessibilityHint` logic that changes based on the element's current state (e.g., `isSelected ? "Tap to remove this symptom" : "Tap to add this symptom"`), providing clear, context-aware instructions to assistive technologies.
