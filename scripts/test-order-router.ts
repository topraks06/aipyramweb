import { routeOrderToBestVendor } from '../src/core/aloha/orderRouter';

async function runTest() {
  console.log("=== VORHANG MARKETPLACE ORDER ROUTER TEST ===");
  
  // Müşteri İsviçre'de (CH - DACH bölgesi)
  const result1 = await routeOrderToBestVendor('CH', 2500, [{ name: 'Test Product', quantity: 1 }]);
  console.log("Test 1 (CH):", result1);

  // Müşteri Türkiye'de (TR)
  const result2 = await routeOrderToBestVendor('TR', 800, [{ name: 'Test Product', quantity: 1 }]);
  console.log("Test 2 (TR):", result2);
}

runTest().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
