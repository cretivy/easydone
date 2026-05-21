"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { CATEGORIES } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { Loader2, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateJobPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    budget: "",
    deadline: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Iltimos tizimga kiring");

    setLoading(true);
    try {
      const res = await fetch("/api/jobs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: user.uid,
          ...formData
        }),
      });
      if (res.ok) {
        alert("Buyurtma muvaffaqiyatli e'lon qilindi!");
        router.push("/jobs");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/jobs" className="flex items-center gap-2 text-slate-500 font-bold mb-8 hover:text-emerald-500">
           <ArrowLeft size={20} /> Birjaga qaytish
        </Link>

        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-slate-100">
           <h1 className="text-4xl font-black mb-2">Buyurtma e'lon qilish</h1>
           <p className="text-slate-500 mb-10">Munosib usta topish uchun ish tafsilotlarini kiriting.</p>

           <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">Buyurtma sarlavhasi</label>
                 <input 
                   required
                   type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                   className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                   placeholder="Masalan: Uyimni to'liq ta'mirlash kerak"
                 />
              </div>

              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">Kategoriya</label>
                 <select 
                   required
                   value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                   className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                 >
                   <option value="">— Tanlang —</option>
                   {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name_uz}</option>)}
                 </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Taxminiy byudjet (so'm)</label>
                    <input 
                      required
                      type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                      placeholder="Masalan: 500000"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Muddat (kunlarda)</label>
                    <input 
                      required
                      type="number" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                      placeholder="Masalan: 7"
                    />
                 </div>
              </div>

              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">Batafsil tavsif</label>
                 <textarea 
                   required
                   value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                   className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500 transition-all font-medium h-48 resize-none"
                   placeholder="Ish haqida batafsil ma'lumot bering..."
                 />
              </div>

              <button 
                type="submit" disabled={loading}
                className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-xl hover:bg-emerald-600 shadow-xl shadow-emerald-100 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "E'lon qilish"}
              </button>
           </form>
        </div>
      </div>
    </div>
  );
}
