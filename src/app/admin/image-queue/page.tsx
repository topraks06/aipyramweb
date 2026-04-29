'use client';
import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase-client';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

export default function ImageQueueAdmin() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'trtex_news'),
        where('needs_manual_image', '==', true)
      );
      const snaps = await getDocs(q);
      const items = snaps.docs.map(d => ({ id: d.id, ...d.data() }));
      setNews(items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleManualUpload = async (id: string) => {
    const url = prompt("Görsel URL'sini girin (manuel bypass):");
    if (!url) return;
    
    setProcessingId(id);
    try {
      await updateDoc(doc(db, 'trtex_news', id), {
        image_url: url,
        needs_manual_image: false,
        image_generated: true,
        image_status: 'manual_override'
      });
      await fetchQueue();
    } catch (e) {
      alert("Hata oluştu.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRetryAI = async (id: string, title: string) => {
    const customPrompt = prompt("Yapay zekayı zorlamak için özel bir detay yazın (boş bırakırsanız başlığa göre tekrar dener):\nÖrn: Ultra lüks, kırmızı kadife döşemelik kumaş...", title);
    if (customPrompt === null) return;

    setProcessingId(id);
    try {
      // In a real scenario, this would call a secure API endpoint to trigger processImageForContent
      // For now, we simulate sending a signal to the backend or updating the doc to trigger the background function
      await updateDoc(doc(db, 'trtex_news', id), {
        needs_manual_image: false, // Reset so scanner picks it up again
        image_generated: false,
        image_status: 'retry_forced',
        _custom_image_prompt: customPrompt
      });
      alert("Yapay Zeka tetiklendi. Arka planda yeniden deneniyor.");
      await fetchQueue();
    } catch (e) {
      alert("Hata oluştu.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div style={{padding:'2rem', color:'#fff'}}>Yükleniyor...</div>;

  return (
    <div style={{ padding: '2rem', background: '#0a0a0a', minHeight: '100vh', color: '#fff', fontFamily: 'var(--m)' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 900, color: '#F5A623' }}>📸 Görsel Bekleyenler (Image Queue)</h1>
      <p style={{ color: '#888', marginBottom: '2rem' }}>
        Yapay zekanın (API limitleri veya ret yemesi sebebiyle) görsel üretemediği haberler burada birikir. 
        Bu haberleri yayına almak için manuel URL girebilir veya yapay zekayı özel bir prompt ile tekrar zorlayabilirsiniz.
      </p>

      {news.length === 0 ? (
        <div style={{ padding: '3rem', background: '#111', border: '1px solid #333', textAlign: 'center', borderRadius: '8px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>Harika! Bekleyen hiçbir görsel hatası yok.</div>
          <div style={{ color: '#666', marginTop: '0.5rem' }}>Tüm yapay zeka ajanları hatasız çalışıyor.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {news.map(n => (
            <div key={n.id} style={{ padding: '1.5rem', background: '#111', border: '1px solid #333', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '0.3rem' }}>ID: {n.id} | Kategori: {n.category || 'Genel'}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{n.translations?.TR?.title || n.title}</div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => handleManualUpload(n.id)}
                  disabled={processingId === n.id}
                  style={{ background: 'transparent', border: '1px solid #555', color: '#fff', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 700 }}
                >
                  🔗 Manuel URL
                </button>
                <button 
                  onClick={() => handleRetryAI(n.id, n.translations?.TR?.title || n.title)}
                  disabled={processingId === n.id}
                  style={{ background: '#F5A623', border: 'none', color: '#000', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 800 }}
                >
                  {processingId === n.id ? 'İŞLENİYOR...' : '🤖 AI İLE ZORLA'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
