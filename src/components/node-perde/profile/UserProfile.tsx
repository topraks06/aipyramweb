'use client';

import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase-client';
import { usePerdeAuth } from '@/hooks/usePerdeAuth';
import { Loader2, User, Building2, CheckCircle2, Lock, Sparkles } from 'lucide-react';

export default function UserProfile({ basePath = '/sites/perde.ai' }: { basePath?: string }) {
  const { user, loading: authLoading } = usePerdeAuth();
  
  const [formData, setFormData] = useState({ name: '', company: '', profession: '' });
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    async function fetchProfile() {
      try {
        const docRef = doc(db, 'perde_members', user!.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setFormData({
            name: data.name || '',
            company: data.company || '',
            profession: data.profession || 'diger'
          });
        }
      } catch (err) {
        console.error("Profil çekilemedi:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user, authLoading]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setMessage(null);
    try {
      await updateDoc(doc(db, 'perde_members', user.uid), {
        name: formData.name,
        company: formData.company,
        profession: formData.profession
      });
      setMessage({ type: 'success', text: 'Profil başarıyla güncellendi.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Profil güncellenirken hata oluştu.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !newPassword || newPassword.length < 6) return;
    setIsPasswordSaving(true);
    setMessage(null);
    try {
      await updatePassword(auth.currentUser, newPassword);
      setNewPassword('');
      setMessage({ type: 'success', text: 'Şifreniz başarıyla güncellendi.' });
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        setMessage({ type: 'error', text: 'Güvenlik nedeniyle şifre değiştirmek için çıkış yapıp tekrar girmelisiniz.' });
      } else {
        setMessage({ type: 'error', text: 'Şifre güncellenirken hata oluştu.' });
      }
    } finally {
      setIsPasswordSaving(false);
    }
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F9F9F6]"><Loader2 className="h-8 w-8 text-[#8B7355] animate-spin" /></div>;
  }

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-12 border-b border-[#111111]/10 pb-8">
        <h1 className="font-serif text-3xl md:text-4xl text-[#111111] mb-2">Profil & Ayarlar</h1>
        <p className="text-zinc-500 text-sm font-light">Hesap bilgilerinizi ve tercihlerinizi yönetin.</p>
      </div>

      {message && (
        <div className={`mb-8 p-4 border rounded-sm flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          <CheckCircle2 className={`w-5 h-5 ${message.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`} />
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <div className="space-y-12">
        {/* Profil Bilgileri */}
        <section className="bg-white border border-[#111111]/10 shadow-sm p-8">
          <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-6 pb-4 border-b border-[#111111]/10">Kişisel Bilgiler</h2>
          
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Yetkili Ad Soyad</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#F9F9F6] border border-zinc-200 py-3 pl-12 pr-4 text-zinc-900 outline-none focus:border-[#8B7355] text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Firma Adı</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input 
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-[#F9F9F6] border border-zinc-200 py-3 pl-12 pr-4 text-zinc-900 outline-none focus:border-[#8B7355] text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Meslek Grubu</label>
              <select
                value={formData.profession}
                onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                className="w-full bg-[#F9F9F6] border border-zinc-200 py-3 px-4 text-zinc-900 outline-none focus:border-[#8B7355] text-sm appearance-none cursor-pointer"
              >
                <option value="perdeci">Perde Mağazası / Atölye</option>
                <option value="ic_mimar">İç Mimar / Mimar</option>
                <option value="mobilyaci">Mobilyacı</option>
                <option value="perakendeci">Perakendeci / Esnaf</option>
                <option value="toptanci">Toptancı / Distribütör</option>
                <option value="uretici">Üretici / Fabrika</option>
                <option value="diger">Diğer</option>
              </select>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit" 
                disabled={isSaving}
                className="bg-[#111111] text-white px-8 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-black transition-colors flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Bilgileri Kaydet'}
              </button>
            </div>
          </form>
        </section>

        {/* Güvenlik */}
        <section className="bg-white border border-[#111111]/10 shadow-sm p-8">
          <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-6 pb-4 border-b border-[#111111]/10">Hesap Güvenliği</h2>
          
          <div className="mb-8">
            <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Kayıtlı E-Posta</label>
            <div className="bg-[#F9F9F6] border border-zinc-200 py-3 px-4 text-zinc-500 text-sm font-mono cursor-not-allowed flex items-center justify-between">
              {user.email}
              {auth.currentUser?.emailVerified && <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest">Doğrulandı</span>}
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2 block">Yeni Şifre</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="En az 6 karakter"
                  minLength={6}
                  className="w-full bg-[#F9F9F6] border border-zinc-200 py-3 pl-12 pr-4 text-zinc-900 outline-none focus:border-[#8B7355] text-sm"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                type="submit" 
                disabled={isPasswordSaving || !newPassword || newPassword.length < 6}
                className="border border-[#111111] text-[#111111] px-8 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-[#111111] hover:text-white transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isPasswordSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Şifreyi Güncelle'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
