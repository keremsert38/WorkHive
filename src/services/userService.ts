import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserData } from '../context/AuthContext';

export interface CreateUserData {
    email: string;
    displayName: string;
    accountType: 'client' | 'freelancer';
    avatar?: string;
    expertise?: string | null;
    title?: string;
    bio?: string;
    phone?: string;
    rating?: number;
    verified: boolean;
    emailVerified?: boolean;
    createdAt: Date;
}

export const createUser = async (userId: string, userData: CreateUserData): Promise<void> => {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
    });
};

export const getUser = async (userId: string): Promise<UserData | null> => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        return null;
    }

    const data = userSnap.data();
    return {
        uid: userId,
        email: data.email,
        displayName: data.displayName,
        accountType: data.accountType,
        avatar: data.avatar,
        expertise: data.expertise,
        title: data.title,
        bio: data.bio,
        phone: data.phone,
        rating: data.rating,
        verified: data.verified,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    };
};

export const updateUser = async (userId: string, data: Partial<UserData>): Promise<void> => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data);
};
