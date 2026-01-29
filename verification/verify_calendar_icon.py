from playwright.sync_api import sync_playwright, expect

def verify_calendar_icon():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app
        # Expo web usually starts on 8081
        page.goto("http://localhost:8081", timeout=60000)

        # Wait for the app to load. Look for "Period Tracker" title.
        page.wait_for_load_state("networkidle")
        expect(page.get_by_text("Period Tracker")).to_be_visible(timeout=30000)

        # Find the Last Period Start button
        # Using a partial match for the accessibility label or looking for the text "Last Period Start"
        # The button is next to "Last Period Start" text.

        # Take a screenshot of the whole page
        page.screenshot(path="verification/calendar_icon_full.png")

        # Try to locate the button specifically to screenshot it
        # The button has accessibilityLabel starting with "Select last period start date"
        button = page.get_by_label("Select last period start date")
        if button.count() > 0:
            button.first.screenshot(path="verification/calendar_icon_button.png")
            print("Button screenshot taken.")
        else:
            print("Button not found by label.")

        browser.close()

if __name__ == "__main__":
    verify_calendar_icon()
