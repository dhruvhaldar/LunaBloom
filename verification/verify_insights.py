from playwright.sync_api import sync_playwright
import json
import time

def test_insights_chart(page):
    # Data to inject
    entries = [
        {
            "date": "2024-02-01T10:00:00.000Z",
            "lastPeriod": "2024-02-01T00:00:00.000Z",
            "cycleLength": 28,
            "periodDuration": 5,
            "selectedSymptoms": [],
            "selectedFlow": "Normal",
            "notes": "Test entry 1",
            "predictedNextPeriod": "2024-03-01T00:00:00.000Z",
            "predictedNextOvulation": "2024-02-14T00:00:00.000Z"
        },
        {
            "date": "2024-01-04T10:00:00.000Z",
            "lastPeriod": "2024-01-04T00:00:00.000Z",
            "cycleLength": 28,
            "periodDuration": 5,
            "selectedSymptoms": [],
            "selectedFlow": "Normal",
            "notes": "Test entry 2",
            "predictedNextPeriod": "2024-02-01T00:00:00.000Z",
            "predictedNextOvulation": "2024-01-18T00:00:00.000Z"
        }
    ]

    entries_json = json.dumps(entries)

    print("Navigating to home...")
    page.goto("http://localhost:8081/", timeout=60000)

    print("Injecting data...")
    page.evaluate(f"localStorage.setItem('periodEntries', '{entries_json}')")

    print("Reloading to pick up data...")
    page.reload()

    # Wait for app to load
    page.wait_for_selector('text="Period Tracker"', timeout=30000)

    print("Navigating to Insights tab...")
    # Expo Router web tabs might be links or buttons.
    # The memory says: "In Expo Router web builds, bottom tab navigation items may render as div elements; Playwright tests should use page.get_by_text('Name', exact=True)"

    # Try to find "Insights"
    insights_tab = page.get_by_text("Insights", exact=True)
    insights_tab.click()

    # Wait for chart
    print("Waiting for chart...")
    # VictoryBar renders svgs.
    # We can look for "Previous Cycles" text which is in InsightsScreen
    page.wait_for_selector('text="Previous Cycles"', timeout=10000)

    # Wait a bit for animation
    time.sleep(2)

    print("Taking screenshot...")
    page.screenshot(path="/home/jules/verification/verification.png")
    print("Screenshot saved.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_insights_chart(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
        finally:
            browser.close()
