"use client";

import { useEffect, useState } from "react";
// import { useAuth } from "@/lib/AuthContext";
import { Loader2, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function OrdersDashboard() {
  // ВРЕМЕННО: Тестовый пользователь для отладки
  const user = { uid: "test-123", role: "MASTER", fullName: "Тестовый Мастер" };
  const authLoading = false;

  const mockOrders = [
    {
      id: "ord-1",
      title: "Разработка логотипа для кофейни",
      price: 500000,
      status: "IN_PROGRESS",
      client: { fullName: "Иван Заказчик", firebaseUid: "client-abc" },
      master: { fullName: "Тестовый Мастер", firebaseUid: "test-123" }
    },
    {
      id: "ord-2",
      title: "Ремонт стиральной машины",
      price: 150000,
      status: "ON_REVIEW",
      client: { fullName: "Анна Петрова", firebaseUid: "client-def" },
      master: { fullName: "Тестовый Мастер", firebaseUid: "test-123" }
    },
    {
      id: "ord-3",
      title: "Перевод текста (английский)",
      price: 300000,
      status: "COMPLETED",
      client: { fullName: "Global Solutions", firebaseUid: "test-123" }, // Здесь мы как клиент
      master: { fullName: "Алексей Переводчик", firebaseUid: "master-789" }
    }
  ];

  const [orders, setOrders] = useState<any[]>(mockOrders);
  const [loading, setLoading] = useState(false); // Сразу false для моков

  useEffect(() => {
     // Ничего не делаем, данные уже в стейте
  }, []);

  const fetchOrders = async () => {
    // Временно отключено
    console.log("Fetch orders skipped - using mocks");
  };

  const handleAction = async (orderId: string, action: string) => {
    alert(`Тест: Выполнено действие ${action} для заказа ${orderId}`);
    // Обновляем локально для демонстрации
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: action === "SUBMIT" ? "ON_REVIEW" : "COMPLETED" } : o));
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="max-w-5xl mx-auto p-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">Mening buyurtmalarim</h1>
        <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-2xl text-xs font-bold border border-amber-200">
           ⚠️ TEST REJIMI (FIREBASE O'CHIRILGAN)
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
                IN_PROGRESS: "Ish jarayonida",
                ON_REVIEW: "Tekshiruvda",
                COMPLETED: "Bajarildi",
                UNDER_ARBITRATION: "Sizning shikoyatingiz",
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
                  <p className="font-black text-emerald-600 mt-2">{parseFloat(order.price as any).toLocaleString()} so'm</p>
                </div>

                <div className="flex gap-2">
                  {/* MASTER ACTIONS */}
                  {!isClient && order.status === "IN_PROGRESS" && (
                    <button 
                      onClick={() => handleAction(order.id, "SUBMIT")}
                      className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors"
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
