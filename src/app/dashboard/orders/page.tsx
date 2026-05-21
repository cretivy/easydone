"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Loader2, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function OrdersDashboard() {
  const { user, userData, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/orders?uid=${user.uid}`);
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchOrders();
    }
  }, [user, authLoading, fetchOrders]);

  const handleAction = async (orderId: string, action: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userId: user?.uid }),
      });
      if (res.ok) {
        await fetchOrders();
      } else {
        const errData = await res.json();
        alert("Xatolik: " + errData.error);
      }
    } catch (error) {
      console.error("Error performing action:", error);
    }
  };


  if (authLoading || loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" /></div>;

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto p-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Iltimos, avval tizimga kiring</h1>
        <a href="/login" className="btn-primary px-8 py-3">Kirish</a>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">Mening buyurtmalarim</h1>
        <div className="text-right">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sizning balansingiz</p>
           <p className="text-xl font-black text-emerald-600">{(userData?.balance || 0).toLocaleString()} so'm</p>
        </div>
      </div>

      
      {orders.length === 0 ? (
        <div className="bg-white p-10 rounded-[32px] text-center border border-slate-100 italic text-slate-400">
           Sizda hali buyurtmalar mavjud emas.
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => {
            const isClient = order.client.firebaseUid === user.uid;
            const statusLabel = {
                PENDING: "Kutilmoqda",
                IN_PROGRESS: "Ish jarayonida",
                ON_REVIEW: "Tekshiruvda",
                COMPLETED: "Bajarildi",
                UNDER_ARBITRATION: "Arbitrajda",
                CANCELLED: "Bekor qilingan"
            }[order.status as string] || order.status;

            return (
              <div key={order.id} className="bg-white p-6 rounded-[32px] border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      order.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' : 
                      order.status === 'ON_REVIEW' ? 'bg-amber-100 text-amber-600' : 
                      order.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {statusLabel}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">#{order.id.slice(0, 8)}</span>
                  </div>
                  <h3 className="text-xl font-bold">{order.title}</h3>
                  <p className="text-sm text-slate-500">
                    {isClient ? `Usta: ${order.master.fullName || "Noma'lum"}` : `Mijoz: ${order.client.fullName || "Noma'lum"}`}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="font-black text-emerald-600">{parseFloat(order.price as any).toLocaleString()} so'm</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {/* MASTER ACTIONS */}
                  {!isClient && order.status === "PENDING" && (
                    <button 
                      onClick={() => handleAction(order.id, "ACCEPT")}
                      className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors"
                    >
                      Buyurtmani qabul qilish
                    </button>
                  )}
                  {!isClient && order.status === "IN_PROGRESS" && (
                    <button 
                      onClick={() => handleAction(order.id, "SUBMIT")}
                      className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors"
                    >
                      Ishni topshirish
                    </button>
                  )}

                  {/* CLIENT ACTIONS */}
                  {isClient && order.status === "ON_REVIEW" && (
                    <>
                      <button 
                        onClick={() => handleAction(order.id, "CONFIRM")}
                        className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors"
                      >
                        Tasdiqlash (To'lash)
                      </button>
                      <button 
                        onClick={() => handleAction(order.id, "DISPUTE")}
                        className="px-6 py-3 bg-red-50 text-red-500 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors"
                      >
                        Shikoyat qilish
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
