import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { ChevronLeft, Search, MoreHorizontal, Edit2 } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { getConversations, Conversation } from '../../services/messageService';

interface Props {
    navigation?: any;
    onConversationPress?: (conversationId: string, recipientName: string, recipientId: string) => void;
}

const MessagesScreen: React.FC<Props> = ({ navigation, onConversationPress }) => {
    const { user } = useAuth();
    const [activeFilter, setActiveFilter] = useState('all');
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    const filters = ['Tümü', 'Okunmamış', 'Siparişler', 'Projeler'];

    useEffect(() => {
        if (user?.uid) {
            loadConversations();
        }
    }, [user?.uid]);

    const loadConversations = async () => {
        if (!user?.uid) return;
        setLoading(true);
        try {
            const data = await getConversations(user.uid);
            setConversations(data);
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (date: Date): string => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return 'Dün';
        } else if (days < 7) {
            const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
            return dayNames[date.getDay()];
        } else {
            return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
        }
    };

    const getOtherParticipantId = (conv: Conversation): string => {
        if (!user?.uid) return '';
        return conv.participants.find(p => p !== user.uid) || '';
    };

    const getOtherParticipantName = (conv: Conversation): string => {
        if (!user?.uid) return 'Kullanıcı';
        const otherUserId = conv.participants.find(p => p !== user.uid);
        return otherUserId ? (conv.participantNames[otherUserId] || 'Kullanıcı') : 'Kullanıcı';
    };

    const handleConversationPress = (conv: Conversation) => {
        const recipientName = getOtherParticipantName(conv);
        const recipientId = getOtherParticipantId(conv);
        if (onConversationPress) {
            onConversationPress(conv.id, recipientName, recipientId);
        }
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
                        <TouchableOpacity>
                            <Search size={24} color={colors.textMuted} />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <MoreHorizontal size={24} color={colors.textMuted} />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                    {filters.map((filter, i) => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterButton,
                                (activeFilter === 'all' && i === 0) || activeFilter === filter
                                    ? styles.filterButtonActive
                                    : {},
                            ]}
                            onPress={() => setActiveFilter(i === 0 ? 'all' : filter)}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    (activeFilter === 'all' && i === 0) || activeFilter === filter
                                        ? styles.filterTextActive
                                        : {},
                                ]}
                            >
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Yükleniyor...</Text>
                </View>
            ) : conversations.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Henüz mesajınız yok</Text>
                    <Text style={styles.emptySubtext}>
                        Müşterilerle iletişime geçtiğinizde mesajlarınız burada görünecek
                    </Text>
                </View>
            ) : (
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {conversations.map((conv) => (
                        <TouchableOpacity key={conv.id} style={styles.chatItem} onPress={() => handleConversationPress(conv)}>
                            <View style={styles.avatarContainer}>
                                <Image
                                    source={{ uri: 'https://picsum.photos/seed/' + conv.id + '/100/100' }}
                                    style={styles.avatar}
                                />
                            </View>

                            <View style={styles.chatContent}>
                                <View style={styles.chatHeader}>
                                    <Text style={styles.chatName}>{getOtherParticipantName(conv)}</Text>
                                    <Text style={styles.chatTime}>{formatTime(conv.lastMessageAt)}</Text>
                                </View>

                                <Text style={styles.chatMessage} numberOfLines={1}>
                                    {conv.lastMessage || 'Henüz mesaj yok'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}


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
        paddingBottom: spacing.base,
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
    filterScroll: {
        marginBottom: 8,
    },
    filterButton: {
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: borderRadius.full,
        backgroundColor: '#F3F4F6',
        marginRight: 8,
    },
    filterButtonActive: {
        backgroundColor: colors.primary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    filterText: {
        fontSize: typography.sm,
        fontWeight: typography.bold,
        color: colors.textSecondary,
    },
    filterTextActive: {
        color: '#0F172A',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: typography.md,
        color: colors.textSecondary,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    },
    emptyText: {
        fontSize: typography.lg,
        fontWeight: typography.bold,
        color: '#1E293B',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: typography.sm,
        color: colors.textMuted,
        textAlign: 'center',
    },
    content: {
        flex: 1,
    },
    chatItem: {
        flexDirection: 'row',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        gap: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F9FAFB',
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 2,
        borderColor: colors.white,
    },
    chatContent: {
        flex: 1,
        justifyContent: 'center',
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    chatName: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: '#1E293B',
    },
    chatTime: {
        fontSize: typography.xs,
        color: colors.textMuted,
    },
    chatMessage: {
        fontSize: typography.sm,
        color: colors.textMuted,
    },
    fab: {
        position: 'absolute',
        bottom: 100,
        right: spacing.xl,
        width: 56,
        height: 56,
        backgroundColor: colors.primary,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
});

export default MessagesScreen;
