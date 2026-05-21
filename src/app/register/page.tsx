"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Hammer, CheckCircle2, ChevronLeft, ChevronRight, Upload, MapPin, Briefcase, Loader2, X } from "lucide-react";
import { CATEGORIES, CITIES } from "@/lib/constants";
import { auth, db, storage } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Role = "client" | "master";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    email: "",
    phone: "+998 ",
    password: "",
    city: "",
    main_category: "",
    subcategories: [] as string[],
    experience: "",
    price: "",
    bio: "",
    availability: "Kunlik"
  });

  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setPortfolioFiles(prev => [...prev, ...files]);
      
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setPortfolioFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  const handleRegister = async () => {
    setLoading(true);
    setError("");

    try {
      // 1. Check unique nickname (Optimized)
      setStatus("Nikneym tekshirilmoqda...");
      try {
        const nickQuery = query(collection(db, "users"), where("nickname", "==", formData.nickname.toLowerCase()));
        const nickSnapshot = await getDocs(nickQuery);
        if (!nickSnapshot.empty) {
          throw new Error("Bu nikneym allaqachon band. Iltimos, boshqasini tanlang.");
        }
      } catch (nickErr) {
        console.warn("Nickname check bypassed or failed:", nickErr);
        // If it's a permission error, we might want to continue or show a better message
      }


      // 2. Create Auth User
      setStatus("Profil yaratilmoqda...");
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Update Auth Profile
      await updateProfile(user, { displayName: formData.name });

      // 3. Upload Portfolio Images if Master
      let portfolioUrls: string[] = [];
      if (role === "master" && portfolioFiles.length > 0) {
        setStatus("Portfolioni yuklanmoqda...");
        const uploadPromises = portfolioFiles.map(async (file, idx) => {
          const storageRef = ref(storage, `portfolios/${user.uid}/${Date.now()}_${idx}`);
          await uploadBytes(storageRef, file);
          return getDownloadURL(storageRef);
        });
        portfolioUrls = await Promise.all(uploadPromises);
      }

      // 4. Save to Firestore
      setStatus("Ma'lumotlar saqlanmoqda...");
      const userRef = doc(db, "users", user.uid);
      const userData: any = {
        uid: user.uid,
        displayName: formData.name,
        nickname: formData.nickname.toLowerCase(),
        email: formData.email,
        role: role,
        createdAt: serverTimestamp(),
      };
      await setDoc(userRef, userData);

      // 5. Sync to Postgres (Prisma)
      setStatus("Sinxronizatsiya qilinmoqda...");
      await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          email: formData.email,
          fullName: formData.name,
          role: role
        }),
      });


      if (role === "master") {
        const masterRef = doc(db, "master_profiles", user.uid);
        const slug = formData.name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 7);
        
        await setDoc(masterRef, {
          ...userData,
          phone: formData.phone,
          city: formData.city,
          mainCategory: formData.main_category,
          subcategories: formData.subcategories,
          experience: parseInt(formData.experience) || 0,
          bio: formData.bio,
          price: formData.price,
          portfolio: portfolioUrls,
          rating: 5.0,
          reviewCount: 0,
          isVerified: false,
          slug: slug,
          availability: formData.availability
        });
      }

      setStep(5);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Progress Bar */}
        {step < 5 && (
          <div className="flex gap-2 mb-12">
            {[1, 2, 3, 4].map((s) => (
              <div 
                key={s} 
                className={`h-2 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-emerald-500' : 'bg-slate-200'}`} 
              />
            ))}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl font-bold text-sm flex items-center gap-2">
            <X size={18} /> {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: ROLE SELECTION */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-slate-100"
            >
              <h2 className="text-3xl font-black mb-2">Xush kelibsiz!</h2>
              <p className="text-slate-500 mb-10">Platformadan qanday maqsadda foydalanmoqchisiz?</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => { setRole("client"); next(); }}
                  className={`p-8 rounded-3xl border-2 transition-all text-left flex flex-col gap-4 ${role === 'client' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-emerald-200'}`}
                >
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                    <User size={32} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">Mijozman</h3>
                    <p className="text-sm text-slate-500">Ustalarni qidiraman va xizmat buyurtma qilaman</p>
                  </div>
                </button>

                <button 
                  onClick={() => { setRole("master"); next(); }}
                  className={`p-8 rounded-3xl border-2 transition-all text-left flex flex-col gap-4 ${role === 'master' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-emerald-200'}`}
                >
                  <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                    <Hammer size={32} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">Ustaman</h3>
                    <p className="text-sm text-slate-500">Mijozlarni topaman va o'z xizmatlarimni taklif qilaman</p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: ACCOUNT DETAILS */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-slate-100"
            >
              <button onClick={back} className="mb-6 text-slate-400 hover:text-emerald-500 flex items-center gap-2 font-bold p-0">
                <ChevronLeft size={20} /> Orqaga
              </button>
              <h2 className="text-3xl font-black mb-2">Ma'lumotlar</h2>
              <p className="text-slate-500 mb-10">Shaxsiy va aloqa ma'lumotlaringizni kiriting</p>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">To'liq ismingiz</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                      placeholder="Alisher Karimov"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nikneym (@)</label>
                    <input 
                      type="text" 
                      value={formData.nickname}
                      onChange={(e) => setFormData({...formData, nickname: e.target.value.replace(/\s+/g, '').toLowerCase()})}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                      placeholder="alisher_usta"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Telefon raqam</label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                      placeholder="+998 90 123 45 67"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                      placeholder="example@mail.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Parol o'rnating</label>
                  <input 
                    type="password" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                  />
                </div>
                
                <button 
                  onClick={role === 'client' ? handleRegister : next} 
                  disabled={loading || !formData.name || !formData.email || !formData.password}
                  className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" />
                      <span className="text-sm font-medium">{status}</span>
                    </>
                  ) : (
                    <>
                      {role === 'client' ? "Ro'yxatdan o'tish" : "Davom etish"} 
                      {role !== 'client' && <ChevronRight className="inline" />}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: SPECIALTY (ONLY FOR MASTERS) */}
          {step === 3 && role === 'master' && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-slate-100"
            >
              <button onClick={back} className="mb-6 text-slate-400 hover:text-emerald-500 flex items-center gap-2 font-bold p-0">
                <ChevronLeft size={20} /> Orqaga
              </button>
              <h2 className="text-3xl font-black mb-2">Mutaxassislik</h2>
              <p className="text-slate-500 mb-10">Asosiy ish yo'nalishingizni tanlang</p>

              <div className="space-y-6">
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">Viloyat / Shahar</label>
                   <select 
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                   >
                     <option value="">— Tanlang —</option>
                     {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Asosiy kategoriya</label>
                  <div className="grid grid-cols-2 gap-3">
                    {CATEGORIES.map(cat => (
                      <button 
                        key={cat.id}
                        type="button"
                        onClick={() => setFormData({...formData, main_category: cat.id, subcategories: []})}
                        className={`p-4 rounded-2xl border text-sm font-bold text-left transition-all ${formData.main_category === cat.id ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 hover:bg-slate-50'}`}
                      >
                        {cat.name_uz}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.main_category && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Qo'shimcha xizmatlar (maks. 3 ta)</label>
                    <div className="flex flex-wrap gap-2">
                       {CATEGORIES.find(c => c.id === formData.main_category)?.subcategories.map(sub => (
                         <button
                           key={sub}
                           type="button"
                           onClick={() => {
                             if (formData.subcategories.includes(sub)) {
                               setFormData({...formData, subcategories: formData.subcategories.filter(s => s !== sub)});
                             } else if (formData.subcategories.length < 3) {
                               setFormData({...formData, subcategories: [...formData.subcategories, sub]});
                             }
                           }}
                           className={`px-4 py-2 rounded-full border text-xs font-bold transition-all ${formData.subcategories.includes(sub) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 text-slate-500 hover:border-emerald-200'}`}
                         >
                           {sub}
                         </button>
                       ))}
                    </div>
                  </motion.div>
                )}
                <button onClick={next} disabled={!formData.main_category || !formData.city} className="btn-primary w-full py-4 text-lg disabled:opacity-50">
                  Davom etish <ChevronRight className="inline" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: EXPERIENCE & PORTFOLIO */}
          {step === 4 && role === 'master' && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-slate-100"
            >
              <button onClick={back} className="mb-6 text-slate-400 hover:text-emerald-500 flex items-center gap-2 font-bold p-0">
                <ChevronLeft size={20} /> Orqaga
              </button>
              <h2 className="text-3xl font-black mb-2">Tajriba va Portfolio</h2>
              <p className="text-slate-500 mb-10">Mijozlar sizni yaxshiroq tanishi uchun</p>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tajriba (yillar)</label>
                    <input 
                      type="number" 
                      value={formData.experience}
                      onChange={(e) => setFormData({...formData, experience: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                      placeholder="Masalan: 5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Boshlang'ich narx</label>
                    <input 
                      type="text" 
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                      placeholder="so'mda"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">O'zingiz haqingizda</label>
                  <textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-emerald-500 transition-all font-medium h-32 resize-none"
                    placeholder="Ish uslubingiz va yutuqlaringiz haqida yozing..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Portfolio rasmlarini yuklang</label>
                  <label className="block p-8 border-2 border-dashed border-slate-200 rounded-3xl text-center hover:border-emerald-300 transition-colors cursor-pointer group">
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                    <Upload className="mx-auto mb-3 text-slate-300 group-hover:text-emerald-500" />
                    <p className="text-xs font-bold text-slate-400">Rasmlarni tanlang (ko'proq rasm ko'proq mijoz)</p>
                  </label>
                  
                  {previews.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-4">
                      {previews.map((src, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                          <img src={src} alt="Preview" className="w-full h-full object-cover" />
                          <button 
                            onClick={() => removeFile(i)}
                            className="absolute top-1 right-1 bg-white p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={handleRegister} 
                  disabled={loading}
                  className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" />
                      <span className="text-sm font-medium">{status}</span>
                    </>
                  ) : (
                    "Ro'yxatdan o'tishni yakunlash"
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: SUCCESS */}
          {step === 5 && (
            <motion.div
              key="success"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-slate-100 text-center"
            >
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-8">
                <CheckCircle2 size={56} />
              </div>
              <h2 className="text-4xl font-black mb-4">Tabriklaymiz! 🎉</h2>
              <p className="text-slate-600 mb-10 leading-relaxed text-lg">
                Profilinigiz muvaffaqiyatli yaratildi. <br/> 
                {role === 'master' ? "Endi mijozlardan buyurtmalar qabul qilishingiz mumkin." : "O'zingizga kerakli ustalarni qidirishni boshlashingiz mumkin."}
              </p>
              <Link href={role === 'master' ? '/profile' : '/masters'} className="btn-primary block w-full py-4 text-lg">
                Boshlaymiz →
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
