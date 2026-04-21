'use client';

import React, { useState, useEffect } from 'react';
import { useTenantAuth } from '@/hooks/useTenantAuth';
import { Sparkles, X, Plus } from 'lucide-react';
import Link from 'next/link';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';

export default function MyProjects() {
    const { user, loading } = useTenantAuth('perde');
    const [selectedProject, setSelectedProject] = useState<any | null>(null);
    const [projects, setProjects] = useState<any[]>([]);

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, 'image_library'),
            where('ownerId', '==', user.uid),
            where('tenant', '==', 'perde'),
            orderBy('createdAt', 'desc')
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProjects(data);
        });
        return () => unsubscribe();
    }, [user]);

    const triggerConceirgeEdit = (project: any) => {
        setSelectedProject(null);
        window.dispatchEvent(new CustomEvent('open_perde_ai_assistant', { 
            detail: { action: 'chat', message: `Şu geçmiş projemi tekrar düzenlemek istiyorum: ${project.roomType} (${project.style || 'Belirtilmemiş'})` } 
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F9F9F6]">
                <div className="w-8 h-8 rounded-full border-2 border-[#8B7355] border-t-transparent animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center bg-white border border-[#111]/10 py-20 px-6 text-center shadow-sm">
                <div className="w-16 h-16 bg-[#F9F9F6] rounded-full flex items-center justify-center mb-6 text-[#8B7355]">
                    <Sparkles className="w-8 h-8" />
                </div>
                <h1 className="font-serif text-2xl text-zinc-900 mb-2">Üye Girişi Gerekli</h1>
                <p className="text-zinc-500 max-w-sm font-light text-sm mb-8">
                    Geçmiş render'larınızı görmek ve yeniden düzenlemek için kurum hesabınızla giriş yapmanız gerekmektedir.
                </p>
                <Link href="/sites/perde/login">
                    <button className="px-8 py-3 bg-zinc-900 text-white text-[11px] uppercase tracking-widest font-semibold hover:bg-zinc-800 transition-colors">
                        Giriş Yap
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9F9F6] pb-24 pt-32 px-6 md:px-12">
            <div className="max-w-7xl mx-auto">
                <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="font-serif text-4xl md:text-5xl text-zinc-900 tracking-tight">Projelerim</h1>
                        <p className="text-zinc-500 font-light mt-2">Geçmişte oluşturduğunuz tüm renderlar ({projects.length})</p>
                    </div>
                    <button 
                        onClick={() => window.dispatchEvent(new CustomEvent('open-concierge', { detail: { action: 'upload' } }))}
                        className="h-12 px-6 bg-[#8B7355] text-white hover:bg-[#725e45] transition-colors rounded uppercase tracking-[0.1em] text-[10px] font-semibold flex items-center gap-2 w-fit"
                    >
                        <Plus className="w-4 h-4" /> YENİ PROJE
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {projects.map((proj) => (
                        <div key={proj.id} className="group cursor-pointer" onClick={() => setSelectedProject(proj)}>
                            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-zinc-200 relative mb-4 shadow-sm border border-[#EBEBE6] group-hover:shadow-lg transition-all">
                                <img src={proj.url_2k || proj.url_1k} alt={proj.roomType} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                            </div>
                            <div className="px-1">
                                <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-1">
                                    {new Date(proj.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                                <h3 className="font-serif text-xl text-zinc-900 capitalize">{proj.roomType || 'İsimsiz Oda'}</h3>
                                <p className="text-sm font-light text-zinc-500 capitalize">{proj.style || proj.tags?.[0] || 'Kumaş Serisi'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Lightbox Modal */}
            {selectedProject && (
                <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm">
                    <button 
                        onClick={() => setSelectedProject(null)}
                        className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors border border-white/20"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="max-w-6xl w-full flex flex-col md:flex-row bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800">
                        <div className="w-full md:w-2/3 max-h-[80vh] bg-black">
                            <img src={selectedProject.url_2k || selectedProject.url_1k} alt={selectedProject.roomType} className="w-full h-full object-contain" />
                        </div>
                        <div className="w-full md:w-1/3 p-8 flex flex-col justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-[#D4C3A3] mb-4">
                                    {new Date(selectedProject.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                                <h2 className="font-serif text-3xl text-white mb-2 capitalize">{selectedProject.roomType || 'İsimsiz Oda'}</h2>
                                <p className="text-zinc-400 font-light mb-8 capitalize">Kullanılan Kumaş: {selectedProject.style || selectedProject.tags?.[0] || 'Kumaş Serisi'}</p>
                            </div>

                            <button 
                                onClick={() => triggerConceirgeEdit(selectedProject)}
                                className="w-full py-4 bg-white text-zinc-900 font-semibold uppercase tracking-widest text-[11px] rounded hover:bg-[#D4C3A3] transition-colors"
                            >
                                Bu Render'ı Tekrar Düzenle
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
