"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { CATEGORIES } from "@/lib/constants";
import { Loader2, ArrowLeft, User, CheckCircle, Clock, CreditCard } from "lucide-react";
import Link from "next/link";

export default function JobDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const res = await fetch(`/api/jobs/${id}`);
      const data = await res.json();
      setJob(data.job);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExecutor = async (offer: any) => {
    if (!confirm(`Haqiqatan ham ushbu ustani tanlamoqchimisiz? Narx: ${offer.price.toLocaleString()} so'm. Mablag'ingiz muzlatiladi.`)) return;

    setIsSelecting(true);
    try {
      // 1. Create the REAL ORDER (Safe Deal)
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: user.uid,
          masterId: offer.master.firebaseUid,
          price: offer.price,
          title: job.title,
          description: `Birja orqali buyurtma: ${job.description}\n\nUsta taklifi: ${offer.message}`
        }),
      });

      const data = await res.json();
      if (data.success) {
        // 2. Close the Job Post
        await fetch(`/api/jobs/${id}/close`, { method: "POST" });
        alert("Ijrochi tayinlandi! Ish boshlandi.");
        router.push("/dashboard/orders");
      } else {
        alert("Xatolik: " + data.error);
      }
    } finally {
      setIsSelecting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" size={48} /></div>;
  if (!job) return <div className="min-h-screen flex items-center justify-center font-bold">Buyurtma topilmadi.</div>;

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/jobs" className="flex items-center gap-2 text-slate-500 font-bold mb-8 hover:text-emerald-500">
           <ArrowLeft size={20} /> Orqaga
        </Link>

        {/* JOB INFO */}
        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-slate-100 mb-12">
           <div className="flex justify-between items-start mb-6">
              <div>
                 <span className="bg-emerald-50 text-emerald-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-3 inline-block">
                    {CATEGORIES.find(c => c.id === job.category)?.name_uz || job.category}
                 </span>
                 <h1 className="text-4xl font-black text-slate-900">{job.title}</h1>
              </div>
              <div className="text-right">
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Byudjet</p>
                 <p className="text-3xl font-black text-emerald-500">{job.budget.toLocaleString()} so'm</p>
              </div>
           </div>
           <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap mb-8">{job.description}</p>
           <div className="flex gap-8 border-t border-slate-50 pt-8">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                 <Clock size={18} /> {job.deadline} kun
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                 <CheckCircle size={18} /> {job.status}
              </div>
           </div>
        </div>

        {/* OFFERS LIST */}
        <div>
           <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
              Ustalardan takliflar 
              <span className="bg-emerald-500 text-white text-sm px-3 py-1 rounded-full">{job.offers.length}</span>
           </h2>

           <div className="space-y-4">
              {job.offers.map((offer: any) => (
                <div key={offer.id} className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between gap-8 transition-all hover:border-emerald-200">
                   <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                         <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 font-bold uppercase">
                            {offer.master.fullName.substring(0, 1)}
                         </div>
                         <div>
                            <p className="font-black text-slate-900">{offer.master.fullName}</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Usta</p>
                         </div>
                      </div>
                      <p className="text-slate-600 mb-6 italic">"{offer.message}"</p>
                      <div className="flex gap-6">
                         <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                            <CreditCard size={14} /> {offer.price.toLocaleString()} so'm
                         </div>
                         <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                            <Clock size={14} /> {offer.days} kun
                         </div>
                      </div>
                   </div>

                   <div className="flex flex-col justify-center shrink-0">
                      {job.clientId === user?.uid && (
                        <button 
                          disabled={isSelecting}
                          onClick={() => handleSelectExecutor(offer)}
                          className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                        >
                          {isSelecting ? <Loader2 className="animate-spin" /> : "Tanlash va buyurtma berish"}
                        </button>
                      )}
                   </div>
                </div>
              ))}
              {job.offers.length === 0 && <div className="p-12 text-center text-slate-400 font-bold border-2 border-dashed border-slate-200 rounded-[40px]">Hozircha hech qanday taklif yo'q.</div>}
           </div>
        </div>

      </div>
    </div>
  );
}
