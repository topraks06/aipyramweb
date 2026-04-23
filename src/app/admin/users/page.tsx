"use client";

import React, { useEffect, useState } from "react";

export default function AdminUsersPage() {
  return (
    <div className="text-white">
      <h1 className="text-2xl font-black uppercase mb-6 tracking-wider">Kullanıcı Yönetimi</h1>
      <div className="border border-white/10 bg-black/50 p-6">
        <p className="text-sm text-zinc-400">Bu modül (perde_members, hometex_members vb.) entegrasyonu aşamasındadır.</p>
        <p className="text-xs text-zinc-500 mt-2">Dumb Client kuralları gereği veriler doğrudan sunucudan beslenecektir.</p>
      </div>
    </div>
  );
}
