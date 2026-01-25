import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Listing {
    id: string;
    userId: string;
    title: string;
    description: string;
    category: string;
    price: number;
    images: string[];
    isActive: boolean;
    rating: number;
    reviewCount: number;
    createdAt: Date;
}

export interface CreateListingData {
    userId: string;
    title: string;
    description: string;
    category: string;
    price: number;
    images?: string[];
}

export const getListings = async (filters?: {
    category?: string;
    userId?: string;
    isActive?: boolean;
    limitCount?: number;
}): Promise<Listing[]> => {
    const listingsRef = collection(db, 'listings');
    let q = query(listingsRef, orderBy('createdAt', 'desc'));

    if (filters?.category) {
        q = query(q, where('category', '==', filters.category));
    }
    if (filters?.userId) {
        q = query(q, where('userId', '==', filters.userId));
    }
    if (filters?.isActive !== undefined) {
        q = query(q, where('isActive', '==', filters.isActive));
    }
    if (filters?.limitCount) {
        q = query(q, limit(filters.limitCount));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt instanceof Timestamp
            ? doc.data().createdAt.toDate()
            : new Date(),
    })) as Listing[];
};

export const getListingById = async (id: string): Promise<Listing | null> => {
    const docRef = doc(db, 'listings', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    } as Listing;
};

export const createListing = async (data: CreateListingData): Promise<string> => {
    const listingsRef = collection(db, 'listings');
    const docRef = await addDoc(listingsRef, {
        ...data,
        images: data.images || [],
        isActive: true,
        rating: 0,
        reviewCount: 0,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};

export const updateListing = async (id: string, data: Partial<Listing>): Promise<void> => {
    const docRef = doc(db, 'listings', id);
    await updateDoc(docRef, data);
};

export const toggleListingStatus = async (id: string, isActive: boolean): Promise<void> => {
    const docRef = doc(db, 'listings', id);
    await updateDoc(docRef, { isActive });
};
