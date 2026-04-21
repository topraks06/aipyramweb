
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AgentsDashboard } from '@/components/agents/AgentsDashboard';

export default function AgentsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      <AgentsDashboard />
      <Footer />
    </div>
  );
}
