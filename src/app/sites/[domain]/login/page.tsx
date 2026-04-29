import { resolveNodeFromDomain } from '@/lib/sovereign-config';

import LoginPerde from '@/components/node-perde/auth/Login';
import LoginHometex from '@/components/node-hometex/auth/Login';
import LoginIcmimar from '@/components/node-icmimar/auth/Login';
import LoginTrtex from '@/components/trtex/auth/Login';

export default async function LoginPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const exactDomain = decodeURIComponent(domain).split(":")[0];
  const basePath = `/sites/${exactDomain}`;
  const node = resolveNodeFromDomain(exactDomain);

  let Login = null;
  if (node.id === 'perde') Login = LoginPerde;
  else if (node.id === 'hometex') Login = LoginHometex;
  else if (node.id === 'icmimar') Login = LoginIcmimar;
  else if (node.id === 'trtex' || exactDomain.includes('trtex')) Login = LoginTrtex;
  else if (exactDomain.includes('heimtex')) {
    Login = (await import('@/components/node-heimtex/auth/Login')).default;
  }
  else if (exactDomain.includes('curtaindesign')) {
    Login = (await import('@/components/node-curtaindesign/CurtaindesignAuth')).default;
  }

  if (!Login) {
    // TRTEX veya tanımsız node → login sayfası yok
    return (
      <main className="h-screen bg-black flex items-center justify-center text-zinc-600 text-sm font-mono">
        Bu site için giriş sayfası bulunmamaktadır.
      </main>
    );
  }

  return (
    <main>
      <Login basePath={basePath} />
    </main>
  );
}
