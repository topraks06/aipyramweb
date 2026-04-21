import MyProjects from '@/components/tenant-perde/MyProjects';
import PerdeNavbar from '@/components/tenant-perde/PerdeNavbar';
import PerdeFooter from '@/components/tenant-perde/PerdeFooter';

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
