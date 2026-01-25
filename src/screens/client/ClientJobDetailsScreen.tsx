import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, FlatList } from 'react-native';
import { ChevronLeft, MoreVertical, Clock, DollarSign, Tag, User, MessageSquare, CheckCircle, XCircle } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { getJobById, JobPosting, updateJobStatus } from '../../services/jobService';
import { getProposalsForJob, Proposal, updateProposalStatus } from '../../services/proposalService';
import { useAuth } from '../../context/AuthContext';
import { getOrCreateConversation } from '../../services/messageService';
import { formatDate } from '../../utils/date';

// Simple date formatter if utility doesn't exist
const formatDateSimple = (date: Date) => {
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
};

interface Props {
    route: any;
    navigation: any;
}

const ClientJobDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
    const { jobId } = route.params;
    const { user } = useAuth();
    const [job, setJob] = useState<JobPosting | null>(null);
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'proposals'>('details');

    useEffect(() => {
        fetchJobDetails();
    }, [jobId]);

    const fetchJobDetails = async () => {
        try {
            setLoading(true);
            const jobData = await getJobById(jobId);
            setJob(jobData);

            if (jobData) {
                const proposalsData = await getProposalsForJob(jobId);
                setProposals(proposalsData);
            }
        } catch (error) {
            console.error('Error fetching job details:', error);
            Alert.alert('Hata', 'İlan detayları yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const handleStatusUpdate = async (newStatus: JobPosting['status']) => {
        if (!job) return;

        setActionLoading(true);
        try {
            await updateJobStatus(job.id, newStatus);
            setJob({ ...job, status: newStatus });
            Alert.alert('Başarılı', 'İlan durumu güncellendi.');
        } catch (error) {
            console.error('Error updating job status:', error);
            Alert.alert('Hata', 'Durum güncellenemedi.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleProposalAction = async (proposalId: string, freelancerId: string, action: 'accepted' | 'rejected') => {
        setActionLoading(true);
        try {
            await updateProposalStatus(proposalId, action);

            // Update local state
            setProposals(prev => prev.map(p =>
                p.id === proposalId ? { ...p, status: action } : p
            ));

            if (action === 'accepted') {
                Alert.alert(
                    'Tebrikler',
                    'Teklifi kabul ettiniz! Freelancer ile mesajlaşmak ister misiniz?',
                    [
                        { text: 'Hayır', style: 'cancel' },
                        {
                            text: 'Mesaj Gönder',
                            onPress: async () => {
                                try {
                                    if (user) {
                                        const conversationId = await getOrCreateConversation(
                                            user.uid,
                                            freelancerId,
                                            user.displayName || 'Müşteri',
                                            'Freelancer' // We should ideally get freelancer name
                                        );
                                        navigation.navigate('Chat', { conversationId, recipientName: 'Freelancer' });
                                    }
                                } catch (e) {
                                    console.error('Chat error:', e);
                                    Alert.alert('Hata', 'Sohbet başlatılamadı.');
                                }
                            }
                        }
                    ]
                );

                // Optionally update job status to 'in_progress'
                if (job && job.status === 'open') {
                    await updateJobStatus(job.id, 'in_progress');
                    setJob({ ...job, status: 'in_progress' });
                }
            } else {
                Alert.alert('Bilgi', 'Teklif reddedildi.');
            }
        } catch (error) {
            console.error('Error updating proposal:', error);
            Alert.alert('Hata', 'İşlem gerçekleştirilemedi.');
        } finally {
            setActionLoading(false);
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
                <Text style={styles.errorText}>İlan bulunamadı.</Text>
                <TouchableOpacity onPress={handleBack} style={styles.backButtonSimple}>
                    <Text style={styles.backButtonText}>Geri Dön</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderProposalItem = ({ item }: { item: Proposal }) => (
        <View style={styles.proposalCard}>
            <View style={styles.proposalHeader}>
                <View style={styles.freelancerInfo}>
                    <View style={styles.avatarPlaceholder}>
                        <User size={20} color="#64748B" />
                    </View>
                    <View>
                        <Text style={styles.freelancerName}>Freelancer</Text>
                        <Text style={styles.proposalDate}>{formatDateSimple(item.createdAt)}</Text>
                    </View>
                </View>
                <View style={styles.priceContainer}>
                    <Text style={styles.priceText}>₺{item.price}</Text>
                </View>
            </View>

            <Text style={styles.coverLetter}>{item.coverLetter}</Text>

            <View style={styles.proposalFooter}>
                <View style={styles.durationBadge}>
                    <Clock size={14} color={colors.textSecondary} />
                    <Text style={styles.durationText}>{item.duration} Günde Teslim</Text>
                </View>

                {item.status === 'pending' && (
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.rejectButton]}
                            onPress={() => handleProposalAction(item.id, item.freelancerId, 'rejected')}
                            disabled={actionLoading}
                        >
                            <XCircle size={18} color="#EF4444" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.acceptButton]}
                            onPress={() => handleProposalAction(item.id, item.freelancerId, 'accepted')}
                            disabled={actionLoading}
                        >
                            <CheckCircle size={18} color="#22C55E" />
                        </TouchableOpacity>
                    </View>
                )}

                {item.status === 'accepted' && (
                    <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7' }]}>
                        <Text style={[styles.statusText, { color: '#166534' }]}>Kabul Edildi</Text>
                    </View>
                )}

                {item.status === 'rejected' && (
                    <View style={[styles.statusBadge, { backgroundColor: '#FEE2E2' }]}>
                        <Text style={[styles.statusText, { color: '#991B1B' }]}>Reddedildi</Text>
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <ChevronLeft size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>İlan Detayları</Text>
                <TouchableOpacity style={styles.moreButton}>
                    <MoreVertical size={24} color="#1E293B" />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'details' && styles.activeTab]}
                    onPress={() => setActiveTab('details')}
                >
                    <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>
                        Detaylar
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'proposals' && styles.activeTab]}
                    onPress={() => setActiveTab('proposals')}
                >
                    <Text style={[styles.tabText, activeTab === 'proposals' && styles.activeTabText]}>
                        Teklifler ({proposals.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'details' ? (
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.statusSection}>
                        <View style={[styles.statusBadgeLarge,
                        job.status === 'open' ? { backgroundColor: '#DBEAFE' } :
                            job.status === 'in_progress' ? { backgroundColor: '#FEF3C7' } :
                                { backgroundColor: '#DCFCE7' }
                        ]}>
                            <Text style={[styles.statusTextLarge,
                            job.status === 'open' ? { color: '#1E40AF' } :
                                job.status === 'in_progress' ? { color: '#92400E' } :
                                    { color: '#166534' }
                            ]}>
                                {job.status === 'open' ? 'Açık İlan' : job.status === 'in_progress' ? 'Süreç Devam Ediyor' : 'Tamamlandı'}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.jobTitle}>{job.title}</Text>

                    <View style={styles.metaInfo}>
                        <View style={styles.metaItem}>
                            <Tag size={16} color={colors.textSecondary} />
                            <Text style={styles.metaText}>{job.category}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Clock size={16} color={colors.textSecondary} />
                            <Text style={styles.metaText}>Son: {formatDateSimple(job.deadline)}</Text>
                        </View>
                    </View>

                    <View style={styles.priceCard}>
                        <Text style={styles.priceLabel}>Bütçe</Text>
                        <Text style={styles.priceValue}>₺{job.budget}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>İlan Açıklaması</Text>
                        <Text style={styles.description}>{job.description}</Text>
                    </View>

                    {job.status === 'open' && (
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => handleStatusUpdate('cancelled')}
                        >
                            <Text style={styles.closeButtonText}>İlanı Kapat</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            ) : (
                <FlatList
                    data={proposals}
                    renderItem={renderProposalItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <MessageSquare size={48} color="#CBD5E1" />
                            <Text style={styles.emptyStateText}>Henüz teklif gelmedi</Text>
                            <Text style={styles.emptyStateSubtext}>Freelancerlar ilanınızı incelediğinde teklifler burada görünecek.</Text>
                        </View>
                    }
                />
            )}
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
        padding: 20,
    },
    errorText: {
        fontSize: typography.md,
        color: colors.textSecondary,
        marginBottom: 16,
    },
    backButtonSimple: {
        paddingVertical: 10,
        paddingHorizontal: 20,
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
    moreButton: {
        padding: 8,
        marginRight: -8,
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        paddingHorizontal: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: colors.primary,
    },
    tabText: {
        fontSize: typography.sm,
        fontWeight: typography.medium,
        color: colors.textSecondary,
    },
    activeTabText: {
        color: colors.primary,
        fontWeight: typography.bold,
    },
    content: {
        padding: spacing.lg,
    },
    listContent: {
        padding: spacing.lg,
    },
    statusSection: {
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    statusBadgeLarge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusTextLarge: {
        fontSize: typography.xs,
        fontWeight: typography.bold,
    },
    jobTitle: {
        fontSize: 24,
        fontWeight: typography.bold,
        color: '#1E293B',
        marginBottom: 16,
    },
    metaInfo: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: typography.sm,
        color: colors.textSecondary,
    },
    priceCard: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
    },
    priceLabel: {
        fontSize: typography.sm,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    priceValue: {
        fontSize: 32,
        fontWeight: typography.bold,
        color: colors.primary,
    },
    section: {
        marginBottom: 24,
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
    closeButton: {
        backgroundColor: '#FEE2E2',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#991B1B',
        fontWeight: typography.bold,
        fontSize: typography.md,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
    },
    emptyStateText: {
        fontSize: typography.lg,
        fontWeight: typography.bold,
        color: '#1E293B',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: typography.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        maxWidth: 250,
    },
    proposalCard: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    proposalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    freelancerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    freelancerName: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: '#1E293B',
    },
    proposalDate: {
        fontSize: typography.xs,
        color: colors.textSecondary,
    },
    priceContainer: {
        backgroundColor: '#FFFBEB',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    priceText: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: '#B45309',
    },
    coverLetter: {
        fontSize: typography.sm,
        color: '#475569',
        lineHeight: 20,
        marginBottom: 16,
    },
    proposalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 12,
    },
    durationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    durationText: {
        fontSize: typography.xs,
        color: colors.textSecondary,
        fontWeight: typography.medium,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    rejectButton: {
        borderColor: '#FEE2E2',
        backgroundColor: '#FEF2F2',
    },
    acceptButton: {
        borderColor: '#DCFCE7',
        backgroundColor: '#F0FDF4',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusText: {
        fontSize: typography.xs,
        fontWeight: typography.bold,
    },
});

export default ClientJobDetailsScreen;
