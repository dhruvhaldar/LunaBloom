## 2024-05-24 - Stepper Input for Small Ranges
**Learning:** TextInputs for small numeric ranges (e.g., cycle length 21-35) create friction on mobile due to keyboard context switching.
**Action:** Use a StepperInput (spinbutton) for integers < 100 where precision isn't critical, enabling single-tap adjustments.

## 2024-05-24 - Icon Visibility in Dark Mode
**Learning:** The design system's `Colors.dark.icon` (#1D3557) matches `Colors.dark.background`, making icons invisible in dark mode by default.
**Action:** Always check icon contrast against background or explicitly use `textColor` for icons in component implementations.
