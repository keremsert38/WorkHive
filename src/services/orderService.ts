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
    Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export type OrderStatus = 'pending' | 'active' | 'revision' | 'completed' | 'cancelled';

export interface Order {
    id: string;
    listingId: string;
    listingTitle: string;
    clientId: string;
    clientName: string;
    freelancerId: string;
    freelancerName: string;
    status: OrderStatus;
    price: number;
    deadline: Date;
    createdAt: Date;
}

export interface CreateOrderData {
    listingId: string;
    listingTitle: string;
    clientId: string;
    clientName: string;
    freelancerId: string;
    freelancerName: string;
    price: number;
    deadlineDays: number;
}

export const createOrder = async (data: CreateOrderData): Promise<string> => {
    const ordersRef = collection(db, 'orders');
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + data.deadlineDays);

    const docRef = await addDoc(ordersRef, {
        ...data,
        status: 'pending' as OrderStatus,
        deadline,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};

export const getOrdersByUser = async (
    userId: string,
    role: 'client' | 'freelancer'
): Promise<Order[]> => {
    const ordersRef = collection(db, 'orders');
    const fieldName = role === 'client' ? 'clientId' : 'freelancerId';

    const q = query(
        ordersRef,
        where(fieldName, '==', userId),
        orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            deadline: data.deadline instanceof Timestamp ? data.deadline.toDate() : new Date(),
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        } as Order;
    });
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
    const docRef = doc(db, 'orders', orderId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    return {
        id: docSnap.id,
        ...data,
        deadline: data.deadline instanceof Timestamp ? data.deadline.toDate() : new Date(),
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    } as Order;
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, { status });
};
