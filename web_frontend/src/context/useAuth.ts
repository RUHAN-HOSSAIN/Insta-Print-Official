import { useContext } from "react";
import { AuthContext } from "./AuthContext";

export const useAuth = () => {
  const ctx = useContext(AuthContext);  // ← useContext এখানেই use হচ্ছে
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};