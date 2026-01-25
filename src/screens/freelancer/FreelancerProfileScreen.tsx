import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { ChevronLeft, Star, Edit2, Settings, CreditCard, Bell, HelpCircle, LogOut, ChevronRight, CheckCircle } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { getFreelancerStats, FreelancerStats } from '../../services/freelancerService';

interface Props {
    navigation?: any;
    onLogout?: () => void;
    onEditProfile?: () => void;
    onNotificationSettings?: () => void;
    onSettings?: () => void;
}

const FreelancerProfileScreen: React.FC<Props> = ({
    navigation,
    onLogout,
    onEditProfile,
    onNotificationSettings,
    onSettings
}) => {
    const { userData, user } = useAuth();
    const [stats, setStats] = useState<FreelancerStats>({
        totalEarnings: 0,
        activeJobs: 0,
        rating: 0,
        completedJobs: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.uid) {
            loadStats();
        }
    }, [user?.uid]);

    const loadStats = async () => {
        if (!user?.uid) return;
        try {
            const data = await getFreelancerStats(user.uid);
            setStats(data);
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Çıkış Yap',
            'Hesabından çıkış yapmak istediğine emin misin?',
            [
                { text: 'İptal', style: 'cancel' },
                { text: 'Çıkış Yap', style: 'destructive', onPress: onLogout },
            ]
        );
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const menuItems = [
        {
            icon: Edit2,
            label: 'Profili Düzenle',
            subtitle: 'Bilgilerini güncelle',
            onPress: onEditProfile
        },
        // Ödeme Yöntemleri kaldırıldı
        {
            icon: Bell,
            label: 'Bildirimler',
            subtitle: 'Bildirim tercihleri',
            onPress: onNotificationSettings
        },
        {
            icon: Settings,
            label: 'Ayarlar',
            subtitle: 'Hesap ve gizlilik',
            onPress: onSettings
        },
        { icon: HelpCircle, label: 'Yardım & Destek', subtitle: 'SSS ve iletişim' },
    ];

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation?.goBack()}>
                        <ChevronLeft size={28} color="#1E293B" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Profilim</Text>
                    <TouchableOpacity onPress={handleLogout}>
                        <LogOut size={24} color={colors.error} />
                    </TouchableOpacity>
                </View>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: userData?.avatar || 'https://picsum.photos/seed/profile/150/150' }}
                            style={styles.avatar}
                        />
                        <View style={styles.verifiedBadge}>
                            <CheckCircle size={16} color={colors.white} />
                        </View>
                    </View>

                    <Text style={styles.userName}>{userData?.displayName || 'Kullanıcı'}</Text>
                    <Text style={styles.userExpertise}>
                        {userData?.title || userData?.expertise || 'Freelancer'}
                    </Text>
                    {userData?.bio && (
                        <Text style={styles.userBio} numberOfLines={2}>
                            {userData.bio}
                        </Text>
                    )}

                    <View style={styles.ratingContainer}>
                        <Star size={16} color="#F59E0B" fill="#F59E0B" />
                        <Text style={styles.ratingText}>
                            {stats.rating > 0 ? stats.rating.toFixed(1) : 'Henüz puan yok'}
                        </Text>
                        <Text style={styles.reviewCount}>({stats.completedJobs} iş)</Text>
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{stats.completedJobs}</Text>
                        <Text style={styles.statLabel}>Tamamlanan</Text>
                    </View>
                    <View style={[styles.statBox, styles.statBoxMiddle]}>
                        <Text style={styles.statValue}>{stats.activeJobs}</Text>
                        <Text style={styles.statLabel}>Aktif İş</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{formatPrice(stats.totalEarnings)}</Text>
                        <Text style={styles.statLabel}>Kazanç</Text>
                    </View>
                </View>

                {/* Menu */}
                <View style={styles.menuContainer}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.menuItem}
                            onPress={item.onPress}
                        >
                            <View style={styles.menuIconContainer}>
                                <item.icon size={22} color={colors.primary} />
                            </View>
                            <View style={styles.menuContent}>
                                <Text style={styles.menuLabel}>{item.label}</Text>
                                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                            </View>
                            <ChevronRight size={20} color={colors.textMuted} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <LogOut size={20} color={colors.error} />
                    <Text style={styles.logoutText}>Çıkış Yap</Text>
                </TouchableOpacity>

                {/* Version */}
                <Text style={styles.versionText}>WorkHive v1.0.0</Text>
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
    scrollContent: {
        paddingBottom: 100,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.white,
        paddingTop: spacing['2xl'],
        paddingBottom: spacing.lg,
        paddingHorizontal: spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerTitle: {
        fontSize: typography.xl,
        fontWeight: typography.black,
        color: '#1E293B',
    },
    profileCard: {
        backgroundColor: colors.white,
        alignItems: 'center',
        paddingVertical: spacing['2xl'],
        marginBottom: spacing.lg,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: spacing.lg,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: colors.primaryLight,
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        backgroundColor: colors.success,
        borderRadius: 16,
        borderWidth: 3,
        borderColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userName: {
        fontSize: typography['2xl'],
        fontWeight: typography.black,
        color: '#0F172A',
        marginBottom: 4,
    },
    userExpertise: {
        fontSize: typography.md,
        color: colors.textSecondary,
        marginBottom: spacing.base,
    },
    userBio: {
        fontSize: typography.xs,
        color: colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: spacing.xl,
        marginTop: -4,
        marginBottom: spacing.base,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    ratingText: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: '#0F172A',
    },
    reviewCount: {
        fontSize: typography.sm,
        color: colors.textMuted,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        marginHorizontal: spacing.lg,
        borderRadius: borderRadius['3xl'],
        padding: spacing.xl,
        marginBottom: spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statBoxMiddle: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#F3F4F6',
    },
    statValue: {
        fontSize: typography.xl,
        fontWeight: typography.black,
        color: '#0F172A',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: typography.xs,
        fontWeight: typography.medium,
        color: colors.textMuted,
    },
    menuContainer: {
        backgroundColor: colors.white,
        marginHorizontal: spacing.lg,
        borderRadius: borderRadius['3xl'],
        overflow: 'hidden',
        marginBottom: spacing.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: '#F9FAFB',
    },
    menuIconContainer: {
        width: 44,
        height: 44,
        backgroundColor: colors.primaryLight,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.base,
    },
    menuContent: {
        flex: 1,
    },
    menuLabel: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: '#0F172A',
        marginBottom: 2,
    },
    menuSubtitle: {
        fontSize: typography.xs,
        color: colors.textMuted,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        backgroundColor: colors.white,
        marginHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        borderRadius: borderRadius['3xl'],
        borderWidth: 1,
        borderColor: colors.error,
        marginBottom: spacing.xl,
    },
    logoutText: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: colors.error,
    },
    versionText: {
        textAlign: 'center',
        fontSize: typography.xs,
        color: colors.textMuted,
        marginBottom: spacing.xl,
    },
});

export default FreelancerProfileScreen;
