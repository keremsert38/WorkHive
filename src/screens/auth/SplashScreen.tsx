import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors, typography, borderRadius } from '../../theme';

const { width } = Dimensions.get('window');

interface Props {
    onFinish: () => void;
}

const SplashScreen: React.FC<Props> = ({ onFinish }) => {
    const progressAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        // Logo animation
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
        }).start();

        // Progress bar animation
        Animated.timing(progressAnim, {
            toValue: 1,
            duration: 1000, // Reduced to 1s
            useNativeDriver: false,
        }).start();

        // Navigate after delay
        const timer = setTimeout(() => {
            onFinish();
        }, 1000); // Reduced to 1s

        return () => clearTimeout(timer);
    }, []);

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={styles.container}>
            {/* Logo */}
            <Animated.View style={[styles.logoContainer, { transform: [{ scale: scaleAnim }, { rotate: '3deg' }] }]}>
                <View style={styles.logoInner}>
                    <View style={styles.dotsContainer}>
                        <View style={[styles.dot, styles.dotTeal]} />
                        <View style={[styles.dot, styles.dotYellow, styles.dotTopRight]} />
                        <View style={[styles.dot, styles.dotTeal]} />
                        <View style={[styles.dot, styles.dotTeal, styles.dotShifted]} />
                    </View>
                </View>
            </Animated.View>

            {/* Title */}
            <Text style={styles.title}>WorkHive</Text>
            <Text style={styles.subtitle}>Yetenek Fırsatla Buluşuyor</Text>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBg}>
                    <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
                </View>
                <Text style={styles.version}>V1.0.4</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    logoContainer: {
        backgroundColor: colors.white,
        padding: 32,
        borderRadius: 40,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    logoInner: {
        position: 'relative',
    },
    dotsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: 40,
        gap: 8,
    },
    dot: {
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    dotTeal: {
        backgroundColor: colors.secondary,
    },
    dotYellow: {
        backgroundColor: colors.primary,
        position: 'absolute',
        top: -16,
        right: -16,
    },
    dotTopRight: {
        position: 'absolute',
        top: -16,
        right: -16,
    },
    dotShifted: {
        marginLeft: 8,
    },
    title: {
        fontSize: typography['4xl'],
        fontWeight: typography.black,
        color: '#1E293B',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: typography.md,
        fontWeight: typography.medium,
        color: '#475569',
        opacity: 0.8,
    },
    progressContainer: {
        position: 'absolute',
        bottom: 80,
        width: '80%',
    },
    progressBg: {
        height: 8,
        width: '100%',
        backgroundColor: '#FDE047',
        borderRadius: borderRadius.full,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: colors.secondary,
        borderRadius: borderRadius.full,
    },
    version: {
        textAlign: 'center',
        color: '#475569',
        fontSize: typography.xs,
        fontWeight: typography.semibold,
        marginTop: 16,
        letterSpacing: 2,
    },
});

export default SplashScreen;
