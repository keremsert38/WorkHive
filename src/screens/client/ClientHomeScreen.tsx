import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput, Dimensions, ActivityIndicator } from 'react-native';
import { Bell, Search, Star, Heart, ArrowRight, Briefcase } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { getListings, Listing } from '../../services/listingService';
import { getJobs, JobPosting } from '../../services/jobService';
import { CATEGORIES } from '../../constants/categories';

const { width } = Dimensions.get('window');

interface Props {
    navigation?: any;
}

const ClientHomeScreen: React.FC<Props> = ({ navigation }) => {
    const { user, userData } = useAuth();
    const [listings, setListings] = useState<Listing[]>([]);
    const [myJobs, setMyJobs] = useState<JobPosting[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timed out')), 10000)
            );

            // Fetch active freelancer listings with timeout
            const listingsPromise = getListings({ isActive: true, limitCount: 5 });

            // Fetch client's own job postings with timeout
            const jobsPromise = user ? getJobs({ clientId: user.uid, limitCount: 3 }) : Promise.resolve([]);

            // Race against timeout
            const [fetchedListings, fetchedJobs] = await Promise.race([
                Promise.all([listingsPromise, jobsPromise]),
                timeoutPromise
            ]) as [Listing[], JobPosting[]];

            setListings(fetchedListings);
            setMyJobs(fetchedJobs);
        } catch (error) {
            console.error('Error loading data:', error);
            // Even on error, we want to show the UI
        } finally {
            setLoading(false);
        }
    };



    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Image
                            source={{ uri: userData?.avatar || `https://i.pravatar.cc/150?u=${user?.uid}` }}
                            style={styles.avatar}
                        />
                        <View>
                            <Text style={styles.welcomeLabel}>HOŞ GELDİN,</Text>
                            <Text style={styles.userName}>{userData?.displayName || 'Kullanıcı'}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.notificationButton}>
                        <Bell size={20} color="#0F172A" />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    {/* Search */}
                    <TouchableOpacity
                        style={styles.searchContainer}
                        onPress={() => navigation && navigation.navigate ? navigation.navigate('ClientSearch') : null}
                    // Note: We are using a custom navigation system in App.tsx
                    >
                        <View style={styles.searchIconContainer}>
                            <Search size={16} color={colors.white} />
                        </View>
                        <Text style={styles.searchInputPlaceholder}>Neye ihtiyacın var?</Text>
                    </TouchableOpacity>

                    {/* Categories Removed */}

                    {/* Main Actions */}
                    <View style={styles.actionGrid}>
                        <TouchableOpacity
                            style={styles.postJobCard}
                            onPress={() => navigation && navigation.navigate ? navigation.navigate('CreateJob') : null}
                        >
                            <View style={styles.postJobContent}>
                                <View style={styles.postJobIconContainer}>
                                    <Text style={styles.postJobIcon}>📢</Text>
                                </View>
                                <View>
                                    <Text style={styles.postJobTitle}>İlan Oluştur</Text>
                                    <Text style={styles.postJobDesc}>Projen için teklif al</Text>
                                </View>
                            </View>
                            <ArrowRight size={20} color={colors.white} />
                        </TouchableOpacity>
                    </View>


                    {/* My Active Jobs - Only show if client has jobs */}
                    {myJobs.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Aktif İlanlarım</Text>
                                <TouchableOpacity>
                                    <Text style={styles.seeAllText}>Tümünü Gör</Text>
                                </TouchableOpacity>
                            </View>
                            {myJobs.map((job) => (
                                <TouchableOpacity
                                    key={job.id}
                                    style={styles.myJobCard}
                                    onPress={() => navigation && navigation.navigate ? navigation.navigate('ClientJobDetails', { jobId: job.id }) : null}
                                >
                                    <View style={styles.myJobLeft}>
                                        <View style={styles.myJobIconContainer}>
                                            <Briefcase size={20} color={colors.primary} />
                                        </View>
                                        <View style={styles.myJobInfo}>
                                            <Text style={styles.myJobTitle} numberOfLines={1}>{job.title}</Text>
                                            <Text style={styles.myJobMeta}>{job.proposalCount} teklif • {job.status === 'open' ? 'Açık' : 'Devam Ediyor'}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.myJobBudget}>{job.budget} TL</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Recommended Freelancers Removed */}

                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.xl,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: colors.primary,
    },
    welcomeLabel: {
        fontSize: 10,
        fontWeight: typography.bold,
        color: colors.textMuted,
        letterSpacing: 2,
    },
    userName: {
        fontSize: typography.lg,
        fontWeight: typography.black,
        color: '#0F172A',
    },
    notificationButton: {
        width: 40,
        height: 40,
        backgroundColor: colors.background,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        paddingHorizontal: spacing.xl,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        borderRadius: borderRadius.xl,
        paddingVertical: 20,
        paddingHorizontal: 16,
        marginBottom: spacing.xl,
    },
    searchIconContainer: {
        width: 32,
        height: 32,
        backgroundColor: colors.primary,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    searchInputPlaceholder: {
        flex: 1,
        fontSize: typography.sm,
        fontWeight: typography.bold,
        color: colors.textMuted,
    },
    categoriesScroll: {
        marginBottom: spacing.xl,
    },
    categoryButtonActive: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: borderRadius.xl,
        gap: 8,
        marginRight: 12,
    },
    categoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        gap: 8,
        marginRight: 12,
    },
    categoryGrid: {
        width: 16,
        height: 16,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 2,
    },
    categoryDot: {
        width: 6,
        height: 6,
        backgroundColor: colors.white,
        borderRadius: 2,
    },
    categoryCircle: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#1E293B',
    },
    categoryCode: {
        fontSize: typography.sm,
        fontWeight: typography.bold,
        color: '#1E293B',
    },
    categoryTextActive: {
        fontSize: typography.sm,
        fontWeight: typography.black,
        color: colors.white,
    },
    categoryText: {
        fontSize: typography.sm,
        fontWeight: typography.black,
        color: '#1E293B',
    },
    banner: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius['5xl'],
        padding: 32,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
        overflow: 'hidden',
    },
    bannerContent: {
        flex: 1,
        zIndex: 1,
    },
    bannerTitle: {
        fontSize: typography['2xl'],
        fontWeight: typography.black,
        color: colors.white,
        marginBottom: 8,
    },
    bannerDesc: {
        fontSize: typography.xs,
        fontWeight: typography.bold,
        color: colors.white,
        opacity: 0.9,
        lineHeight: 18,
        maxWidth: 150,
    },
    bannerIcon: {
        width: 80,
        height: 80,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    bannerCircle: {
        position: 'absolute',
        right: -40,
        top: -40,
        width: 160,
        height: 160,
        backgroundColor: colors.white,
        opacity: 0.05,
        borderRadius: 80,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.base,
    },
    sectionTitle: {
        fontSize: typography['2xl'],
        fontWeight: typography.black,
        color: '#0F172A',
    },
    seeAllText: {
        fontSize: typography.sm,
        fontWeight: typography.bold,
        color: colors.primary,
    },
    itemCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius['6xl'],
        borderWidth: 1,
        borderColor: colors.primary,
        marginBottom: spacing.base,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    itemImageContainer: {
        height: 192,
        backgroundColor: '#0D9488',
    },
    itemImage: {
        width: '100%',
        height: '100%',
        opacity: 0.6,
    },
    proBadge: {
        position: 'absolute',
        top: 16,
        left: 16,
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: borderRadius.full,
    },
    proBadgeText: {
        fontSize: 10,
        fontWeight: typography.black,
        color: colors.white,
    },

    portfolioOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    portfolioIcon: {
        width: 32,
        height: 32,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    portfolioText: {
        fontSize: 8,
        color: colors.white,
        opacity: 0.6,
        letterSpacing: 2,
        fontWeight: typography.bold,
    },
    itemContent: {
        padding: spacing.xl,
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    itemUser: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    itemUserAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    itemUserName: {
        fontSize: typography.sm,
        fontWeight: typography.black,
        color: '#1E293B',
    },

    itemTitle: {
        fontSize: typography.sm,
        fontWeight: typography.medium,
        color: colors.textSecondary,
        lineHeight: 20,
        marginBottom: spacing.xl,
    },
    itemFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    priceLabel: {
        fontSize: 10,
        fontWeight: typography.black,
        color: colors.textLight,
        letterSpacing: 2,
        marginBottom: 4,
    },
    priceValue: {
        fontSize: typography['2xl'],
        fontWeight: typography.black,
        color: colors.primary,
    },
    viewButton: {
        backgroundColor: '#0F172A',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: borderRadius.xl,
    },
    viewButtonText: {
        fontSize: typography.sm,
        fontWeight: typography.black,
        color: colors.white,
    },
    actionGrid: {
        marginBottom: spacing.xl,
    },
    postJobCard: {
        backgroundColor: '#0F172A',
        borderRadius: borderRadius['2xl'],
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    postJobContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    postJobIconContainer: {
        width: 48,
        height: 48,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    postJobIcon: {
        fontSize: 24,
    },
    postJobTitle: {
        fontSize: typography.md,
        fontWeight: typography.black,
        color: colors.white,
        marginBottom: 2,
    },
    postJobDesc: {
        fontSize: typography.xs,
        color: '#94A3B8',
        fontWeight: typography.medium,
    },
    // My Jobs styles
    myJobCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F8FAFC',
        borderRadius: borderRadius.xl,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    myJobLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    myJobIconContainer: {
        width: 44,
        height: 44,
        backgroundColor: 'rgba(251, 191, 36, 0.15)',
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    myJobInfo: {
        flex: 1,
    },
    myJobTitle: {
        fontSize: typography.sm,
        fontWeight: typography.bold,
        color: '#1E293B',
        marginBottom: 4,
    },
    myJobMeta: {
        fontSize: typography.xs,
        color: '#64748B',
        fontWeight: typography.medium,
    },
    myJobBudget: {
        fontSize: typography.md,
        fontWeight: typography.black,
        color: colors.primary,
    },
    // Empty state
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyStateText: {
        fontSize: typography.sm,
        color: '#94A3B8',
        fontWeight: typography.medium,
    },
});

export default ClientHomeScreen;
