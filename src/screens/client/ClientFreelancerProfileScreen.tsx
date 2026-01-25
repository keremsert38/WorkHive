import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { ChevronLeft, Star, MapPin, Briefcase, Mail, Phone, Award } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { FreelancerProfile, getFreelancerDetails, ServiceListing } from '../../services/clientService';
import { useAuth } from '../../context/AuthContext';

interface Props {
    freelancerId: string;
    onBack: () => void;
    onTableOffer: (freelancer: FreelancerProfile) => void;
    onServiceClick?: (listing: ServiceListing) => void;
}

const ClientFreelancerProfileScreen: React.FC<Props> = ({ freelancerId, onBack, onTableOffer, onServiceClick }) => {
    const [freelancer, setFreelancer] = useState<FreelancerProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFreelancer();
    }, [freelancerId]);

    const loadFreelancer = async () => {
        setLoading(true);
        const data = await getFreelancerDetails(freelancerId);
        setFreelancer(data);
        setLoading(false);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!freelancer) {
        return (
            <View style={styles.container}>
                <Text>Freelancer bulunamadı.</Text>
            </View>
        );
    }

    const renderListingItem = ({ item }: { item: ServiceListing }) => (
        <TouchableOpacity
            style={styles.listingCard}
            onPress={() => onServiceClick && onServiceClick(item)}
        >
            <Image source={{ uri: item.imageUrl || 'https://picsum.photos/200' }} style={styles.listingImage} />
            <View style={styles.listingInfo}>
                <Text style={styles.listingTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.listingPrice}>{item.price} TL</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <ChevronLeft size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profil Detayı</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <Image
                        source={{ uri: freelancer.avatar || `https://i.pravatar.cc/150?u=${freelancer.uid}` }}
                        style={styles.avatar}
                    />
                    <Text style={styles.name}>{freelancer.displayName}</Text>
                    <Text style={styles.title}>{freelancer.title || 'Freelancer'}</Text>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Star size={16} color={colors.warning} fill={colors.warning} />
                            <Text style={styles.statText}>5.0 (Rating)</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Briefcase size={16} color={colors.textMuted} />
                            <Text style={styles.statText}>{freelancer.listings?.length || 0} İlan</Text>
                        </View>
                    </View>
                </View>

                {/* Bio */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Hakkında</Text>
                    <Text style={styles.bioText}>{freelancer.bio || 'Henüz bir biyografi eklenmemiş.'}</Text>
                </View>

                {/* Skills/Expertise */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Uzmanlık Alanı</Text>
                    <View style={styles.skillChip}>
                        <Text style={styles.skillText}>{freelancer.expertise || 'Belirtilmemiş'}</Text>
                    </View>
                </View>

                {/* Listings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Hizmet İlanları</Text>
                    {freelancer.listings && freelancer.listings.length > 0 ? (
                        <FlatList
                            data={freelancer.listings}
                            renderItem={renderListingItem}
                            keyExtractor={item => item.id!}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingRight: 16 }}
                        />
                    ) : (
                        <Text style={styles.emptyText}>Henüz aktif ilan yok.</Text>
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.offerButton}
                    onPress={() => onTableOffer(freelancer)}
                >
                    <Text style={styles.offerButtonText}>Özel Teklif Ver</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: spacing['3xl'],
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: '#1E293B',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    profileHeader: {
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: spacing['2xl'],
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        marginBottom: spacing.lg,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: spacing.md,
    },
    name: {
        fontSize: typography['xl'],
        fontWeight: typography.bold,
        color: '#1E293B',
        marginBottom: 4,
    },
    title: {
        fontSize: typography.sm,
        color: colors.textMuted,
        marginBottom: spacing.lg,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        fontSize: typography.sm,
        fontWeight: typography.medium,
        color: '#475569',
    },
    statDivider: {
        width: 1,
        height: 16,
        backgroundColor: '#E2E8F0',
    },
    section: {
        backgroundColor: colors.white,
        padding: spacing.xl,
        marginBottom: spacing.lg,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#F1F5F9',
    },
    sectionTitle: {
        fontSize: typography.lg,
        fontWeight: typography.bold,
        color: '#1E293B',
        marginBottom: spacing.md,
    },
    bioText: {
        fontSize: typography.md,
        color: colors.textSecondary,
        lineHeight: 24,
    },
    skillChip: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: borderRadius.lg,
        alignSelf: 'flex-start',
    },
    skillText: {
        fontSize: typography.sm,
        color: colors.primary,
        fontWeight: typography.medium,
    },
    listingCard: {
        width: 200,
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginRight: 16,
        overflow: 'hidden',
    },
    listingImage: {
        width: '100%',
        height: 120,
    },
    listingInfo: {
        padding: 12,
    },
    listingTitle: {
        fontSize: typography.sm,
        fontWeight: typography.bold,
        color: '#1E293B',
        marginBottom: 8,
        height: 40,
    },
    listingPrice: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: colors.primary,
    },
    emptyText: {
        color: colors.textMuted,
        fontStyle: 'italic',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        padding: spacing.xl,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    offerButton: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
    },
    offerButtonText: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: colors.white,
    },
});

export default ClientFreelancerProfileScreen;
