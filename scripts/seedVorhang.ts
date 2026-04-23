import { adminDb } from '../src/lib/firebase-admin';

async function seedVorhang() {
  const sellers = [
    { id: 'v-seller-1', name: 'Weber Textil', email: 'contact@weber-textil.de', rating: 4.8 },
    { id: 'v-seller-2', name: 'Kaya Stoffe', email: 'info@kaya-stoffe.de', rating: 4.6 },
    { id: 'v-seller-3', name: 'Alpen Vorhange', email: 'sales@alpenvorhange.de', rating: 4.9 }
  ];

  const products = [
    { id: '1', title: 'Premium Leinen Vorhang', sellerId: 'v-seller-1', price: 249.99, imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80', isVerified: true, category: 'Vorhänge', color: 'Beige' },
    { id: '2', title: 'Blackout Samt', sellerId: 'v-seller-2', price: 189.50, imageUrl: 'https://images.unsplash.com/photo-1543169720-6d306b9b3e1a?w=600&q=80', isVerified: true, category: 'Vorhänge', color: 'Blau' },
    { id: '3', title: 'Tüll Transparent', sellerId: 'v-seller-3', price: 120.00, imageUrl: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=600&q=80', isVerified: false, category: 'Vorhänge', color: 'Weiß' },
    { id: '4', title: 'Zebra Rollo', sellerId: 'v-seller-1', price: 89.99, imageUrl: 'https://images.unsplash.com/photo-1588636730303-39fba087a313?w=600&q=80', isVerified: true, category: 'Rollos', color: 'Grau' },
    { id: '5', title: 'Outdoor Stoff (Meterware)', sellerId: 'v-seller-2', price: 45.00, imageUrl: 'https://images.unsplash.com/photo-1584839846270-22e8964e5c54?w=600&q=80', isVerified: true, category: 'Stoffe', color: 'Grün' },
    { id: '6', title: 'Vorhangstange (Gold)', sellerId: 'v-seller-3', price: 115.00, imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80', isVerified: true, category: 'Zubehör', color: 'Gold' },
    { id: '7', title: 'Blickdicht Beige', sellerId: 'v-seller-1', price: 155.00, imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80', isVerified: true, category: 'Vorhänge', color: 'Beige' },
    { id: '8', title: 'Dunkelgrau Samt', sellerId: 'v-seller-2', price: 210.00, imageUrl: 'https://images.unsplash.com/photo-1616137466211-f939a420be84?w=600&q=80', isVerified: true, category: 'Vorhänge', color: 'Grau' },
    { id: '9', title: 'Weiß Tüll Premium', sellerId: 'v-seller-3', price: 135.00, imageUrl: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=600&q=80', isVerified: true, category: 'Vorhänge', color: 'Weiß' },
    { id: '10', title: 'Balkon Rollo', sellerId: 'v-seller-1', price: 95.00, imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600&q=80', isVerified: true, category: 'Rollos', color: 'Weiß' },
    { id: '11', title: 'Seide Stoff', sellerId: 'v-seller-2', price: 85.00, imageUrl: 'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?w=600&q=80', isVerified: false, category: 'Stoffe', color: 'Grau' },
    { id: '12', title: 'Silber Vorhangstange', sellerId: 'v-seller-3', price: 95.00, imageUrl: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&q=80', isVerified: true, category: 'Zubehör', color: 'Grau' }
  ];

  for (const seller of sellers) {
    await adminDb.collection('vorhang_sellers').doc(seller.id).set(seller);
    console.log(`Seller ${seller.name} added.`);
  }

  for (const product of products) {
    await adminDb.collection('vorhang_products').doc(product.id).set(product);
    console.log(`Product ${product.title} added.`);
  }

  console.log('Vorhang Seed Complete!');
  process.exit(0);
}

seedVorhang().catch(e => {
  console.error(e);
  process.exit(1);
});
