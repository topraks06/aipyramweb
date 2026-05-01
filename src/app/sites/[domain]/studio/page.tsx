import { redirect } from 'next/navigation';

export default async function LegacyStudioPage(props: { params: Promise<{ domain: string }> }) {
  const params = await props.params;
  const domain = params.domain;
  const exactDomain = decodeURIComponent(domain).split(":")[0];
  
  if (exactDomain.includes('perde')) {
    const StudioLayout = (await import('@/components/node-perde/studio/StudioLayout')).default;
    const Img2ImgVisualizer = (await import('@/components/node-perde/Img2ImgVisualizer')).default;
    const RoomVisualizer = (await import('@/components/node-perde/RoomVisualizer')).default;
    
    // We pass a functional child that receives activeTab from StudioLayout via cloneElement
    const StudioContent = ({ activeTab }: { activeTab?: string }) => {
      if (activeTab === 'img2img') return <Img2ImgVisualizer />;
      if (activeTab === 'room') return <RoomVisualizer />;
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 rounded-2xl border border-white/10 p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Trendler Yakında</h3>
          <p className="text-zinc-500">Stil keşfi ve trend analiz modülü hazırlanıyor.</p>
        </div>
      );
    };

    return (
      <StudioLayout>
        <StudioContent />
      </StudioLayout>
    );
  }

  // Fallback for other domains
  redirect(`/sites/${exactDomain}/yonetim`);
}
