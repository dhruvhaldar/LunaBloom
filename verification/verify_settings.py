from playwright.sync_api import Page, expect, sync_playwright

def test_settings_toggles(page: Page):
    print("Navigating to home...")
    # Use domcontentloaded to avoid waiting for open socket connections (HMR)
    page.goto("http://localhost:8081", wait_until="domcontentloaded", timeout=60000)

    print("Looking for Settings tab...")
    # 2. Navigate to Settings tab
    settings_tab = page.get_by_role("link", name="Settings")
    if settings_tab.count() == 0:
         print("Role link not found, trying text...")
         settings_tab = page.get_by_text("Settings", exact=True)

    # Wait for it to be visible just in case
    settings_tab.first.wait_for(state="visible", timeout=10000)
    settings_tab.first.click()

    print("Verifying Settings screen...")
    # 3. Verify we are on Settings screen
    expect(page.get_by_text("Other Settings")).to_be_visible(timeout=10000)

    print("Finding Luteal Phase toggle...")
    # 4. Find the Luteal Phase toggle and click it
    luteal_toggle = page.get_by_label("Luteal Phase Calculation")

    # Take screenshot before toggle
    page.screenshot(path="/home/jules/verification/settings_before.png")

    print("Clicking toggle...")
    luteal_toggle.click()

    page.wait_for_timeout(1000) # Wait for animation/state update

    # 5. Take screenshot after toggle
    page.screenshot(path="/home/jules/verification/settings_after.png")
    print("Screenshots taken.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_settings_toggles(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
        finally:
            browser.close()
