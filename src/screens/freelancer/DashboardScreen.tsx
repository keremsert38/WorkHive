import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { Bell, Wallet, Briefcase, Star, Plus, LineChart, LogOut } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { getFreelancerStats, getJobRequests, FreelancerStats, JobRequest } from '../../services/freelancerService';

const { width } = Dimensions.get('window');

interface Props {
    navigation?: any;
}

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
    const { userData, user } = useAuth();
    const [stats, setStats] = useState<FreelancerStats>({
        totalEarnings: 0,
        activeJobs: 0,
        rating: 0,
        completedJobs: 0,
    });
    const [requests, setRequests] = useState<JobRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.uid) {
            loadData();
        }
    }, [user?.uid]);

    const loadData = async () => {
        if (!user?.uid) return;

        setLoading(true);
        try {
            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timed out')), 10000)
            );

            const statsPromise = getFreelancerStats(user.uid);
            const requestsPromise = getJobRequests(user.uid);

            const [statsData, requestsData] = await Promise.race([
                Promise.all([statsPromise, requestsPromise]),
                timeoutPromise
            ]) as [FreelancerStats, JobRequest[]];

            setStats(statsData);
            setRequests(requestsData);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Use real chart data if available, otherwise fallback to empty
    const chartData = stats.chartData || [];

    const maxValue = chartData.length > 0 ? Math.max(...chartData.map(d => d.value)) : 1;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
        }).format(price);
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Yükleniyor...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Image
                            source={{ uri: userData?.avatar || 'https://picsum.photos/seed/user/100/100' }}
                            style={styles.avatar}
                        />
                        <View>
                            <Text style={styles.userName}>{userData?.displayName || 'Kullanıcı'}</Text>
                            <View style={styles.badgeContainer}>
                                <Star size={12} color={colors.primary} fill={colors.primary} />
                                <Text style={styles.badgeText}>
                                    {userData?.accountType === 'freelancer' ? 'FREELANCER' : 'MÜŞTERİ'}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity style={styles.notificationButton}>
                            <Bell size={24} color="#1E293B" />
                            {requests.length > 0 && <View style={styles.notificationDot} />}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Overview Card */}
                <View style={styles.overviewCard}>
                    <Text style={styles.sectionLabel}>GENEL BAKIŞ</Text>
                    <View style={styles.statsRow}>
                        <View style={[styles.statItem, styles.statBorder]}>
                            <View style={styles.statIcon}>
                                <Wallet size={20} color={colors.primary} />
                            </View>
                            <Text style={styles.statLabel}>KAZANCIM</Text>
                            <Text style={styles.statValue}>{formatPrice(stats.totalEarnings)}</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.statItem, styles.statBorder]}
                            onPress={() => navigation?.navigate('JobManagement')}
                        >
                            <View style={styles.statIcon}>
                                <Briefcase size={20} color={colors.primary} />
                            </View>
                            <Text style={styles.statLabel}>AKTİF İŞLER</Text>
                            <Text style={styles.statValue}>{stats.activeJobs}</Text>
                        </TouchableOpacity>
                        <View style={styles.statItem}>
                            <View style={styles.statIcon}>
                                <Star size={20} color={colors.primary} />
                            </View>
                            <Text style={styles.statLabel}>PUANIM</Text>
                            <Text style={styles.statValue}>{stats.rating > 0 ? stats.rating.toFixed(1) : '-'}</Text>
                        </View>
                    </View>
                </View>

                {/* Pending Requests */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Bekleyen Talepler</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>Tümünü Gör</Text>
                        </TouchableOpacity>
                    </View>

                    {requests.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyText}>Henüz bekleyen talep yok</Text>
                            <Text style={styles.emptySubtext}>Yeni talepler burada görünecek</Text>
                        </View>
                    ) : (
                        requests.slice(0, 2).map((req) => (
                            <View key={req.id} style={styles.requestCard}>
                                <View style={styles.requestHeader}>
                                    <View style={styles.requestInfo}>
                                        <View style={styles.requestBadge}>
                                            <Text style={styles.requestBadgeText}>İSTEK</Text>
                                        </View>
                                        <Text style={styles.requestName}>{req.clientName}</Text>
                                    </View>
                                </View>
                                <Text style={styles.requestTitle}>{req.title}</Text>
                                <Text style={styles.requestDesc}>"{req.description}"</Text>
                                <View style={styles.requestFooter}>
                                    <View>
                                        <Text style={styles.priceLabel}>TEKLİF</Text>
                                        <Text style={styles.priceValue}>{formatPrice(req.offeredPrice)}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.replyButton}
                                        onPress={() => {
                                            // Navigate to chat with the client
                                            navigation.navigate('Chat', {
                                                conversationId: null, // Let ChatScreen find/create it
                                                recipientId: req.clientId,
                                                recipientName: req.clientName
                                            });
                                        }}
                                    >
                                        <Text style={styles.replyButtonText}>Cevapla</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                {/* Earnings Chart */}
                <View style={styles.chartCard}>
                    <View style={styles.chartHeader}>
                        <Text style={styles.chartLabel}>SON 7 GÜN</Text>
                        <Text style={styles.chartValue}>{formatPrice(stats.totalEarnings)}</Text>
                    </View>
                    <View style={styles.chartContainer}>
                        {chartData.map((item, index) => (
                            <View key={index} style={styles.barContainer}>
                                <View
                                    style={[
                                        styles.bar,
                                        {
                                            height: maxValue > 0 ? (item.value / maxValue) * 80 : 0,
                                            backgroundColor: index === 6 ? colors.primary : '#F3F4F6', // Highlight today (last item)
                                        },
                                    ]}
                                />
                            </View>
                        ))}
                    </View>
                    <View style={styles.chartProgress}>
                        <View style={styles.chartProgressFill} />
                    </View>
                </View>

                {/* Actions */}

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: typography.md,
        color: colors.textSecondary,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.white,
        padding: spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: colors.primaryLight,
    },
    userName: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: '#1E293B',
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: typography.bold,
        color: colors.textSecondary,
        letterSpacing: -0.5,
    },
    notificationButton: {
        width: 44,
        height: 44,
        backgroundColor: colors.background,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        backgroundColor: colors.error,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: colors.white,
    },
    overviewCard: {
        backgroundColor: colors.white,
        margin: spacing.lg,
        padding: spacing.xl,
        borderRadius: borderRadius['4xl'],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    sectionLabel: {
        fontSize: typography.xs,
        fontWeight: typography.black,
        color: colors.textMuted,
        letterSpacing: 2,
        marginBottom: spacing.xl,
    },
    statsRow: {
        flexDirection: 'row',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statBorder: {
        borderRightWidth: 1,
        borderRightColor: '#F9FAFB',
    },
    statIcon: {
        width: 40,
        height: 40,
        backgroundColor: colors.primaryLight,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: typography.bold,
        color: colors.textMuted,
        marginBottom: 4,
    },
    statValue: {
        fontSize: typography.lg,
        fontWeight: typography.black,
        color: '#1E293B',
    },
    section: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.base,
    },
    sectionTitle: {
        fontSize: typography.xl,
        fontWeight: typography.bold,
        color: '#1E293B',
    },
    seeAllText: {
        fontSize: typography.sm,
        fontWeight: typography.bold,
        color: colors.primary,
    },
    emptyCard: {
        backgroundColor: colors.white,
        padding: spacing.xl,
        borderRadius: borderRadius['3xl'],
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    emptyText: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: '#1E293B',
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: typography.sm,
        color: colors.textMuted,
    },
    requestCard: {
        backgroundColor: colors.white,
        padding: spacing.lg,
        borderRadius: borderRadius['3xl'],
        marginBottom: spacing.base,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    requestHeader: {
        marginBottom: 8,
    },
    requestInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    requestBadge: {
        backgroundColor: colors.primaryLight,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    requestBadgeText: {
        fontSize: 10,
        fontWeight: typography.bold,
        color: colors.primary,
    },
    requestName: {
        fontSize: typography.xs,
        color: colors.textMuted,
        fontWeight: typography.medium,
    },
    requestTitle: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: '#1E293B',
        marginBottom: 8,
    },
    requestDesc: {
        fontSize: typography.xs,
        color: colors.textSecondary,
        fontStyle: 'italic',
        marginBottom: 16,
    },
    requestFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    priceLabel: {
        fontSize: 10,
        fontWeight: typography.bold,
        color: colors.textMuted,
    },
    priceValue: {
        fontSize: typography.lg,
        fontWeight: typography.black,
        color: '#1E293B',
    },
    replyButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: borderRadius.full,
    },
    replyButtonText: {
        fontSize: typography.sm,
        fontWeight: typography.bold,
        color: '#1E293B',
    },
    chartCard: {
        backgroundColor: colors.white,
        margin: spacing.lg,
        padding: spacing.xl,
        borderRadius: borderRadius['4xl'],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    chartHeader: {
        marginBottom: spacing.xl,
    },
    chartLabel: {
        fontSize: 10,
        fontWeight: typography.bold,
        color: colors.textMuted,
        marginBottom: 4,
    },
    chartValue: {
        fontSize: typography['2xl'],
        fontWeight: typography.black,
        color: '#1E293B',
    },
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 80,
        marginBottom: spacing.base,
    },
    barContainer: {
        flex: 1,
        alignItems: 'center',
    },
    bar: {
        width: 24,
        borderRadius: 4,
    },
    chartProgress: {
        height: 4,
        backgroundColor: colors.background,
        borderRadius: 2,
        overflow: 'hidden',
    },
    chartProgressFill: {
        width: '60%',
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 2,
    },
    actionsRow: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        gap: spacing.base,
        marginBottom: spacing.xl,
    },
    actionCard: {
        flex: 1,
        backgroundColor: colors.white,
        padding: spacing.xl,
        borderRadius: borderRadius['3xl'],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    actionIcon: {
        width: 40,
        height: 40,
        backgroundColor: colors.primary,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    actionIconLight: {
        backgroundColor: colors.primaryLight,
        shadowOpacity: 0,
        elevation: 0,
    },
    actionText: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: '#1E293B',
    },
});

export default DashboardScreen;
