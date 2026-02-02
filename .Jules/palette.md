# Palette's Journal

## 2026-02-02 - ChatInput Disabled State
**Learning:** Even if a button's logic prevents action (empty submission), the lack of visual feedback (disabled state) leads to "dead clicks" and user confusion. Users expect the interface to reflect the validity of their input immediately.
**Action:** Always pair logical validation with visual state changes (opacity, color) on action buttons. Ensure `accessibilityState.disabled` matches the visual and functional state.

## 2026-02-02 - Expo Web Testing Hydration
**Learning:** Playwright tests on Expo Web can fail because elements (like placeholders) aren't immediately available even after navigation appears complete.
**Action:** Use robust waiting strategies (wait for unique page text/element) or explicit timeouts when testing client-side hydrated apps like Expo Web.
