from playwright.sync_api import Page, expect, sync_playwright
import time

def test_empty_state(page: Page):
    print("Navigating to app root...")
    # Increase navigation timeout
    page.goto("http://localhost:8081", timeout=60000)

    print("Waiting for app to load...")
    # Wait for any text that indicates app loaded
    page.wait_for_selector('text=Period Tracker', timeout=60000)

    print("Clicking History tab...")
    # Click the tab with text "History"
    page.get_by_text("History").click()

    print("Waiting for Empty State...")
    # 3. Assert: Check for Empty State text.
    expect(page.get_by_text("No Entries Yet")).to_be_visible(timeout=20000)

    print("Waiting for animation...")
    time.sleep(2)

    # 4. Screenshot
    print("Taking screenshot...")
    page.screenshot(path="verification/empty_state.png")
    print("Screenshot saved.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_empty_state(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()
