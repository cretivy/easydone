"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Search, MapPin, Star, ArrowRight, PaintRoller, Droplets, Hammer, Zap, Home, Armchair, Box, Grid, Maximize, MoreHorizontal } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

const ICON_MAP: Record<string, any> = {
  PaintRoller, Droplets, Hammer, Zap, Home, Armchair, Box, Grid, Maximize, MoreHorizontal
};

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-emerald-50/50 -z-10" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-200/30 blur-3xl rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold mb-6">
              🟢 Toshkentda 2,400+ tasdiqlangan ustalar
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
              Usta topish — <span className="text-emerald-500">endit judayam oson</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Santexnik, elektrik yoki mebelchi kerakmi? Antigravity orqali bir necha soniyada eng yaxshi ustalarni toping va buyurtma bering.
            </p>
          </motion.div>

          <motion.div 
            className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
             <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Qanday xizmat kerak? (masalan: Boyoqchi)" 
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 shadow-xl text-lg outline-none"
              />
            </div>
            <div className="relative w-full md:w-64">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select className="w-full pl-12 pr-4 py-4 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 shadow-xl text-lg outline-none appearance-none bg-white">
                <option>Toshkent shahar</option>
                <option>Samarqand</option>
              </select>
            </div>
            <button className="btn-primary w-full md:w-auto h-full py-4 text-lg">
              Izlash
            </button>
          </motion.div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-extrabold mb-2">Kategoriyalar</h2>
              <p className="text-slate-500">Har qanday turdagi usta xizmatlari</p>
            </div>
            <Link href="/categories" className="text-emerald-600 font-bold flex items-center gap-1 hover:underline">
              Barchasi <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {CATEGORIES.map((cat, i) => {
              const Icon = ICON_MAP[cat.icon];
              return (
                <motion.div
                  key={cat.id}
                  whileHover={{ y: -5 }}
                  className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center text-center cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 transition-all group"
                >
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    {Icon ? <Icon className="w-6 h-6" /> : <Box className="w-6 h-6" />}
                  </div>
                  <span className="font-bold text-sm">{cat.name_uz}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED MASTERS */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold mb-4">Eng yaxshi ustalar</h2>
            <p className="text-slate-500">Mijozlar tomonidan eng yuqori baholangan mutaxassislarimiz</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((m) => (
              <motion.div key={m} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-slate-100">
                <div className="h-48 bg-slate-200 relative">
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    4.9 (124 sharh)
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700">AK</div>
                    <div>
                      <h3 className="font-bold">Alisher Karimov</h3>
                      <p className="text-xs text-slate-500">Santexnik · 5 yillik tajriba</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-6 line-clamp-2">
                    Barcha turdagi santexnika ishlarini sifatli va kafolatli amalga oshiraman. Isitish tizimlari va suv quvurlarini o'rnatish.
                  </p>
                  <div className="flex items-center justify-between pt-4 border-top border-slate-50">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Xizmat narxi</span>
                      <span className="font-extrabold text-emerald-600">50,000 so'm <span className="text-xs text-slate-400 font-normal">/soat</span></span>
                    </div>
                    <button className="bg-slate-100 p-3 rounded-xl hover:bg-emerald-500 hover:text-white transition-colors">
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-emerald-600 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <Hammer className="w-full h-full -rotate-12 translate-x-20" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-extrabold mb-16">Qanday ishlaydi?</h2>
          <div className="grid md:grid-cols-4 gap-12">
            {[
              { n: "01", t: "Ro'yxatdan o'ting", d: "Siz bir necha soniyada usta yoki mijoz sifatida profil yaratasiz." },
              { n: "02", t: "Masterlarni taqqoslang", d: "Reyting va sharhlar asosida o'zingizga ma'qul ustani tanlang." },
              { n: "03", t: "Buyurtma bering", d: "Vaqtni belgilang va buyurtmani yuboring, usta uni tasdiqlaydi." },
              { n: "04", t: "Natijani oling", d: "Ish yakunlanganidan so'ng natijani tekshiring va baholang." },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="text-5xl font-black text-white/20 mb-4">{step.n}</div>
                <h3 className="text-xl font-bold mb-3">{step.t}</h3>
                <p className="text-emerald-100 text-sm leading-relaxed">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* FOOTER */}
      <footer className="bg-slate-900 py-12 text-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8 border-b border-white/10 pb-12 mb-12">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
              <Hammer className="text-white w-6 h-6" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight">Easy Done</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-400 font-bold">
            <Link href="#">Haqimizda</Link>
            <Link href="#">Xizmatlar</Link>
            <Link href="#">Yordam</Link>
            <Link href="#">Kontakt</Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          © 2026 Easy Done Platform. Barcha huquqlar himoyalangan.
        </div>
      </footer>
    </div>
  );
}
