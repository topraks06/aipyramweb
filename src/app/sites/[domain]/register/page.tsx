import { resolveNodeFromDomain } from '@/lib/sovereign-config';

export const dynamic = "force-dynamic";

import RegisterPerde from '@/components/node-perde/auth/Register';
import RegisterHometex from '@/components/node-hometex/auth/Register';
// icmimar için register bileşeni var mı kontrol ediyoruz
// icmimar için @/components/node-icmimar/auth/Register var.
import RegisterIcmimar from '@/components/node-icmimar/auth/Register';

export default async function RegisterPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const exactDomain = decodeURIComponent(domain).split(":")[0];
  const basePath = `/sites/${exactDomain}`;
  const node = resolveNodeFromDomain(exactDomain);

  let Register = null;
  if (node.id === 'perde') Register = RegisterPerde;
  else if (node.id === 'hometex') Register = RegisterHometex;
  else if (node.id === 'icmimar') Register = RegisterIcmimar;
  else if (exactDomain.includes('heimtex')) {
    Register = (await import('@/components/node-heimtex/auth/Register')).default;
  }

  if (!Register) {
    return (
      <main className="h-screen bg-black flex items-center justify-center text-zinc-600 text-sm font-mono">
        Bu site için kayıt sayfası bulunmamaktadır.
      </main>
    );
  }

  return (
    <main>
      <Register basePath={basePath} />
    </main>
  );
}
