"use client";

import Link from "next/link";
import { Hammer, User, LogOut, LayoutDashboard, Plus, Search, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { useAuth } from "@/lib/AuthContext";

export default function Header() {
  const { user, userData } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav className={`sticky top-0 z-[100] transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
            <Hammer className="text-white w-6 h-6" />
          </div>
          <span className="font-black text-2xl tracking-tighter text-slate-900">Easy Done</span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/masters" className="text-sm font-bold text-slate-600 hover:text-emerald-500 transition-colors uppercase tracking-widest">Mutaxassislar</Link>
          <Link href="/jobs" className="text-sm font-bold text-slate-600 hover:text-emerald-500 transition-colors uppercase tracking-widest">Birja</Link>
          <Link href="/categories" className="text-sm font-bold text-slate-600 hover:text-emerald-500 transition-colors">Xizmatlar</Link>
          <Link href="/how-it-works" className="text-sm font-bold text-slate-600 hover:text-emerald-500 transition-colors">Qanday ishlaydi?</Link>
          {userData?.role === 'ADMIN' && (
            <Link href="/admin/dashboard" className="text-xs font-black bg-red-50 text-red-600 px-3 py-1 rounded-lg border border-red-100 hover:bg-red-500 hover:text-white transition-all uppercase">Admin</Link>
          )}
        </div>


        {/* ACTIONS */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
               {userData?.role?.toUpperCase() === 'CLIENT' && (
                 <Link href="/jobs/create" className="text-sm font-black bg-emerald-500 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 flex items-center gap-2">
                    <Plus size={18} /> Buyurtma berish
                 </Link>
               )}
               <Link href="/dashboard/orders" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 transition-all">
                  Mening buyurtmalarim
               </Link>

               <Link href="/profile" className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 hover:bg-white transition-all">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-xs uppercase">
                    {user.displayName?.substring(0, 2) || "U"}
                  </div>
                  <span className="text-sm font-bold text-slate-700">{user.displayName || "Profil"}</span>
               </Link>
               <button onClick={() => signOut(auth)} className="text-xs font-bold text-red-400 hover:text-red-600">Chiqish</button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-emerald-500 transition-all">Kirish</Link>
              <Link href="/register" className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all">Ro'yxatdan o'tish</Link>
            </div>
          )}
        </div>

        {/* MOBILE TOGGLE */}
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-slate-600">
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-slate-100 p-4 space-y-4 shadow-2xl animate-in fade-in slide-in-from-top-4">
          <Link href="/masters" className="block p-4 font-bold text-slate-700 hover:bg-slate-50 rounded-xl" onClick={() => setIsMenuOpen(false)}>Ustalar</Link>
          <Link href="/categories" className="block p-4 font-bold text-slate-700 hover:bg-slate-50 rounded-xl" onClick={() => setIsMenuOpen(false)}>Xizmatlar</Link>
          <hr className="border-slate-50" />
          {user ? (
            <Link href="/profile" className="block p-4 font-bold text-emerald-600" onClick={() => setIsMenuOpen(false)}>Mening profilim</Link>
          ) : (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <Link href="/login" className="p-4 text-center font-bold text-slate-600 border border-slate-100 rounded-2xl" onClick={() => setIsMenuOpen(false)}>Kirish</Link>
              <Link href="/register" className="p-4 text-center font-bold bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-100" onClick={() => setIsMenuOpen(false)}>Registratsiya</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
