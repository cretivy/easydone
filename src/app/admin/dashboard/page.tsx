"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldAlert, CreditCard, Check, X } from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState<{ disputes: any[]; payouts: any[] }>({ disputes: [], payouts: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/data");
      const result = await res.json();
      if (!result.error) {
        setData(result);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (type: string, id: string, action: string) => {
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id, action }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error("Error performing admin action:", error);
    }
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" /></div>;

  return (
    <div className="bg-slate-50 min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* HEADER */}
        <div>
           <h1 className="text-4xl font-black text-slate-900">Admin Panel</h1>
           <p className="text-slate-500 font-bold mt-2">Bozor faoliyatini boshqarish va nizolarni hal qilish</p>
        </div>

        {/* SECTION: DISPUTES */}
        <section>
          <div className="flex items-center gap-2 mb-6">
             <ShieldAlert className="text-red-500" />
             <h2 className="text-2xl font-black">Nizoli buyurtmalar (Arbitraj)</h2>
             <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-black">{data.disputes.length}</span>
          </div>

          <div className="grid gap-4">
             {data.disputes.map(order => (
               <div key={order.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:border-red-200 transition-colors">
                 <div>
                    <h3 className="text-lg font-black">{order.title}</h3>
                    <p className="text-sm text-slate-500 mb-4">#{order.id.slice(0,8)}</p>
                    <div className="grid grid-cols-2 gap-8">
                       <div>
                          <p className="text-[10px] uppercase font-black text-slate-400">Mijoz</p>
                          <p className="font-bold">{order.client.fullName || "Noma'lum"}</p>
                       </div>
                       <div>
                          <p className="text-[10px] uppercase font-black text-slate-400">Usta</p>
                          <p className="font-bold">{order.master.fullName || "Noma'lum"}</p>
                       </div>
                    </div>
                    <p className="text-xl font-black text-emerald-600 mt-4">{order.price.toLocaleString()} so'm</p>
                 </div>

                 <div className="flex flex-col gap-2 justify-center shrink-0">
                    <button 
                      onClick={() => handleAction("DISPUTE", order.id, "REFUND_CLIENT")}
                      className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2"
                    >
                       <X size={16} /> Mijozga qaytarish
                    </button>
                    <button 
                      onClick={() => handleAction("DISPUTE", order.id, "PAY_MASTER")}
                      className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold text-sm hover:bg-emerald-600 transition-all flex items-center gap-2"
                    >
                       <Check size={16} /> Ustaga to'lash
                    </button>
                 </div>
               </div>
             ))}
             {data.disputes.length === 0 && <p className="italic text-slate-400">Hozircha nizolar yo'q.</p>}
          </div>
        </section>

        {/* SECTION: PAYOUTS */}
        <section>
          <div className="flex items-center gap-2 mb-6">
             <CreditCard className="text-blue-500" />
             <h2 className="text-2xl font-black">Pul yechish so'rovlari</h2>
             <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-black">{data.payouts.length}</span>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
             <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-black text-slate-400">
                   <tr>
                      <th className="px-6 py-4">Usta</th>
                      <th className="px-6 py-4">Karta ma'lumotlari</th>
                      <th className="px-6 py-4">Suma</th>
                      <th className="px-6 py-4">Sana</th>
                      <th className="px-6 py-4">Amal</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {data.payouts.map(p => (
                     <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold">{p.master.fullName}</td>
                        <td className="px-6 py-4 font-mono text-sm">{p.cardDetails}</td>
                        <td className="px-6 py-4 font-black text-emerald-600">{p.amount.toLocaleString()} so'm</td>
                        <td className="px-6 py-4 text-xs text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                           <button 
                             onClick={() => handleAction("PAYOUT", p.id, "MARK_PAID")}
                             className="bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-600 transition-all"
                           >
                             To'landi
                           </button>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
             {data.payouts.length === 0 && <div className="p-8 text-center italic text-slate-400">Yangi so'rovlar yo'q.</div>}
          </div>
        </section>

      </div>
    </div>
  );
}
