from playwright.sync_api import Page, expect, sync_playwright

def test_chatbot_empty_state(page: Page):
  page.set_default_timeout(60000)

  print("Navigating to home...")
  page.goto("http://localhost:8081")

  print("Waiting for Home page to load...")
  try:
      expect(page.get_by_text("Period Tracker")).to_be_visible(timeout=30000)
  except Exception as e:
      print("Home page load failed or timed out.")
      page.screenshot(path="verification/failed_home_load.png")
      raise e

  print("Navigating to MenstruAI tab...")
  page.goto("http://localhost:8081/chatbot")

  print("Waiting for MenstruAI content...")
  try:
      expect(page.get_by_text("MenstruAI Assistant")).to_be_visible(timeout=30000)
      expect(page.get_by_text("I'm here to help with your menstrual health questions.")).to_be_visible()
  except Exception as e:
      print("MenstruAI content not found.")
      page.screenshot(path="verification/failed_chatbot_load.png")
      print(page.content())
      raise e

  # Wait for animation to finish (800ms duration)
  print("Waiting for animation to finish...")
  page.wait_for_timeout(2000)

  print("Taking screenshot...")
  page.screenshot(path="verification/verification.png")
  print("Screenshot saved.")

if __name__ == "__main__":
  with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    try:
      test_chatbot_empty_state(page)
    finally:
      browser.close()
