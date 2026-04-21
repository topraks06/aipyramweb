import os
import datetime
from google.cloud import firestore
from google.oauth2 import service_account

cred = service_account.Credentials.from_service_account_file('C:\\Users\\MSI\\Desktop\\aipyramweb\\firebase-sa-key.json')
db = firestore.Client(credentials=cred, project=cred.project_id)

news_ref = db.collection('aipyram-web_news')

titles = [
    "Avrupa Yesil Mutabakati: Tekstil Sektorunde Karbon Ayak Izi Denetimleri Basliyor",
    "Cin Lojistik Krizi: Navlun Fiyatlarindaki Sok Artis Turkiye Icin Bos Kapasite Firsati Yaratti",
    "Alev Geciktirici Kumaslar (FR): Almanya Otel Konsorsiyumundan 5 Milyon Euro luk Ihale",
    "Iplik Savaslari: Ozbekistan Pamuk Ambargosunun Turk Ev Tekstiline Stratejik Etkileri",
    "Luks Mimari Akimi: Iskandinav Ic Mekan Tasarimcilari Neden Yuzunu Ege Ketenine Dondu?",
    "Dijital Baskili Perdeler: Guney Amerika Pazarindaki Buyume Raporu (2026 Projeksiyonu)",
    "Polyester Hammadde: Stok Fiyatlarinda Son 5 Yilin En Dusuk Seviyesine Gerileme Gozlendi",
    "Akilli Ev Tekstili: Isik Gecirgenligi Sensorle Ayarlanan Fon Perdelerin AR-GE Raporu",
    "Ingiltere E-Ihracatinda B2B Cokusu: Brexit Sonrasi Kumas Tedarigi Ispanya ya Kayiyor",
    "Organik Iplik Sertifikasyonu (GOTS): Amerika Pazarinda Neden Zemin Kaybediyor?",
    "Lojistik Raporu: Iskenderun Limanindan Avrupa ya Acilan Yeni Yuksek Hizli Kargo Rotasi",
    "2026 Renk Trendleri Raporu: Terracotta ve Safir Mavisi Ev Dekorasyonunu Domine Edecek"
]

cat_options = ['GUMRUK & LOJISTIK', 'KURESEL PAZAR', 'IHALE FIRSATI', 'HAMMADDE (IPLIK)', 'MIMARI & TREND', 'YENI TEKNOLOJI']
directions = ['risk', 'opportunity', 'opportunity', 'risk', 'opportunity', 'opportunity', 'opportunity', 'opportunity', 'risk', 'risk', 'opportunity', 'opportunity']
explanations = [
    'Yuksek karbon vergisi riskli.',
    'Avrupa ureticileri Turkiye arayisinda.',
    'Kritik ihale, FR ureticileri.',
    'Hammadde krizi.',
    'Dogal urun algisi.',
    'G.Amerika trendi.',
    'Maliyet dususu.',
    'ARGE yatirimi sart.',
    'Yeni B2B hatlari.',
    'GOTS pahali.',
    'Yeni lojistik hatti.',
    'Tasarim radari.'
]

for i in range(12):
    doc_id = f'NEWS_ALOHA_{100 + i}'
    doc_data = {
        'id': doc_id,
        'title': titles[i],
        'summary': f'{titles[i]} - ALOHA YZ Ticaret raporu.',
        'category': cat_options[i % 6],
        'image_url': f'/aloha_images/aloha_{(i % 15)}.jpg',
        'createdAt': datetime.datetime.now(datetime.timezone.utc),
        'translations': {
            'TR': {'title': titles[i], 'summary': 'Otonom Rapor'},
            'EN': {'title': f'[EN] {titles[i]}', 'summary': 'Autonomous Report'}
        },
        'insight': {
            'direction': directions[i],
            'market_impact_score': 85 + (i % 10),
            'explanation': explanations[i]
        },
        'trtex_payload_core': {
            'zone': 'BREAKING'
        }
    }
    news_ref.document(doc_id).set(doc_data)

print('12 High-Quality News Items Injected into Firebase Database.')
