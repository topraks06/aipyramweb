/**
 * ALOHA CODE OPS — GitHub API ile Kod Okuma/Yazma/PR Oluşturma
 * 
 * Aloha'ya "IDE gücü" veren modül.
 * Cloud ortamında dosya sistemi yok → GitHub API ile:
 * - Kod okuma
 * - Kod yazma (commit)
 * - Branch oluşturma
 * - PR açma
 * - Dosya arama
 * 
 * .env: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO
 */

import { adminDb } from '@/lib/firebase-admin';

const GITHUB_API = 'https://api.github.com';

function getGitHubHeaders(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN tanımlı değil. .env dosyasına ekleyin.');
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

function getRepoInfo(repoOverride?: string): { owner: string; repo: string } {
  const owner = process.env.GITHUB_OWNER || 'aipyram';
  const repo = repoOverride || process.env.GITHUB_REPO || 'aipyramweb';
  return { owner, repo };
}

// ═══════════════════════════════════════════════════
// 1. KOD OKUMA — Herhangi dosyayı oku
// ═══════════════════════════════════════════════════

export async function readFile(filePath: string, branch?: string, repoOverride?: string): Promise<{
  success: boolean;
  content?: string;
  sha?: string;
  size?: number;
  error?: string;
}> {
  try {
    const { owner, repo } = getRepoInfo(repoOverride);
    const ref = branch || 'main';
    const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}?ref=${ref}`;
    
    const res = await fetch(url, { headers: getGitHubHeaders() });
    if (!res.ok) {
      if (res.status === 404) return { success: false, error: `Dosya bulunamadı: ${filePath}` };
      return { success: false, error: `GitHub API (${res.status}): ${await res.text()}` };
    }

    const data = await res.json();
    
    if (data.type !== 'file') {
      return { success: false, error: `${filePath} bir dosya değil (${data.type})` };
    }

    const content = Buffer.from(data.content, 'base64').toString('utf8');
    return { success: true, content, sha: data.sha, size: data.size };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ═══════════════════════════════════════════════════
// 2. KOD YAZMA — Dosya oluştur veya güncelle (commit)
// ═══════════════════════════════════════════════════

export async function writeFile(
  filePath: string,
  content: string,
  commitMessage: string,
  branch?: string,
  repoOverride?: string,
): Promise<{ success: boolean; commitSha?: string; error?: string }> {
  try {
    const { owner, repo } = getRepoInfo(repoOverride);
    const ref = branch || 'main';

    // 🛡️ MAIN BRANCH KORUMASI — Direkt main/master yazımı YASAK
    const PROTECTED_BRANCHES = ['main', 'master', 'production', 'release'];
    if (PROTECTED_BRANCHES.includes(ref)) {
      return { 
        success: false, 
        error: `[🛡️ BRANCH KORUMASI] "${ref}" branch'ine direkt yazım YASAK! Önce branch oluştur: git_create_branch → git_write_file(branch: "aloha/fix-xxx") → git_create_pr` 
      };
    }

    // Mevcut dosyanın SHA'sını al (güncelleme için gerekli)
    let existingSha: string | undefined;
    const existing = await readFile(filePath, ref, repoOverride);
    if (existing.success) {
      existingSha = existing.sha;
    }

    const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}`;
    const body: any = {
      message: `[Aloha] ${commitMessage}`,
      content: Buffer.from(content).toString('base64'),
      branch: ref,
    };
    if (existingSha) body.sha = existingSha;

    const res = await fetch(url, {
      method: 'PUT',
      headers: getGitHubHeaders(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return { success: false, error: `GitHub write (${res.status}): ${(await res.text()).substring(0, 200)}` };
    }

    const data = await res.json();
    await logCodeOp('FILE_WRITE', { filePath, branch: ref, commitSha: data.commit?.sha, message: commitMessage });
    
    return { success: true, commitSha: data.commit?.sha };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ═══════════════════════════════════════════════════
// 3. KOD ARAMA — Repository içinde arama
// ═══════════════════════════════════════════════════

export async function searchCode(query: string, repoOverride?: string): Promise<{
  success: boolean;
  results?: Array<{ file: string; matches: number }>;
  total?: number;
  error?: string;
}> {
  try {
    const { owner, repo } = getRepoInfo(repoOverride);
    const searchQuery = `${query}+repo:${owner}/${repo}`;
    const url = `${GITHUB_API}/search/code?q=${encodeURIComponent(searchQuery)}&per_page=20`;

    const res = await fetch(url, { headers: getGitHubHeaders() });
    if (!res.ok) {
      return { success: false, error: `GitHub search (${res.status}): ${(await res.text()).substring(0, 200)}` };
    }

    const data = await res.json();
    const results = (data.items || []).map((item: any) => ({
      file: item.path,
      matches: item.text_matches?.length || 1,
    }));

    return { success: true, results, total: data.total_count };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ═══════════════════════════════════════════════════
// 4. BRANCH OLUŞTURMA
// ═══════════════════════════════════════════════════

export async function createBranch(branchName: string, fromBranch?: string, repoOverride?: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { owner, repo } = getRepoInfo(repoOverride);
    const baseBranch = fromBranch || 'main';

    // Base branch'in son commit SHA'sını al
    const refRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/refs/heads/${baseBranch}`, {
      headers: getGitHubHeaders(),
    });
    if (!refRes.ok) return { success: false, error: `Base branch bulunamadı: ${baseBranch}` };
    const refData = await refRes.json();
    const sha = refData.object.sha;

    // Yeni branch oluştur
    const createRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/refs`, {
      method: 'POST',
      headers: getGitHubHeaders(),
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha,
      }),
    });

    if (!createRes.ok) {
      return { success: false, error: `Branch oluşturulamadı (${createRes.status}): ${(await createRes.text()).substring(0, 200)}` };
    }

    await logCodeOp('BRANCH_CREATED', { branchName, fromBranch: baseBranch, sha });
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ═══════════════════════════════════════════════════
// 5. PULL REQUEST OLUŞTURMA
// ═══════════════════════════════════════════════════

export async function createPullRequest(
  title: string,
  body: string,
  headBranch: string,
  baseBranch?: string,
  repoOverride?: string,
): Promise<{ success: boolean; prNumber?: number; prUrl?: string; error?: string }> {
  try {
    const { owner, repo } = getRepoInfo(repoOverride);
    const base = baseBranch || 'main';

    const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/pulls`, {
      method: 'POST',
      headers: getGitHubHeaders(),
      body: JSON.stringify({
        title: `[Aloha] ${title}`,
        body: `## 🤖 Aloha Otomatik PR\n\n${body}\n\n---\n_Bu PR Aloha AI tarafından otomatik oluşturulmuştur._`,
        head: headBranch,
        base,
      }),
    });

    if (!res.ok) {
      return { success: false, error: `PR oluşturulamadı (${res.status}): ${(await res.text()).substring(0, 200)}` };
    }

    const data = await res.json();
    await logCodeOp('PR_CREATED', { title, prNumber: data.number, headBranch, baseBranch: base });
    
    return { success: true, prNumber: data.number, prUrl: data.html_url };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ═══════════════════════════════════════════════════
