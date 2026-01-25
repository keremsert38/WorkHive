import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { ChevronLeft, Bell, Mail, MessageSquare } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface Props {
    onBack: () => void;
}

const NotificationSettingsScreen: React.FC<Props> = ({ onBack }) => {
    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [messageEnabled, setMessageEnabled] = useState(true);

    const toggleSwitch = (setter: (val: boolean) => void, val: boolean) => {
        setter(!val);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <ChevronLeft size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Bildirim Tercihleri</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Genel Bildirimler</Text>

                    <View style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                            <Bell size={22} color={colors.primary} />
                            <View style={styles.textContainer}>
                                <Text style={styles.settingLabel}>Push Bildirimleri</Text>
                                <Text style={styles.settingDescription}>Uygulama içi anlık bildirimler</Text>
                            </View>
                        </View>
                        <Switch
                            trackColor={{ false: '#E2E8F0', true: colors.primaryLight }}
                            thumbColor={pushEnabled ? colors.primary : '#f4f3f4'}
                            onValueChange={() => toggleSwitch(setPushEnabled, pushEnabled)}
                            value={pushEnabled}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                            <Mail size={22} color={colors.primary} />
                            <View style={styles.textContainer}>
                                <Text style={styles.settingLabel}>E-posta Bildirimleri</Text>
                                <Text style={styles.settingDescription}>Önemli güncellemeler ve özeti</Text>
                            </View>
                        </View>
                        <Switch
                            trackColor={{ false: '#E2E8F0', true: colors.primaryLight }}
                            thumbColor={emailEnabled ? colors.primary : '#f4f3f4'}
                            onValueChange={() => toggleSwitch(setEmailEnabled, emailEnabled)}
                            value={emailEnabled}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                            <MessageSquare size={22} color={colors.primary} />
                            <View style={styles.textContainer}>
                                <Text style={styles.settingLabel}>Mesaj Bildirimleri</Text>
                                <Text style={styles.settingDescription}>Yeni mesaj geldiğinde bildir</Text>
                            </View>
                        </View>
                        <Switch
                            trackColor={{ false: '#E2E8F0', true: colors.primaryLight }}
                            thumbColor={messageEnabled ? colors.primary : '#f4f3f4'}
                            onValueChange={() => toggleSwitch(setMessageEnabled, messageEnabled)}
                            value={messageEnabled}
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: spacing['2xl'],
        paddingBottom: spacing.lg,
        paddingHorizontal: spacing.lg,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: typography.lg,
        fontWeight: typography.bold,
        color: '#1E293B',
    },
    content: {
        flex: 1,
        padding: spacing.lg,
    },
    section: {
        backgroundColor: colors.white,
        borderRadius: borderRadius['2xl'],
        padding: spacing.lg,
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: '#1E293B',
        marginBottom: spacing.lg,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    textContainer: {
        flex: 1,
    },
    settingLabel: {
        fontSize: typography.sm,
        fontWeight: typography.bold,
        color: '#1E293B',
        marginBottom: 2,
    },
    settingDescription: {
        fontSize: typography.xs,
        color: colors.textMuted,
    },
});

export default NotificationSettingsScreen;
