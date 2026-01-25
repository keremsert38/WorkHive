import { db } from '../config/firebase';
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ServiceListing } from './freelancerService';
import { UserData } from '../context/AuthContext';

export type { ServiceListing };

// ... (SearchFilters interface and searchFreelancers function remain same)

// ... (getFreelancerDetails function remains same)

// Yeni İş İsteği Oluştur
// Yeni İş İsteği Oluştur
export const createJobRequest = async (
    clientId: string,
    clientName: string,
    freelancerId: string,
    serviceId: string | null,
    jobData: {
        title: string;
        description: string;
        price: number;
        deliveryTime: number;
    }
): Promise<string> => {
    try {
        const requestData = {
            clientId,
            clientName,
            freelancerId,
            serviceId, // Can be null for direct offers
            title: jobData.title,
            description: jobData.description,
            offeredPrice: jobData.price,
            deliveryTime: jobData.deliveryTime,
            status: 'pending',
            createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, 'job_requests'), requestData);
        return docRef.id;
    } catch (error) {
        console.error('Error creating job request:', error);
        throw error;
    }
};

export interface FreelancerProfile extends UserData {
    listings: ServiceListing[];
}

// Freelancer arama filtreleri
export interface SearchFilters {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
}

// Freelancer Arama
export const searchFreelancers = async (searchQuery: string, filters?: SearchFilters): Promise<ServiceListing[]> => {
    try {
        const listingsRef = collection(db, 'listings');
        let q = query(listingsRef, where('isActive', '==', true));

        // Not: Firestore'da birden fazla alanı aynı anda filtrelemek (özellikle aralık sorguları) için bileşik index gerekir.
        // Bu örnekte basit filtreleme yapıp, detaylı filtrelemeyi client-side yapacağız.

        if (filters?.category) {
            q = query(q, where('category', '==', filters.category));
        }

        const querySnapshot = await getDocs(q);
        let listings: ServiceListing[] = [];

        querySnapshot.forEach((doc) => {
            listings.push({ id: doc.id, ...doc.data() } as ServiceListing);
        });

        // Client-side filtering
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            listings = listings.filter(l =>
                l.title.toLowerCase().includes(lowerQuery) ||
                l.description.toLowerCase().includes(lowerQuery)
            );
        }

        if (filters?.minPrice) {
            listings = listings.filter(l => l.price >= (filters.minPrice || 0));
        }
        if (filters?.maxPrice) {
            listings = listings.filter(l => l.price <= (filters.maxPrice || Infinity));
        }

        return listings;
    } catch (error) {
        console.error('Error searching freelancers:', error);
        return [];
    }
};

// Freelancer Detaylarını Getir (Kullanıcı verisi + İlanlar)
export const getFreelancerDetails = async (freelancerId: string): Promise<FreelancerProfile | null> => {
    try {
        // Kullanıcı verisini al
        const userDocRef = doc(db, 'users', freelancerId);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) return null;

        const userData = { uid: userDoc.id, ...userDoc.data() } as UserData;

        // Freelancer'ın ilanlarını al
        const listingsRef = collection(db, 'listings');
        const q = query(listingsRef, where('freelancerId', '==', freelancerId), where('isActive', '==', true));
        const listingsSnapshot = await getDocs(q);
        const listings: ServiceListing[] = [];

        listingsSnapshot.forEach((doc) => {
            listings.push({ id: doc.id, ...doc.data() } as ServiceListing);
        });

        return {
            ...userData,
            listings
        };
    } catch (error) {
        console.error('Error getting freelancer details:', error);
        return null;
    }
};

// Müşteri İşlerini Getir
export const getClientJobs = async (clientId: string): Promise<any[]> => {
    try {
        const jobsRef = collection(db, 'jobs');
        const q = query(jobsRef, where('clientId', '==', clientId), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting client jobs:', error);
        return [];
    }
};

// İş Tamamlama (Müşteri Onayı)
export const completeJob = async (jobId: string): Promise<void> => {
    const jobRef = doc(db, 'jobs', jobId);
    await updateDoc(jobRef, {
        status: 'completed',
        updatedAt: serverTimestamp(),
    });
};
