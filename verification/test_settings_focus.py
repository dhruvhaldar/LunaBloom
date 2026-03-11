from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    print("Starting server...")
    page.goto("http://localhost:8081") # Wait for expo web

    # Wait for app to load
    page.wait_for_timeout(10000)

    # Click on Log Period Button to focus it and see if the outline shows
    # Wait, we changed index.tsx Log Period button and date picker.

    print("Finding Log Period button...")
    log_button = page.get_by_text("Log Period Entry")

    print("Focusing Log Period button...")
    log_button.focus()
    page.wait_for_timeout(1000) # Wait for focus style

    print("Taking screenshot of focused Log Period button...")
    page.screenshot(path="verification/focused_state.png")

    print("Hovering Log Period button...")
    log_button.hover()
    page.wait_for_timeout(1000) # Wait for hover style

    print("Taking screenshot of hovered Log Period button...")
    page.screenshot(path="verification/hover_state.png")

    print("Finding date picker button...")
    date_button = page.get_by_text("Last Period Start").locator("xpath=following-sibling::*").first

    print("Hovering date picker...")
    date_button.hover()
    page.wait_for_timeout(1000)
    page.screenshot(path="verification/date_picker_hover.png")

    context.close()
    browser.close()

if __name__ == "__main__":
    with sync_playwright() as playwright:
        run(playwright)
