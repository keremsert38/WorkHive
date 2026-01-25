import {
    collection,
    doc,
    getDocs,
    addDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Listing } from './listingService';

export interface Favorite {
    id: string;
    userId: string;
    listingId: string;
    createdAt: Date;
}

export const getFavorites = async (userId: string): Promise<Favorite[]> => {
    const favoritesRef = collection(db, 'favorites');
    const q = query(favoritesRef, where('userId', '==', userId));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        } as Favorite;
    });
};

export const addFavorite = async (userId: string, listingId: string): Promise<string> => {
    const favoritesRef = collection(db, 'favorites');

    // Check if already favorited
    const q = query(
        favoritesRef,
        where('userId', '==', userId),
        where('listingId', '==', listingId)
    );
    const existing = await getDocs(q);

    if (!existing.empty) {
        return existing.docs[0].id;
    }

    const docRef = await addDoc(favoritesRef, {
        userId,
        listingId,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};

export const removeFavorite = async (userId: string, listingId: string): Promise<void> => {
    const favoritesRef = collection(db, 'favorites');
    const q = query(
        favoritesRef,
        where('userId', '==', userId),
        where('listingId', '==', listingId)
    );

    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
};

export const isFavorite = async (userId: string, listingId: string): Promise<boolean> => {
    const favoritesRef = collection(db, 'favorites');
    const q = query(
        favoritesRef,
        where('userId', '==', userId),
        where('listingId', '==', listingId)
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty;
};
