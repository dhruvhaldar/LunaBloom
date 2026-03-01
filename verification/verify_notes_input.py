from playwright.sync_api import Page, expect, sync_playwright

def test_notes_input_limit(page: Page):
  page.goto("http://localhost:8081")

  # Wait for the app to load
  page.wait_for_timeout(3000)

  # Find the Notes input using accessibility hint
  notes_input = page.get_by_placeholder("Record any additional notes...")

  # Ensure it is visible
  expect(notes_input).to_be_visible()

  # Type a very long string that exceeds the max limit of 500 characters
  long_text = "a" * 505
  notes_input.fill(long_text)

  # Wait a bit to ensure the onChange text and truncation logic have run
  page.wait_for_timeout(1000)

  # Take a screenshot
  page.screenshot(path="/app/verification/notes_input_limit.png")

if __name__ == "__main__":
  with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    try:
      test_notes_input_limit(page)
    finally:
      browser.close()
