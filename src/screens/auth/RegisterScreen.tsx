import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator, Modal, FlatList } from 'react-native';
import { ChevronLeft, User, Mail, Briefcase, Lock, Eye, EyeOff, ChevronDown, X, Check } from 'lucide-react-native';
import { colors, typography, spacing } from '../../theme';
import { register, signInWithGoogle } from '../../services/authService';

import { TERMS_AND_CONDITIONS } from '../../constants/terms';

const EXPERTISE_OPTIONS = [
    'Grafik Tasarım',
    'Web Geliştirme',
    'Mobil Uygulama Geliştirme',
    'UI/UX Tasarım',
    'Video Düzenleme',
    'Fotoğrafçılık',
    'İçerik Yazarlığı',
    'SEO & Dijital Pazarlama',
    'Sosyal Medya Yönetimi',
    'Çeviri & Yerelleştirme',
    'Ses & Müzik Prodüksiyonu',
    '3D Modelleme & Animasyon',
    'Oyun Geliştirme',
    'Veri Analizi',
    'Muhasebe & Finans',
    'Hukuki Danışmanlık',
    'Sanal Asistan',
    'Diğer',
];

interface Props {
    onBack: () => void;
    onSuccess: (email: string) => void;
    onLogin: () => void;
}

const RegisterScreen: React.FC<Props> = ({ onBack, onSuccess, onLogin }) => {
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [expertise, setExpertise] = useState('Grafik Tasarım');
    const [showExpertiseModal, setShowExpertiseModal] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!displayName.trim() || !email.trim() || !password.trim()) {
            Alert.alert('Hata', 'Tüm alanları doldurun.');
            return;
        }
        if (!agreed) {
            Alert.alert('Hata', 'Kullanım koşullarını kabul etmelisiniz.');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
            return;
        }

        setLoading(true);
        try {
            await register({
                email: email.trim(),
                password,
                displayName: displayName.trim(),
                accountType: 'freelancer',
                expertise,
            });
            onSuccess(email.trim());
        } catch (error: any) {
            let message = 'Kayıt yapılamadı. Lütfen tekrar deneyin.';
            if (error.code === 'auth/email-already-in-use') {
                message = 'Bu e-posta adresi zaten kullanılıyor.';
            } else if (error.code === 'auth/invalid-email') {
                message = 'Geçersiz e-posta adresi.';
            } else if (error.code === 'auth/weak-password') {
                message = 'Şifre çok zayıf. En az 6 karakter kullanın.';
            }
            Alert.alert('Kayıt Hatası', message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRegister = async () => {
        setLoading(true);
        try {
            await signInWithGoogle('freelancer');
            // Auth state listener in App.tsx will handle navigation
        } catch (error: any) {
            console.error('Google register error:', error);
            Alert.alert('Hata', 'Google ile kayıt yapılamadı.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <ChevronLeft size={28} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Freelancer Kaydı</Text>
                <View style={{ width: 28 }} />
            </View>

            {/* Title */}
            <Text style={styles.title}>
                Yeteneklerini <Text style={styles.titleHighlight}>Paraya Dönüştür</Text>
            </Text>
            <Text style={styles.subtitle}>
                Binlerce müşteriye ulaş ve projelerle kazanmaya başla.
            </Text>

            {/* Form */}
            <View style={styles.form}>
                {/* Name */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Ad Soyad</Text>
                    <View style={styles.inputContainer}>
                        <User size={20} color={colors.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Adınız Soyadınız"
                            placeholderTextColor={colors.textMuted}
                            value={displayName}
                            onChangeText={setDisplayName}
                        />
                    </View>
                </View>

                {/* Email */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>E-posta</Text>
                    <View style={styles.inputContainer}>
                        <Mail size={20} color={colors.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="ornek@email.com"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>
                </View>

                {/* Expertise */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Uzmanlık Alanı</Text>
                    <TouchableOpacity style={styles.inputContainer} onPress={() => setShowExpertiseModal(true)}>
                        <Briefcase size={20} color={colors.textMuted} style={styles.inputIcon} />
                        <Text style={[styles.input, { color: '#1E293B' }]}>{expertise}</Text>
                        <ChevronDown size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                </View>

                {/* Password */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Şifre</Text>
                    <View style={styles.inputContainer}>
                        <Lock size={20} color={colors.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor={colors.textMuted}
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            {showPassword ? (
                                <EyeOff size={20} color={colors.textMuted} />
                            ) : (
                                <Eye size={20} color={colors.textMuted} />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Terms */}
            <View style={styles.termsContainer}>
                <TouchableOpacity
                    style={[styles.checkbox, agreed && styles.checkboxChecked]}
                    onPress={() => setAgreed(!agreed)}
                />
                <Text style={styles.termsText}>
                    <Text style={styles.termsLink} onPress={() => setShowTermsModal(true)}>Kullanım Koşulları</Text> ve{' '}
                    <Text style={styles.termsLink} onPress={() => setShowTermsModal(true)}>Gizlilik Politikası</Text>'nı kabul ediyorum.
                </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleRegister}
                activeOpacity={0.9}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#1E293B" />
                ) : (
                    <Text style={styles.submitButtonText}>Kayıt Ol ve Başla 🚀</Text>
                )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>veya şununla devam et</Text>
                <View style={styles.dividerLine} />
            </View>

            {/* Social Buttons */}
            <View style={styles.socialContainer}>
                <TouchableOpacity style={styles.socialButton} onPress={handleGoogleRegister} disabled={loading}>
                    <Text style={styles.socialText}>G</Text>
                    <Text style={styles.socialLabel}>Google ile Kayıt Ol</Text>
                </TouchableOpacity>
            </View>

            {/* Login Link */}
            <Text style={styles.loginText}>
                Zaten bir hesabın var mı?{' '}
                <Text style={styles.loginLink} onPress={onLogin}>Giriş Yap</Text>
            </Text>

            {/* Terms Modal */}
            <Modal
                visible={showTermsModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowTermsModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Kullanıcı Sözleşmesi</Text>
                        <TouchableOpacity onPress={() => setShowTermsModal(false)} style={styles.closeButton}>
                            <X size={24} color="#1E293B" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalScrollContent}>
                        <Text style={styles.termsFullText}>{TERMS_AND_CONDITIONS}</Text>
                    </ScrollView>
                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={styles.acceptButton}
                            onPress={() => {
                                setAgreed(true);
                                setShowTermsModal(false);
                            }}
                        >
                            <Text style={styles.acceptButtonText}>Okudum ve Kabul Ediyorum</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Expertise Selection Modal */}
            <Modal
                visible={showExpertiseModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowExpertiseModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Uzmanlık Alanı Seçin</Text>
                            <TouchableOpacity onPress={() => setShowExpertiseModal(false)}>
                                <X size={24} color="#1E293B" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={EXPERTISE_OPTIONS}
                            keyExtractor={(item) => item}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.expertiseOption,
                                        expertise === item && styles.expertiseOptionSelected
                                    ]}
                                    onPress={() => {
                                        setExpertise(item);
                                        setShowExpertiseModal(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.expertiseOptionText,
                                        expertise === item && styles.expertiseOptionTextSelected
                                    ]}>
                                        {item}
                                    </Text>
                                    {expertise === item && (
                                        <Check size={20} color={colors.primary} />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
        paddingHorizontal: spacing.xl,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: spacing['2xl'],
        paddingBottom: spacing.lg,
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
    title: {
        fontSize: typography['3xl'],
        fontWeight: typography.black,
        color: '#1E293B',
        marginBottom: 8,
    },
    titleHighlight: {
        color: colors.primary,
    },
    subtitle: {
        fontSize: typography.md,
        color: colors.textSecondary,
        lineHeight: 24,
        marginBottom: 32,
    },
    form: {
        gap: 24,
        marginBottom: 32,
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
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: typography.md,
        color: '#1E293B',
    },
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 32,
        paddingHorizontal: 4,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.primary,
        marginTop: 2,
    },
    checkboxChecked: {
        backgroundColor: colors.primary,
    },
    termsText: {
        flex: 1,
        fontSize: typography.xs,
        color: colors.textSecondary,
        lineHeight: 18,
    },
    termsLink: {
        textDecorationLine: 'underline',
        fontWeight: typography.semibold,
        color: '#475569',
    },
    submitButton: {
        backgroundColor: colors.primary,
        paddingVertical: 20,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#1E293B',
        fontSize: typography.lg,
        fontWeight: typography.black,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E2E8F0',
    },
    dividerText: {
        paddingHorizontal: 16,
        fontSize: typography.xs,
        color: colors.textMuted,
    },
    socialContainer: {
        marginBottom: 24,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 20,
        paddingVertical: 16,
        gap: 12,
    },
    socialText: {
        fontSize: typography.lg,
        fontWeight: typography.bold,
        color: '#1E293B',
    },
    socialLabel: {
        fontSize: typography.md,
        fontWeight: typography.medium,
        color: '#1E293B',
    },
    loginText: {
        textAlign: 'center',
        fontSize: typography.sm,
        color: colors.textSecondary,
        marginBottom: 32,
    },
    loginLink: {
        color: '#1E293B',
        fontWeight: typography.bold,
        textDecorationLine: 'underline',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '70%',
        paddingBottom: 32,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    modalTitle: {
        fontSize: typography.lg,
        fontWeight: typography.bold,
        color: '#1E293B',
    },
    expertiseOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    expertiseOptionSelected: {
        backgroundColor: '#FFFBEB',
    },
    expertiseOptionText: {
        fontSize: typography.md,
        color: '#475569',
    },
    expertiseOptionTextSelected: {
        color: '#1E293B',
        fontWeight: typography.semibold,
    },
    // Terms Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: colors.white,
    },
    closeButton: {
        padding: 4,
    },
    modalScrollContent: {
        padding: 20,
    },
    termsFullText: {
        fontSize: typography.sm,
        color: '#334155',
        lineHeight: 24,
    },
    modalFooter: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        backgroundColor: colors.white,
    },
    acceptButton: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    acceptButtonText: {
        color: '#1E293B',
        fontWeight: typography.bold,
        fontSize: typography.md,
    },
});

export default RegisterScreen;
