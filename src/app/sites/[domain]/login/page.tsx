import { resolveTenantFromDomain } from '@/lib/tenant-config';

// Tenant → Login bileşen map'i (if/else cehennemi yerine)
const tenantLoginMap: Record<string, () => Promise<any>> = {
  perde: () => import('@/components/tenant-perde/auth/Login'),
  hometex: () => import('@/components/tenant-hometex/auth/Login'),
};

export default async function LoginPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const exactDomain = decodeURIComponent(domain).split(":")[0];
  const basePath = `/sites/${exactDomain}`;
  const tenant = resolveTenantFromDomain(exactDomain);

  // Dinamik import — tenant'a göre doğru Login bileşeni
  const loader = tenantLoginMap[tenant.id];
  if (!loader) {
    // TRTEX veya tanımsız tenant → login sayfası yok
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
