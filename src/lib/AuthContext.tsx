"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
// import { auth, db } from "@/lib/firebase";
// import { onAuthStateChanged } from "firebase/auth";
// import { doc, getDoc } from "firebase/firestore";

interface AuthContextType {
  user: any;
  userData: any;
  loading: boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  refreshUserData: async () => {},
});

// МОКОВЫЙ ПОЛЬЗОВАТЕЛЬ ДЛЯ ТЕСТОВ
const MOCK_USER = {
  uid: "test-123",
  displayName: "Test Master",
  email: "test@example.com",
  photoURL: null,
};

const MOCK_DATA = {
  fullName: "Test Master",
  role: "MASTER",
  balance: 5000000,
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(MOCK_USER);
  const [userData, setUserData] = useState<any>(MOCK_DATA);
  const [loading, setLoading] = useState(false);

  const refreshUserData = React.useCallback(async () => {
    console.log("Mock refresh");
  }, []);

  useEffect(() => {
    // ВРЕМЕННО: Оставляем только моки
    setUser(MOCK_USER);
    setUserData(MOCK_DATA);
    setLoading(false);
  }, []);

  const value = React.useMemo(() => ({
    user,
    userData,
    loading,
    refreshUserData
  }), [user, userData, loading, refreshUserData]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
