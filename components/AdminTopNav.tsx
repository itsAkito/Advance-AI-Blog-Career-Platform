"use client";

import Link from "next/link";

interface AdminTopNavProps {
  activePage?: string;
}

export default function AdminTopNav({ activePage = "overview" }: AdminTopNavProps) {
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0e0e0e]/60 backdrop-blur-xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] h-16 flex justify-between items-center px-8 font-headline tracking-tight">
      <div className="flex items-center gap-8">
        <Link href="/admin" className="text-xl font-bold bg-gradient-to-br from-blue-400 to-blue-600 bg-clip-text text-transparent">
          Synthetix Admin
        </Link>
        <div className="hidden md:flex gap-6 text-sm">
          <Link href="/admin" className={activePage === "overview" ? "text-blue-400 font-bold" : "text-zinc-500 hover:text-blue-300 transition-colors"}>
            Platform
          </Link>
          <Link href="/admin/analytics" className={activePage === "analytics" ? "text-blue-400 font-bold" : "text-zinc-500 hover:text-blue-300 transition-colors"}>
            Insights
          </Link>
          <Link href="/admin/users" className={activePage === "users" ? "text-blue-400 font-bold" : "text-zinc-500 hover:text-blue-300 transition-colors"}>
            Audit
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-5">
        <span className="material-symbols-outlined text-zinc-500 hover:text-blue-300 cursor-pointer text-[20px]">sensors</span>
        <span className="material-symbols-outlined text-zinc-500 hover:text-blue-300 cursor-pointer text-[20px]">notifications</span>
        <span className="material-symbols-outlined text-zinc-500 hover:text-blue-300 cursor-pointer text-[20px]">settings</span>
        <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant/20 overflow-hidden">
          <img
            className="w-full h-full object-cover"
            alt="Admin avatar"
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
          />
        </div>
      </div>
    </nav>
  );
}
