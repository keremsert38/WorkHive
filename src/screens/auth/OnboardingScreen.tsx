import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Shield, Check, ArrowRight } from 'lucide-react-native';
import { colors, typography, borderRadius, spacing } from '../../theme';

const { width } = Dimensions.get('window');

interface Props {
    onNext: () => void;
}

const OnboardingScreen: React.FC<Props> = ({ onNext }) => {
    return (
        <View style={styles.container}>
            {/* Top Section */}
            <View style={styles.topSection}>
                <View style={styles.circleOuter}>
                    <View style={styles.iconContainer}>
                        <Shield size={80} color={colors.secondary} />
                        <View style={styles.checkBadge}>
                            <Check size={24} color={colors.white} />
                        </View>
                    </View>
                </View>
            </View>

            {/* Bottom Section */}
            <View style={styles.bottomSection}>
                <Text style={styles.title}>Güvenli İş Birliği</Text>
                <Text style={styles.description}>
                    Projelerinizi güvenle yönetin ve uzmanlarla kolayca iletişim kurun.
                </Text>

                {/* Dots */}
                <View style={styles.dotsContainer}>
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                    <View style={[styles.dot, styles.dotActive]} />
                </View>

                {/* Button */}
                <TouchableOpacity style={styles.button} onPress={onNext} activeOpacity={0.9}>
                    <Text style={styles.buttonText}>Başla</Text>
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
    topSection: {
        flex: 1,
        backgroundColor: colors.primary,
        borderBottomLeftRadius: 80,
        borderBottomRightRadius: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    circleOuter: {
        width: 256,
        height: 256,
        borderRadius: 128,
        backgroundColor: 'rgba(254, 243, 199, 0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 192,
        height: 192,
        backgroundColor: colors.white,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '-6deg' }],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    checkBadge: {
        position: 'absolute',
        top: -16,
        right: -16,
        width: 48,
        height: 48,
        backgroundColor: '#1E293B',
        borderRadius: 24,
        borderWidth: 4,
        borderColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomSection: {
        flex: 0.8,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    title: {
        fontSize: typography['3xl'],
        fontWeight: typography.black,
        color: '#1E293B',
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        fontSize: typography.md,
        fontWeight: typography.medium,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 40,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#D1D5DB',
    },
    dotActive: {
        width: 32,
        backgroundColor: colors.primary,
    },
    button: {
        width: '100%',
        backgroundColor: '#1E293B',
        paddingVertical: 20,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    buttonText: {
        color: colors.white,
        fontSize: typography.lg,
        fontWeight: typography.bold,
    },
});

export default OnboardingScreen;
