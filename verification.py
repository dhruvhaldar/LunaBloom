import time
from playwright.sync_api import sync_playwright

def verify_selection_button_focus():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Give the server a generous amount of time to build initially (~30-60s)
        page = browser.new_page()

        print("Waiting for Expo Web server to bundle and load...")
        # Increase timeout to 120s for the first load due to Metro bundler
        page.goto("http://localhost:8081", timeout=120000)

        page.wait_for_timeout(5000)

        # Test Focus State (Keyboard Navigation)
        print("Testing Focus State...")
        # Press Tab until we focus the 'Normal' button. We can just focus it programmatically
        # The 'Normal' flow option is a SelectionButton

        # In react native web, touchables might not be natively focusable with locator.focus(), so let's use the actual DOM node or keyboard tab
        # We'll tab through the page
        page.keyboard.press("Tab")
        page.keyboard.press("Tab")
        page.keyboard.press("Tab")
        page.keyboard.press("Tab")
        page.keyboard.press("Tab")
        page.keyboard.press("Tab")
        page.keyboard.press("Tab")
        page.keyboard.press("Tab")
        page.keyboard.press("Tab")

        page.wait_for_timeout(1000)
        page.screenshot(path="before_focus.png")
        print("Saved before_focus.png")

        browser.close()

if __name__ == "__main__":
    verify_selection_button_focus()
