import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { ChevronLeft, Info, DollarSign, Clock, Tag } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { createJob } from '../../services/jobService';

interface Props {
    onBack: () => void;
    onSuccess: () => void;
}

const CreateJobScreen: React.FC<Props> = ({ onBack, onSuccess }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [budget, setBudget] = useState('');
    const [category, setCategory] = useState('');
    const [deadlineDays, setDeadlineDays] = useState('7');

    const categories = ['Tasarım', 'Yazılım', 'Çeviri', 'Danışmanlık', 'Video & Animasyon', 'Müzik & Ses'];

    const handleCreateJob = async () => {
        if (!title.trim() || !description.trim() || !budget.trim() || !category) {
            Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
            return;
        }

        if (!user) {
            Alert.alert('Hata', 'Oturum açmanız gerekiyor.');
            return;
        }

        // Calculate deadline based on days
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + parseInt(deadlineDays || '7'));

        setLoading(true);
        try {
            await createJob({
                clientId: user.uid,
                title: title.trim(),
                description: description.trim(),
                category,
                budget: parseFloat(budget),
                deadline,
            });
            Alert.alert('Başarılı', 'İlanınız yayınlandı!', [
                { text: 'Tamam', onPress: onSuccess }
            ]);
        } catch (error) {
            console.error('Job creation error:', error);
            Alert.alert('Hata', 'İlan oluşturulurken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <ChevronLeft size={28} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Yeni İlan Oluştur</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.formContainer}>
                    {/* Title */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>İlan Başlığı</Text>
                        <View style={styles.inputContainer}>
                            <Tag size={20} color={colors.textLight} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Örn: E-ticaret Sitesi İçin Logo"
                                placeholderTextColor={colors.textMuted}
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>
                    </View>

                    {/* Category */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Kategori</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[
                                        styles.categoryChip,
                                        category === cat && styles.categoryChipActive
                                    ]}
                                    onPress={() => setCategory(cat)}
                                >
                                    <Text style={[
                                        styles.categoryChipText,
                                        category === cat && styles.categoryChipTextActive
                                    ]}>{cat}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Description */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>İlan Detayları</Text>
                        <View style={[styles.inputContainer, styles.textAreaContainer]}>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Projenizden bahsedin..."
                                placeholderTextColor={colors.textMuted}
                                multiline
                                numberOfLines={6}
                                value={description}
                                onChangeText={setDescription}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>

                    {/* Budget */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Bütçe (TL)</Text>
                        <View style={styles.inputContainer}>
                            <DollarSign size={20} color={colors.textLight} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Örn: 5000"
                                placeholderTextColor={colors.textMuted}
                                keyboardType="numeric"
                                value={budget}
                                onChangeText={setBudget}
                            />
                        </View>
                    </View>

                    {/* Deadline Days */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Teslim Süresi (Gün)</Text>
                        <View style={styles.inputContainer}>
                            <Clock size={20} color={colors.textLight} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Örn: 7"
                                placeholderTextColor={colors.textMuted}
                                keyboardType="numeric"
                                value={deadlineDays}
                                onChangeText={setDeadlineDays}
                            />
                            <Text style={styles.inputSuffix}>gün</Text>
                        </View>
                    </View>

                    {/* Warning */}
                    <View style={styles.warningBox}>
                        <Info size={20} color={colors.primary} />
                        <Text style={styles.warningText}>
                            İlanınız onaylandıktan sonra freelancerlar teklif vermeye başlayacaktır.
                        </Text>
                    </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleCreateJob}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#0F172A" />
                    ) : (
                        <Text style={styles.submitButtonText}>İlanı Yayınla</Text>
                    )}
                </TouchableOpacity>
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
    content: {
        flex: 1,
    },
    formContainer: {
        padding: spacing.xl,
        gap: 24,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: typography.sm,
        fontWeight: typography.bold,
        color: '#1E293B',
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: borderRadius.xl,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    textAreaContainer: {
        paddingVertical: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: typography.md,
        color: '#1E293B',
        padding: 0,
    },
    textArea: {
        minHeight: 120,
    },
    categoryScroll: {
        flexDirection: 'row',
        marginBottom: 8,
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
    dateText: {
        fontSize: typography.md,
        color: '#1E293B',
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        padding: 16,
        borderRadius: borderRadius.xl,
        gap: 12,
        marginTop: 8,
    },
    warningText: {
        flex: 1,
        fontSize: typography.xs,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    submitButton: {
        backgroundColor: colors.primary,
        margin: spacing.xl,
        paddingVertical: 16,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        fontSize: typography.md,
        fontWeight: typography.black,
        color: '#0F172A',
    },
    inputSuffix: {
        fontSize: typography.sm,
        color: '#64748B',
        fontWeight: typography.medium,
        marginLeft: 8,
    },
});

export default CreateJobScreen;
