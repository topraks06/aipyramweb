"use client";

import React from "react";
import HealthCards from "@/components/aloha/HealthCards";

export default function AdminTenantsPage() {
  return (
    <div className="text-white">
      <h1 className="text-2xl font-black uppercase mb-6 tracking-wider">Tenant Sağlık Monitörü</h1>
      <div className="max-w-4xl">
        <HealthCards />
      </div>
    </div>
  );
}
