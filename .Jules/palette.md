## 2025-12-28 - Multiline Input in React Native
**Learning:** React Native's `TextInput` requires `textAlignVertical: 'top'` to ensure placeholder and text start at the top-left when `multiline` is enabled and the input has a fixed height. Without it, text centers vertically by default on Android.
**Action:** Always include `textAlignVertical: 'top'` and appropriate `paddingTop` when styling multiline text inputs.
