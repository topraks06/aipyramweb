import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const homepageData = {
    hero: {
      titleTr: ['Yapay Zeka Destekli', 'Sanal Fuar'],
      titleEn: ['AI Powered', 'Virtual Fair'],
      subtitleTr: 'aipyram Master Node üzerinden canlı yayın.',
      subtitleEn: 'Live broadcast from aipyram Master Node.',
      image: 'https://images.unsplash.com/photo-1558222218-b7b54eede3f3?w=800&q=80'
    },
    trends: {
      headerTr: 'Haftanın Trendleri',
      headerEn: 'Weekly Trends',
      cards: [
        {
          id: 'trend_1',
          nameEn: 'Minimalist Curtains',
          nameTr: 'Minimalist Perdeler',
          descEn: 'High demand in DACH region.',
          descTr: 'DACH bölgesinde yüksek talep.',
          img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80',
          score: 95,
          badge: 'HOT',
          badgeEn: 'HOT',
          prompt: 'minimalist living room with sheer curtains',
          reasonTr: 'Yüksek organik arama hacmi.',
          reasonEn: 'High organic search volume.'
        }
      ]
    },
    collections: {
      headerTr: 'Koleksiyonlar',
      headerEn: 'Collections',
      items: []
    }
  };

  return NextResponse.json({
    success: true,
    data: homepageData,
    meta: {
      source: 'aipyram_master_node_live',
      timestamp: Date.now()
    }
  });
}
