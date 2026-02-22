from playwright.sync_api import sync_playwright, expect

def test_selection_button_press_animation(page):
    print("Navigating to home page...")
    page.goto("http://localhost:8081", timeout=60000)

    # Wait for the app to load
    print("Waiting for app to load...")
    expect(page.get_by_text("Period Tracker")).to_be_visible(timeout=30000)

    # Find the 'Cramps' symptom button
    cramps_button = page.get_by_role("checkbox", name="Select Cramps symptom")

    print("Found Cramps button. Taking initial screenshot...")
    cramps_button.scroll_into_view_if_needed()
    page.screenshot(path="verification/1_initial.png")

    print("Pressing button (mouse down)...")
    box = cramps_button.bounding_box()
    if box:
        page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
        page.mouse.down()

        page.wait_for_timeout(200)

        print("Taking screenshot of pressed state...")
        page.screenshot(path="verification/2_pressed.png")

        page.mouse.up()

        page.wait_for_timeout(500)

        print("Taking screenshot of released state (should be selected)...")
        page.screenshot(path="verification/3_released_selected.png")

        # Debug HTML
        print("Button HTML:", cramps_button.evaluate("el => el.outerHTML"))

        # Verify it is checked
        expect(cramps_button).to_be_checked()

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 375, "height": 812}) # Mobile viewport
        page = context.new_page()
        try:
            test_selection_button_press_animation(page)
        except Exception as e:
            print(f"Test failed: {e}")
            page.screenshot(path="verification/error.png")
            # If failed, print HTML too if possible
            # But handle might be gone
        finally:
            browser.close()
