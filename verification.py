from playwright.sync_api import sync_playwright, expect

def verify_focus():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to local server...")
        # Increase timeout since dev server might take a bit to start Metro bundler initially
        page.goto("http://localhost:8081", timeout=60000)

        print("Waiting for page to load...")
        # Wait for the "Light" flow button to appear
        light_btn = page.locator("div[role='radio']", has_text="Light")
        light_btn.wait_for(state="visible", timeout=60000)

        print("Focusing the 'Light' button via keyboard navigation...")
        # Wait a moment for animations/render
        page.wait_for_timeout(2000)

        # Click somewhere safe, then press Tab to focus
        page.locator("text='Period Tracker'").click()

        # Tab multiple times until we reach the "Light" button.
        # Alternatively, we can use Playwright's focus method, but let's see if that triggers the :focus-visible / focused state correctly.
        light_btn.focus()

        # Wait a bit for the focus ring to render
        page.wait_for_timeout(500)

        print("Taking screenshot...")
        # Take screenshot of the specific section to see the focus ring clearly
        section = page.locator("text='Period Flow 🩸'").locator("..")
        section.screenshot(path="focus_verification.png")

        print("Verification complete.")
        browser.close()

if __name__ == "__main__":
    verify_focus()
