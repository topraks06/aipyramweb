/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║  ALOHA MONITORING API — Gerçek Zamanlı Sağlık Dashboard   ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * GET /api/aloha/metrics → Tüm metrikleri döndür
 * 
 * Metrikler:
 * - health_score: Genel sağlık puanı (0-100)
 * - last_audit: Son denetim zamanı ve sonucu
 * - fixed_count: Düzeltilen haber sayısı (son 24 saat)
 * - error_rate: Hata oranı (son 24 saat)
 * - chains: Son zincir çalıştırma sonuçları
 * - per_project: Proje bazlı metrikler
 */

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

interface ProjectMetrics {
  name: string;
  totalArticles: number;
  recentArticles: number; // son 24h
  healthScore: number;
  lastAuditScore: number;
  lastAuditTime: string;
  fixedCount: number;
  errorCount: number;
  brokenSlugs: number;
  missingImages: number;
}

interface DashboardMetrics {
  timestamp: string;
  overall: {
    health_score: number;
    total_articles: number;
    fixed_last_24h: number;
    errors_last_24h: number;
    error_rate: number;
    chains_completed: number;
    chains_failed: number;
    uptime_hours: number;
  };
  projects: ProjectMetrics[];
  last_chains: Array<{
    name: string;
    project: string;
    status: string;
    stats: any;
    completedAt: string;
    duration: number;
  }>;
  last_repairs: Array<{
    articleId: string;
    action: string;
    status: string;
    detail: string;
    timestamp: string;
  }>;
}

export async function GET(): Promise<NextResponse> {
  try {
    const now = Date.now();
    const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();
    
    // === PER-PROJECT METRICS ===
    const projects = ['trtex', 'hometex', 'perde'];
    const projectMetrics: ProjectMetrics[] = [];
    let totalArticles = 0;
    let totalFixed = 0;
    let totalErrors = 0;
    let overallHealthSum = 0;

    for (const proj of projects) {
      const collection = `${proj}_news`;
      
      // Toplam makale sayısı
      let docCount = 0;
      let recentCount = 0;
      let brokenSlugs = 0;
      let missingImages = 0;
      
      try {
        const snap = await adminDb.collection(collection).get();
        docCount = snap.size;
        
        for (const doc of snap.docs) {
          const data = doc.data();
          const publishedAt = data.publishedAt ? new Date(data.publishedAt).getTime() : 0;
          if (now - publishedAt < 24 * 60 * 60 * 1000) recentCount++;
          
          // Slug kontrolü
          const slug = data.slug || '';
          if (/[ğüşıöçĞÜŞİÖÇ]/.test(slug) || !slug) brokenSlugs++;
          
          // Görsel kontrolü
          if (!data.image_url || data.image_url.length < 10) missingImages++;
        }
      } catch { /* koleksiyon yok */ }

      // Son audit raporu
      let lastAuditScore = 0;
      let lastAuditTime = '';
      try {
        const auditSnap = await adminDb.collection('aloha_audit_reports')
          .where('project', '==', proj)
          .orderBy('timestamp', 'desc')
          .limit(1)
          .get();
        if (!auditSnap.empty) {
          const auditData = auditSnap.docs[0].data();
          lastAuditScore = auditData.score || 0;
          lastAuditTime = auditData.timestamp || '';
        }
      } catch { /* index yok */ }

      const healthScore = Math.min(100, Math.round(
        (docCount > 0 ? 30 : 0) +
        (recentCount > 0 ? 20 : 0) +
        (brokenSlugs === 0 ? 15 : Math.max(0, 15 - brokenSlugs * 2)) +
        (missingImages === 0 ? 15 : Math.max(0, 15 - missingImages)) +
        (lastAuditScore > 0 ? lastAuditScore * 0.2 : 0)
      ));

      projectMetrics.push({
        name: proj,
        totalArticles: docCount,
        recentArticles: recentCount,
        healthScore,
        lastAuditScore,
        lastAuditTime,
        fixedCount: 0, // aşağıda güncellenir
        errorCount: 0,
        brokenSlugs,
        missingImages,
      });

      totalArticles += docCount;
      overallHealthSum += healthScore;
    }

    // === CHAIN LOGS ===
    let lastChains: any[] = [];
    let chainsCompleted = 0;
    let chainsFailed = 0;
    try {
      const chainSnap = await adminDb.collection('aloha_chain_logs')
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();
      
      lastChains = chainSnap.docs.map(d => {
        const data = d.data();
        if (data.status === 'done' || data.status === 'partial') chainsCompleted++;
        if (data.status === 'failed') chainsFailed++;
        return {
          name: data.name,
          project: data.project,
          status: data.status,
          stats: data.stats,
          completedAt: data.completedAt || data.createdAt,
          duration: data.duration || 0,
        };
      });
    } catch { /* koleksiyon yok */ }

    // === REPAIR LOGS ===
    let lastRepairs: any[] = [];
    try {
      const repairSnap = await adminDb.collection('aloha_repair_logs')
        .orderBy('timestamp', 'desc')
        .limit(20)
        .get();
      
      lastRepairs = repairSnap.docs.map(d => {
        const data = d.data();
        if (data.status === 'fixed') totalFixed++;
        if (data.status === 'error') totalErrors++;
        return {
          articleId: data.articleId,
          action: data.action,
          status: data.status,
          detail: data.detail,
          timestamp: data.timestamp,
        };
      });
    } catch { /* koleksiyon yok */ }

    // === MEMORY LOGS (ek metrikler) ===
    try {
      const memSnap = await adminDb.collection('aloha_memory')
        .where('timestamp', '>=', twentyFourHoursAgo)
        .orderBy('timestamp', 'desc')
        .limit(100)
        .get();
      
      for (const doc of memSnap.docs) {
        const data = doc.data();
        if (data.type === 'tool_execution' && data.success === true) totalFixed++;
        if (data.type === 'tool_execution' && data.success === false) totalErrors++;
      }
    } catch { /* */ }

    // Update per-project fixed/error counts
    for (const repair of lastRepairs) {
      const proj = projectMetrics.find(p => repair.articleId?.startsWith(p.name));
      if (proj) {
        if (repair.status === 'fixed') proj.fixedCount++;
        if (repair.status === 'error') proj.errorCount++;
      }
    }

    const errorRate = totalFixed + totalErrors > 0 
      ? Math.round((totalErrors / (totalFixed + totalErrors)) * 100) 
      : 0;

    const overallHealth = projects.length > 0 
      ? Math.round(overallHealthSum / projects.length) 
      : 0;

    const metrics: DashboardMetrics = {
      timestamp: new Date().toISOString(),
      overall: {
        health_score: overallHealth,
        total_articles: totalArticles,
        fixed_last_24h: totalFixed,
        errors_last_24h: totalErrors,
        error_rate: errorRate,
        chains_completed: chainsCompleted,
        chains_failed: chainsFailed,
        uptime_hours: Math.round((now - new Date('2026-04-01').getTime()) / (1000 * 60 * 60)),
      },
      projects: projectMetrics,
      last_chains: lastChains,
      last_repairs: lastRepairs,
    };

    return NextResponse.json(metrics);
  } catch (error: any) {
    console.error('[METRICS] Hata:', error.message);
    return NextResponse.json(
      { error: 'Metrik hesaplama hatası', detail: error.message },
      { status: 500 }
    );
  }
}
