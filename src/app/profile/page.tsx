"use client";

import { useState, useEffect } from "react";
import { auth, db, storage } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { 
  User, Camera, Check, X, Loader2, AlertCircle, 
  Settings, Award, Briefcase, Mail
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";

export default function ProfilePage() {
  const { user, userData, loading: authLoading, refreshUserData } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form fields
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = "/login";
    }
    if (userData) {
      setProfileData(userData);
      setName(user?.displayName || "");
      setNickname(userData.nickname || "");
      setPhotoPreview(user?.photoURL || "");
    }
  }, [user, userData, authLoading]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const validateNickname = async (nick: string) => {
    if (!nick) return true;
    if (nick === profileData?.nickname) return true;

    const q = query(collection(db, "users"), where("nickname", "==", nick.toLowerCase()));
    const snapshot = await getDocs(q);
    return snapshot.empty;
  };

  const handleSave = async () => {
    const oldData = { ...profileData };
    const newData = { ...profileData, displayName: name, nickname: nickname.toLowerCase(), photoURL: photoPreview };
    
    setProfileData(newData);
    setEditing(false);
    setSaving(true);
    setError("");

    try {
      if (nickname && nickname !== oldData?.nickname) {
        const isUnique = await validateNickname(nickname);
        if (!isUnique) {
          setError("Bu nikneym allaqachon band.");
          setProfileData(oldData);
          setEditing(true);
          setSaving(false);
          return;
        }
      }

      let newPhotoURL = user.photoURL;
      if (photoFile) {
        const storageRef = ref(storage, `profiles/${user.uid}`);
        await uploadBytes(storageRef, photoFile);
        newPhotoURL = await getDownloadURL(storageRef);
      }

      const updatePayload: any = {
        displayName: name,
        nickname: nickname.toLowerCase(),
        photoURL: newPhotoURL
      };
      
      await Promise.all([
        updateProfile(user, { displayName: name, photoURL: newPhotoURL }),
        updateDoc(doc(db, "users", user.uid), updatePayload),
        userData?.role === 'master' ? updateDoc(doc(db, "master_profiles", user.uid), updatePayload) : Promise.resolve()
      ]);

      await refreshUserData();
    } catch (err: any) {
      setError("Saqlashda xatolik.");
      setProfileData(oldData);
      setEditing(true);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pt-12 pb-24">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* HEADER PROFILE */}
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden mb-8">
           <div className="h-40 bg-gradient-to-r from-emerald-400 to-teal-500 relative">
              <button 
                onClick={() => setEditing(!editing)}
                className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white/30 transition-all font-bold text-sm flex items-center gap-2"
              >
                {editing ? <X size={20} /> : <Settings size={20} />} {editing ? 'Bekor qilish' : 'Tahrirlash'}
              </button>
           </div>
           
           <div className="px-8 pb-12 relative">
              <div className="flex flex-col md:flex-row items-end gap-6 -mt-16 mb-8">
                 <div className="relative group">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-[32px] bg-white p-2 shadow-xl border border-slate-50 overflow-hidden">
                       <div className="w-full h-full rounded-[24px] bg-slate-100 flex items-center justify-center overflow-hidden">
                         {photoPreview ? (
                           <img src={photoPreview} className="w-full h-full object-cover" />
                         ) : (
                           <User size={64} className="text-slate-300" />
                         )}
                       </div>
                    </div>
                    {editing && (
                      <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-[32px] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={24} />
                        <input type="file" className="hidden" onChange={handlePhotoChange} accept="image/*" />
                      </label>
                    )}
                 </div>

                 <div className="flex-1 pb-2">
                    {editing ? (
                      <div className="space-y-4 max-w-md">
                        <input 
                          type="text" 
                          value={name} 
                          onChange={(e) => setName(e.target.value)}
                          className="text-4xl font-black bg-slate-50 border-none ring-2 ring-emerald-100 rounded-2xl px-4 py-2 w-full outline-none focus:ring-emerald-500"
                        />
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">@</span>
                          <input 
                            type="text" 
                            value={nickname} 
                            onChange={(e) => setNickname(e.target.value.replace(/\s+/g, '').toLowerCase())}
                            className="text-lg font-bold bg-slate-50 border-none ring-2 ring-emerald-100 rounded-2xl pl-10 pr-4 py-3 w-full outline-none focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <h1 className="text-4xl font-black text-slate-900">{profileData?.displayName || user.displayName || 'Ism kiritilmagan'}</h1>
                        <p className="text-xl font-bold text-emerald-500">@{profileData?.nickname || 'nikneym'}</p>
                      </div>
                    )}
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-3xl">
                   <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                      <Mail size={24} />
                   </div>
                   <div>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email</p>
                     <p className="font-bold text-slate-700">{user.email}</p>
                   </div>
                </div>
                <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-3xl">
                   <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
                      <Award size={24} />
                   </div>
                   <div>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rol</p>
                     <p className="font-bold text-slate-700 uppercase">{userData?.role === 'master' ? 'Mutaxassis (Usta)' : 'Mijoz'}</p>
                   </div>
                </div>
                <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-3xl">
                   <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
                      <Briefcase size={24} />
                   </div>
                   <div>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">A'zolik</p>
                     <p className="font-bold text-slate-700">6 oydan beri</p>
                   </div>
                </div>
              </div>

              <AnimatePresence>
                {editing && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="mt-8"
                  >
                    {error && (
                      <div className="p-4 bg-red-50 text-red-500 rounded-2xl text-sm font-bold flex items-center gap-2 border border-red-100 mb-4">
                        <AlertCircle size={18} /> {error}
                      </div>
                    )}
                    <button 
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-lg hover:bg-emerald-600 shadow-xl shadow-emerald-100 flex items-center justify-center gap-2"
                    >
                      {saving && <Loader2 className="animate-spin" size={20} />}
                      {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </div>

        {/* EXTRA SECTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100">
              <h3 className="text-xl font-black mb-6">Xavfsizlik</h3>
              <button className="w-full p-4 text-left font-bold text-slate-600 border border-slate-50 rounded-2xl hover:bg-slate-50 transition-all mb-3 flex justify-between items-center">
                Parolni o'zgartirish <Check size={18} className="text-emerald-500" />
              </button>
              <button className="w-full p-4 text-left font-bold text-slate-600 border border-slate-50 rounded-2xl hover:bg-slate-50 transition-all flex justify-between items-center">
                Ikki bosqichli himoya <div className="w-10 h-5 bg-slate-200 rounded-full"></div>
              </button>
           </div>
           <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100">
              <h3 className="text-xl font-black mb-6">Bildirishnomalar</h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-600 text-sm">Email xabarlar</span>
                    <div className="w-10 h-5 bg-emerald-500 rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div></div>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-600 text-sm">Telegram bot</span>
                    <div className="w-10 h-5 bg-slate-200 rounded-full relative"><div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full"></div></div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
