const { test, expect } = require('@playwright/test');

test('Verify StepperInput focus state', async ({ page }) => {
  // Increase timeout for this test
  test.setTimeout(60000);

  // Navigate to the home page where StepperInput is used
  // Using localhost:8081 as per logs
  await page.goto('http://localhost:8081');

  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Locate the StepperInput field for Cycle Length
  // Using getByRole with 'spinbutton' to target the input specifically, not the buttons
  const cycleLengthInput = page.getByRole('spinbutton', { name: 'Cycle length in days' });

  // Ensure the input is visible
  await expect(cycleLengthInput).toBeVisible();

  // Initial screenshot before focus
  await page.screenshot({ path: 'before_focus.png' });

  // Click to focus the input
  await cycleLengthInput.click();

  // Wait a bit for styles to apply
  await page.waitForTimeout(1000);

  // Take screenshot of focused state
  await page.screenshot({ path: 'focused_state.png' });
});
