from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    try:
        page.goto("http://localhost:8081")

        # Wait for "Period Tracker" text
        expect(page.get_by_text("Period Tracker")).to_be_visible(timeout=30000)

        # Check for tab buttons by text
        # These texts are inside the tab bar buttons
        expect(page.get_by_text("Home", exact=True)).to_be_visible()
        expect(page.get_by_text("History", exact=True)).to_be_visible()
        expect(page.get_by_text("Insights", exact=True)).to_be_visible()
        expect(page.get_by_text("MenstruAI", exact=True)).to_be_visible()
        expect(page.get_by_text("Settings", exact=True)).to_be_visible()

        print("All tabs visible!")

        page.screenshot(path="verification/tabs_success.png")
    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="verification/error_2.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
