import { config } from 'dotenv';
config({ path: '.env.local' });
import { MasterPhotographer } from '../src/core/swarm/master-photographer';

console.log("\n=== TEST 1: YARN (İplik) ===");
console.log(MasterPhotographer.buildMasterPhotographerPrompt({ category: "yarn", context: "Polyester İplik Fiyatları Yükseliyor" }));

console.log("\n=== TEST 2: MACHINERY (Tekstil Makineleri) ===");
console.log(MasterPhotographer.buildMasterPhotographerPrompt({ category: "machinery", context: "Yeni Nesil Dokuma Makineleri ITMA'da Tanıtıldı" }));

console.log("\n=== TEST 3: CURTAINS (Perde) ===");
console.log(MasterPhotographer.buildMasterPhotographerPrompt({ category: "curtains", context: "2026 Blackout Perde Trendleri" }));

console.log("\n=== TEST 4: CARPET (Halı) ===");
console.log(MasterPhotographer.buildMasterPhotographerPrompt({ category: "carpets", context: "Gaziantep Halı İhracatında Rekor" }));

console.log("\n=== TEST 5: DEFAULT HOMETEX (Fuar) ===");
console.log(MasterPhotographer.buildMasterPhotographerPrompt({ category: "general", context: "Sürdürülebilir Ev Tekstiline Yoğun İlgi" }));
