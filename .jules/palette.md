## 2024-05-23 - Encapsulating Haptics in UI Components
**Learning:** Platform-specific logic (like `Haptics` checks for Web vs Native) clutters screen components and leads to inconsistency.
**Action:** Encapsulate this logic within reusable UI components (like `Switch`, `SelectionButton`). This ensures every interaction feels premium and consistent across platforms without repetitive code in screens.

## 2025-05-24 - Enhancing ScrollView Interactions
**Learning:** Default ScrollView behavior (locking taps when keyboard is up, not dismissing keyboard on drag) frustrates users during form entry.
**Action:** Always configure `keyboardDismissMode="on-drag"` and `keyboardShouldPersistTaps="handled"` in scrollable containers wrapping forms to create a fluid, native-feeling experience.

## 2025-05-24 - Relative Time Context for Future Dates
**Learning:** Users often struggle with mental math when viewing future dates (e.g., "Is Oct 24 in 3 weeks or 4?"). Providing relative time (e.g., "in 32 days") alongside absolute dates reduces cognitive load significantly.
**Action:** Always include relative time context for future dates in list views or summaries, not just for the immediate next item.
