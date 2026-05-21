"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { CATEGORIES } from "@/lib/constants";
import { 
  Search, Briefcase, Clock, CreditCard, 
  ChevronRight, Filter, Loader2, MessageSquare, Plus, X 
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function JobsMarketplace() {
  const { user, userData } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  
  // Offer state
  const [activeJob, setActiveJob] = useState<any>(null);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerDays, setOfferDays] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/jobs?category=${selectedCategory}`);
      const data = await res.json();
      setJobs(data.jobs || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [selectedCategory]);

  const handleOffer = async () => {
    if (!user) return alert("Avval profilga kirishingiz kerak");
    if (userData?.role !== 'MASTER') return alert("Faqat ustalar taklif yubora oladi");

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/jobs/offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: activeJob.id,
          masterId: user.uid,
          price: parseFloat(offerPrice),
          days: parseInt(offerDays),
          message: offerMessage
        }),
      });
      if (res.ok) {
        alert("Taklif yuborildi!");
        setActiveJob(null);
        fetchJobs();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      
      {/* HERO SECTION */}
      <div className="bg-slate-900 py-20 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="max-w-2xl">
               <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">Buyurtmalar <span className="text-emerald-400 font-outline-2">Birjasi</span></h1>
               <p className="text-slate-400 text-xl font-medium">Mijozlar tomonidan e'lon qilingan loyihalarni toping va o'z taklifingizni bering.</p>
            </div>
            {userData?.role?.toUpperCase() === 'CLIENT' && (
              <Link href="/jobs/create" className="bg-emerald-500 hover:bg-emerald-600 px-8 py-5 rounded-[24px] font-black text-lg shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-2">
                <Plus size={24} /> Buyurtma e'lon qilish
              </Link>
            )}
          </div>
        </div>

        <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-500/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           
           {/* FILTERS */}
           <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
                 <h3 className="text-xl font-black mb-6 flex items-center gap-2"><Filter size={20} /> Filtrlar</h3>
                 <div className="space-y-4">
                    <div>
                       <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Yo'nalishlar</label>
                       <div className="flex flex-col gap-2">
                         <button 
                           onClick={() => setSelectedCategory("")}
                           className={`text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all ${selectedCategory === '' ? 'bg-emerald-500 text-white' : 'hover:bg-slate-50 text-slate-600'}`}
                         >
                           Barchasi
                         </button>
                         {CATEGORIES.map(cat => (
                           <button 
                             key={cat.id}
                             onClick={() => setSelectedCategory(cat.id)}
                             className={`text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all ${selectedCategory === cat.id ? 'bg-emerald-500 text-white' : 'hover:bg-slate-50 text-slate-600'}`}
                           >
                             {cat.name_uz}
                           </button>
                         ))}
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* JOBS LIST */}
           <div className="lg:col-span-3 space-y-4">
              {loading ? (
                <div className="bg-white p-20 rounded-[40px] text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" size={48} /></div>
              ) : jobs.length === 0 ? (
                <div className="bg-white p-20 rounded-[40px] text-center text-slate-400 font-bold border border-slate-100">Hozircha ochiq buyurtmalar yo'q.</div>
              ) : (
                jobs.map(job => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    key={job.id} 
                    className="bg-white rounded-[40px] p-8 border border-slate-100 flex flex-col md:flex-row justify-between gap-8 hover:border-emerald-200 transition-all hover:shadow-xl shadow-slate-200"
                  >
                    <div className="flex-1">
                       <span className="bg-emerald-50 text-emerald-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-3 inline-block">
                         {CATEGORIES.find(c => c.id === job.category)?.name_uz || job.category}
                       </span>
                       <h3 className="text-2xl font-black text-slate-900 mb-3">{job.title}</h3>
                       <p className="text-slate-500 text-sm line-clamp-2 mb-6">{job.description}</p>
                       
                       <div className="flex flex-wrap items-center gap-6 text-slate-400">
                          <div className="flex items-center gap-2 text-xs font-bold">
                             <Clock size={16} /> {job.deadline} kun
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold">
                             <MessageSquare size={16} /> {job._count.offers} taklif
                          </div>
                          <div className="text-xs font-bold bg-slate-50 px-3 py-1 rounded-lg">
                             Mijoz: {job.client.fullName}
                          </div>
                       </div>
                    </div>

                    <div className="flex flex-col justify-between items-end shrink-0">
                       <div className="text-right">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Byudjet</p>
                          <p className="text-3xl font-black text-emerald-500">{job.budget.toLocaleString()} so'm</p>
                       </div>
                       
                       {userData?.role === 'MASTER' && (
                         <button 
                           onClick={() => setActiveJob(job)}
                           className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-lg"
                         >
                           Taklif yuborish
                         </button>
                       )}
                    </div>
                  </motion.div>
                ))
              )}
           </div>

        </div>
      </div>

      {/* BID MODAL */}
      <AnimatePresence>
        {activeJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
               onClick={() => setActiveJob(null)}
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
               className="relative bg-white w-full max-w-lg rounded-[40px] p-10 shadow-2xl"
             >
                <div className="flex justify-between items-center mb-8">
                   <h2 className="text-3xl font-black">Taklif yuborish</h2>
                   <button onClick={() => setActiveJob(null)} className="text-slate-400 hover:text-slate-900"><X /></button>
                </div>
                
                <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="text-sm font-bold text-slate-700 mb-2 block">Narxingiz (so'm)</label>
                         <input 
                           type="number" 
                           value={offerPrice} onChange={e => setOfferPrice(e.target.value)}
                           className="w-full p-4 bg-slate-50 rounded-2xl outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500" 
                           placeholder={activeJob.budget.toString()}
                         />
                      </div>
                      <div>
                         <label className="text-sm font-bold text-slate-700 mb-2 block">Muddat (kun)</label>
                         <input 
                           type="number" 
                           value={offerDays} onChange={e => setOfferDays(e.target.value)}
                           className="w-full p-4 bg-slate-50 rounded-2xl outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500" 
                           placeholder={activeJob.deadline.toString()}
                         />
                      </div>
                   </div>
                   <div>
                      <label className="text-sm font-bold text-slate-700 mb-2 block">Xabaringiz</label>
                      <textarea 
                        value={offerMessage} onChange={e => setOfferMessage(e.target.value)}
                        className="w-full p-4 bg-slate-50 rounded-2xl outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500 h-32" 
                        placeholder="Nima uchun mijoz aynan sizni tanlashi kerak?"
                      />
                   </div>
                   <button 
                     disabled={isSubmitting}
                     onClick={handleOffer}
                     className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-lg disabled:opacity-50"
                   >
                     {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "Taklifni yuborish"}
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
