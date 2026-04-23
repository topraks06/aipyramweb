import { resolveNodeFromDomain } from '@/lib/sovereign-config';

export const dynamic = "force-dynamic";

// Node → Register bileşen map'i
const nodeRegisterMap: Record<string, () => Promise<any>> = {
  perde: () => import('@/components/node-perde/auth/Register'),
  hometex: () => import('@/components/node-hometex/auth/Register'),
};

export default async function RegisterPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const exactDomain = decodeURIComponent(domain).split(":")[0];
  const basePath = `/sites/${exactDomain}`;
  const node = resolveNodeFromDomain(exactDomain);

  const loader = nodeRegisterMap[node.id];
  if (!loader) {
    return (
      <main className="h-screen bg-black flex items-center justify-center text-zinc-600 text-sm font-mono">
        Bu site için kayıt sayfası bulunmamaktadır.
      </main>
    );
  }

  const RegisterModule = await loader();
  const Register = RegisterModule.default;

  return (
    <main>
      <Register basePath={basePath} />
    </main>
  );
}
