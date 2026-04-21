import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// GÜVENLİK GUARD'I: Sadece bu alt dizinlere izin verilir.
const ALLOWED_PROJECTS = ['hometex.ai', 'aipyramweb'];

export async function POST(req: Request) {
  try {
    const { code, targetPath } = await req.json();

    if (!code || !targetPath) {
      return NextResponse.json({ success: false, error: 'Eksik parametreler.' }, { status: 400 });
    }

    // 1. GÜVENLİK İZOLASYONU (Sandbox Koruması)
    const isSafe = ALLOWED_PROJECTS.some(project => targetPath.includes(project));
    if (!isSafe) {
      return NextResponse.json({ 
        success: false, 
        error: `GÜVENLİK İHLALİ (AntiGravity Sandbox): ${targetPath} dosyasına erişim yasaktır. Sadece AIPyram ve Hometex üzerinde işlem yapılabilir.`
      }, { status: 403 });
    }

    // 2. KÖK DİZİNİ HESAPLAMA (Absolute ve Relative Path desteği)
    // Eğer ajan absolute path verdiyse direkt kullanıyoruz (Güvenli kabul edip isSafe'den geçtik)
    const finalPath = path.isAbsolute(targetPath) ? targetPath : path.resolve(targetPath);

    // 3. FİZİKSEL YAZMA (MÜHÜRLEME)
    await fs.writeFile(finalPath, code, 'utf-8');

    return NextResponse.json({ 
      success: true, 
      message: 'Mühürlendi ve Başarıyla Enjekte Edildi',
      path: finalPath
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
