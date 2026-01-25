import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Home, Search, MessageSquare, List, User } from 'lucide-react-native';
import { colors, typography, spacing } from '../theme';
import { Screen } from '../types';

interface BottomNavProps {
    activeScreen: Screen;
    onNavigate: (screen: Screen) => void;
    unreadCount?: number;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, onNavigate, unreadCount = 0 }) => {
    const navItems = [
        { id: Screen.DASHBOARD, label: 'Panel', Icon: Home },
        { id: Screen.JOB_BOARD, label: 'İşler', Icon: Search },
        { id: Screen.MESSAGES, label: 'Mesajlar', Icon: MessageSquare, badge: unreadCount > 0 ? unreadCount : undefined },
        { id: Screen.LISTING_MANAGEMENT, label: 'İlanlarım', Icon: List },
        { id: Screen.FREELANCER_PROFILE, label: 'Profil', Icon: User },
    ];

    return (
        <View style={styles.container}>
            {navItems.map((item) => {
                const IconComponent = item.Icon;
                const isActive = activeScreen === item.id;
                return (
                    <TouchableOpacity
                        key={item.id}
                        onPress={() => onNavigate(item.id)}
                        style={styles.navItem}
                    >
                        {isActive && <View style={styles.activeIndicator} />}
                        <View style={styles.iconContainer}>
                            <IconComponent
                                size={24}
                                color={isActive ? colors.primary : colors.textMuted}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            {item.badge && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>
                                        {item.badge > 99 ? '99+' : item.badge}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <Text style={[styles.label, isActive && styles.labelActive]}>
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingBottom: 8,
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    activeIndicator: {
        position: 'absolute',
        top: -1,
        width: 32,
        height: 2,
        backgroundColor: colors.primary,
        borderRadius: 1,
    },
    iconContainer: {
        padding: 4,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: -8,
        backgroundColor: colors.primary,
        width: 16,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: typography.bold,
        color: colors.white,
    },
    label: {
        fontSize: 10,
        fontWeight: typography.medium,
        color: colors.textMuted,
        marginTop: 4,
    },
    labelActive: {
        color: colors.primary,
        fontWeight: typography.semibold,
    },
});

export default BottomNav;
