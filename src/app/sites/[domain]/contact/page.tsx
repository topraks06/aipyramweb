import Contact from '@/components/tenant-perde/Contact';
import PerdeNavbar from '@/components/tenant-perde/PerdeNavbar';

export default async function ContactPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;

  return (
    <div className="min-h-screen bg-[#F9F9F6]">
      <PerdeNavbar theme="light" />

      <main>
        <Contact />
      </main>
    </div>
  );
}
