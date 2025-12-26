# Palette's Journal

This journal documents critical UX and accessibility learnings for the project.

## Format
`## YYYY-MM-DD - [Title]`
`**Learning:** [UX/a11y insight]`
`**Action:** [How to apply next time]`

## 2024-05-22 - Chat Accessibility
**Learning:** Wrapping dynamic chat responses in a `View` with `accessibilityLiveRegion="polite"` ensures screen readers automatically announce new messages without the user needing to manually navigate to them.
**Action:** Always wrap dynamic text updates (like chat messages or status updates) in a live region container.
