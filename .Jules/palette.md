## 2024-05-23 - Encapsulating Haptics in UI Components
**Learning:** Platform-specific logic (like `Haptics` checks for Web vs Native) clutters screen components and leads to inconsistency.
**Action:** Encapsulate this logic within reusable UI components (like `Switch`, `SelectionButton`). This ensures every interaction feels premium and consistent across platforms without repetitive code in screens.

## 2025-05-24 - Enhancing ScrollView Interactions
**Learning:** Default ScrollView behavior (locking taps when keyboard is up, not dismissing keyboard on drag) frustrates users during form entry.
**Action:** Always configure `keyboardDismissMode="on-drag"` and `keyboardShouldPersistTaps="handled"` in scrollable containers wrapping forms to create a fluid, native-feeling experience.

## 2025-05-24 - Relative Time Context for Future Dates
**Learning:** Users often struggle with mental math when viewing future dates (e.g., "Is Oct 24 in 3 weeks or 4?"). Providing relative time (e.g., "in 32 days") alongside absolute dates reduces cognitive load significantly.
**Action:** Always include relative time context for future dates in list views or summaries, not just for the immediate next item.

## 2025-05-24 - Web Accessibility Focus and Hover States on Buttons
**Learning:** React Native Web mapping for `TouchableOpacity` doesn't always handle keyboard navigation focus effectively on the web, often failing to show custom focus rings or missing subtle hover states on icon buttons.
**Action:** Replace `TouchableOpacity` with `Pressable` for interactive elements (especially icon buttons) when web support is needed. Utilize the `({ pressed, hovered, focused })` state parameters to add explicit background color changes on hover/focus, and `Platform.select({ web: { outlineStyle: 'solid' } })` to ensure keyboard focus is always visible.

## 2025-05-24 - Enhancing Focus Rings on Bordered Components
**Learning:** When adding focus rings (`outlineColor`) to components that already have borders, the focus ring can blend into the border and become difficult to see for keyboard users.
**Action:** Use `outlineOffset: 2` along with a distinct `outlineColor` (like the primary brand color) to ensure the focus ring appears clearly outside the component's border, significantly improving accessibility for keyboard navigation.

## 2025-05-24 - Preserving Legacy Touch Feedback When Migrating to Pressable
**Learning:** When substituting `TouchableOpacity` with `Pressable` for enhanced web accessibility (hover/focus rings), the native mobile touch feedback (opacity reduction) is lost if not explicitly re-implemented. This creates an inconsistent and unresponsive feel on mobile devices.
**Action:** When making this migration, always ensure the `pressed` state explicitly returns `{ opacity: 0.7 }` to maintain the expected native mobile UX alongside the new web enhancements.

## 2024-03-24 - Improve screen reader support for ChatInput character count
**Learning:** The character limit indicator in the `ChatInput` component was purely visual. Providing this context (e.g., '0 characters used out of 200') to screen readers using `accessibilityLabel` ensures an equitable experience and aligns with the pattern used in `NotesInput`.
**Action:** Add `accessibilityLabel` to text components acting as character counters to make their purpose and status explicit to assistive technology.

## 2024-05-18 - Input Limit Accessibility
**Learning:** Custom visual/haptic feedback for input limits (like "shake" animations) leaves screen reader users unaware of why their input is clamped when native `maxLength` is removed to facilitate the custom feedback.
**Action:** Always pair custom programmatic input clamping with `AccessibilityInfo.announceForAccessibility` to ensure equitable, immediate feedback for screen reader users.
