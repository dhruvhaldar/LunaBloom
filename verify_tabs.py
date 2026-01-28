from playwright.sync_api import sync_playwright
import time

def test_tabs(page):
    print("Navigating to home...")
    page.goto("http://localhost:3000")
    # Wait for Home
    print("Waiting for Period Tracker...")
    # Increase timeout just in case first load is slow
    page.get_by_text("Period Tracker").wait_for(timeout=30000)

    print("Clicking History tab...")
    # Tab labels are usually text. But they might be in a view.
    # We use exact=True because "History" is also the title of the screen.
    # The tab bar is at the bottom.
    page.get_by_text("History", exact=True).last.click()

    print("Waiting for Logged Entries...")
    page.get_by_text("Logged Entries").wait_for()

    print("Clicking Insights tab...")
    page.get_by_text("Insights", exact=True).last.click()

    print("Waiting for Cycle Insights...")
    page.get_by_text("Cycle Insights").wait_for()

    # Take screenshot
    print("Taking screenshot...")
    page.screenshot(path="/home/jules/verification/tabs.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_tabs(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
            raise e
        finally:
            browser.close()
