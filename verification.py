from playwright.sync_api import sync_playwright, expect

def verify_feature(page):
    page.goto("http://localhost:8081")
    page.wait_for_timeout(3000)

    # Go to insights page
    page.get_by_role("tab", name="Insights").click()
    page.wait_for_timeout(2000)

    # Click the "Previous Cycles" collapsible header to test if it toggles
    page.get_by_text("Previous Cycles").click()
    page.wait_for_timeout(500)

    # Take a screenshot
    page.screenshot(path="focus_verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(record_video_dir="verification/video")
        page = context.new_page()
        try:
            verify_feature(page)
        finally:
            context.close()
            browser.close()
