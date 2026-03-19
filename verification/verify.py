from playwright.sync_api import sync_playwright

def verify_hover_state():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 900})
        page = context.new_page()

        print("Starting app...")
        page.goto("http://localhost:8081/chatbot", wait_until="networkidle")

        print("Waiting for MenstruAI text...")
        page.get_by_text("MenstruAI", exact=False).first.wait_for(state="visible", timeout=60000)

        # Scroll to the bottom to make the input/suggestions fully visible
        page.keyboard.press("End")
        page.wait_for_timeout(1000)

        print("Clicking a suggestion...")
        # Since the chat input might be blocked by the tab bar, click a suggestion instead
        suggestion = page.get_by_text("Explain the menstrual cycle").first
        suggestion.click(force=True)

        print("Waiting for Share button...")
        share_btn = page.get_by_role("button", name="Share response")
        share_btn.wait_for(state="visible", timeout=30000)

        page.screenshot(path="verification/before_hover.png")

        print("Hovering over Share button...")
        # Force hover too just in case
        share_btn.hover(force=True)
        page.wait_for_timeout(500)
        page.screenshot(path="verification/hover_state.png")

        print("Focusing on Share button...")
        # Since it's web, use keyboard tab to focus the button
        page.keyboard.press("Tab")
        page.keyboard.press("Tab")
        # Ensure focus is on it, or we can just use locator.focus()
        share_btn.focus()
        page.wait_for_timeout(500)
        page.screenshot(path="verification/focused_state.png")

        print("Done.")
        browser.close()

if __name__ == "__main__":
    verify_hover_state()
