import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Types
export interface FreelancerStats {
    totalEarnings: number;
    activeJobs: number;
    rating: number;
    completedJobs: number;
    chartData?: { name: string; value: number }[];
}

export interface Job {
    id: string;
    title: string;
    description: string;
    clientId: string;
    clientName: string;
    freelancerId: string;
    status: 'pending' | 'active' | 'completed' | 'cancelled';
    price: number;
    progress: number;
    deadline: Date;
    icon: string;
    createdAt: Date;
}

export interface ServiceListing {
    id: string;
    freelancerId: string;
    title: string;
    description: string;
    price: number;
    category: string;
    subCategory: string;
    deliveryTime: number; // in days
    features: string[];
    imageUrl: string;
    isActive: boolean;
    createdAt: Date;
}

export interface JobRequest {
    id: string;
    clientId: string;
    clientName: string;
    freelancerId: string;
    title: string;
    description: string;
    offeredPrice: number;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: Date;
}

// Get freelancer stats
export const getFreelancerStats = async (userId: string): Promise<FreelancerStats> => {
    try {
        // Get user document for rating
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists() ? userSnap.data() : {};

        // Get active jobs count
        const jobsQuery = query(
            collection(db, 'jobs'),
            where('freelancerId', '==', userId),
            where('status', '==', 'active')
        );
        const activeJobsSnap = await getDocs(jobsQuery);

        // Get completed jobs for earnings
        const completedJobsQuery = query(
            collection(db, 'jobs'),
            where('freelancerId', '==', userId),
            where('status', '==', 'completed')
        );
        const completedJobsSnap = await getDocs(completedJobsQuery);

        let totalEarnings = 0;
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Initialize chart data for last 7 days
        const chartData = Array(7).fill(0).map((_, i) => {
            const d = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
            const dayName = d.toLocaleDateString('tr-TR', { weekday: 'short' });
            return { name: dayName, value: 0, date: d.toISOString().split('T')[0] };
        });

        completedJobsSnap.forEach(doc => {
            const data = doc.data();
            const price = data.price || 0;
            totalEarnings += price;

            // Add to chart if within last week
            if (data.completedAt) {
                const completedDate = data.completedAt instanceof Timestamp
                    ? data.completedAt.toDate()
                    : new Date(data.completedAt);

                if (completedDate >= oneWeekAgo) {
                    const dateStr = completedDate.toISOString().split('T')[0];
                    const dayIndex = chartData.findIndex(d => d.date === dateStr);
                    if (dayIndex !== -1) {
                        chartData[dayIndex].value += price;
                    }
                }
            }
        });

        return {
            totalEarnings,
            activeJobs: activeJobsSnap.size,
            rating: userData.rating || 0,
            completedJobs: completedJobsSnap.size,
            chartData: chartData.map(({ name, value }) => ({ name, value }))
        };
    } catch (error) {
        console.error('Error getting freelancer stats:', error);
        return {
            totalEarnings: 0,
            activeJobs: 0,
            rating: 0,
            completedJobs: 0,
            chartData: []
        };
    }
};

// Get freelancer jobs
export const getFreelancerJobs = async (
    userId: string,
    status?: 'pending' | 'active' | 'completed' | 'delivered'
): Promise<Job[]> => {
    try {
        let jobsQuery;
        if (status) {
            jobsQuery = query(
                collection(db, 'jobs'),
                where('freelancerId', '==', userId),
                where('status', '==', status),
                orderBy('createdAt', 'desc')
            );
        } else {
            jobsQuery = query(
                collection(db, 'jobs'),
                where('freelancerId', '==', userId),
                orderBy('createdAt', 'desc')
            );
        }

        const snapshot = await getDocs(jobsQuery);
        const jobs: Job[] = [];

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            jobs.push({
                id: docSnap.id,
                title: data.title,
                description: data.description,
                clientId: data.clientId,
                clientName: data.clientName,
                freelancerId: data.freelancerId,
                status: data.status,
                price: data.price,
                progress: data.progress || 0,
                deadline: data.deadline instanceof Timestamp ? data.deadline.toDate() : new Date(data.deadline),
                icon: data.icon || '📋',
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
            });
        });

        return jobs;
    } catch (error) {
        console.error('Error getting freelancer jobs:', error);
        return [];
    }
};

