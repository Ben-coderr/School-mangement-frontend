'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

type User = {
    id: string;
    username: string;
    fullName: string;
    role: 'ADMIN' | 'TEACHER' | 'PARENT' | 'STUDENT';
};

interface AuthContextType {
    user: User | null;
    login: (credentials: { username: string; password: string }, rememberMe: boolean) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const token = localStorage.getItem(process.env.NEXT_PUBLIC_JWT_STORAGE_KEY!) ||
                    sessionStorage.getItem(process.env.NEXT_PUBLIC_JWT_STORAGE_KEY!);

                if (token) {
                    const { data } = await api.get('/auth/me');
                    setUser(data);
                }
            } catch (error) {
                console.error('Auth verification failed:', error);
                logout();
            }
        };
        verifyAuth();
    }, []);

    const login = async (credentials: { username: string; password: string }, rememberMe: boolean) => {
        try {
            const { data } = await api.post('/auth/login', credentials);

            if (rememberMe) {
                localStorage.setItem(process.env.NEXT_PUBLIC_JWT_STORAGE_KEY!, data.token);
            } else {
                sessionStorage.setItem(process.env.NEXT_PUBLIC_JWT_STORAGE_KEY!, data.token);
            }

            const userData = JSON.parse(atob(data.token.split('.')[1]));
            setUser(userData);
            router.push('/list/students');
            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem(process.env.NEXT_PUBLIC_JWT_STORAGE_KEY!);
        sessionStorage.removeItem(process.env.NEXT_PUBLIC_JWT_STORAGE_KEY!);
        setUser(null);
        router.push('/sign-in');
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);