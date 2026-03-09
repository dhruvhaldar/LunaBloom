import time
import os
from playwright.sync_api import sync_playwright

def verify_settings():
    # Setup playwright
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Create a browser context with timezone and viewport
        context = browser.new_context(
            viewport={'width': 414, 'height': 896},
            device_scale_factor=2
        )
        page = context.new_page()

        try:
            # Navigate to the app with a longer timeout since Expo web can be slow to start
            page.goto('http://localhost:8081', timeout=60000)

            # Wait for the app to load
            page.wait_for_selector('text="Period Tracker"', timeout=60000)

            # Click the Settings tab using get_by_role('tab')
            # In React Navigation web, tabs have role="tab"
            settings_tab = page.locator('div[role="tab"]').filter(has_text="Settings")

            # If standard role doesn't work, try a broad text search
            if not settings_tab.count():
                 settings_tab = page.locator('text="Settings"').last

            settings_tab.click()

            # Wait for Settings screen to render
            page.wait_for_selector('text="Other Settings"', timeout=10000)

            # Wait a moment for layout to settle
            page.wait_for_timeout(2000)

            # Scroll down slightly to make sure both toggles are clearly visible
            page.evaluate("window.scrollBy(0, 100)")
            page.wait_for_timeout(500)

            # Make sure our new text is there
            page.wait_for_selector('text="Improves ovulation prediction by using a 14-day phase."', timeout=5000)
            page.wait_for_selector('text="Blocks screen captures to protect your privacy."', timeout=5000)

            # Ensure directory exists
            os.makedirs('/app/verification', exist_ok=True)

            # Take screenshot of the settings screen
            page.screenshot(path='/app/verification/settings_screen.png')
            print("Successfully saved screenshot to /app/verification/settings_screen.png")

        except Exception as e:
            print(f"Verification failed: {e}")
            # Try to grab an error screenshot
            try:
                 page.screenshot(path='/app/verification/error_screenshot.png')
                 print("Saved error state screenshot")
            except:
                 pass
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_settings()
