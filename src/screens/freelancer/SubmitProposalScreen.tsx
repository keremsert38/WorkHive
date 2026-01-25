import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { ChevronLeft, DollarSign, Clock, FileText, Send } from 'lucide-react-native';
import { colors, typography, spacing } from '../../theme';
import { createProposal } from '../../services/proposalService';
import { getJobById } from '../../services/jobService';
import { useAuth } from '../../context/AuthContext';

interface Props {
    route: any;
    navigation: any;
}

const SubmitProposalScreen: React.FC<Props> = ({ route, navigation }) => {
    const { jobId, jobTitle: initialJobTitle, budget: initialJobBudget } = route.params;
    const { user } = useAuth();

    const [jobTitle, setJobTitle] = useState(initialJobTitle || '');
    const [jobBudget, setJobBudget] = useState(initialJobBudget || 0);

    const [price, setPrice] = useState('5000');
    const [duration, setDuration] = useState('7');
    const [coverLetter, setCoverLetter] = useState('');
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (!initialJobTitle || !initialJobBudget) {
            fetchJobDetails();
        }
    }, [jobId]);

    const fetchJobDetails = async () => {
        try {
            const job = await getJobById(jobId);
            if (job) {
                setJobTitle(job.title);
                setJobBudget(job.budget);
            }
        } catch (error) {
            console.error('Error fetching job details:', error);
        }
    };

    const handleSubmit = async () => {
        if (!price || !duration || !coverLetter.trim()) {
            Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
            return;
        }

        if (!user) {
            Alert.alert('Hata', 'Giriş yapmalısınız.');
            return;
        }

        setLoading(true);
        try {
            await createProposal({
                jobId,
                freelancerId: user.uid,
                price: Number(price),
                coverLetter: coverLetter.trim(),
                duration,
                status: 'pending',
            });

            Alert.alert(
                'Başarılı',
                'Teklifiniz gönderildi!',
                [{ text: 'Tamam', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error('Submit proposal error:', error);
            Alert.alert('Hata', 'Teklif gönderilirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Teklif Ver</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.jobInfoCard}>
                    <Text style={styles.jobInfoLabel}>İlan Başlığı</Text>
                    <Text style={styles.jobInfoTitle}>{jobTitle}</Text>
                    <View style={styles.budgetBadge}>
                        <Text style={styles.budgetText}>İşveren Bütçesi: {jobBudget} TL</Text>
                    </View>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Teklif Fiyatınız (TL)</Text>
                        <View style={styles.inputContainer}>
                            <DollarSign size={20} color={colors.textSecondary} />
                            <TextInput
                                style={styles.input}
                                value={price}
                                onChangeText={setPrice}
                                keyboardType="numeric"
                                placeholder="0"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Teslim Süresi (Gün)</Text>
                        <View style={styles.inputContainer}>
                            <Clock size={20} color={colors.textSecondary} />
                            <TextInput
                                style={styles.input}
                                value={duration}
                                onChangeText={setDuration}
                                keyboardType="numeric"
                                placeholder="0"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Ön Yazı</Text>
                        <View style={[styles.inputContainer, styles.textAreaContainer]}>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={coverLetter}
                                onChangeText={setCoverLetter}
                                multiline
                                numberOfLines={6}
                                placeholder="Neden bu iş için en uygun kişi olduğunuzu anlatın..."
                                textAlignVertical="top"
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Send size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.submitButtonText}>Teklifi Gönder</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
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
    content: {
        padding: spacing.lg,
    },
    jobInfoCard: {
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    jobInfoLabel: {
        fontSize: typography.xs,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    jobInfoTitle: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: '#1E293B',
        marginBottom: 12,
    },
    budgetBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    budgetText: {
        fontSize: typography.sm,
        color: '#059669',
        fontWeight: typography.medium,
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: typography.sm,
        fontWeight: typography.bold,
        color: '#1E293B',
        marginBottom: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 50,
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: typography.md,
        color: '#1E293B',
    },
    textAreaContainer: {
        height: 150,
        alignItems: 'flex-start',
        paddingVertical: 12,
    },
    textArea: {
        height: '100%',
        textAlignVertical: 'top',
    },
    footer: {
        padding: 16,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    submitButton: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: '#1E293B',
    },
});

export default SubmitProposalScreen;
