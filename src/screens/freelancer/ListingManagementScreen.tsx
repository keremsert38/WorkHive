import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { ArrowLeft, Search, Plus, LayoutGrid, BarChart3 } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { getFreelancerListings, toggleListingStatus, ServiceListing } from '../../services/freelancerService';
import { Screen } from '../../types';

interface Props {
    navigation?: any;
    onAddListing?: () => void;
    onEditListing?: (listing: ServiceListing) => void;
}

const ListingManagementScreen: React.FC<Props> = ({ navigation, onAddListing, onEditListing }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('all');
    const [listings, setListings] = useState<ServiceListing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.uid) {
            loadListings();
        }
    }, [user?.uid]);

    const loadListings = async () => {
        if (!user?.uid) return;

        setLoading(true);
        try {
            const listingsData = await getFreelancerListings(user.uid);
            setListings(listingsData);
        } catch (error) {
            console.error('Error loading listings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (listing: ServiceListing) => {
        try {
            await toggleListingStatus(listing.id, !listing.isActive);
            // Update local state
            setListings(prev =>
                prev.map(l =>
                    l.id === listing.id ? { ...l, isActive: !l.isActive } : l
                )
            );
        } catch (error) {
            Alert.alert('Hata', 'İlan durumu güncellenemedi.');
        }
    };

    const filteredListings = listings.filter(listing => {
        if (activeTab === 'all') return true;
        if (activeTab === 'active') return listing.isActive;
        if (activeTab === 'passive') return !listing.isActive;
        return true;
    });

    const getTabCounts = () => {
        const activeCount = listings.filter(l => l.isActive).length;
        const passiveCount = listings.filter(l => !l.isActive).length;
        return {
            all: listings.length,
            active: activeCount,
            passive: passiveCount,
        };
    };

    const counts = getTabCounts();

    const tabs = [
        { id: 'all', label: `Tümü (${counts.all})` },
        { id: 'active', label: `Aktif (${counts.active})` },
        { id: 'passive', label: `Pasif (${counts.passive})` },
    ];

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <View style={styles.headerTop}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={() => navigation?.goBack()}>
                            <ArrowLeft size={24} color="#1E293B" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>İlan Yönetimi</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity>
                            <Search size={22} color="#475569" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.tabContainer}>
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            style={styles.tab}
                            onPress={() => setActiveTab(tab.id)}
                        >
                            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                                {tab.label}
                            </Text>
                            {activeTab === tab.id && <View style={styles.tabUnderline} />}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Yükleniyor...</Text>
                </View>
            ) : (
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {filteredListings.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>İlan bulunmuyor</Text>
                            <Text style={styles.emptySubtext}>
                                Yeni bir ilan oluşturmak için + butonuna tıklayın
                            </Text>
                        </View>
                    ) : (
                        filteredListings.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.listingCard}
                                onPress={() => onEditListing && onEditListing(item)}
                            >
                                <Image source={{ uri: item.imageUrl }} style={styles.listingImage} />
                                <View style={styles.listingContent}>
                                    <View style={styles.listingHeader}>
                                        <Text style={styles.listingTitle} numberOfLines={2}>{item.title}</Text>
                                        <TouchableOpacity
                                            style={[styles.toggle, item.isActive && styles.toggleActive]}
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                handleToggleStatus(item);
                                            }}
                                        >
                                            <View style={styles.toggleCircle} />
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.listingPrice}>{formatPrice(item.price)}</Text>
                                    <View style={styles.listingActions}>
                                        <TouchableOpacity>
                                            <LayoutGrid size={18} color={colors.textMuted} />
                                        </TouchableOpacity>
                                        <TouchableOpacity>
                                            <BarChart3 size={18} color={colors.textMuted} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            )}

            {/* FAB */}
            <TouchableOpacity style={styles.fab} onPress={onAddListing}>
                <Plus size={32} color="#0F172A" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    headerContainer: {
        backgroundColor: colors.white,
        paddingTop: spacing['2xl'],
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.base,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    headerTitle: {
        fontSize: typography.xl,
        fontWeight: typography.bold,
        color: '#1E293B',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        position: 'relative',
    },
    tabText: {
        fontSize: typography.sm,
        fontWeight: typography.bold,
        color: colors.textMuted,
    },
    tabTextActive: {
        color: '#0F172A',
    },
    tabUnderline: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: colors.primary,
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
    content: {
        flex: 1,
        padding: spacing.lg,
    },
    emptyContainer: {
        backgroundColor: colors.white,
        padding: spacing.xl,
        borderRadius: borderRadius['3xl'],
        alignItems: 'center',
        marginTop: spacing.xl,
    },
    emptyText: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: '#1E293B',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: typography.sm,
        color: colors.textMuted,
        textAlign: 'center',
    },
    listingCard: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: borderRadius['3xl'],
        marginBottom: spacing.base,
        gap: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    listingImage: {
        width: 96,
        height: 96,
        borderRadius: borderRadius.xl,
    },
    listingContent: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    listingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 8,
    },
    listingTitle: {
        flex: 1,
        fontSize: typography.sm,
        fontWeight: typography.bold,
        color: '#1E293B',
        lineHeight: 18,
    },
    toggle: {
        width: 40,
        height: 20,
        backgroundColor: '#E5E7EB',
        borderRadius: 10,
        padding: 2,
    },
    toggleActive: {
        backgroundColor: colors.success,
        alignItems: 'flex-end',
    },
    toggleCircle: {
        width: 16,
        height: 16,
        backgroundColor: colors.white,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    listingPrice: {
        fontSize: typography.md,
        fontWeight: typography.black,
        color: '#0F172A',
    },
    listingActions: {
        flexDirection: 'row',
        gap: 16,
    },
    fab: {
        position: 'absolute',
        bottom: 100,
        right: spacing.xl,
        width: 64,
        height: 64,
        backgroundColor: colors.primary,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
    },
});

export default ListingManagementScreen;
