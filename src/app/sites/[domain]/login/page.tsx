import { resolveNodeFromDomain } from '@/lib/sovereign-config';

// Node → Login bileşen map'i (if/else cehennemi yerine)
const nodeLoginMap: Record<string, () => Promise<any>> = {
  perde: () => import('@/components/node-perde/auth/Login'),
  hometex: () => import('@/components/node-hometex/auth/Login'),
};

export default async function LoginPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const exactDomain = decodeURIComponent(domain).split(":")[0];
  const basePath = `/sites/${exactDomain}`;
  const node = resolveNodeFromDomain(exactDomain);

  // Dinamik import — node'a göre doğru Login bileşeni
  const loader = nodeLoginMap[node.id];
  if (!loader) {
    // TRTEX veya tanımsız node → login sayfası yok
    return (
      <main className="h-screen bg-black flex items-center justify-center text-zinc-600 text-sm font-mono">
        Bu site için giriş sayfası bulunmamaktadır.
      </main>
    );
  }

  const LoginModule = await loader();
  const Login = LoginModule.default;

  return (
    <main>
      <Login basePath={basePath} />
    </main>
  );
}
