import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator, Modal } from 'react-native';
import { ChevronLeft, User, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { colors, typography, spacing } from '../../theme';
import { register, signInWithGoogle } from '../../services/authService';

import { TERMS_AND_CONDITIONS } from '../../constants/terms';
import { X } from 'lucide-react-native'; // Import X icon for modal

interface Props {
    onBack: () => void;
    onSuccess: (email: string) => void;
    onLogin: () => void;
}

const ClientRegisterScreen: React.FC<Props> = ({ onBack, onSuccess, onLogin }) => {
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
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
                accountType: 'client',
            });
            onSuccess(email.trim());
        } catch (error: any) {
            console.error('Registration error:', error);
            let message = 'Kayıt yapılamadı. Lütfen tekrar deneyin.';
            if (error.code === 'auth/email-already-in-use') {
                message = 'Bu e-posta adresi zaten kullanılıyor.';
            } else if (error.code === 'auth/invalid-email') {
                message = 'Geçersiz e-posta adresi.';
            } else if (error.code === 'auth/weak-password') {
                message = 'Şifre çok zayıf. En az 6 karakter kullanın.';
            } else if (error.message) {
                // Capture other errors (like the rolled back firestore error)
                message = `Hata: ${error.message}`;
            }
            Alert.alert('Kayıt Hatası', message);
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
                <Text style={styles.headerTitle}>Müşteri Kaydı</Text>
                <View style={{ width: 28 }} />
            </View>

            {/* Title */}
            <Text style={styles.title}>Yeteneklerle{'\n'}Buluşmaya Başla</Text>
            <Text style={styles.subtitle}>
                Hemen bir müşteri hesabı oluştur ve projen için en iyi freelancerı bul.
            </Text>

            {/* Form */}
            <View style={styles.form}>
                {/* Name Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Ad Soyad</Text>
                    <View style={styles.inputContainer}>
                        <User size={18} color={colors.textLight} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Örn. Ahmet Yılmaz"
                            placeholderTextColor={colors.textMuted}
                            value={displayName}
                            onChangeText={setDisplayName}
                            editable={!loading}
                        />
                    </View>
                </View>

                {/* Email Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>E-posta</Text>
                    <View style={styles.inputContainer}>
                        <Mail size={18} color={colors.textLight} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="ahmet@ornek.com"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                            editable={!loading}
                        />
                    </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Şifre</Text>
                    <View style={styles.inputContainer}>
                        <Lock size={18} color={colors.textLight} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="En az 6 karakter"
                            placeholderTextColor={colors.textMuted}
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                            editable={!loading}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            {showPassword ? (
                                <EyeOff size={18} color={colors.secondary} />
                            ) : (
                                <Eye size={18} color={colors.secondary} />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Terms */}
            <TouchableOpacity style={styles.termsContainer} onPress={() => setAgreed(!agreed)}>
                <View style={[styles.checkbox, agreed && styles.checkboxChecked]} />
                <Text style={styles.termsText}>
                    <Text style={{ textDecorationLine: 'underline' }} onPress={() => setShowTermsModal(true)}>Kullanım Koşullarını ve Gizlilik Politikasını</Text> okudum, onaylıyorum.
                </Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleRegister}
                activeOpacity={0.9}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#0F172A" />
                ) : (
                    <Text style={styles.submitButtonText}>Hesap Oluştur</Text>
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
                <TouchableOpacity style={styles.socialButton} onPress={async () => {
                    setLoading(true);
                    try {
                        await signInWithGoogle('client');
                        // No explicit navigation needed if auth listener handles it
                    } catch (error) {
                        console.error('Google register error:', error);
                        Alert.alert('Hata', 'Google ile kayıt yapılamadı.');
                    } finally {
                        setLoading(false);
                    }
                }} disabled={loading}>
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
        paddingBottom: spacing['2xl'],
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
        fontSize: typography['4xl'],
        fontWeight: typography.black,
        color: '#0F172A',
        marginBottom: 16,
        lineHeight: 44,
    },
    subtitle: {
        fontSize: typography.sm,
        fontWeight: typography.medium,
        color: colors.textSecondary,
        marginBottom: 40,
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
        borderRadius: 9999,
        paddingHorizontal: 16,
        paddingVertical: 20,
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
        marginBottom: 40,
        paddingHorizontal: 4,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginTop: 2,
    },
    checkboxChecked: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    termsText: {
        flex: 1,
        fontSize: 11,
        color: colors.textMuted,
        fontWeight: typography.medium,
    },
    submitButton: {
        backgroundColor: colors.primary,
        paddingVertical: 20,
        borderRadius: 9999,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        shadowColor: colors.primaryLight,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 8,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#0F172A',
        fontSize: typography.lg,
        fontWeight: typography.black,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 40,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#F3F4F6',
    },
    dividerText: {
        fontSize: typography.xs,
        color: colors.textMuted,
        fontWeight: typography.bold,
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginBottom: 40,
    },
    socialButton: {
        flex: 1,
        height: 64,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    socialText: {
        fontWeight: typography.black,
        color: '#1E293B',
        fontSize: typography.lg,
    },
    socialLabel: {
        fontSize: typography.sm,
        fontWeight: typography.bold,
        color: '#1E293B',
    },
    loginText: {
        textAlign: 'center',
        fontSize: typography.sm,
        color: colors.textSecondary,
        marginBottom: 32,
        fontWeight: typography.medium,
    },
    loginLink: {
        color: colors.secondary,
        fontWeight: typography.bold,
    },
    // Terms Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: colors.white,
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
    closeButton: {
        padding: 4,
    },
    modalContent: {
        flex: 1,
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

export default ClientRegisterScreen;
