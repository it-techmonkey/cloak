"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import AuthModal from "./AuthModal";

type AuthState = {
  user: User | null;
  loading: boolean;
  openAuthModal: (mode?: "signin" | "signup") => void;
  closeAuthModal: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  signOut: async () => {},
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
  const router = useRouter();

  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;

    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) setModalOpen(false);
    });

    // Validate session server-side, then check for ?signin=1 once we know auth state
    supabase.auth.getUser().then(({ data }) => {
      const currentUser = data.user ?? null;
      setUser(currentUser);
      setLoading(false);

      // Only open the modal if the user is NOT already signed in
      if (!currentUser && typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (params.get("signin") === "1") {
          setModalMode("signin");
          setModalOpen(true);
        }
      }

      // Always clean ?signin=1 from the URL
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (params.has("signin")) {
          params.delete("signin");
          const newSearch = params.toString();
          const cleanUrl = window.location.pathname + (newSearch ? `?${newSearch}` : "");
          window.history.replaceState(null, "", cleanUrl);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  function openAuthModal(mode: "signin" | "signup" = "signin") {
    setModalMode(mode);
    setModalOpen(true);
  }

  async function signOut() {
    const supabase = createClient();
    // Sign out client-side first — onAuthStateChange fires immediately,
    // clearing user state and updating all components before navigation
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      openAuthModal,
      closeAuthModal: () => setModalOpen(false),
      signOut,
    }}>
      {children}
      <AuthModal
        defaultMode={modalMode}
        onClose={() => setModalOpen(false)}
        open={modalOpen}
      />
    </AuthContext.Provider>
  );
}
