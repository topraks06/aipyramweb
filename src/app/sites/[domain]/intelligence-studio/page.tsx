import VisionJournalismClient from '@/components/trtex/admin/VisionJournalismClient';

export const metadata = {
  title: 'Intelligence Studio | TRTEX Autonomous',
  description: 'AI-powered B2B intelligence generation',
};

export default function IntelligenceStudioPage() {
  return (
    <div className="min-h-screen bg-black">
      <VisionJournalismClient />
    </div>
  );
}
