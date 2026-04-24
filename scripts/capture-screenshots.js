const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Go to admin page
  await page.goto('http://localhost:3000/admin');
  
  // Bypass login
  await page.evaluate(() => {
    sessionStorage.setItem('dev_bypass_admin', 'true');
  });
  
  // Reload to apply bypass
  await page.reload();
  
  // Wait for dashboard to load (radar data should be there)
  await page.waitForTimeout(3000);
  
  // Take screenshot of dashboard
  await page.screenshot({ path: '.agents/artifacts/admin_dashboard.png', fullPage: true });
  
  // Go to feature flags
  await page.goto('http://localhost:3000/admin/feature-flags');
  await page.waitForTimeout(2000);
  
  // Take screenshot of feature flags
  await page.screenshot({ path: '.agents/artifacts/admin_feature_flags.png', fullPage: true });
  
  await browser.close();
  console.log("Screenshots captured successfully.");
})();
