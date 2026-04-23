import MyProjects from '@/components/node-perde/MyProjects';
import PerdeNavbar from '@/components/node-perde/PerdeNavbar';
import PerdeFooter from '@/components/node-perde/PerdeFooter';

export default function ProjectsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#F9F9F6] selection:bg-[#8B7355] selection:text-white">
            <PerdeNavbar theme="light" />
            <main className="flex-1">
                <MyProjects />
            </main>
            <PerdeFooter />
        </div>
    );
}
