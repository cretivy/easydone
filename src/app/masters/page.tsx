"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Filter, Star, ShieldCheck, ChevronRight, SlidersHorizontal, Loader2, X, User } from "lucide-react";
import { CATEGORIES, CITIES } from "@/lib/constants";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, where } from "firebase/firestore";
import { MasterProfile } from "@/lib/types";
import Link from "next/link";

export default function MastersCatalog() {
  const [masters, setMasters] = useState<MasterProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchMasters();
  }, []);

  const fetchMasters = async () => {
    setLoading(true);
    
    // Safety timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 6000);

    try {
      const q = query(collection(db, "master_profiles"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        uid: doc.id
      })) as MasterProfile[];
      setMasters(data);
    } catch (err) {
      console.error("Error fetching masters:", err);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const filteredMasters = masters.filter(m => {
    const matchesCat = selectedCat === "all" || m.mainCategory === selectedCat;
    const matchesCity = selectedCity === "all" || m.city === selectedCity;
    const matchesSearch = !searchTerm || 
      m.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.bio.toLowerCase().includes(searchTerm.toLowerCase());
    
    const priceNum = parseInt(m.price.replace(/\D/g, "")) || 0;
    const matchesMinPrice = !minPrice || priceNum >= parseInt(minPrice);
    const matchesMaxPrice = !maxPrice || priceNum <= parseInt(maxPrice);

    return matchesCat && matchesCity && matchesSearch && matchesMinPrice && matchesMaxPrice;
  });

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Search Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <h1 className="text-3xl font-black shrink-0 text-slate-900">Ustalar katalogi</h1>
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ism yoki xizmat turi bo'yicha izlash..." 
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shrink-0"
            >
              <SlidersHorizontal size={20} /> Filtrlar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters (Desktop & Mobile Drawer) */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-72 shrink-0 space-y-8`}>
            <div>
              <h3 className="font-black mb-4 text-lg">Kategoriyalar</h3>
              <div className="space-y-1">
                <button 
                  onClick={() => setSelectedCat("all")}
                  className={`w-full text-left p-3 rounded-xl font-bold transition-all ${selectedCat === 'all' ? 'bg-emerald-500 text-white' : 'hover:bg-slate-200 text-slate-600'}`}
                >
                  Barchasi
                </button>
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => setSelectedCat(cat.id)}
                    className={`w-full text-left p-3 rounded-xl font-bold transition-all ${selectedCat === cat.id ? 'bg-emerald-500 text-white' : 'hover:bg-slate-200 text-slate-600'}`}
                  >
                    {cat.name_uz}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-black mb-4 text-lg">Hudud</h3>
              <select 
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-sm"
              >
                <option value="all">Barcha viloyatlar</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <h3 className="font-black mb-4 text-lg">Narx doirasi (so'm)</h3>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="number" 
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="dan" 
                  className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none text-sm text-center font-bold" 
                />
                <input 
                  type="number" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="gacha" 
                  className="w-full p-4 rounded-2xl bg-white border border-slate-200 outline-none text-sm text-center font-bold" 
                />
              </div>
            </div>

            <button 
              onClick={() => {
                setSelectedCat("all");
                setSelectedCity("all");
                setMinPrice("");
                setMaxPrice("");
                setSearchTerm("");
              }}
              className="w-full py-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Filtrlarni tozalash
            </button>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <span className="text-slate-500 font-bold">
                {loading ? "Yuklanmoqda..." : `${filteredMasters.length} ta natija topildi`}
              </span>
              {!loading && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-400">Saralash:</span>
                  <select className="bg-transparent border-none outline-none font-black text-sm cursor-pointer">
                    <option>Reyting bo'yicha</option>
                    <option>Narx: arzonroq</option>
                    <option>Yangi qo'shilganlar</option>
                  </select>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="animate-spin mb-4" size={48} />
                <p className="font-bold">Ustalar ro'yxati yuklanmoqda...</p>
              </div>
            ) : filteredMasters.length === 0 ? (
              <div className="bg-white p-12 rounded-[32px] text-center border border-slate-100">
                <div className="text-6xl mb-6">🔍</div>
                <h3 className="text-2xl font-black mb-2">Hech narsa topilmadi</h3>
                <p className="text-slate-500">Qidiruv parametrlarini o'zgartirib ko'ring</p>
              </div>
            ) : (
              <div className="grid gap-6">
                <AnimatePresence>
                  {filteredMasters.map((master) => (
                    <motion.div 
                      key={master.uid}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white p-6 rounded-[32px] border border-slate-100 flex flex-col md:flex-row gap-6 hover:shadow-xl transition-all group"
                    >
                      <div className="w-full md:w-48 h-48 bg-slate-100 rounded-[24px] overflow-hidden shrink-0 relative">
                        {master.portfolio && master.portfolio[0] ? (
                          <img src={master.portfolio[0]} alt={master.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                             <User size={64} />
                          </div>
                        )}
                        {master.isVerified && (
                          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1">
                            <ShieldCheck size={12} /> Tasdiqlangan
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
                          <div>
                            <h3 className="text-xl font-bold mb-1 group-hover:text-emerald-600 transition-colors">
                              {master.displayName}
                            </h3>
                            <p className="text-sm text-slate-500 font-bold mb-2">
                              {CATEGORIES.find(c => c.id === master.mainCategory)?.name_uz || master.mainCategory}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400">
                              <span className="flex items-center gap-1"><Star size={14} className="fill-amber-400 text-amber-400" /> {master.rating} ({master.reviewCount})</span>
                              <span className="flex items-center gap-1"><MapPin size={14} /> {master.city}</span>
                              <span>{master.experience} yillik tajriba</span>
                            </div>
                          </div>
                          <div className="text-left md:text-right">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Xizmat narxi</span>
                            <span className="text-2xl font-black text-emerald-600">
                              {parseInt(master.price).toLocaleString()} <span className="text-xs text-slate-400 font-normal">so'm</span>
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-2">
                          {master.bio}
                        </p>

                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                          <div className="flex gap-2 flex-wrap">
                             {master.subcategories?.slice(0, 3).map((sub, i) => (
                               <span key={i} className="px-4 py-2 bg-slate-100 rounded-full text-xs font-bold text-slate-600">{sub}</span>
                             ))}
                          </div>
                          <Link 
                            href={`/masters/${master.uid}`} 
                            className="w-full md:w-auto px-8 py-3 bg-emerald-500 text-white rounded-2xl font-bold text-sm hover:bg-emerald-600 transition-colors text-center"
                          >
                            Profilni ko'rish
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Pagination Placeholder */}
            {!loading && filteredMasters.length > 0 && (
              <div className="mt-12 flex justify-center gap-2">
                 <button className="w-10 h-10 rounded-xl font-bold bg-emerald-500 text-white">1</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
