from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    try:
        # 1. Navigate to root
        print("Navigating to root...")
        page.goto("http://localhost:8081", timeout=60000)

        # Wait for hydration
        page.wait_for_timeout(5000)

        # 2. Click History tab
        print("Clicking History tab...")
        # Use exact=True to avoid matching "History" in the header if visible
        page.get_by_text("History", exact=True).click()

        # 3. Wait a bit to see the state (short wait to catch spinner)
        page.wait_for_timeout(500)

        # 4. Screenshot
        print("Taking screenshot...")
        page.screenshot(path="verification_loading.png")

    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="error.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
