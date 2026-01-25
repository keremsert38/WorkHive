import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { ChevronLeft, Bell, Search, Palette, Code, Video, Globe, Type, Music, Briefcase, GraduationCap, Star, Plus, Home, LayoutGrid, ShoppingBag, User } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface Props {
    navigation?: any;
}

const CategoriesScreen: React.FC<Props> = ({ navigation }) => {
    const categories = [
        { title: 'Grafik Tasarım', count: '1.2K+ UZMAN', Icon: Palette, color: colors.primaryLight, iconColor: colors.primary, active: true },
        { title: 'Yazılım & Teknoloji', count: '850+ Uzman', Icon: Code, color: colors.background, iconColor: '#475569' },
        { title: 'Video & Animasyon', count: '500+ Uzman', Icon: Video, color: colors.background, iconColor: '#475569' },
        { title: 'Dijital Pazarlama', count: '1.1K+ Uzman', Icon: Globe, color: colors.background, iconColor: '#475569' },
        { title: 'Yazarlık & Çeviri', count: '700+ Uzman', Icon: Type, color: colors.background, iconColor: '#475569' },
        { title: 'Ses & Müzik', count: '400+ Uzman', Icon: Music, color: colors.background, iconColor: '#475569' },
        { title: 'İş Yönetimi', count: '300+ Uzman', Icon: Briefcase, color: colors.background, iconColor: '#475569' },
        { title: 'Eğitim & Danışmanlık', count: '250+ Uzman', Icon: GraduationCap, color: colors.background, iconColor: '#475569' },
    ];

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation?.goBack()}>
                            <ChevronLeft size={28} color="#1E293B" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Kategoriler</Text>
                        <TouchableOpacity style={styles.notificationButton}>
                            <Bell size={20} color="#1E293B" />
                            <View style={styles.notificationDot} />
                        </TouchableOpacity>
                    </View>

                    {/* Search */}
                    <View style={styles.searchContainer}>
                        <Search size={20} color={colors.textMuted} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Hangi hizmete ihtiyacınız var?"
                            placeholderTextColor={colors.textMuted}
                        />
                    </View>

                    {/* Categories Grid */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Keşfet</Text>
                            <TouchableOpacity>
                                <Text style={styles.seeAllText}>Tümünü Gör</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.grid}>
                            {categories.map((cat, i) => {
                                const IconComponent = cat.Icon;
                                return (
                                    <TouchableOpacity
                                        key={i}
                                        style={[styles.categoryCard, cat.active && styles.categoryCardActive]}
                                    >
                                        <View style={[styles.categoryIcon, { backgroundColor: cat.color }]}>
                                            <IconComponent size={28} color={cat.iconColor} />
                                        </View>
                                        <Text style={styles.categoryTitle}>{cat.title}</Text>
                                        <Text style={[styles.categoryCount, cat.active && styles.categoryCountActive]}>
                                            {cat.count}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Promo Banner */}
                    <View style={styles.banner}>
                        <View style={styles.bannerCircle}>
                            <Star size={80} color="#FDE047" fill="#FDE047" style={{ opacity: 0.3 }} />
                        </View>
                        <Text style={styles.bannerTitle}>Bionluk Pro'yu Keşfedin</Text>
                        <Text style={styles.bannerDesc}>Sektörün en iyi freelancer'ları ile tanışın.</Text>
                        <TouchableOpacity style={styles.bannerButton}>
                            <Text style={styles.bannerButtonText}>Hemen Başla</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Navigation - Custom for Categories */}
            <View style={styles.bottomNav}>
                <View style={styles.fabContainer}>
                    <TouchableOpacity style={styles.fab}>
                        <Plus size={32} color={colors.white} strokeWidth={3} />
                    </TouchableOpacity>
                </View>
                <View style={styles.navBar}>
                    <TouchableOpacity style={styles.navItem}>
                        <Home size={22} color={colors.textMuted} />
                        <Text style={styles.navText}>ANA SAYFA</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem}>
                        <LayoutGrid size={22} color={colors.primary} />
                        <Text style={[styles.navText, styles.navTextActive]}>KATEGORİLER</Text>
                    </TouchableOpacity>
                    <View style={{ width: 48 }} />
                    <TouchableOpacity style={styles.navItem}>
                        <ShoppingBag size={22} color={colors.textMuted} />
                        <Text style={styles.navText}>SİPARİŞLER</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem}>
                        <User size={22} color={colors.textMuted} />
                        <Text style={styles.navText}>PROFİL</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: spacing.xl,
        paddingBottom: 140,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing['2xl'],
    },
    headerTitle: {
        fontSize: typography.xl,
        fontWeight: typography.black,
        color: '#1E293B',
    },
    notificationButton: {
        width: 40,
        height: 40,
        backgroundColor: colors.background,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    notificationDot: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        backgroundColor: colors.primary,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.white,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderRadius: borderRadius.xl,
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 12,
        marginBottom: spacing['2xl'],
    },
    searchInput: {
        flex: 1,
        fontSize: typography.sm,
        color: '#1E293B',
    },
    section: {
        marginBottom: spacing['2xl'],
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: typography['2xl'],
        fontWeight: typography.black,
        color: '#1E293B',
    },
    seeAllText: {
        fontSize: typography.sm,
        fontWeight: typography.bold,
        color: colors.primary,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    categoryCard: {
        width: '47%',
        padding: spacing.lg,
        borderRadius: borderRadius['4xl'],
        borderWidth: 1,
        borderColor: '#F3F4F6',
        backgroundColor: colors.white,
    },
    categoryCardActive: {
        borderColor: colors.primary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    categoryIcon: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    categoryTitle: {
        fontSize: typography.sm,
        fontWeight: typography.black,
        color: '#1E293B',
        marginBottom: 4,
    },
    categoryCount: {
        fontSize: 10,
        fontWeight: typography.black,
        color: colors.textMuted,
    },
    categoryCountActive: {
        color: colors.primary,
    },
    banner: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius['5xl'],
        padding: 32,
        minHeight: 220,
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    bannerCircle: {
        position: 'absolute',
        right: -40,
        bottom: -40,
        width: 192,
        height: 192,
        backgroundColor: '#F59E0B',
        borderRadius: 96,
        opacity: 0.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bannerTitle: {
        fontSize: typography['2xl'],
        fontWeight: typography.black,
        color: colors.white,
        maxWidth: 180,
        marginBottom: 8,
    },
    bannerDesc: {
        fontSize: typography.sm,
        fontWeight: typography.medium,
        color: colors.white,
        opacity: 0.9,
        maxWidth: 200,
        marginBottom: 16,
    },
    bannerButton: {
        backgroundColor: colors.white,
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: borderRadius.full,
        alignSelf: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    bannerButtonText: {
        fontSize: typography.sm,
        fontWeight: typography.bold,
        color: colors.primary,
    },
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    fabContainer: {
        position: 'absolute',
        top: -40,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 10,
    },
    fab: {
        width: 64,
        height: 64,
        backgroundColor: colors.primary,
        borderRadius: 32,
        borderWidth: 6,
        borderColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    navBar: {
        height: 80,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    navItem: {
        alignItems: 'center',
        gap: 4,
    },
    navText: {
        fontSize: 10,
        fontWeight: typography.bold,
        color: colors.textMuted,
    },
    navTextActive: {
        color: colors.primary,
    },
});

export default CategoriesScreen;