// Get pending job requests
export const getJobRequests = async (userId: string): Promise<JobRequest[]> => {
    try {
        const requestsQuery = query(
            collection(db, 'job_requests'),
            where('freelancerId', '==', userId),
            where('status', '==', 'pending'),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(requestsQuery);
        const requests: JobRequest[] = [];

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            requests.push({
                id: docSnap.id,
                clientId: data.clientId,
                clientName: data.clientName,
                freelancerId: data.freelancerId,
                title: data.title,
                description: data.description,
                offeredPrice: data.offeredPrice,
                status: data.status,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
            });
        });

        return requests;
    } catch (error) {
        console.error('Error getting job requests:', error);
        return [];
    }
};

// Get freelancer service listings
export const getFreelancerListings = async (userId: string): Promise<ServiceListing[]> => {
    try {
        const listingsQuery = query(
            collection(db, 'listings'),
            where('freelancerId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(listingsQuery);
        const listings: ServiceListing[] = [];

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            listings.push({
                id: docSnap.id,
                freelancerId: data.freelancerId,
                title: data.title,
                description: data.description,
                price: data.price,
                category: data.category,
                subCategory: data.subCategory || '',
                deliveryTime: data.deliveryTime || 3,
                features: data.features || [],
                imageUrl: data.imageUrl || 'https://picsum.photos/seed/listing/150/100',
                isActive: data.isActive ?? true,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
            });
        });

        return listings;
    } catch (error) {
        console.error('Error getting freelancer listings:', error);
        return [];
    }
};

// Create a new service listing
export const createListing = async (
    userId: string,
    data: Omit<ServiceListing, 'id' | 'freelancerId' | 'createdAt'>
): Promise<string> => {
    const docRef = await addDoc(collection(db, 'listings'), {
        freelancerId: userId,
        ...data,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};

// Toggle listing status
export const toggleListingStatus = async (listingId: string, isActive: boolean): Promise<void> => {
    const listingRef = doc(db, 'listings', listingId);
    await updateDoc(listingRef, { isActive });
};

// Update job progress
export const updateJobProgress = async (jobId: string, progress: number): Promise<void> => {
    const jobRef = doc(db, 'jobs', jobId);
    await updateDoc(jobRef, { progress });
};

// Accept or reject job request
export const respondToJobRequest = async (
    requestId: string,
    accept: boolean,
    freelancerId: string
): Promise<void> => {
    const requestRef = doc(db, 'job_requests', requestId);
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists()) {
        throw new Error('Request not found');
    }

    const requestData = requestSnap.data();

    if (accept) {
        // Create a new job from the request
        await addDoc(collection(db, 'jobs'), {
            title: requestData.title,
            description: requestData.description,
            clientId: requestData.clientId,
            clientName: requestData.clientName,
            freelancerId: freelancerId,
            status: 'active',
            price: requestData.offeredPrice,
            progress: 0,
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            icon: '📋',
            createdAt: serverTimestamp(),
        });

        await updateDoc(requestRef, { status: 'accepted' });
    } else {
        await updateDoc(requestRef, { status: 'rejected' });
    }
};

// Update a service listing
export const updateListing = async (
    listingId: string,
    data: Partial<Omit<ServiceListing, 'id' | 'freelancerId' | 'createdAt'>>
): Promise<void> => {
    const listingRef = doc(db, 'listings', listingId);
    await updateDoc(listingRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
};

// Delete a service listing
export const deleteListing = async (listingId: string): Promise<void> => {
    const listingRef = doc(db, 'listings', listingId);
    await deleteDoc(listingRef);
};
