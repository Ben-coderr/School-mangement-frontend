'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/authContext';

export default function ProtectedRoute({
                                           children,
                                           allowedRoles = []
                                       }: {
    children: React.ReactNode,
    allowedRoles?: string[]
}) {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/sign-in');
        } else if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role!)) {
            router.push('/unauthorized');
        }
    }, [isAuthenticated, user?.role, router]);

    return isAuthenticated ? children : null;
}