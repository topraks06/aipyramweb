import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const showrooms = [
    {
      id: 'AIPYRAM_VENDOR_HQ',
      slug: 'aipyram-textile',
      name: 'aipyram Vision',
      category: 'Home Textile',
      hall: 'Hall 3',
      booth: 'B45',
      companyName: 'aipyram GmbH',
      country: 'CH',
      isVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80',
      descTr: 'Geleceğin tekstil vizyonu.',
      descEn: 'The future of textile vision.',
      tags: ['AI', 'Smart Fabric'],
      stats: {
        trustScore: 99,
        exportCountries: 40,
        responseRate: '100%',
        moq: '500m',
        capacity: '1M',
        certifications: ['ISO 9001', 'Oeko-Tex'],
        aiScore: 98,
        badge: 'ELITE'
      },
      collections: []
    }
  ];

  return NextResponse.json({
    success: true,
    data: showrooms,
    meta: {
      source: 'aipyram_master_node_live',
      timestamp: Date.now()
    }
  });
}
