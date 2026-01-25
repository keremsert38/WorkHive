import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { ChevronLeft, SlidersHorizontal, Heart, Star, ChevronRight } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface Props {
    navigation?: any;
}

const ClientFavoritesScreen: React.FC<Props> = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('services');

    const favorites = [
        { cat: 'GRAFİK TASARIM', title: 'Minimalist Logo Tasarımı', price: '₺450', rating: '4.9', count: '124', img: 'https://picsum.photos/seed/fav1/600/400', popular: true },
        { cat: 'SES VE MÜZİK', title: 'Profesyonel Seslendirme', price: '₺300', rating: '5.0', count: '89', img: 'https://picsum.photos/seed/fav2/600/400', popular: false },
        { cat: 'YAZILIM VE TEKNOLOJİ', title: 'Modern Web Tasarımı', price: '₺1.200', rating: '4.8', count: '210', img: 'https://picsum.photos/seed/fav3/600/400', popular: false },
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation?.goBack()}>
                        <ChevronLeft size={28} color="#1E293B" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Favorilerim</Text>
                    <TouchableOpacity>
                        <SlidersHorizontal size={24} color="#1E293B" />
                    </TouchableOpacity>
                </View>

                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'freelancers' && styles.tabActive]}
                        onPress={() => setActiveTab('freelancers')}
                    >
                        <Text style={[styles.tabText, activeTab === 'freelancers' && styles.tabTextActive]}>
                            Freelancerlar
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'services' && styles.tabActive]}
                        onPress={() => setActiveTab('services')}
                    >
                        <Text style={[styles.tabText, activeTab === 'services' && styles.tabTextActive]}>
                            Hizmetler
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.countRow}>
                    <Text style={styles.countText}>3 KAYITLI HİZMET</Text>
                    <TouchableOpacity>
                        <Text style={styles.editText}>Tümünü Düzenle</Text>
                    </TouchableOpacity>
                </View>

                {favorites.map((fav, i) => (
                    <View key={i} style={styles.card}>
                        <View style={styles.imageContainer}>
                            <Image source={{ uri: fav.img }} style={styles.image} />
                            {fav.popular && (
                                <View style={styles.popularBadge}>
                                    <Text style={styles.popularText}>POPÜLER</Text>
                                </View>
                            )}
                            <TouchableOpacity style={styles.heartButton}>
                                <Heart size={20} color={colors.white} fill={colors.white} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.cardContent}>
                            <View style={styles.cardHeader}>
                                <View>
                                    <Text style={styles.categoryText}>{fav.cat}</Text>
                                    <Text style={styles.titleText}>{fav.title}</Text>
                                </View>
                                <View style={styles.priceContainer}>
                                    <Text style={styles.priceLabel}>BAŞLAYAN FİYATLA</Text>
                                    <Text style={styles.priceValue}>{fav.price}</Text>
                                </View>
                            </View>

                            <View style={styles.ratingRow}>
                                <Star size={16} color={colors.primary} fill={colors.primary} />
                                <Text style={styles.ratingValue}>{fav.rating}</Text>
                                <Text style={styles.ratingCount}>({fav.count} Değerlendirme)</Text>
                            </View>

                            <TouchableOpacity style={styles.viewButton}>
                                <Text style={styles.viewButtonText}>Hemen İncele</Text>
                                <ChevronRight size={18} color={colors.white} />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                <TouchableOpacity style={styles.loadMoreButton}>
                    <Text style={styles.loadMoreText}>DAHA FAZLA GÖSTER</Text>
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
    headerContainer: {
        backgroundColor: colors.white,
        paddingTop: spacing['2xl'],
        paddingHorizontal: spacing.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
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
        color: '#0F172A',
    },
    content: {
        flex: 1,
        padding: spacing.xl,
    },
    countRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
    },
    countText: {
        fontSize: 11,
        fontWeight: typography.black,
        color: colors.textMuted,
        letterSpacing: 2,
    },
    editText: {
        fontSize: 11,
        fontWeight: typography.black,
        color: colors.primary,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius['6xl'],
        marginBottom: spacing.xl,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    imageContainer: {
        height: 224,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    popularBadge: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: borderRadius.full,
    },
    popularText: {
        fontSize: 10,
        fontWeight: typography.black,
        color: colors.white,
    },
    heartButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 40,
        height: 40,
        backgroundColor: colors.error,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: colors.white,
    },
    cardContent: {
        padding: spacing.xl,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.base,
    },
    categoryText: {
        fontSize: 10,
        fontWeight: typography.black,
        color: colors.textLight,
        letterSpacing: 2,
        marginBottom: 4,
    },
    titleText: {
        fontSize: typography.lg,
        fontWeight: typography.black,
        color: '#0F172A',
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    priceLabel: {
        fontSize: 9,
        fontWeight: typography.black,
        color: colors.textLight,
        letterSpacing: 1,
    },
    priceValue: {
        fontSize: typography.xl,
        fontWeight: typography.black,
        color: colors.primary,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: spacing.base,
    },
    ratingValue: {
        fontSize: typography.md,
        fontWeight: typography.black,
        color: '#0F172A',
    },
    ratingCount: {
        fontSize: typography.xs,
        fontWeight: typography.bold,
        color: colors.textLight,
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: borderRadius.xl,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    viewButtonText: {
        fontSize: typography.sm,
        fontWeight: typography.black,
        color: colors.white,
    },
    loadMoreButton: {
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#E5E7EB',
        borderRadius: borderRadius['4xl'],
        paddingVertical: 24,
        alignItems: 'center',
        marginTop: spacing.base,
        marginBottom: 100,
    },
    loadMoreText: {
        fontSize: typography.sm,
        fontWeight: typography.black,
        color: colors.textMuted,
        letterSpacing: 2,
    },
});

export default ClientFavoritesScreen;
