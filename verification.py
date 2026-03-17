import os
from playwright.sync_api import Page, expect, sync_playwright

def verify_feature(page: Page):
    print("Navigating to http://localhost:8081/chatbot...")
    page.goto("http://localhost:8081/chatbot", timeout=60000)

    print("Waiting for MenstruAI text to appear...")
    expect(page.get_by_text("MenstruAI Assistant")).to_be_visible(timeout=30000)
    page.wait_for_timeout(1000)

    # We want to verify the hover state of the suggestion chips
    # They are Pressable components now.

    print("Hovering over the first suggestion chip...")
    first_suggestion = page.get_by_text("Explain the menstrual cycle")
    expect(first_suggestion).to_be_visible()

    # Take a screenshot before hover
    page.screenshot(path="before_hover.png")

    # Hover over the element
    first_suggestion.hover()
    page.wait_for_timeout(1000)

    # Take a screenshot after hover
    page.screenshot(path="after_hover.png")

    print("Hovering over the second suggestion chip...")
    second_suggestion = page.get_by_text("How to relieve cramps?")
    second_suggestion.hover()
    page.wait_for_timeout(1000)
    page.screenshot(path="after_hover2.png")

    print("Focusing the first suggestion chip...")
    first_suggestion.focus()
    page.wait_for_timeout(1000)
    page.screenshot(path="after_focus.png")

    print("Verification complete!")

if __name__ == "__main__":
    os.makedirs("verification/video", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(record_video_dir="verification/video", viewport={"width": 1280, "height": 720})
        page = context.new_page()
        try:
            verify_feature(page)
        except Exception as e:
            print(f"Error during verification: {e}")
            page.screenshot(path="error.png")
        finally:
            context.close()
            browser.close()
