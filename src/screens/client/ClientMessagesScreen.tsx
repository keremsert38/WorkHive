import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { ChevronLeft, Search, SlidersHorizontal, Edit2, MessageSquare, CheckCircle, Clock } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
// import { useFocusEffect } from '@react-navigation/native';
import { getConversations } from '../../services/messageService';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface Props {
    navigation?: any;
    onConversationPress?: (conversationId: string, recipientName: string, recipientId: string) => void;
}

const ClientMessagesScreen: React.FC<Props> = ({ navigation, onConversationPress }) => {
    const { user } = useAuth();
    const [activeFilter, setActiveFilter] = useState('Tümü');
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        if (user) {
            loadConversations();
        }
    }, [user]);

    const loadConversations = async () => {
        try {
            setLoading(true);
            const data = await getConversations(user!.uid);
            setConversations(data);
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConversationPress = (conv: any) => {
        const otherParticipantId = conv.participants.find((p: string) => p !== user?.uid);
        const otherParticipantName = conv.participantNames[otherParticipantId] || 'Kullanıcı';

        if (onConversationPress) {
            onConversationPress(conv.id, otherParticipantName, otherParticipantId || '');
        }
    };

    const filters = ['Tümü', 'Okunmamış', 'Teklifler', 'Aktif İşler'];

    const getStatusStyle = (status: string) => {
        // ... existing status styles or remove if unused
        return { bg: colors.background, color: colors.textMuted };
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation?.goBack()}>
                        <ChevronLeft size={28} color="#1E293B" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Mesajlarım</Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.iconButton}>
                            <Search size={22} color="#1E293B" />
                        </TouchableOpacity>
                    </View>
                </View>

            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                        <Text>Yükleniyor...</Text>
                    </View>
                ) : conversations.length === 0 ? (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                        <Text style={{ color: colors.textMuted }}>Henüz mesajınız yok.</Text>
                    </View>
                ) : (
                    conversations.map((conv) => {
                        const otherParticipantId = conv.participants.find((p: string) => p !== user?.uid);
                        const name = conv.participantNames[otherParticipantId] || 'Kullanıcı';
                        const time = conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

                        return (
                            <TouchableOpacity key={conv.id} style={styles.messageItem} onPress={() => handleConversationPress(conv)}>
                                <View style={styles.avatarContainer}>
                                    <View style={[styles.avatar, { backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' }]}>
                                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#64748B' }}>
                                            {name.charAt(0)}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.messageContent}>
                                    <View style={styles.messageHeader}>
                                        <Text style={styles.messageName} numberOfLines={1}>{name}</Text>
                                        <Text style={styles.messageTime}>{time}</Text>
                                    </View>

                                    <Text style={[styles.messageText]} numberOfLines={1}>
                                        {conv.lastMessage || 'Dosya gönderildi'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>


        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    header: {
        paddingTop: spacing['2xl'],
        paddingHorizontal: spacing.xl,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
    },
    headerTitle: {
        fontSize: typography['2xl'],
        fontWeight: typography.black,
        color: '#1E293B',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 16,
    },
    iconButton: {
        width: 40,
        height: 40,
        backgroundColor: colors.background,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterScroll: {
        borderBottomWidth: 1,
        borderBottomColor: '#F9FAFB',
    },
    filterButton: {
        paddingBottom: 16,
        paddingHorizontal: 8,
        marginRight: 16,
        position: 'relative',
    },
    filterText: {
        fontSize: typography.sm,
        fontWeight: typography.black,
        color: colors.textMuted,
    },
    filterTextActive: {
        color: colors.secondary,
    },
    filterDot: {
        position: 'absolute',
        top: 0,
        right: -4,
        width: 8,
        height: 8,
        backgroundColor: colors.primary,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.white,
    },
    filterUnderline: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: colors.secondary,
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
    },
    content: {
        flex: 1,
    },
    messageItem: {
        flexDirection: 'row',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.xl,
        gap: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F9FAFB',
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: colors.white,
    },
    onlineDot: {
        position: 'absolute',
        bottom: 0,
        right: 2,
        width: 16,
        height: 16,
        backgroundColor: colors.success,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: colors.white,
    },
    messageContent: {
        flex: 1,
    },
    messageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    messageName: {
        flex: 1,
        fontSize: typography.md,
        fontWeight: typography.black,
        color: '#0F172A',
        paddingRight: 16,
    },
    messageTime: {
        fontSize: 11,
        fontWeight: typography.bold,
        color: colors.textLight,
    },
    messageText: {
        fontSize: typography.sm,
        color: colors.textMuted,
        fontWeight: typography.medium,
        marginBottom: 12,
    },
    messageTextUnread: {
        color: '#1E293B',
        fontWeight: typography.bold,
    },
    messageFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 6,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 9,
        fontWeight: typography.black,
        letterSpacing: -0.5,
    },
    unreadDot: {
        width: 12,
        height: 12,
        backgroundColor: colors.primary,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: colors.white,
    },
    fab: {
        position: 'absolute',
        bottom: 100,
        right: spacing.xl,
        width: 56,
        height: 56,
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.secondary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
});

export default ClientMessagesScreen;
