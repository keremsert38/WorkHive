import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
// import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { getClientJobs, completeJob } from '../../services/clientService';
import { ChevronLeft, Search, Clock, ChevronRight, CheckCircle, RotateCcw } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface Props {
    navigation?: any;
}

const ClientOrdersScreen: React.FC<Props> = ({ navigation }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'ongoing' | 'completed'>('ongoing');
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // usage of useFocusEffect crashes without NavigationContainer. 
    // Since we unmount/remount screens in App.tsx manually, useEffect is sufficient.
    React.useEffect(() => {
        loadOrders();
    }, [user]);

    const loadOrders = async () => {
        if (!user) return;
        setLoading(true);
        // Fetch all and filter client side for now to avoid multiple reads or complex indexes
        const allOrders = await getClientJobs(user.uid);
        setOrders(allOrders);
        setLoading(false);
    };

    const ongoingOrders = orders.filter(o => ['pending', 'in_progress', 'active', 'delivered'].includes(o.status));
    const completedOrders = orders.filter(o => ['completed', 'cancelled'].includes(o.status));

    const handleCompleteJob = async (jobId: string) => {
        try {
            await completeJob(jobId);
            // Refresh orders
            loadOrders();
        } catch (error) {
            console.error('Error completing job:', error);
        }
    };

    const activeTabParams = activeTab === 'ongoing' ? ongoingOrders : completedOrders;

    const renderOrderCard = (item: any) => (
        <TouchableOpacity key={item.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <View style={styles.orderUser}>
                    <View style={[styles.userInitials, { backgroundColor: colors.primaryLight }]}>
                        <Text style={[styles.userInitialsText, { color: colors.primary }]}>
                            {item.freelancerId ? 'FR' : 'U'}
                        </Text>
                    </View>
                    <Text style={styles.userName}>Freelancer #{item.freelancerId.substring(0, 5)}</Text>
                </View>
                <Text style={styles.orderId}>#{item.id.substring(0, 8)}</Text>
            </View>
            <View style={styles.orderContent}>
                <Image source={{ uri: 'https://picsum.photos/200/200' }} style={styles.orderImage} />
                <View style={styles.orderInfo}>
                    <Text style={styles.orderTitle}>{item.title}</Text>
                    <View style={styles.orderTime}>
                        <Clock size={14} color={colors.primary} />
                        <Text style={styles.orderTimeText}>Teslim: {item.deliveryTime} Gün</Text>
                    </View>
                </View>
            </View>
            <View style={styles.orderFooter}>
                <View style={[styles.statusBadge, item.status === 'completed' && { backgroundColor: colors.successLight }, item.status === 'delivered' && { backgroundColor: '#FEF3C7' }]}>
                    <Text style={[styles.statusText, item.status === 'completed' && { color: colors.success }, item.status === 'delivered' && { color: colors.warning }]}>
                        {item.status === 'delivered' ? 'ONAY BEKLİYOR' : item.status.toUpperCase()}
                    </Text>
                </View>

                {item.status === 'delivered' ? (
                    <TouchableOpacity
                        style={styles.completeButton}
                        onPress={() => handleCompleteJob(item.id)}
                    >
                        <CheckCircle size={16} color={colors.white} />
                        <Text style={styles.completeButtonText}>Onayla</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.detailButton}>
                        <ChevronRight size={20} color="#1E293B" />
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation?.goBack()}>
                        <ChevronLeft size={28} color="#1E293B" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Siparişlerim</Text>
                    <View style={{ width: 28 }} />
                </View>

                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'ongoing' && styles.tabActive]}
                        onPress={() => setActiveTab('ongoing')}
                    >
                        <Text style={[styles.tabText, activeTab === 'ongoing' && styles.tabTextActive]}>
                            Devam Edenler ({ongoingOrders.length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
                        onPress={() => setActiveTab('completed')}
                    >
                        <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
                            Tamamlananlar ({completedOrders.length})
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
                ) : activeTabParams.length > 0 ? (
                    activeTabParams.map(renderOrderCard)
                ) : (
                    <View style={{ alignItems: 'center', marginTop: 40 }}>
                        <Text style={{ color: colors.textMuted }}>Sipariş bulunamadı.</Text>
                    </View>
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
    headerContainer: {
        backgroundColor: colors.white,
        paddingTop: spacing['2xl'],
        paddingHorizontal: spacing.xl,
        zIndex: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
    },
    headerTitle: {
        fontSize: typography.xl,
        fontWeight: typography.black,
        color: '#1E293B',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        padding: 6,
        borderRadius: borderRadius.xl,
        marginBottom: spacing.xl,
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderRadius: 12,
    },
    tabActive: {
        backgroundColor: colors.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontSize: typography.sm,
        fontWeight: typography.black,
        color: colors.textMuted,
    },
    tabTextActive: {
        color: colors.primary,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.xl,
    },
    orderCard: {
        backgroundColor: colors.white,
        padding: spacing.lg,
        borderRadius: borderRadius['5xl'],
        borderWidth: 1,
        borderColor: '#F3F4F6',
        marginBottom: spacing.base,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    orderHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.base,
    },
    orderUser: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    userInitials: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userInitialsText: {
        fontSize: typography.sm,
        fontWeight: typography.bold,
    },
    userName: {
        fontSize: typography.md,
        fontWeight: typography.black,
        color: '#1E293B',
    },
    orderId: {
        fontSize: 10,
        fontWeight: typography.black,
        color: colors.textLight,
    },
    orderContent: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: spacing.base,
    },
    orderImage: {
        width: 96,
        height: 96,
        borderRadius: borderRadius['3xl'],
    },
    orderInfo: {
        flex: 1,
        justifyContent: 'center',
        gap: 8,
    },
    orderTitle: {
        fontSize: typography.md,
        fontWeight: typography.black,
        color: '#0F172A',
    },
    orderTime: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    orderTimeText: {
        fontSize: typography.xs,
        fontWeight: typography.bold,
        color: colors.primary,
    },
    orderFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 8,
    },
    statusBadge: {
        backgroundColor: colors.primaryLight,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: borderRadius.xl,
    },
    statusText: {
        fontSize: 10,
        fontWeight: typography.black,
        color: colors.primary,
    },
    detailButton: {
        width: 40,
        height: 40,
        backgroundColor: colors.background,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingVertical: spacing.xl,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#F3F4F6',
    },
    dividerText: {
        fontSize: 10,
        fontWeight: typography.black,
        color: colors.textLight,
        letterSpacing: 2,
    },
    deliveredText: {
        fontSize: 10,
        fontWeight: typography.bold,
        color: colors.textMuted,
        fontStyle: 'italic',
    },
    completedActions: {
        flexDirection: 'row',
        gap: 12,
        paddingTop: 8,
    },
    completedBadge: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: colors.successLight,
        paddingVertical: 16,
        borderRadius: borderRadius.xl,
    },
    completedText: {
        fontSize: 11,
        fontWeight: typography.black,
        color: colors.success,
    },
    reorderBadge: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: colors.primaryLight,
        paddingVertical: 16,
        borderRadius: borderRadius.xl,
    },
    reorderText: {
        fontSize: 11,
        fontWeight: typography.black,
        color: colors.primary,
    },
    completeButton: {
        backgroundColor: colors.success,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: borderRadius.lg,
        gap: 6,
    },
    completeButtonText: {
        color: colors.white,
        fontSize: typography.xs,
        fontWeight: typography.bold,
    },
});

export default ClientOrdersScreen;
