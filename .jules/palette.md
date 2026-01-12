## 2024-05-24 - [Accessibility State for Custom Toggles]
**Learning:** Custom toggle buttons (using TouchableOpacity) need explicit `accessibilityRole` (radio/checkbox) AND `accessibilityState={{ checked: boolean }}` to be correctly announced by screen readers. Merely changing visual style is insufficient for non-visual users.
**Action:** When creating custom selection controls, always pair visual state changes with aria/accessibility props.

## 2024-05-25 - [Guidance in Empty States]
**Learning:** Empty states in conversational interfaces (chatbots) often leave users with "writer's block". Providing clickable "suggestion chips" not only demonstrates the system's capabilities but also reduces friction for the first interaction.
**Action:** In open-ended input interfaces, always provide "quick start" options to guide the user.

## 2024-05-26 - [Feedback during Async Operations]
**Learning:** In chat interfaces, disappearing content (clearing the previous response) without an immediate replacement creates a "flash of empty content" that confuses users, especially if the keyboard remains open. A dedicated, centered "Thinking..." state provides reassurance that the system is working, unlike a small spinner on a button which might be obscured.
**Action:** For AI interactions, replace the content area with a friendly loading state rather than showing the empty state again.

## 2024-06-03 - [Visual Indicators for Selection]
**Learning:** Relying solely on background color changes to indicate selection state (in chips/toggles) is insufficient for accessibility, particularly for users with color vision deficiencies. Adding a distinct icon (like a checkmark) provides a necessary secondary visual cue.
**Action:** Always include an icon or shape change alongside color changes for selection states in custom UI components.

## 2025-06-04 - [Validation Timing and Haptic Feedback]
**Learning:** Validating text inputs on every keystroke (`onChangeText`) causes premature and annoying warnings (e.g., flagging "2" as too small when the user intends to type "28"). Deferring validation to `onEndEditing` creates a much smoother experience. Additionally, adding haptic feedback to form interactions (selection, submission) significantly enhances the perceived responsiveness and "delight" of the app.
**Action:** Use `onEndEditing` for logic-heavy validation warnings while keeping `onChangeText` for character masking. Integrate `expo-haptics` for meaningful state changes.

## 2025-06-05 - [Native Modules on Web]
**Learning:** Even if `expo-haptics` is supposed to be a no-op on web, it may throw errors in certain environments (e.g. "Haptic.selectionAsync is not available").
**Action:** Always wrap native-only calls like Haptics in `if (Platform.OS !== 'web')` checks to ensure cross-platform stability.
