'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import EmployeeDashboard from "@/components/EmployeeDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import { ShieldCheck, LogOut, User as UserIcon } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const role = (session?.user as any)?.role || 'EMPLOYEE';

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Navigation Réelle */}
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">SuiviDossier</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold">{session?.user?.name || (session?.user as any)?.username}</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{role}</span>
            </div>
            
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 px-3 py-2 rounded-xl text-sm font-medium transition-all"
            >
              <LogOut size={16} /> <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto py-10 px-4">
        {role === 'EMPLOYEE' ? (
          <EmployeeDashboard />
        ) : (
          <AdminDashboard />
        )}
      </div>
    </main>
  );
}
