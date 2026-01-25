import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { ChevronLeft, Briefcase, DollarSign, Clock, Filter, Search } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { getJobs, JobPosting } from '../../services/jobService';

interface Props {
    onBack: () => void;
    onJobPress: (job: JobPosting) => void;
}

const JobBoardScreen: React.FC<Props> = ({ onBack, onJobPress }) => {
    const [jobs, setJobs] = useState<JobPosting[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const categories = ['Tümü', 'Tasarım', 'Yazılım', 'Çeviri', 'Danışmanlık', 'Video & Animasyon'];

    useEffect(() => {
        loadJobs();
    }, [selectedCategory]);

    const loadJobs = async () => {
        try {
            const filters: any = { status: 'open' };
            if (selectedCategory && selectedCategory !== 'Tümü') {
                filters.category = selectedCategory;
            }
            const fetchedJobs = await getJobs(filters);
            setJobs(fetchedJobs);
        } catch (error) {
            console.error('Error loading jobs:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadJobs();
    };

    const formatDate = (date: Date) => {
        const now = new Date();
        const diff = date.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (days <= 0) return 'Bugün';
        if (days === 1) return 'Yarın';
        return `${days} gün`;
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <ChevronLeft size={28} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>İş Fırsatları</Text>
                <TouchableOpacity style={styles.filterButton}>
                    <Filter size={20} color="#1E293B" />
                </TouchableOpacity>
            </View>

            {/* Categories */}
            <View style={styles.categoriesContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            style={[
                                styles.categoryChip,
                                (selectedCategory === cat || (cat === 'Tümü' && !selectedCategory)) && styles.categoryChipActive
                            ]}
                            onPress={() => setSelectedCategory(cat === 'Tümü' ? null : cat)}
                        >
                            <Text style={[
                                styles.categoryChipText,
                                (selectedCategory === cat || (cat === 'Tümü' && !selectedCategory)) && styles.categoryChipTextActive
                            ]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Jobs List */}
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                }
            >
                {loading ? (
                    <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
                ) : jobs.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Briefcase size={48} color="#CBD5E1" />
                        <Text style={styles.emptyStateTitle}>Henüz iş ilanı yok</Text>
                        <Text style={styles.emptyStateText}>Yeni ilanlar eklendiğinde burada görünecek.</Text>
                    </View>
                ) : (
                    jobs.map((job) => (
                        <TouchableOpacity
                            key={job.id}
                            style={styles.jobCard}
                            onPress={() => onJobPress(job)}
                        >
                            <View style={styles.jobHeader}>
                                <View style={styles.categoryBadge}>
                                    <Text style={styles.categoryBadgeText}>{job.category}</Text>
                                </View>
                                <Text style={styles.jobDate}>{formatDate(job.deadline)}</Text>
                            </View>
                            <Text style={styles.jobTitle} numberOfLines={2}>{job.title}</Text>
                            <Text style={styles.jobDescription} numberOfLines={3}>{job.description}</Text>
                            <View style={styles.jobFooter}>
                                <View style={styles.jobBudget}>
                                    <DollarSign size={16} color={colors.primary} />
                                    <Text style={styles.jobBudgetText}>{job.budget} TL</Text>
                                </View>
                                <View style={styles.jobProposals}>
                                    <Text style={styles.jobProposalsText}>{job.proposalCount} teklif</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: typography.xl,
        fontWeight: typography.bold,
        color: '#1E293B',
    },
    filterButton: {
        padding: 8,
        marginRight: -8,
    },
    categoriesContainer: {
        paddingVertical: 16,
        paddingHorizontal: spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: borderRadius.full,
        backgroundColor: '#F1F5F9',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    categoryChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    categoryChipText: {
        fontSize: typography.xs,
        fontWeight: typography.bold,
        color: '#64748B',
    },
    categoryChipTextActive: {
        color: '#0F172A',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.xl,
        paddingBottom: 100,
    },
    loader: {
        marginTop: 60,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyStateTitle: {
        fontSize: typography.lg,
        fontWeight: typography.bold,
        color: '#1E293B',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: typography.sm,
        color: '#94A3B8',
        textAlign: 'center',
    },
    jobCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: borderRadius['2xl'],
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    jobHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    categoryBadge: {
        backgroundColor: 'rgba(251, 191, 36, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
    },
    categoryBadgeText: {
        fontSize: typography.xs,
        fontWeight: typography.bold,
        color: colors.primary,
    },
    jobDate: {
        fontSize: typography.xs,
        color: '#64748B',
        fontWeight: typography.medium,
    },
    jobTitle: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: '#1E293B',
        marginBottom: 8,
        lineHeight: 24,
    },
    jobDescription: {
        fontSize: typography.sm,
        color: '#64748B',
        lineHeight: 20,
        marginBottom: 16,
    },
    jobFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    jobBudget: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    jobBudgetText: {
        fontSize: typography.md,
        fontWeight: typography.black,
        color: colors.primary,
    },
    jobProposals: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: borderRadius.full,
    },
    jobProposalsText: {
        fontSize: typography.xs,
        fontWeight: typography.bold,
        color: '#64748B',
    },
});

export default JobBoardScreen;