// 6. DİZİN LİSTELEME — Klasör içeriğini gör
// ═══════════════════════════════════════════════════

export async function listDirectory(dirPath: string, branch?: string, repoOverride?: string): Promise<{
  success: boolean;
  items?: Array<{ name: string; type: 'file' | 'dir'; size: number; path: string }>;
  error?: string;
}> {
  try {
    const { owner, repo } = getRepoInfo(repoOverride);
    const ref = branch || 'main';
    const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${dirPath}?ref=${ref}`;

    const res = await fetch(url, { headers: getGitHubHeaders() });
    if (!res.ok) return { success: false, error: `Dizin bulunamadı: ${dirPath}` };

    const data = await res.json();
    if (!Array.isArray(data)) return { success: false, error: `${dirPath} bir dizin değil` };

    const items = data.map((item: any) => ({
      name: item.name,
      type: item.type === 'dir' ? 'dir' as const : 'file' as const,
      size: item.size || 0,
      path: item.path,
    }));

    return { success: true, items };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ═══════════════════════════════════════════════════
// 7. COMMIT GEÇMİŞİ — Son değişiklikleri gör 
// ═══════════════════════════════════════════════════

export async function getRecentCommits(count: number = 10, repoOverride?: string): Promise<{
  success: boolean;
  commits?: Array<{ sha: string; message: string; author: string; date: string }>;
  error?: string;
}> {
  try {
    const { owner, repo } = getRepoInfo(repoOverride);
    const url = `${GITHUB_API}/repos/${owner}/${repo}/commits?per_page=${count}`;

    const res = await fetch(url, { headers: getGitHubHeaders() });
    if (!res.ok) return { success: false, error: `Commits alınamadı (${res.status})` };

    const data = await res.json();
    const commits = data.map((c: any) => ({
      sha: c.sha.substring(0, 7),
      message: c.commit.message.substring(0, 100),
      author: c.commit.author.name,
      date: c.commit.author.date,
    }));

    return { success: true, commits };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ═══════════════════════════════════════════════════
// LOGGER
// ═══════════════════════════════════════════════════

async function logCodeOp(operation: string, details: any) {
  try {
    if (adminDb) {
      await adminDb.collection('aloha_operations').add({
        operation: `CODE_${operation}`,
        details,
        timestamp: new Date().toISOString(),
        source: 'aloha_code_ops',
      });
    }
  } catch { /* sessiz */ }
  console.log(`[💻 CODE OPS] ${operation}:`, JSON.stringify(details).substring(0, 200));
}
