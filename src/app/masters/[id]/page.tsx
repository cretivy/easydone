"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { MasterProfile, Review } from "@/lib/types";
import { CATEGORIES } from "@/lib/constants";
import { 
  Star, MapPin, ShieldCheck, Clock, Calendar, CheckCircle, 
  MessageSquare, Phone, ChevronRight, User, Loader2, ArrowLeft,
  Image as ImageIcon, X
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function MasterProfilePage() {
  const { id } = useParams();
  const [master, setMaster] = useState<MasterProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("portfolio");
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      fetchMasterData();
      checkFavorite();
    }
  }, [id]);

  const checkFavorite = () => {
    const favs = JSON.parse(localStorage.getItem("fav_masters") || "[]");
    setIsFavorite(favs.includes(id));
  };

  const toggleFavorite = () => {
    const favs = JSON.parse(localStorage.getItem("fav_masters") || "[]");
    let newFavs;
    if (isFavorite) {
      newFavs = favs.filter((f: string) => f !== id);
    } else {
      newFavs = [...favs, id];
    }
    localStorage.setItem("fav_masters", JSON.stringify(newFavs));
    setIsFavorite(!isFavorite);
  };

  const fetchMasterData = async () => {
    setLoading(true);
    try {
      // Fetch Profile
      const masterDoc = await getDoc(doc(db, "master_profiles", id as string));
      if (masterDoc.exists()) {
        setMaster(masterDoc.data() as MasterProfile);
      }

      // Fetch Reviews
      const q = query(
        collection(db, "reviews"), 
        where("masterId", "==", id),
        orderBy("createdAt", "desc")
      );
      const reviewSnapshot = await getDocs(q);
      const reviewData = reviewSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      setReviews(reviewData);

    } catch (err) {
      console.error("Error fetching master profile:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
      </div>
    );
  }

  if (!master) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="text-6xl text-slate-300">👤</div>
        <h2 className="text-2xl font-black">Usta topilmadi</h2>
        <Link href="/masters" className="btn-primary py-3 px-8">Katalogga qaytish</Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/masters" className="flex items-center gap-2 text-slate-500 font-bold hover:text-emerald-500 transition-colors">
            <ArrowLeft size={20} /> Orqaga
          </Link>
          <div className="flex gap-4">
            <button 
              onClick={toggleFavorite}
              className={`p-3 rounded-2xl transition-all ${isFavorite ? 'bg-red-50 text-red-500 shadow-inner' : 'bg-slate-50 text-slate-400 hover:text-red-500'}`}
            >
              <Star size={20} className={isFavorite ? 'fill-current' : ''} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: MAIN INFO */}
          <div className="lg:col-span-2 space-y-8">
            {/* PROFILE CARD */}
            <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-slate-100">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-32 h-32 md:w-48 md:h-48 bg-slate-100 rounded-[32px] overflow-hidden shrink-0 relative border-4 border-slate-50">
                  {master.photoURL ? (
                    <img src={master.photoURL} alt={master.displayName} className="w-full h-full object-cover" />
                  ) : master.portfolio?.[0] ? (
                    <img src={master.portfolio[0]} alt={master.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                       <User size={64} />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900">{master.displayName}</h1>
                    {master.isVerified && (
                       <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1 border border-blue-100">
                         <ShieldCheck size={14} /> Tasdiqlangan
                       </span>
                    )}
                  </div>
                  
                  <p className="text-lg font-bold text-slate-500">
                    {CATEGORIES.find(c => c.id === master.mainCategory)?.name_uz || master.mainCategory}
                  </p>

                  <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-slate-400">
                    <div className="flex items-center gap-2">
                       <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                          <Star size={20} className="fill-current" />
                       </div>
                       <div>
                         <div className="text-slate-900">{master.rating}</div>
                         <div className="text-[10px] uppercase">O'rtacha reyting</div>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                          <MapPin size={20} />
                       </div>
                       <div>
                         <div className="text-slate-900">{master.city}</div>
                         <div className="text-[10px] uppercase">Ish joyi</div>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                          <Clock size={20} />
                       </div>
                       <div>
                         <div className="text-slate-900">{master.experience} yil</div>
                         <div className="text-[10px] uppercase">Ish tajribasi</div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 border-t border-slate-50 pt-8">
                 <h3 className="text-xl font-black mb-4">Mutaxassis haqida</h3>
                 <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">
                   {master.bio}
                 </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                 {master.subcategories?.map((sub, i) => (
                   <span key={i} className="px-6 py-3 bg-slate-50 rounded-2xl text-sm font-bold text-slate-600 border border-slate-100">
                      {sub}
                   </span>
                 ))}
              </div>
            </div>

            {/* PORTFOLIO / REVIEWS TABS */}
            <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
               <div className="flex border-b border-slate-50">
                  <button 
                    onClick={() => setActiveTab("portfolio")}
                    className={`flex-1 py-6 font-black text-lg transition-all ${activeTab === 'portfolio' ? 'text-emerald-500 border-b-4 border-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Ish namunalari ({master.portfolio?.length || 0})
                  </button>
                  <button 
                    onClick={() => setActiveTab("reviews")}
                    className={`flex-1 py-6 font-black text-lg transition-all ${activeTab === 'reviews' ? 'text-emerald-500 border-b-4 border-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Mijozlar fikri ({reviews.length})
                  </button>
               </div>

               <div className="p-8">
                  {activeTab === 'portfolio' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {master.portfolio && master.portfolio.length > 0 ? (
                         master.portfolio.map((img, i) => (
                           <div key={i} className="aspect-video bg-slate-100 rounded-3xl overflow-hidden group cursor-zoom-in">
                              <img 
                                src={img} 
                                alt={`Work ${i+1}`} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                              />
                           </div>
                         ))
                       ) : (
                         <div className="col-span-full py-20 text-center text-slate-400 flex flex-col items-center gap-4">
                            <ImageIcon size={48} className="opacity-20" />
                            <p className="font-bold">Hozircha rasmlar yuklanmagan</p>
                         </div>
                       )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                       {/* REVIEW FORM */}
                       <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 mb-8">
                          <h4 className="font-black mb-4">Fikr qoldirish</h4>
                          <div className="flex gap-1 mb-4">
                             {[1,2,3,4,5].map(s => (
                               <button key={s} className="text-amber-400 hover:scale-110 transition-transform">
                                 <Star size={24} />
                               </button>
                             ))}
                          </div>
                          <textarea className="w-full p-4 rounded-2xl border-none ring-1 ring-emerald-100 focus:ring-2 focus:ring-emerald-500 outline-none h-24 mb-4 text-sm" placeholder="Ish haqida fikringizni yozing..."></textarea>
                          <button className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold text-sm">Yuborish</button>
                       </div>

                       {reviews.length > 0 ? (
                         reviews.map((review) => (
                           <div key={review.id} className="p-6 bg-slate-50 rounded-3xl space-y-4">
                              <div className="flex justify-between items-start">
                                 <div className="font-bold text-slate-900">{review.clientName || "Mijoz"}</div>
                                 <div className="flex gap-1">
                                    {[1,2,3,4,5].map(s => (
                                      <Star key={s} size={14} className={s <= review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                                    ))}
                                 </div>
                              </div>
                              <p className="text-slate-600 text-sm leading-relaxed">{review.comment}</p>
                              <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                {review.createdAt?.toDate().toLocaleDateString('uz-UZ')}
                              </div>
                           </div>
                         ))
                       ) : (
                         <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-4">
                            <MessageSquare size={48} className="opacity-20" />
                            <p className="font-bold">Hozircha fikrlar mavjud emas</p>
                         </div>
                       )}
                    </div>
                  )}
               </div>
            </div>
          </div>

          {/* RIGHT: ACTIONS & SUMMARY */}
          <div className="space-y-6">
             <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 sticky top-28">
                <div className="mb-6">
                   <div className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Xizmat narxi (kamida)</div>
                   <div className="text-4xl font-black text-emerald-600">
                     {parseInt(master.price).toLocaleString()} <span className="text-lg text-slate-400">so'm</span>
                   </div>
                </div>

                <div className="space-y-4 mb-8">
                   <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
                         <Calendar size={18} />
                      </div>
                      Hozir bo'sh: <span className="text-emerald-500 ml-auto">{master.availability || 'Kunlik'}</span>
                   </div>
                   <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                      <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500">
                         <CheckCircle size={18} />
                      </div>
                      Bajarilgan ishlar: <span className="ml-auto">{master.reviewCount + 10}+</span>
                   </div>
                </div>

                <button 
                  onClick={() => setShowOrderModal(true)}
                  className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-lg hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 mb-3"
                >
                   <MessageSquare size={20} /> Buyurtma berish
                </button>
                <Link href={`tel:${master.phone}`} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                   <Phone size={20} /> Bog'lanish
                </Link>

                <p className="text-[10px] text-center text-slate-400 mt-6 font-bold uppercase tracking-tighter">
                  Xavfsiz to'lov va kafolatlangan sifat
                </p>
             </div>

             <div className="bg-emerald-600 rounded-[40px] p-8 text-white relative overflow-hidden group">
                <div className="relative z-10">
                   <h4 className="text-2xl font-black mb-2">Ustani tekshirish</h4>
                   <p className="text-emerald-100 text-sm font-medium mb-6">Ushbu mutaxassis barcha kerakli hujjatlarni taqdim etgan va tekshiruvdan o'tgan.</p>
                   <button className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-white/30 transition-all">
                      Batafsil
                   </button>
                </div>
                <ShieldCheck size={120} className="absolute -bottom-8 -right-8 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
             </div>
          </div>

        </div>
      </div>

      {/* ORDER MODAL */}
      <AnimatePresence>
        {showOrderModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setShowOrderModal(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }} 
               animate={{ scale: 1, opacity: 1, y: 0 }} 
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative bg-white w-full max-w-lg rounded-[40px] p-8 md:p-10 shadow-2xl"
             >
                <button onClick={() => setShowOrderModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900">
                   <X size={24} />
                </button>
                <h2 className="text-3xl font-black mb-2">Buyurtma berish</h2>
                <p className="text-slate-500 mb-8">Usta bilan bog'lanish va ish tafsilotlarini kelishish</p>

                <div className="space-y-4">
                   <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Ish turi</label>
                      <input type="text" defaultValue={master.mainCategory} className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-100 outline-none" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-sm font-bold text-slate-700 mb-2">Sana</label>
                         <input type="date" className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-100 outline-none" />
                      </div>
                      <div>
                         <label className="block text-sm font-bold text-slate-700 mb-2">Vaqt</label>
                         <input type="time" className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-100 outline-none" />
                      </div>
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Tavsif</label>
                      <textarea className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-100 outline-none h-32" placeholder="Nima ish bajarilishi kerakligini batafsil yozing..."></textarea>
                   </div>
                   <button className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-lg shadow-lg shadow-emerald-200 mt-4">
                      So'rovni yuborish
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
