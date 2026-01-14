from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_stepper(page: Page):
    print("Navigating to home...")
    page.goto("http://localhost:8081")

    # Wait for the app to load. The cycle settings section should be visible.
    print("Waiting for Cycle Settings...")
    expect(page.get_by_text("Cycle Settings")).to_be_visible(timeout=120000)

    # Check Cycle Length stepper
    print("Checking Cycle Length stepper...")
    cycle_input = page.get_by_role("textbox", name="Cycle length in days")
    expect(cycle_input).to_be_visible()

    # Check initial value (default 28)
    expect(cycle_input).to_have_value("28")

    # Click Increment
    print("Clicking increment...")
    inc_btn = page.get_by_label("Increase Cycle length in days")
    expect(inc_btn).to_be_visible()
    expect(inc_btn).to_be_enabled()
    inc_btn.click(force=True)
    time.sleep(1)

    # Check value became 29
    expect(cycle_input).to_have_value("29")

    # Click Decrement
    print("Clicking decrement...")
    dec_btn = page.get_by_label("Decrease Cycle length in days")
    dec_btn.click()

    # Check value became 28
    expect(cycle_input).to_have_value("28")

    # Screenshot
    print("Taking screenshot...")
    page.screenshot(path="verification/stepper_verification.png")
    print("Screenshot saved.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_stepper(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
