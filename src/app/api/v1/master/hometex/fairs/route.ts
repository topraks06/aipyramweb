import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Mock data to simulate the Master Brain serving Hometex
  const fairs = [
    {
      slug: 'heimtextil-2027',
      name: 'Heimtextil Frankfurt 2027',
      targetDate: '2027-01-12',
      displayDate: '12-15 Jan 2027',
      location: 'Frankfurt, Germany',
      flag: '🇩🇪',
      urgency: 'KRİTİK',
      hasLiveCast: true,
      desc: 'Global epicenter for home and contract textiles.',
      stats: ['2,800+ Exhibitors', '44,000+ Visitors'],
      tags: ['B2B', 'Home Textiles', 'AI Integration'],
      officialUrl: 'https://heimtextil.messefrankfurt.com',
      image: 'https://images.unsplash.com/photo-1558024920-b41e1887dc32?w=800&q=80',
    }
  ];

  return NextResponse.json({
    success: true,
    data: fairs,
    meta: {
      source: 'aipyram_master_node_live',
      timestamp: Date.now()
    }
  });
}
