import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { ChevronLeft, MoreVertical, Clock, Calendar, CheckCircle, Send } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { getFreelancerJobs, Job, deliverJob } from '../../services/freelancerService';

interface Props {
    navigation?: any;
}

const JobManagementScreen: React.FC<Props> = ({ navigation }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.uid) {
            loadJobs();
        }
    }, [user?.uid, activeTab]);

    const loadJobs = async () => {
        if (!user?.uid) return;

        setLoading(true);
        try {
            // Fetch both active and delivered for 'active' tab
            // For simplicity, getFreelancerJobs with specific status or filter client side
            // Ideally backend supports array of statuses
            const jobsData = await getFreelancerJobs(user.uid);

            if (activeTab === 'active') {
                setJobs(jobsData.filter(j => ['pending', 'active', 'delivered'].includes(j.status)));
            } else {
                setJobs(jobsData.filter(j => ['completed', 'cancelled'].includes(j.status)));
            }
        } catch (error) {
            console.error('Error loading jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeliverWork = async (jobId: string) => {
        Alert.alert(
            'İşi Teslim Et',
            'İşi tamamladığınızı ve müşteriye teslim etmek istediğinizi onaylıyor musunuz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Teslim Et',
                    onPress: async () => {
                        try {
                            await deliverJob(jobId);
                            Alert.alert('Başarılı', 'İş teslim edildi. Müşteri onayı bekleniyor.');
                            loadJobs(); // Refresh
                        } catch (error) {
                            console.error(error);
                            Alert.alert('Hata', 'İşlem sırasında bir hata oluştu.');
                        }
                    }
                }
            ]
        );
    };

    const formatDeadline = (deadline: Date): string => {
        const now = new Date();
        const diff = deadline.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (diff < 0) return 'Gecikmiş';
        if (hours < 24) return `${hours} Saat Kaldı`;
        return `${days} Gün Kaldı`;
    };

    const isUrgent = (deadline: Date): boolean => {
        const now = new Date();
        const diff = deadline.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        return hours < 24;
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation?.goBack()}>
                        <ChevronLeft size={28} color="#1E293B" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>İşlerim</Text>
                    <TouchableOpacity>
                        <MoreVertical size={24} color="#1E293B" />
                    </TouchableOpacity>
                </View>

                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={styles.tab}
                        onPress={() => setActiveTab('active')}
                    >
                        <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
                            Aktif
                        </Text>
                        {activeTab === 'active' && <View style={styles.tabUnderline} />}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.tab}
                        onPress={() => setActiveTab('completed')}
                    >
                        <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
                            Tamamlanan
                        </Text>
                        {activeTab === 'completed' && <View style={styles.tabUnderline} />}
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Yükleniyor...</Text>
                </View>
            ) : (
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {jobs.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                {activeTab === 'active' ? 'Aktif iş bulunmuyor' : 'Tamamlanan iş bulunmuyor'}
                            </Text>
                            <Text style={styles.emptySubtext}>
                                {activeTab === 'active'
                                    ? 'Yeni iş talepleri kabul ettiğinizde burada görünecek'
                                    : 'Tamamladığınız işler burada listelenecek'}
                            </Text>
                        </View>
                    ) : (
                        jobs.map((job) => (
                            <View key={job.id} style={styles.jobCard}>
                                <View style={styles.jobHeader}>
                                    <View style={styles.jobIcon}>
                                        <Text style={styles.jobIconText}>{job.icon}</Text>
                                    </View>
                                    <View style={styles.jobInfo}>
                                        <Text style={styles.jobTitle}>{job.title}</Text>
                                        <Text style={styles.jobClient}>Müşteri: {job.clientName}</Text>
                                    </View>
                                    {job.status === 'delivered' && (
                                        <View style={styles.statusBadge}>
                                            <CheckCircle size={12} color={colors.warning} />
                                            <Text style={styles.statusText}>ONAY BEKLİYOR</Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.progressSection}>
                                    <View style={styles.progressHeader}>
                                        <Text style={styles.progressLabel}>İLERLEME</Text>
                                        <Text style={styles.progressValue}>{job.progress}%</Text>
                                    </View>
                                    <View style={styles.progressBar}>
                                        <View style={[styles.progressFill, { width: `${job.progress}%` }]} />
                                    </View>
                                </View>

                                <View style={styles.jobFooter}>
                                    <View>
                                        <Text style={styles.deadlineLabel}>TESLİM TARİHİ</Text>
                                        <View style={styles.deadlineRow}>
                                            {isUrgent(job.deadline) ? (
                                                <Clock size={16} color={colors.error} />
                                            ) : (
                                                <Calendar size={16} color="#475569" />
                                            )}
                                            <Text style={[styles.deadlineText, isUrgent(job.deadline) && styles.deadlineUrgent]}>
                                                {formatDeadline(job.deadline)}
                                            </Text>
                                        </View>
                                    </View>

                                    {job.status === 'active' ? (
                                        <TouchableOpacity
                                            style={[styles.detailButton, styles.deliverButton]}
                                            onPress={() => handleDeliverWork(job.id)}
                                        >
                                            <Send size={16} color={colors.white} />
                                            <Text style={styles.detailButtonText}>Teslim Et</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity style={styles.detailButton}>
                                            <Text style={styles.detailButtonText}>Detaylar</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            )}
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
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.xl,
    },
    headerTitle: {
        fontSize: typography.xl,
        fontWeight: typography.black,
        color: '#1E293B',
    },
    tabContainer: {
        flexDirection: 'row',
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
    jobCard: {
        backgroundColor: colors.white,
        padding: spacing.lg,
        borderRadius: borderRadius['3xl'],
        marginBottom: spacing.base,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    jobHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
        marginBottom: spacing.lg,
    },
    jobIcon: {
        width: 56,
        height: 56,
        backgroundColor: colors.background,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    jobIconText: {
        fontSize: 24,
    },
    jobInfo: {
        flex: 1,
    },
    jobTitle: {
        fontSize: typography.md,
        fontWeight: typography.black,
        color: '#1E293B',
        marginBottom: 4,
    },
    jobClient: {
        fontSize: typography.xs,
        fontWeight: typography.medium,
        color: colors.textMuted,
    },
    progressSection: {
        marginBottom: spacing.lg,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 10,
        fontWeight: typography.black,
        color: colors.textMuted,
        letterSpacing: 2,
    },
    progressValue: {
        fontSize: 10,
        fontWeight: typography.black,
        color: '#1E293B',
    },
    progressBar: {
        height: 8,
        backgroundColor: colors.background,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 4,
    },
    jobFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
    },
    deadlineLabel: {
        fontSize: 10,
        fontWeight: typography.black,
        color: colors.textMuted,
        letterSpacing: 2,
        marginBottom: 4,
    },
    deadlineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    deadlineText: {
        fontSize: typography.sm,
        fontWeight: typography.bold,
        color: '#475569',
    },
    deadlineUrgent: {
        color: colors.error,
    },
    detailButton: {
        backgroundColor: colors.background,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: borderRadius.xl,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    deliverButton: {
        backgroundColor: colors.primary,
    },
    detailButtonText: {
        fontSize: typography.xs,
        fontWeight: typography.bold,
        color: colors.white,
    },
    statusBadge: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: borderRadius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statusText: {
        fontSize: 8,
        fontWeight: typography.bold,
        color: colors.warning,
    },
});

export default JobManagementScreen;
