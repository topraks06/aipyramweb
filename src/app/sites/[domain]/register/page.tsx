import { resolveTenantFromDomain } from '@/lib/tenant-config';

export const dynamic = "force-dynamic";

// Tenant → Register bileşen map'i
const tenantRegisterMap: Record<string, () => Promise<any>> = {
  perde: () => import('@/components/tenant-perde/auth/Register'),
  hometex: () => import('@/components/tenant-hometex/auth/Register'),
};

export default async function RegisterPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const exactDomain = decodeURIComponent(domain).split(":")[0];
  const basePath = `/sites/${exactDomain}`;
  const tenant = resolveTenantFromDomain(exactDomain);

  const loader = tenantRegisterMap[tenant.id];
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
