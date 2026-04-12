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
\n## 2025-05-24 - Enhancing Focus Rings on Bordered Components\n**Learning:** When adding focus rings (`outlineColor`) to components that already have borders, the focus ring can blend into the border and become difficult to see for keyboard users.\n**Action:** Use `outlineOffset: 2` along with a distinct `outlineColor` (like the primary brand color) to ensure the focus ring appears clearly outside the component's border, significantly improving accessibility for keyboard navigation.
## 2024-05-24 - Explicit ID association for form inputs
**Learning:** Screen readers may not consistently associate visual labels (like a standalone  component) with interactive inputs (like ) unless explicitly linked.
**Action:** Use  on the visual label and the matching  attribute on the  to guarantee a strong programmatic connection for screen readers.

## 2024-05-24 - Explicit ID association for form inputs
**Learning:** Screen readers may not consistently associate visual labels (like a standalone `ThemedText` component) with interactive inputs (like `TextInput`) unless explicitly linked.
**Action:** Use `nativeID` on the visual label and the matching `aria-labelledby` attribute on the `TextInput` to guarantee a strong programmatic connection for screen readers.
