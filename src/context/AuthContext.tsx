import { createContext, useState, useEffect, useContext, useCallback, useMemo } from "react";
import { supabase } from "../lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    setIsAuthenticated: (auth: boolean) => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe usarse dentro de un AuthProvider");
    }
    return context;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsAuthenticated(!!session);
            setIsLoading(false);
        }).catch(() => {
            setIsLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsAuthenticated(!!session);
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const logout = useCallback(async () => {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("auth-token");
        localStorage.removeItem("user-name");
    }, []);

    const contextValue = useMemo(() => ({
        isAuthenticated,
        user,
        session,
        isLoading,
        setIsAuthenticated,
        logout,
    }), [isAuthenticated, user, session, isLoading, logout]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
