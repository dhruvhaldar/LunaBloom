## 2024-05-22 - Numeric Input Patterns
**Learning:** Replaced raw numeric `TextInput`s with a `StepperInput` component to improve mobile usability (tap vs type). Learned that `onBlur` is preferred over `onEndEditing` for validation callbacks to ensure consistent behavior across Web and Native platforms.
**Action:** Use `StepperInput` for small-range numeric inputs and strictly use `onBlur` for validation logic.
