import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image, ActivityIndicator } from 'react-native';
import { Search, ChevronLeft, Filter, Star, Heart } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { searchFreelancers } from '../../services/clientService';
import { ServiceListing } from '../../services/freelancerService';
import { CATEGORIES } from '../../constants/categories';

interface Props {
    navigation?: any;
    onBack?: () => void;
    onServiceClick?: (listing: ServiceListing) => void;
    initialCategory?: string;
}

const ClientSearchScreen: React.FC<Props> = ({ onBack, onServiceClick, initialCategory }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<ServiceListing[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    React.useEffect(() => {
        if (initialCategory) {
            setActiveCategory(initialCategory);
            performSearch(initialCategory);
        }
    }, [initialCategory]);

    const performSearch = async (category: string) => {
        setLoading(true);
        setHasSearched(true);
        try {
            const data = await searchFreelancers('', { category });
            setResults(data);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };



    const handleSearch = async () => {
        if (!searchQuery.trim() && !activeCategory) return;

        setLoading(true);
        setHasSearched(true);
        try {
            const data = await searchFreelancers(searchQuery, { category: activeCategory || undefined });
            setResults(data);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: ServiceListing }) => (
        <TouchableOpacity style={styles.card} onPress={() => onServiceClick && onServiceClick(item)}>
            <Image source={{ uri: item.imageUrl || 'https://picsum.photos/400/300' }} style={styles.cardImage} />


            <View style={styles.cardContent}>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>Freelancer</Text>

                </View>

                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>

                <View style={styles.cardFooter}>
                    <Text style={styles.priceLabel}>BAŞLANGIÇ</Text>
                    <Text style={styles.price}>{item.price} TL</Text>
                </View>
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
                <View style={styles.searchBar}>
                    <Search size={20} color={colors.textMuted} />
                    <TextInput
                        style={styles.input}
                        placeholder="Hizmet veya freelancer ara..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                        autoFocus
                    />
                </View>
                <TouchableOpacity style={styles.filterButton}>
                    <Filter size={20} color="#1E293B" />
                </TouchableOpacity>
            </View>

            {/* Categories Grid */}
            {!hasSearched && (
                <View style={styles.categoryContainer}>
                    <Text style={styles.sectionTitle}>Kategoriler</Text>
                    <FlatList
                        data={CATEGORIES} // Extended categories
                        numColumns={2}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.categoryCard,
                                    activeCategory === item.id && styles.categoryCardActive
                                ]}
                                onPress={() => {
                                    const newCategory = item.name; // Use name to match stored data
                                    setActiveCategory(item.id); // Keep ID for UI state
                                    // Trigger instant search
                                    setHasSearched(true);
                                    setLoading(true);
                                    searchFreelancers('', { category: newCategory })
                                        .then(data => {
                                            setResults(data);
                                            setLoading(false);
                                        })
                                        .catch(err => {
                                            console.error(err);
                                            setLoading(false);
                                        });
                                }}
                            >
                                <View style={styles.categoryIconContainer}>
                                    <Text style={styles.categoryIcon}>{item.icon}</Text>
                                </View>
                                <Text style={[
                                    styles.categoryCardText,
                                    activeCategory === item.id && styles.categoryCardTextActive
                                ]}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                        columnWrapperStyle={styles.categoryGridWrapper}
                        contentContainerStyle={styles.categoryContent}
                    />
                </View>
            )}

            {/* Results */}
            {hasSearched ? (
                loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={results}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id!}
                        contentContainerStyle={styles.resultsContent}
                        ListEmptyComponent={
                            <View style={styles.centerContainer}>
                                <Search size={48} color={colors.textLight} />
                                <Text style={styles.emptyTitle}>Sonuç bulunamadı</Text>
                                <Text style={styles.emptyText}>Farklı anahtar kelimelerle tekrar deneyin</Text>
                            </View>
                        }
                    />
                )
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: spacing['2xl'],
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
        backgroundColor: colors.white,
        gap: 12,
    },
    backButton: {
        padding: 4,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: borderRadius.lg,
        paddingHorizontal: 12,
        height: 48,
        gap: 8,
    },
    input: {
        flex: 1,
        fontSize: typography.sm,
        color: '#1E293B',
    },
    filterButton: {
        padding: 8,
        backgroundColor: '#F1F5F9',
        borderRadius: borderRadius.lg,
    },
    categoryContainer: {
        flex: 1, // fill space if no search
        backgroundColor: '#F8FAFC',
        paddingTop: spacing.lg,
    },
    sectionTitle: {
        fontSize: typography.lg,
        fontWeight: typography.bold,
        color: '#1E293B',
        marginLeft: spacing.lg,
        marginBottom: spacing.md,
    },
    categoryContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
    },
    categoryGridWrapper: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    categoryCard: {
        width: '48%',
        aspectRatio: 1, // Square
        backgroundColor: colors.white,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    categoryCardActive: {
        borderColor: colors.primary,
        backgroundColor: '#FFFBEB',
    },
    categoryIconContainer: {
        width: 64,
        height: 64,
        backgroundColor: '#F8FAFC',
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    categoryIcon: {
        fontSize: 32,
    },
    categoryCardText: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: '#1E293B',
    },
    categoryCardTextActive: {
        color: colors.primary,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    resultsContent: {
        padding: spacing.lg,
        paddingBottom: 100, // Extra space at bottom
        gap: 16,
    },
    emptyTitle: {
        fontSize: typography.lg,
        fontWeight: typography.bold,
        color: '#1E293B',
        marginTop: 16,
        marginBottom: 4,
    },
    emptyText: {
        fontSize: typography.sm,
        color: colors.textMuted,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.primary,
        marginBottom: 16,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardImage: {
        width: '100%',
        height: 180,
    },

    cardContent: {
        padding: spacing.lg,
    },
    userInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    userName: {
        fontSize: typography.xs,
        fontWeight: typography.bold,
        color: colors.textMuted,
    },

    cardTitle: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: '#1E293B',
        marginBottom: 12,
        lineHeight: 20,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceLabel: {
        fontSize: 10,
        fontWeight: typography.bold,
        color: colors.textLight,
        letterSpacing: 1,
    },
    price: {
        fontSize: typography.lg,
        fontWeight: typography.black,
        color: colors.primary,
    },
});

export default ClientSearchScreen;
