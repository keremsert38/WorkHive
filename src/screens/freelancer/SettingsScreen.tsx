import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronLeft, Shield, FileText, Info, Trash2 } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface Props {
    onBack: () => void;
}

const SettingsScreen: React.FC<Props> = ({ onBack }) => {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <ChevronLeft size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ayarlar</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Hesap Ayarları</Text>

                    <TouchableOpacity style={styles.menuItem}>
                        <Shield size={20} color={colors.primary} />
                        <Text style={styles.menuText}>Gizlilik ve Güvenlik</Text>
                        <ChevronLeft size={20} color={colors.textMuted} style={{ transform: [{ rotate: '180deg' }] }} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <FileText size={20} color={colors.primary} />
                        <Text style={styles.menuText}>Kullanım Koşulları</Text>
                        <ChevronLeft size={20} color={colors.textMuted} style={{ transform: [{ rotate: '180deg' }] }} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Info size={20} color={colors.primary} />
                        <Text style={styles.menuText}>Uygulama Hakkında</Text>
                        <ChevronLeft size={20} color={colors.textMuted} style={{ transform: [{ rotate: '180deg' }] }} />
                    </TouchableOpacity>
                </View>

                <View style={[styles.section, { marginTop: spacing.lg }]}>
                    <Text style={[styles.sectionTitle, { color: colors.error }]}>Tehlikeli Bölge</Text>

                    <TouchableOpacity style={styles.menuItem}>
                        <Trash2 size={20} color={colors.error} />
                        <Text style={[styles.menuText, { color: colors.error }]}>Hesabımı Sil</Text>
                    </TouchableOpacity>
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
    },
    sectionTitle: {
        fontSize: typography.sm,
        fontWeight: typography.black,
        color: colors.textMuted,
        marginBottom: spacing.md,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 12,
    },
    menuText: {
        flex: 1,
        fontSize: typography.md,
        fontWeight: typography.medium,
        color: '#1E293B',
    }
});

export default SettingsScreen;
