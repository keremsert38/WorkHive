import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Home, Search, ShoppingBag, MessageSquare, Heart, User } from 'lucide-react-native';
import { colors, typography } from '../theme';
import { Screen } from '../types';

interface ClientBottomNavProps {
    activeScreen: Screen;
    onNavigate: (screen: Screen) => void;
    unreadCount?: number;
}

const ClientBottomNav: React.FC<ClientBottomNavProps> = ({ activeScreen, onNavigate, unreadCount = 0 }) => {
    const navItems = [
        { id: Screen.CLIENT_HOME, label: 'Anasayfa', Icon: Home },
        { id: Screen.CLIENT_SEARCH, label: 'Keşfet', Icon: Search },
        // Favorites removed
        // Orders removed
        { id: Screen.CLIENT_MESSAGES, label: 'Mesajlar', Icon: MessageSquare, badge: unreadCount > 0 ? unreadCount : undefined },
        { id: Screen.CLIENT_PROFILE, label: 'Profil', Icon: User },
    ];

    // Show all 4 items
    const displayItems = navItems;

    return (
        <View style={styles.container}>
            {displayItems.map((item) => {
                const IconComponent = item.Icon;
                const isActive = activeScreen === item.id;
                return (
                    <TouchableOpacity
                        key={item.id}
                        onPress={() => onNavigate(item.id)}
                        style={styles.navItem}
                    >
                        <View style={styles.iconContainer}>
                            <IconComponent
                                size={24}
                                color={isActive ? colors.primary : colors.textMuted}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            {item.badge && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{item.badge}</Text>
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
        zIndex: 50,
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        padding: 4,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: -8,
        backgroundColor: colors.error,
        width: 16,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.white,
    },
    badgeText: {
        fontSize: 9,
        fontWeight: typography.bold,
        color: colors.white,
    },
    label: {
        fontSize: 10,
        fontWeight: typography.bold,
        color: colors.textMuted,
        marginTop: 4,
    },
    labelActive: {
        color: colors.primary,
    },
});

export default ClientBottomNav;
