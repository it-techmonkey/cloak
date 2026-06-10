"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import AuthModal from "./AuthModal";

type AuthState = {
  user: User | null;
  loading: boolean;
  openAuthModal: (mode?: "signin" | "signup") => void;
  closeAuthModal: () => void;
};

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"signin" | "signup">("signin");
  const initialised = useRef(false);

  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;

    const supabase = createClient();

    // getUser() validates the session server-side (unlike getSession which trusts local storage)
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      // Close modal when auth state confirms a user is signed in
      if (session?.user) setModalOpen(false);
    });

    // Auto-open modal if redirected from a protected route, then clean the URL
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("signin") === "1") {
        setModalMode("signin");
        setModalOpen(true);
        // Remove ?signin=1 from the URL without a navigation
        params.delete("signin");
        const newSearch = params.toString();
        const cleanUrl = window.location.pathname + (newSearch ? `?${newSearch}` : "");
        window.history.replaceState(null, "", cleanUrl);
      }
    }

    return () => subscription.unsubscribe();
  }, []);

  function openAuthModal(mode: "signin" | "signup" = "signin") {
    setModalMode(mode);
    setModalOpen(true);
  }

  return (
    <AuthContext.Provider value={{ user, loading, openAuthModal, closeAuthModal: () => setModalOpen(false) }}>
      {children}
      <AuthModal
        defaultMode={modalMode}
        onClose={() => setModalOpen(false)}
        open={modalOpen}
      />
    </AuthContext.Provider>
  );
}
