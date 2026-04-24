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
  
  // Wait for dashboard to load
  await page.waitForTimeout(3000);
  
  // Type command
  await page.fill('input[type="text"]', 'Hometex dashboard');
  await page.keyboard.press('Enter');
  
  // Wait for response and widget
  await page.waitForTimeout(5000);
  
  // Take screenshot
  await page.screenshot({ path: '.agents/artifacts/aloha_hometex_test.png', fullPage: true });
  
  // Change Target Node to TRTEX
  await page.selectOption('select', 'trtex');
  await page.waitForTimeout(1000);
  
  // Type content stats
  await page.fill('input[type="text"]', 'istatistik');
  await page.keyboard.press('Enter');
  
  // Wait for response and widget
  await page.waitForTimeout(5000);
  
  // Take screenshot
  await page.screenshot({ path: '.agents/artifacts/aloha_trtex_test.png', fullPage: true });

  await browser.close();
  console.log("ALOHA command tests completed and screenshots captured.");
})();
