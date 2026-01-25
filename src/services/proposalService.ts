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
    serverTimestamp,
    Timestamp,
    increment
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserData } from '../context/AuthContext';

export interface Proposal {
    id: string;
    jobId: string;
    freelancerId: string;
    price: number;
    coverLetter: string;
    duration: string;
    status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
    createdAt: Date;
    freelancer?: UserData; // Helper for UI
}

export interface CreateProposalData {
    jobId: string;
    freelancerId: string;
    price: number;
    coverLetter: string;
    duration: string;
}

export const createProposal = async (data: CreateProposalData): Promise<string> => {
    const proposalsRef = collection(db, 'proposals');
    const docRef = await addDoc(proposalsRef, {
        ...data,
        status: 'pending',
        createdAt: serverTimestamp(),
    });

    // Increment proposal count on the job
    const jobRef = doc(db, 'job_postings', data.jobId);
    await updateDoc(jobRef, {
        proposalCount: increment(1)
    });

    return docRef.id;
};

export const getProposalsForJob = async (jobId: string): Promise<Proposal[]> => {
    const proposalsRef = collection(db, 'proposals');
    const q = query(proposalsRef, where('jobId', '==', jobId), orderBy('createdAt', 'desc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt instanceof Timestamp ? doc.data().createdAt.toDate() : new Date(),
    })) as Proposal[];
};

export const getProposalsByFreelancer = async (freelancerId: string): Promise<Proposal[]> => {
    const proposalsRef = collection(db, 'proposals');
    const q = query(proposalsRef, where('freelancerId', '==', freelancerId), orderBy('createdAt', 'desc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt instanceof Timestamp ? doc.data().createdAt.toDate() : new Date(),
    })) as Proposal[];
};

export const updateProposalStatus = async (id: string, status: Proposal['status']): Promise<void> => {
    const docRef = doc(db, 'proposals', id);
    await updateDoc(docRef, { status });
};
