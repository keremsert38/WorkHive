import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Mail, RefreshCw, CheckCircle, ArrowLeft } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { resendVerificationEmail, checkEmailVerified, logout } from '../../services/authService';

interface Props {
    email: string;
    onVerified: () => void;
    onBack: () => void;
}

const EmailVerificationScreen: React.FC<Props> = ({ email, onVerified, onBack }) => {
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // Check verification status periodically
    useEffect(() => {
        const interval = setInterval(async () => {
            const verified = await checkEmailVerified();
            if (verified) {
                clearInterval(interval);
                onVerified();
            }
        }, 3000); // Check every 3 seconds

        return () => clearInterval(interval);
    }, [onVerified]);

    // Countdown timer for resend button
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleResend = async () => {
        if (countdown > 0) return;

        setResending(true);
        try {
            await resendVerificationEmail();
            setCountdown(60); // 60 seconds cooldown
            Alert.alert('Başarılı', 'Doğrulama e-postası tekrar gönderildi.');
        } catch (error) {
            Alert.alert('Hata', 'E-posta gönderilemedi. Lütfen tekrar deneyin.');
        } finally {
            setResending(false);
        }
    };

    const handleCheckManually = async () => {
        setLoading(true);
        try {
            const verified = await checkEmailVerified();
            if (verified) {
                onVerified();
            } else {
                Alert.alert('Henüz Doğrulanmadı', 'E-posta adresiniz henüz doğrulanmamış. Lütfen gelen kutunuzu kontrol edin.');
            }
        } catch (error) {
            Alert.alert('Hata', 'Doğrulama durumu kontrol edilemedi.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoBack = async () => {
        await logout();
        onBack();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                <ArrowLeft size={24} color="#1E293B" />
            </TouchableOpacity>

            {/* Icon */}
            <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                    <Mail size={48} color={colors.primary} />
                </View>
                <View style={styles.checkBadge}>
                    <CheckCircle size={24} color={colors.white} />
                </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>E-posta Doğrulama</Text>
            <Text style={styles.subtitle}>
                <Text style={styles.emailText}>{email}</Text> adresine bir doğrulama bağlantısı gönderdik.
            </Text>

            {/* Instructions */}
            <View style={styles.instructionsCard}>
                <Text style={styles.instructionsTitle}>Yapmanız gerekenler:</Text>
                <View style={styles.step}>
                    <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
                    <Text style={styles.stepText}>E-posta gelen kutunuzu kontrol edin</Text>
                </View>
                <View style={styles.step}>
                    <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
                    <Text style={styles.stepText}>WorkHive'dan gelen e-postayı açın</Text>
                </View>
                <View style={styles.step}>
                    <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
                    <Text style={styles.stepText}>"E-postamı Doğrula" bağlantısına tıklayın</Text>
                </View>
            </View>

            {/* Check Button */}
            <TouchableOpacity
                style={styles.checkButton}
                onPress={handleCheckManually}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color={colors.white} />
                ) : (
                    <>
                        <RefreshCw size={20} color={colors.white} />
                        <Text style={styles.checkButtonText}>Doğrulamayı Kontrol Et</Text>
                    </>
                )}
            </TouchableOpacity>

            {/* Resend Link */}
            <View style={styles.resendContainer}>
                <Text style={styles.resendText}>E-posta gelmedi mi? </Text>
                <TouchableOpacity onPress={handleResend} disabled={countdown > 0 || resending}>
                    {resending ? (
                        <ActivityIndicator size="small" color={colors.secondary} />
                    ) : (
                        <Text style={[styles.resendLink, countdown > 0 && styles.resendLinkDisabled]}>
                            {countdown > 0 ? `Tekrar gönder (${countdown}s)` : 'Tekrar Gönder'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Spam Note */}
            <Text style={styles.spamNote}>
                💡 Spam/Gereksiz klasörünü de kontrol etmeyi unutmayın.
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
        paddingHorizontal: spacing.xl,
        paddingTop: spacing['2xl'],
    },
    backButton: {
        width: 44,
        height: 44,
        backgroundColor: colors.background,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing['2xl'],
    },
    iconContainer: {
        alignSelf: 'center',
        marginBottom: spacing['2xl'],
        position: 'relative',
    },
    iconCircle: {
        width: 120,
        height: 120,
        backgroundColor: colors.primaryLight,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 40,
        height: 40,
        backgroundColor: colors.success,
        borderRadius: 20,
        borderWidth: 4,
        borderColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: typography['3xl'],
        fontWeight: typography.black,
        color: '#0F172A',
        textAlign: 'center',
        marginBottom: spacing.base,
    },
    subtitle: {
        fontSize: typography.md,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: spacing['2xl'],
    },
    emailText: {
        fontWeight: typography.bold,
        color: colors.secondary,
    },
    instructionsCard: {
        backgroundColor: colors.background,
        borderRadius: borderRadius['3xl'],
        padding: spacing.xl,
        marginBottom: spacing['2xl'],
    },
    instructionsTitle: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: '#0F172A',
        marginBottom: spacing.lg,
    },
    step: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.base,
    },
    stepNumber: {
        width: 28,
        height: 28,
        backgroundColor: colors.primary,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.base,
    },
    stepNumberText: {
        fontSize: typography.sm,
        fontWeight: typography.bold,
        color: colors.white,
    },
    stepText: {
        flex: 1,
        fontSize: typography.sm,
        color: colors.textSecondary,
    },
    checkButton: {
        backgroundColor: colors.secondary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 18,
        borderRadius: borderRadius.xl,
        marginBottom: spacing.xl,
        shadowColor: colors.secondary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    checkButtonText: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: colors.white,
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    resendText: {
        fontSize: typography.sm,
        color: colors.textSecondary,
    },
    resendLink: {
        fontSize: typography.sm,
        fontWeight: typography.bold,
        color: colors.secondary,
    },
    resendLinkDisabled: {
        color: colors.textMuted,
    },
    spamNote: {
        fontSize: typography.xs,
        color: colors.textMuted,
        textAlign: 'center',
        backgroundColor: colors.primaryLight,
        paddingVertical: spacing.base,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.xl,
    },
});

export default EmailVerificationScreen;
