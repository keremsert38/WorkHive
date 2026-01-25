import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { ChevronLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { colors, typography, spacing } from '../../theme';
import { login, signInWithGoogle } from '../../services/authService';

interface Props {
    onBack: () => void;
    onSuccess: () => void;
    onRegister: () => void;
}

const LoginScreen: React.FC<Props> = ({ onBack, onSuccess, onRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Eksik Bilgi', 'Lütfen e-posta ve şifrenizi girin.');
            return;
        }

        setLoading(true);
        try {
            await login(email.trim(), password.trim());
            onSuccess();
        } catch (error: any) {
            console.error('Login error:', error);
            Alert.alert('Giriş Hatası', error.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await signInWithGoogle();
            onSuccess();
        } catch (error: any) {
            console.error('Google login error:', error);
            Alert.alert('Giriş Hatası', 'Google ile giriş yapılamadı.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            {/* ... (keep header as is) ... */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <ChevronLeft size={28} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Giriş Yap</Text>
                <View style={{ width: 28 }} />
            </View>

            {/* Title */}
            <Text style={styles.title}>Tekrar Hoş Geldin! 👋</Text>
            <Text style={styles.subtitle}>
                Hesabına giriş yaparak kaldığın yerden devam edebilirsin.
            </Text>

            {/* Form */}
            <View style={styles.form}>
                {/* Email Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>E-posta</Text>
                    <View style={styles.inputContainer}>
                        <Mail size={18} color={colors.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="eposta@adresiniz.com"
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
                        <Lock size={18} color={colors.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="........"
                            placeholderTextColor={colors.textMuted}
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                            editable={!loading}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            {showPassword ? (
                                <EyeOff size={18} color={colors.textMuted} />
                            ) : (
                                <Eye size={18} color={colors.textMuted} />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Forgot Password */}
                <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
                </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleLogin}
                activeOpacity={0.9}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#1E293B" />
                ) : (
                    <Text style={styles.submitButtonText}>Giriş Yap</Text>
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
                <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin} disabled={loading}>
                    <Text style={styles.socialText}>G</Text>
                    <Text style={styles.socialLabel}>Google ile Giriş Yap</Text>
                </TouchableOpacity>
            </View>

            {/* Register Link */}
            <Text style={styles.registerText}>
                Hesabın yok mu?{' '}
                <Text style={styles.registerLink} onPress={onRegister}>
                    Kayıt Ol
                </Text>
            </Text>
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
        marginTop: spacing.xl,
    },
    subtitle: {
        fontSize: typography.md,
        color: colors.textSecondary,
        lineHeight: 24,
        marginBottom: 40,
    },
    form: {
        gap: 24,
        marginBottom: 16,
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
    forgotPassword: {
        alignSelf: 'flex-end',
    },
    forgotPasswordText: {
        fontSize: typography.sm,
        fontWeight: typography.semibold,
        color: colors.secondary,
    },
    submitButton: {
        backgroundColor: colors.primary,
        paddingVertical: 20,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        marginTop: 24,
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
        gap: 16,
        marginBottom: 32,
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
        marginBottom: 32,
    },
    socialButton: {
        flex: 1,
        height: 56,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#E2E8F0',
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
        fontSize: typography.xl,
    },
    socialLabel: {
        fontSize: typography.sm,
        fontWeight: typography.bold,
        color: '#1E293B',
    },
    registerText: {
        textAlign: 'center',
        fontSize: typography.sm,
        color: colors.textSecondary,
        marginBottom: 32,
    },
    registerLink: {
        color: colors.secondary,
        fontWeight: typography.bold,
    },
});

export default LoginScreen;
