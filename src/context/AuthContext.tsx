import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getUser } from '../services/userService';

export interface UserData {
    uid: string;
    email: string;
    displayName: string;
    accountType: 'client' | 'freelancer';
    avatar?: string;
    expertise?: string;
    title?: string;
    bio?: string;
    phone?: string;
    rating?: number;
    verified: boolean;
    createdAt: Date;
}

interface AuthContextType {
    user: User | null;
    userData: UserData | null;
    loading: boolean;
    setUserData: (data: UserData | null) => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userData: null,
    loading: true,
    setUserData: () => { },
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                try {
                    const data = await getUser(firebaseUser.uid);
                    setUserData(data);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            } else {
                setUserData(null);
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{ user, userData, loading, setUserData }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
