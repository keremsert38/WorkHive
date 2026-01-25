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
    onSnapshot,
    Unsubscribe
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Message {
    id: string;
    senderId: string;
    text: string;
    imageUrl?: string;
    createdAt: Date;
}

export interface Conversation {
    id: string;
    participants: string[];
    participantNames: { [key: string]: string };
    lastMessage: string;
    lastMessageAt: Date;
    unreadCounts: { [key: string]: number };
}

export const getConversations = async (userId: string): Promise<Conversation[]> => {
    const conversationsRef = collection(db, 'conversations');
    const q = query(
        conversationsRef,
        where('participants', 'array-contains', userId),
        orderBy('lastMessageAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const conversations: Conversation[] = [];

    for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        let participantNames = data.participantNames || {};
        let needsUpdate = false;

        // Check if we have names for all participants
        for (const participantId of data.participants) {
            // Check if name is missing, generic 'Kullanıcı', or 'İşveren'
            if (!participantNames[participantId] ||
                participantNames[participantId] === 'Kullanıcı' ||
                participantNames[participantId] === 'İşveren' ||
                participantNames[participantId] === 'Freelancer') {
                try {
                    const userDoc = await getDoc(doc(db, 'users', participantId));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        participantNames[participantId] = userData.displayName || 'İsimsiz Kullanıcı';
                        needsUpdate = true;
                    }
                } catch (error) {
                    console.error(`Error fetching user ${participantId}:`, error);
                }
            }
        }

        // Update conversation if names were missing
        if (needsUpdate) {
            try {
                await updateDoc(doc(db, 'conversations', docSnapshot.id), {
                    participantNames: participantNames
                });
            } catch (error) {
                console.error('Error updating conversation names:', error);
            }
        }

        conversations.push({
            id: docSnapshot.id,
            ...data,
            participantNames, // Use the updated names
            lastMessageAt: data.lastMessageAt instanceof Timestamp
                ? data.lastMessageAt.toDate()
                : new Date(),
            unreadCount: data.unreadCounts?.[userId] || 0,
        } as Conversation);
    }

    return conversations;
};

export const getMessages = async (conversationId: string): Promise<Message[]> => {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        } as Message;
    });
};

export const subscribeToMessages = (
    conversationId: string,
    callback: (messages: Message[]) => void
): Unsubscribe => {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
            } as Message;
        });
        callback(messages);
    });
};

export const sendMessage = async (
    conversationId: string,
    senderId: string,
    text: string,
    imageUrl?: string
): Promise<string> => {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const messageData: any = {
        senderId,
        text,
        createdAt: serverTimestamp(),
    };

    if (imageUrl) {
        messageData.imageUrl = imageUrl;
    }

    const docRef = await addDoc(messagesRef, messageData);

    // Update conversation's last message and increment unread count for recipient
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationSnap = await getDoc(conversationRef);
    const conversationData = conversationSnap.data();

    // Find recipient (participant who is not sender)
    const recipientId = conversationData?.participants.find((p: string) => p !== senderId);

    const updates: any = {
        lastMessage: imageUrl ? '📷 Fotoğraf' : text,
        lastMessageAt: serverTimestamp(),
    };

    if (recipientId) {
        const currentUnread = conversationData?.unreadCounts?.[recipientId] || 0;
        updates[`unreadCounts.${recipientId}`] = currentUnread + 1;
    }

    await updateDoc(conversationRef, updates);

    return docRef.id;
};

export const markConversationAsRead = async (conversationId: string, userId: string): Promise<void> => {
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
        [`unreadCounts.${userId}`]: 0
    });
};

export const subscribeToTotalUnreadCount = (
    userId: string,
    callback: (count: number) => void
): Unsubscribe => {
    const conversationsRef = collection(db, 'conversations');
    const q = query(
        conversationsRef,
        where('participants', 'array-contains', userId)
    );

    return onSnapshot(q, (snapshot) => {
        let totalUnread = 0;
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            totalUnread += data.unreadCounts?.[userId] || 0;
        });
        callback(totalUnread);
    });
};

export const createConversation = async (
    participants: string[],
    participantNames: { [key: string]: string }
): Promise<string> => {
    const conversationsRef = collection(db, 'conversations');
    const docRef = await addDoc(conversationsRef, {
        participants,
        participantNames,
        lastMessage: '',
        lastMessageAt: serverTimestamp(),
        unreadCounts: {
            [participants[0]]: 0,
            [participants[1]]: 0
        }
    });
    return docRef.id;
};

export const getOrCreateConversation = async (
    userId1: string,
    userId2: string,
    userName1: string,
    userName2: string
): Promise<string> => {
    const conversationsRef = collection(db, 'conversations');

    // Check if conversation exists
    const q = query(
        conversationsRef,
        where('participants', 'array-contains', userId1)
    );

    const snapshot = await getDocs(q);
    const existing = snapshot.docs.find(doc =>
        doc.data().participants.includes(userId2)
    );

    if (existing) {
        return existing.id;
    }

    // Create new conversation
    return createConversation(
        [userId1, userId2],
        { [userId1]: userName1, [userId2]: userName2 }
    );
};
