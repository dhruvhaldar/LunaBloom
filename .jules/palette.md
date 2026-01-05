## 2024-05-24 - [Accessibility State for Custom Toggles]
**Learning:** Custom toggle buttons (using TouchableOpacity) need explicit `accessibilityRole` (radio/checkbox) AND `accessibilityState={{ checked: boolean }}` to be correctly announced by screen readers. Merely changing visual style is insufficient for non-visual users.
**Action:** When creating custom selection controls, always pair visual state changes with aria/accessibility props.

## 2024-05-25 - [Guidance in Empty States]
**Learning:** Empty states in conversational interfaces (chatbots) often leave users with "writer's block". Providing clickable "suggestion chips" not only demonstrates the system's capabilities but also reduces friction for the first interaction.
**Action:** In open-ended input interfaces, always provide "quick start" options to guide the user.

## 2024-05-26 - [Feedback during Async Operations]
**Learning:** In chat interfaces, disappearing content (clearing the previous response) without an immediate replacement creates a "flash of empty content" that confuses users, especially if the keyboard remains open. A dedicated, centered "Thinking..." state provides reassurance that the system is working, unlike a small spinner on a button which might be obscured.
**Action:** For AI interactions, replace the content area with a friendly loading state rather than showing the empty state again.
