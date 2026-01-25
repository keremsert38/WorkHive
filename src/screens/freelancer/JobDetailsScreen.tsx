import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { ChevronLeft, Clock, DollarSign, Tag, Calendar, MapPin, CheckCircle, Share2, AlertCircle, MessageSquare } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { getJobById, JobPosting } from '../../services/jobService';
// import { getProposalByJobAndFreelancer } from '../../services/proposalService'; // Future optimization: check if already applied
import { useAuth } from '../../context/AuthContext';

interface Props {
    route: any; // In a real app use RouteProp
    navigation: any;
    onBack: () => void;
    onApply: (job: JobPosting) => void;
    onMessage?: (job: JobPosting) => void;
}

// Simple date formatter
const formatDateSimple = (date: Date) => {
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
};

const JobDetailsScreen: React.FC<Props> = ({ route, onBack, onApply, onMessage }) => {
    const { jobId } = route.params || {};
    const { user } = useAuth();
    const [job, setJob] = useState<JobPosting | null>(null);
    const [loading, setLoading] = useState(true);
    // const [hasApplied, setHasApplied] = useState(false);

    useEffect(() => {
        if (jobId) {
            fetchJobDetails();
        }
    }, [jobId]);

    const fetchJobDetails = async () => {
        try {
            setLoading(true);
            const jobData = await getJobById(jobId);
            setJob(jobData);
            // Check if already applied logic here
        } catch (error) {
            console.error('Error fetching job details:', error);
            Alert.alert('Hata', 'İlan detayları yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!job) {
        return (
            <View style={styles.errorContainer}>
                <AlertCircle size={48} color={colors.textSecondary} />
                <Text style={styles.errorText}>İlan bulunamadı veya kaldırılmış.</Text>
                <TouchableOpacity onPress={onBack} style={styles.backButtonSimple}>
                    <Text style={styles.backButtonText}>İlanlara Dön</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const daysLeft = Math.ceil((job.deadline.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    const isDeadlinePassed = daysLeft < 0;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <ChevronLeft size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>İlan Detayı</Text>
                <TouchableOpacity style={styles.shareButton}>
                    <Share2 size={24} color="#1E293B" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Title Section */}
                <View style={styles.titleSection}>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <View style={styles.categoryBadge}>
                        <Tag size={14} color={colors.primary} />
                        <Text style={styles.categoryText}>{job.category}</Text>
                    </View>
                </View>

                {/* Main Info Grid */}
                <View style={styles.infoGrid}>
                    <View style={styles.infoCard}>
                        <View style={styles.iconBg}>
                            <DollarSign size={20} color={colors.primary} />
                        </View>
                        <Text style={styles.infoLabel}>Bütçe</Text>
                        <Text style={styles.infoValue}>₺{job.budget}</Text>
                    </View>

                    <View style={styles.infoCard}>
                        <View style={[styles.iconBg, isDeadlinePassed && { backgroundColor: '#FEE2E2' }]}>
                            <Clock size={20} color={isDeadlinePassed ? '#EF4444' : colors.primary} />
                        </View>
                        <Text style={styles.infoLabel}>Son Başvuru</Text>
                        <Text style={[styles.infoValue, isDeadlinePassed && { color: '#EF4444' }]}>
                            {daysLeft > 0 ? `${daysLeft} Gün Kaldı` : 'Süre Doldu'}
                        </Text>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>İş Açıklaması</Text>
                    <Text style={styles.description}>{job.description}</Text>
                </View>

                {/* Requirements (Static for now, could be dynamic) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Aranan Özellikler</Text>
                    <View style={styles.requirementItem}>
                        <CheckCircle size={16} color={colors.primary} style={{ marginTop: 2 }} />
                        <Text style={styles.requirementText}>Bu alanda profesyonel deneyim</Text>
                    </View>
                    <View style={styles.requirementItem}>
                        <CheckCircle size={16} color={colors.primary} style={{ marginTop: 2 }} />
                        <Text style={styles.requirementText}>Portfolyo sunumu</Text>
                    </View>
                    <View style={styles.requirementItem}>
                        <CheckCircle size={16} color={colors.primary} style={{ marginTop: 2 }} />
                        <Text style={styles.requirementText}>Zamanında teslimat</Text>
                    </View>
                </View>

                <View style={styles.metaSection}>
                    <Text style={styles.metaText}>Yayınlanma: {formatDateSimple(job.createdAt)}</Text>
                    <Text style={styles.metaText}>•</Text>
                    <Text style={styles.metaText}>{job.proposalCount} Başvuru</Text>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.bottomBar}>
                <View style={styles.budgetContainer}>
                    <Text style={styles.budgetLabel}>Tahmini Bütçe</Text>
                    <Text style={styles.budgetValue}>{job.budget} TL</Text>
                </View>
                <TouchableOpacity
                    style={[styles.applyButton, { backgroundColor: colors.white, borderWidth: 1, borderColor: '#E2E8F0', marginRight: 8 }]}
                    onPress={() => onMessage && onMessage(job)}
                >
                    <MessageSquare size={20} color="#1E293B" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.applyButton, isDeadlinePassed && styles.disabledButton]}
                    onPress={() => onApply(job)}
                    disabled={isDeadlinePassed}
                >
                    <Text style={styles.applyButtonText}>
                        {isDeadlinePassed ? 'Süre Doldu' : 'Başvur'}
                    </Text>
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    errorText: {
        fontSize: typography.md,
        color: colors.textMuted,
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 24,
    },
    backButtonSimple: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: colors.primary,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#1E293B',
        fontWeight: 'bold',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xl,
        paddingBottom: spacing.md,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: typography.lg,
        fontWeight: typography.bold,
        color: '#1E293B',
    },
    shareButton: {
        padding: 8,
        marginRight: -8,
    },
    content: {
        padding: spacing.lg,
        paddingBottom: 100,
    },
    titleSection: {
        marginBottom: 24,
    },
    jobTitle: {
        fontSize: 24,
        fontWeight: typography.black,
        color: '#1E293B',
        marginBottom: 12,
        lineHeight: 32,
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
        gap: 6,
    },
    categoryText: {
        fontSize: typography.sm,
        color: '#B45309',
        fontWeight: typography.bold,
    },
    infoGrid: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    infoCard: {
        flex: 1,
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    iconBg: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFFBEB',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: typography.xs,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: '#1E293B',
    },
    section: {
        marginBottom: 24,
        backgroundColor: colors.white,
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    sectionTitle: {
        fontSize: typography.lg,
        fontWeight: typography.bold,
        color: '#1E293B',
        marginBottom: 12,
    },
    description: {
        fontSize: typography.md,
        color: '#475569',
        lineHeight: 24,
    },
    requirementItem: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    requirementText: {
        fontSize: typography.md,
        color: '#475569',
        flex: 1,
    },
    metaSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 8,
    },
    metaText: {
        fontSize: typography.xs,
        color: colors.textMuted,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 32,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 8,
    },
    budgetContainer: {
        flex: 1,
    },
    budgetLabel: {
        fontSize: typography.xs,
        color: colors.textSecondary,
    },
    budgetValue: {
        fontSize: typography.xl,
        fontWeight: typography.black,
        color: '#1E293B',
    },
    applyButton: {
        backgroundColor: colors.primary,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabledButton: {
        backgroundColor: '#E2E8F0',
        opacity: 0.8,
    },
    applyButtonText: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: '#1E293B',
    },
});

export default JobDetailsScreen;
