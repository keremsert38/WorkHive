import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronLeft, ShoppingBag, PenTool, CheckCircle, ArrowRight } from 'lucide-react-native';
import { colors, typography, borderRadius, spacing } from '../../theme';

interface Props {
    onBack: () => void;
    onNext: (type: 'client' | 'freelancer') => void;
}

const AccountTypeScreen: React.FC<Props> = ({ onBack, onNext }) => {
    const [selected, setSelected] = useState<'client' | 'freelancer' | null>('client');

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <ChevronLeft size={28} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Hesap Tipi</Text>
                <View style={{ width: 28 }} />
            </View>

            {/* Progress */}
            <View style={styles.progressContainer}>
                <View style={[styles.progressDot, styles.progressActive]} />
                <View style={styles.progressDot} />
                <View style={styles.progressDot} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Title */}
                <Text style={styles.title}>
                    Nasıl devam etmek <Text style={styles.titleHighlight}>istersiniz?</Text>
                </Text>
                <Text style={styles.subtitle}>
                    Size en uygun deneyimi hazırlayabilmemiz için bir seçim yapın.
                </Text>

                {/* Options */}
                <View style={styles.optionsContainer}>
                    {/* Client Option */}
                    <TouchableOpacity
                        style={[styles.option, selected === 'client' && styles.optionSelected]}
                        onPress={() => setSelected('client')}
                        activeOpacity={0.9}
                    >
                        <View style={[styles.checkIcon, selected === 'client' && styles.checkIconActive]}>
                            <CheckCircle size={24} color={selected === 'client' ? colors.primary : '#E5E7EB'} />
                        </View>
                        <View style={[styles.iconContainer, { backgroundColor: '#EFF6FF' }]}>
                            <ShoppingBag size={28} color={colors.secondary} />
                        </View>
                        <Text style={styles.optionTitle}>Hizmet Almak İstiyorum</Text>
                        <Text style={styles.optionDesc}>
                            İhtiyacım olan dijital hizmetleri profesyonellerden hızlıca satın almak istiyorum.
                        </Text>
                    </TouchableOpacity>

                    {/* Freelancer Option */}
                    <TouchableOpacity
                        style={[styles.option, selected === 'freelancer' && styles.optionSelected]}
                        onPress={() => setSelected('freelancer')}
                        activeOpacity={0.9}
                    >
                        <View style={[styles.checkIcon, selected === 'freelancer' && styles.checkIconActive]}>
                            <CheckCircle size={24} color={selected === 'freelancer' ? colors.primary : '#E5E7EB'} />
                        </View>
                        <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                            <PenTool size={28} color={colors.primary} />
                        </View>
                        <Text style={styles.optionTitle}>Freelancer Olmak İstiyorum</Text>
                        <Text style={styles.optionDesc}>
                            Yeteneklerimi sergileyerek global müşterilere ulaşmak ve para kazanmak istiyorum.
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Continue Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.continueButton, !selected && styles.continueButtonDisabled]}
                    onPress={() => selected && onNext(selected)}
                    disabled={!selected}
                    activeOpacity={0.9}
                >
                    <Text style={styles.continueButtonText}>Devam Et</Text>
                    <ArrowRight size={20} color={colors.white} />
                </TouchableOpacity>
            </View>
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
        paddingHorizontal: spacing.lg,
        paddingTop: spacing['2xl'],
        paddingBottom: spacing.base,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: typography.xl,
        fontWeight: typography.bold,
        color: '#1E293B',
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: spacing.lg,
    },
    progressDot: {
        width: 48,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#E5E7EB',
    },
    progressActive: {
        backgroundColor: colors.primary,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.xl,
    },
    title: {
        fontSize: typography['3xl'],
        fontWeight: typography.black,
        color: '#1E293B',
        marginBottom: 8,
    },
    titleHighlight: {
        color: colors.secondary,
        fontStyle: 'italic',
    },
    subtitle: {
        fontSize: typography.md,
        color: colors.textSecondary,
        marginBottom: 32,
    },
    optionsContainer: {
        gap: 24,
    },
    option: {
        padding: 24,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: '#F3F4F6',
        backgroundColor: colors.white,
        position: 'relative',
    },
    optionSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight,
    },
    checkIcon: {
        position: 'absolute',
        top: 16,
        right: 16,
    },
    checkIconActive: {
        opacity: 1,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    optionTitle: {
        fontSize: typography.xl,
        fontWeight: typography.bold,
        color: '#1E293B',
        marginBottom: 8,
    },
    optionDesc: {
        fontSize: typography.sm,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    footer: {
        padding: spacing.xl,
        paddingBottom: spacing['2xl'],
    },
    continueButton: {
        backgroundColor: colors.secondary,
        paddingVertical: 20,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        shadowColor: colors.secondary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    continueButtonDisabled: {
        opacity: 0.5,
    },
    continueButtonText: {
        color: colors.white,
        fontSize: typography.lg,
        fontWeight: typography.bold,
    },
});

export default AccountTypeScreen;
