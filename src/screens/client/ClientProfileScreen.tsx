import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { ChevronLeft, Store, User, Ticket, ChevronRight, CheckCircle, LogOut } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { deleteAccount } from '../../services/authService';

interface Props {
    navigation?: any;
    onLogout?: () => void;
    onEditProfile?: () => void;
}

const ClientProfileScreen: React.FC<Props> = ({ navigation, onLogout, onEditProfile }) => {
    const { userData } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            'Çıkış Yap',
            'Hesabından çıkış yapmak istediğine emin misin?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Çıkış Yap',
                    style: 'destructive',
                    onPress: onLogout
                },
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Hesabı Sil',
            'Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Hesabı Sil',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteAccount();
                            // App.tsx handles state change on user null usually, or we trigger logout
                            onLogout && onLogout();
                        } catch (error) {
                            Alert.alert('Hata', 'Hesap silinirken bir hata oluştu.');
                            console.error(error);
                        }
                    }
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation?.goBack()}>
                    <ChevronLeft size={28} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profil Ayarları</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* User Info */}
                <View style={styles.userSection}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: userData?.avatar || 'https://i.pravatar.cc/150?u=user' }}
                            style={styles.avatar}
                        />
                        <View style={styles.verifiedBadge}>
                            <CheckCircle size={14} color={colors.primary} fill={colors.white} />
                        </View>
                    </View>
                    <View>
                        <Text style={styles.greeting}>Merhaba, {userData?.displayName || 'Kullanıcı'}</Text>
                        <View style={styles.userMeta}>
                            <Text style={styles.accountType}>
                                {userData?.accountType === 'client' ? 'Alıcı Hesabı' : 'Freelancer'}
                            </Text>
                            <View style={styles.dot} />
                            <Text style={styles.memberSince}>{userData?.email}</Text>
                        </View>
                    </View>
                </View>


                {/* Account Management */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>HESAP YÖNETİMİ</Text>
                    <View style={styles.menuCard}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={onEditProfile}
                        >
                            <View style={styles.menuIcon}>
                                <User size={24} color={colors.textMuted} />
                            </View>
                            <View style={styles.menuText}>
                                <Text style={styles.menuTitle}>Hesap Bilgilerimi Düzenle</Text>
                                <Text style={styles.menuSubtitle}>Kişisel detaylar ve şifre</Text>
                            </View>
                            <ChevronRight size={20} color={colors.textLight} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <LogOut size={20} color={colors.textMuted} />
                    <Text style={[styles.logoutText, { color: colors.textMuted }]}>Çıkış Yap</Text>
                </TouchableOpacity>

                {/* Delete Account Button */}
                <TouchableOpacity style={[styles.logoutButton, { borderColor: colors.error, marginTop: 12 }]} onPress={handleDeleteAccount}>
                    <Text style={[styles.logoutText, { color: colors.error }]}>Hesabımı Sil</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.white,
        paddingTop: spacing['2xl'],
        paddingBottom: spacing.xl,
        paddingHorizontal: spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerTitle: {
        fontSize: typography.xl,
        fontWeight: typography.black,
        color: '#1E293B',
    },
    content: {
        flex: 1,
        padding: spacing.xl,
    },
    userSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
        marginBottom: spacing['2xl'],
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 4,
        borderColor: colors.white,
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        backgroundColor: colors.primary,
        borderRadius: 16,
        borderWidth: 4,
        borderColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    greeting: {
        fontSize: typography['2xl'],
        fontWeight: typography.black,
        color: '#0F172A',
        marginBottom: 4,
    },
    userMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    accountType: {
        fontSize: typography.sm,
        fontWeight: typography.bold,
        color: colors.textMuted,
    },
    dot: {
        width: 4,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
    },
    memberSince: {
        fontSize: typography.xs,
        fontWeight: typography.medium,
        color: colors.textLight,
    },
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.primary,
        padding: 32,
        borderRadius: borderRadius['5xl'],
        marginBottom: spacing['2xl'],
        overflow: 'hidden',
        position: 'relative',
    },
    bannerContent: {
        zIndex: 1,
    },
    bannerLabel: {
        fontSize: 10,
        fontWeight: typography.black,
        color: '#0F172A',
        opacity: 0.6,
        letterSpacing: 2,
        marginBottom: 4,
    },
    bannerTitle: {
        fontSize: typography['2xl'],
        fontWeight: typography.black,
        color: '#0F172A',
    },
    bannerIcon: {
        width: 56,
        height: 56,
        backgroundColor: '#F59E0B',
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    bannerCircle: {
        position: 'absolute',
        right: -24,
        bottom: -24,
        width: 128,
        height: 128,
        backgroundColor: colors.white,
        opacity: 0.1,
        borderRadius: 64,
    },
    section: {
        marginBottom: spacing['2xl'],
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: typography.black,
        color: colors.textLight,
        letterSpacing: 2,
        marginBottom: spacing.xl,
        marginLeft: 4,
    },
    menuCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius['5xl'],
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: '#F9FAFB',
    },
    menuIcon: {
        width: 56,
        height: 56,
        backgroundColor: colors.background,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    menuIconWithBadge: {
        position: 'relative',
    },
    menuBadge: {
        position: 'absolute',
        top: -4,
        right: 12,
        width: 24,
        height: 24,
        backgroundColor: colors.primary,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuBadgeText: {
        fontSize: 10,
        fontWeight: typography.bold,
        color: colors.white,
    },
    menuText: {
        flex: 1,
    },
    menuTitle: {
        fontSize: typography.md,
        fontWeight: typography.black,
        color: '#0F172A',
        marginBottom: 2,
    },
    menuSubtitle: {
        fontSize: typography.xs,
        fontWeight: typography.medium,
        color: colors.textMuted,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        backgroundColor: colors.white,
        paddingVertical: 16,
        borderRadius: borderRadius['3xl'],
        borderWidth: 1,
        borderColor: colors.error,
        marginBottom: spacing['2xl'],
    },
    logoutText: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: colors.error,
    },
    creditCard: {
        backgroundColor: '#0F172A',
        borderRadius: borderRadius['5xl'],
        padding: 32,
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 80,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 48,
    },
    cardLabel: {
        fontSize: 9,
        fontWeight: typography.black,
        color: colors.white,
        opacity: 0.4,
        letterSpacing: 2,
        marginBottom: 4,
    },
    cardNumber: {
        fontSize: typography['2xl'],
        fontWeight: typography.black,
        color: colors.white,
        letterSpacing: 3,
    },
    cardRadio: {
        width: 48,
        height: 48,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardRadioInner: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: colors.white,
        borderRadius: 10,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    cardHolder: {
        fontSize: typography.md,
        fontWeight: typography.black,
        color: colors.white,
    },
    cardBrand: {
        flexDirection: 'row',
    },
    brandCircle1: {
        width: 32,
        height: 32,
        backgroundColor: colors.error,
        borderRadius: 16,
    },
    brandCircle2: {
        width: 32,
        height: 32,
        backgroundColor: colors.warning,
        borderRadius: 16,
        marginLeft: -12,
        opacity: 0.8,
    },
    cardStripe: {
        position: 'absolute',
        left: -40,
        top: 0,
        bottom: 0,
        width: 128,
        backgroundColor: colors.white,
        opacity: 0.05,
        transform: [{ rotate: '12deg' }],
    },
});

export default ClientProfileScreen;
