import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { ChevronLeft, Star, Heart, Share2, Clock, CheckCircle2, MessageSquare } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { getFreelancerDetails, FreelancerProfile } from '../../services/clientService';
import { ServiceListing } from '../../services/freelancerService';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

interface Props {
    listing: ServiceListing;
    onBack?: () => void;
    onHire?: (listing: ServiceListing, freelancer: FreelancerProfile) => void;
    onViewProfile?: (freelancer: FreelancerProfile) => void;
    onMessage?: (freelancer: FreelancerProfile, listing: ServiceListing) => void;
}

const ServiceDetailScreen: React.FC<Props> = ({ listing, onBack, onHire, onViewProfile, onMessage }) => {
    const { user } = useAuth();
    const [freelancer, setFreelancer] = useState<FreelancerProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFreelancerDetails();
    }, [listing.freelancerId]);

    const loadFreelancerDetails = async () => {
        setLoading(true);
        const data = await getFreelancerDetails(listing.freelancerId);
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

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Image Gallery */}
                <View style={styles.imageContainer}>
                    <Image source={{ uri: listing.imageUrl || 'https://picsum.photos/600/400' }} style={styles.image} />
                    <View style={styles.headerOverlay}>
                        <TouchableOpacity onPress={onBack} style={styles.iconButton}>
                            <ChevronLeft size={24} color="#1E293B" />
                        </TouchableOpacity>

                    </View>
                </View>

                <View style={styles.content}>
                    {/* Title & Price */}
                    <Text style={styles.title}>{listing.title}</Text>

                    <View style={styles.priceRow}>
                        <View>
                            <Text style={styles.priceLabel}>BAŞLANGIÇ FİYATI</Text>
                            <Text style={styles.price}>{listing.price} TL</Text>
                        </View>

                    </View>

                    {/* Freelancer Info */}
                    {freelancer && (
                        <View style={styles.freelancerCard}>
                            <Image
                                source={{ uri: freelancer.avatar || `https://i.pravatar.cc/150?u=${freelancer.uid}` }}
                                style={styles.avatar}
                            />
                            <View style={styles.freelancerInfo}>
                                <Text style={styles.freelancerName}>{freelancer.displayName}</Text>
                                <Text style={styles.freelancerTitle}>{freelancer.title || 'Freelancer'}</Text>
                                <View style={styles.onlineBadge}>
                                    <View style={styles.onlineDot} />
                                    <Text style={styles.onlineText}>Çevrimiçi</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.profileButton} onPress={() => freelancer && onViewProfile && onViewProfile(freelancer)}>
                                <Text style={styles.profileButtonText}>Profili Gör</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Hizmet Hakkında</Text>
                        <Text style={styles.description}>{listing.description}</Text>
                    </View>

                    {/* Features (Mock) */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Neler Dahil?</Text>
                        <View style={styles.featureItem}>
                            <CheckCircle2 size={20} color={colors.success} />
                            <Text style={styles.featureText}>Kaynak Dosyalar</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <CheckCircle2 size={20} color={colors.success} />
                            <Text style={styles.featureText}>Yüksek Çözünürlük</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <CheckCircle2 size={20} color={colors.success} />
                            <Text style={styles.featureText}>Ticari Kullanım</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Clock size={20} color={colors.primary} />
                            <Text style={styles.featureText}>{listing.deliveryTime} Günde Teslimat</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.footer}>
                <View style={styles.footerPrice}>
                    <Text style={styles.totalLabel}>Toplam</Text>
                    <Text style={styles.totalPrice}>{listing.price} TL</Text>
                </View>
                <TouchableOpacity
                    style={[styles.hireButton, { backgroundColor: colors.white, borderWidth: 1, borderColor: '#E2E8F0', marginRight: 12 }]}
                    onPress={() => {
                        if (onMessage) onMessage(freelancer, listing);
                    }}
                >
                    <MessageSquare size={20} color="#1E293B" />
                    <Text style={[styles.hireButtonText, { color: '#1E293B' }]}>Mesaj</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.hireButton}
                    onPress={() => freelancer && onHire && onHire(listing, freelancer)}
                >
                    <Text style={styles.hireButtonText}>Devam Et</Text>
                    <ChevronLeft size={20} color={colors.white} style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>
            </View>
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 100,
    },
    imageContainer: {
        height: 300,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: spacing.xl,
        paddingTop: spacing['3xl'], // Status bar spacing
    },
    iconButton: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    content: {
        padding: spacing.xl,
        marginTop: -24,
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius['3xl'],
        borderTopRightRadius: borderRadius['3xl'],
    },
    title: {
        fontSize: typography['xl'],
        fontWeight: typography.bold,
        color: '#1E293B',
        marginBottom: spacing.lg,
        lineHeight: 28,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing['2xl'],
        paddingBottom: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    priceLabel: {
        fontSize: 10,
        fontWeight: typography.bold,
        color: colors.textLight,
        letterSpacing: 1,
        marginBottom: 4,
    },
    price: {
        fontSize: typography['3xl'],
        fontWeight: typography.black,
        color: colors.primary,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0F172A',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: borderRadius.lg,
        gap: 6,
    },
    ratingText: {
        color: colors.white,
        fontWeight: typography.black,
        fontSize: typography.md,
    },
    reviewCount: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: typography.xs,
    },
    freelancerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: borderRadius.xl,
        marginBottom: spacing['2xl'],
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },
    freelancerInfo: {
        flex: 1,
    },
    freelancerName: {
        fontSize: typography.sm,
        fontWeight: typography.black,
        color: '#1E293B',
        marginBottom: 2,
    },
    freelancerTitle: {
        fontSize: typography.xs,
        color: colors.textMuted,
        marginBottom: 4,
    },
    onlineBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    onlineDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.success,
    },
    onlineText: {
        fontSize: 10,
        fontWeight: typography.bold,
        color: colors.success,
    },
    profileButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    profileButtonText: {
        fontSize: typography.xs,
        fontWeight: typography.bold,
        color: '#1E293B',
    },
    section: {
        marginBottom: spacing['2xl'],
    },
    sectionTitle: {
        fontSize: typography.lg,
        fontWeight: typography.black,
        color: '#1E293B',
        marginBottom: spacing.md,
    },
    description: {
        fontSize: typography.md,
        color: colors.textSecondary,
        lineHeight: 24,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    featureText: {
        fontSize: typography.sm,
        fontWeight: typography.medium,
        color: '#334155',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        padding: spacing.xl,
        paddingBottom: spacing['2xl'], // Safe area
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    footerPrice: {
        flex: 1,
    },
    totalLabel: {
        fontSize: 10,
        fontWeight: typography.bold,
        color: colors.textLight,
        marginBottom: 2,
    },
    totalPrice: {
        fontSize: typography['2xl'],
        fontWeight: typography.black,
        color: '#1E293B',
    },
    hireButton: {
        flex: 1.5,
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: borderRadius.xl,
        gap: 8,
    },
    hireButtonText: {
        fontSize: typography.md,
        fontWeight: typography.black,
        color: colors.white,
    },
});

export default ServiceDetailScreen;
