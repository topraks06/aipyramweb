import AboutEnterprise from '@/components/tenant-perde/AboutEnterprise';
import PerdeNavbar from '@/components/tenant-perde/PerdeNavbar';
import PerdeFooter from '@/components/tenant-perde/PerdeFooter';

export default async function AboutPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;

  return (
    <div className="min-h-screen bg-[#F9F9F6]">
      <PerdeNavbar theme="light" />
      <main>
        <AboutEnterprise />
      </main>
      <PerdeFooter />
    </div>
  );
}
