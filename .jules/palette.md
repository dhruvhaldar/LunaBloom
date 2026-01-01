## 2024-05-24 - [Accessibility State for Custom Toggles]
**Learning:** Custom toggle buttons (using TouchableOpacity) need explicit `accessibilityRole` (radio/checkbox) AND `accessibilityState={{ checked: boolean }}` to be correctly announced by screen readers. Merely changing visual style is insufficient for non-visual users.
**Action:** When creating custom selection controls, always pair visual state changes with aria/accessibility props.
