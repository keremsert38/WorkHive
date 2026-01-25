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
    Timestamp,
    deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface JobPosting {
    id: string;
    clientId: string;
    title: string;
    description: string;
    category: string;
    budget: number;
    deadline: Date;
    status: 'open' | 'in_progress' | 'completed' | 'cancelled';
    proposalCount: number;
    createdAt: Date;
}

export interface CreateJobData {
    clientId: string;
    title: string;
    description: string;
    category: string;
    budget: number;
    deadline: Date;
}

export const createJob = async (data: CreateJobData): Promise<string> => {
    const jobsRef = collection(db, 'job_postings');
    const docRef = await addDoc(jobsRef, {
        ...data,
        status: 'open',
        proposalCount: 0,
        createdAt: serverTimestamp(),
        deadline: Timestamp.fromDate(data.deadline),
    });
    return docRef.id;
};

export const getJobs = async (filters?: {
    clientId?: string;
    category?: string;
    status?: 'open' | 'in_progress' | 'completed' | 'cancelled';
    limitCount?: number;
}): Promise<JobPosting[]> => {
    const jobsRef = collection(db, 'job_postings');
    let q = query(jobsRef, orderBy('createdAt', 'desc'));

    if (filters?.clientId) {
        q = query(q, where('clientId', '==', filters.clientId));
    }
    if (filters?.category) {
        q = query(q, where('category', '==', filters.category));
    }
    if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
    } else if (!filters?.clientId) {
        // If listing all jobs (e.g. for freelancers), show only open ones by default unless specified
        q = query(q, where('status', '==', 'open'));
    }

    if (filters?.limitCount) {
        q = query(q, limit(filters.limitCount));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
            deadline: data.deadline instanceof Timestamp ? data.deadline.toDate() : new Date(),
        };
    }) as JobPosting[];
};

export const getJobById = async (id: string): Promise<JobPosting | null> => {
    const docRef = doc(db, 'job_postings', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        deadline: data.deadline instanceof Timestamp ? data.deadline.toDate() : new Date(),
    } as JobPosting;
};

export const updateJobStatus = async (id: string, status: JobPosting['status']): Promise<void> => {
    const docRef = doc(db, 'job_postings', id);
    await updateDoc(docRef, { status });
};

export const deleteJob = async (id: string): Promise<void> => {
    const docRef = doc(db, 'job_postings', id);
    await deleteDoc(docRef);
};
