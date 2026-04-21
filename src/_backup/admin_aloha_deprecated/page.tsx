"use client";

import AlohaControl from "@/components/admin/AlohaControl";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AlohaPage() {
    return (
        <div className="min-h-screen bg-background">
            <AdminHeader />
            <main className="container mx-auto p-6 max-w-7xl">
                <AlohaControl />
            </main>
        </div>
    );
}
