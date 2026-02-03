from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app root
        print("Navigating to app root...")
        page.goto("http://localhost:8081", timeout=60000)

        # Wait for hydration
        print("Waiting for hydration...")
        page.wait_for_timeout(5000)

        # Navigate to Insights tab
        print("Navigating to Insights tab...")
        # Expo Router web tabs might be links with href="/insights" or buttons with text "Insights"
        # Using get_by_role('link', name='Insights') or get_by_text('Insights')

        # Try to find the link first
        insights_link = page.get_by_role("link", name="Insights")

        if insights_link.count() > 0:
            insights_link.click()
        else:
            # Fallback to text
            page.get_by_text("Insights").click()

        print("Clicked Insights tab...")

        # Wait for Insights screen content to load
        # Look for "Cycle Insights" title
        expect(page.get_by_text("Cycle Insights")).to_be_visible(timeout=10000)

        print("Insights screen visible. Taking screenshot...")
        page.screenshot(path="verification/insights.png")

        browser.close()
        print("Done.")

if __name__ == "__main__":
    run()
