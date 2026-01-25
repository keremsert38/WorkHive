import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { ChevronLeft, Info, Clock, CreditCard } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { ServiceListing, FreelancerProfile, createJobRequest } from '../../services/clientService';
import { useAuth } from '../../context/AuthContext';

interface Props {
    listing?: ServiceListing; // Optional now
    freelancer: FreelancerProfile;
    onBack: () => void;
    onSuccess: () => void;
}

const JobRequestScreen: React.FC<Props> = ({ listing, freelancer, onBack, onSuccess }) => {
    const { userData } = useAuth();

    // Form State
    const [title, setTitle] = useState(listing?.title || '');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(listing?.price ? listing.price.toString() : '');
    const [deliveryTime, setDeliveryTime] = useState(listing?.deliveryTime ? listing.deliveryTime.toString() : '');

    const [loading, setLoading] = useState(false);

    const handleSendRequest = async () => {
        if (!title.trim() || !description.trim() || !price.trim() || !deliveryTime.trim()) {
            Alert.alert('Eksik Bilgi', 'Lütfen tüm alanları doldurun.');
            return;
        }

        if (!userData) return;

        setLoading(true);
        try {
            await createJobRequest(
                userData.uid,
                userData.displayName || 'İsimsiz Müşteri',
                freelancer.uid, // Assuming uid is on FreelancerProfile from UserData
                listing?.id || null, // Service ID is null for custom offers
                {
                    title: title.trim(),
                    description: description.trim(),
                    price: parseFloat(price),
                    deliveryTime: parseInt(deliveryTime),
                }
            );
            Alert.alert('Başarılı', 'İş isteğiniz gönderildi!', [
                { text: 'Tamam', onPress: onSuccess }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert('Hata', 'İstek gönderilirken bir sorun oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <ChevronLeft size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{listing ? 'Hizmet İsteği' : 'Özel Teklif Ver'}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Context Card */}
                <View style={styles.summaryCard}>
                    <View style={styles.freelancerRow}>
                        <Text style={styles.freelancerLabel}>Freelancer:</Text>
                        <Text style={styles.freelancerName}>{freelancer.displayName}</Text>
                    </View>
                    {listing && (
                        <>
                            <Text style={[styles.label, { marginTop: 12 }]}>SEÇİLEN HİZMET</Text>
                            <Text style={styles.serviceTitle}>{listing.title}</Text>
                        </>
                    )}
                </View>

                {/* Details Form */}
                <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>İş Detayları</Text>

                    {/* Title (Editable if no listing) */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>İş Başlığı</Text>
                        <TextInput
                            style={[styles.input, listing && styles.disabledInput]}
                            value={title}
                            onChangeText={setTitle}
                            editable={!listing}
                            placeholder="Örn: Logo Tasarımı"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Açıklama</Text>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Projeden beklentilerinizi ve detayları yazın..."
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>

                    {/* Price & Duration */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.inputLabel}>Bütçe (TL)</Text>
                            <TextInput
                                style={[styles.input, listing && styles.disabledInput]}
                                value={price}
                                onChangeText={setPrice}
                                keyboardType="numeric"
                                editable={!listing}
                                placeholder="0.00"
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.inputLabel}>Süre (Gün)</Text>
                            <TextInput
                                style={[styles.input, listing && styles.disabledInput]}
                                value={deliveryTime}
                                onChangeText={setDeliveryTime}
                                keyboardType="numeric"
                                editable={!listing}
                                placeholder="3"
                            />
                        </View>
                    </View>

                    {/* Info Terms */}
                    <View style={styles.infoBox}>
                        <Info size={20} color={colors.primary} />
                        <Text style={styles.infoText}>
                            İstek gönderildikten sonra freelancer teklifi kabul ederse iş başlayacaktır.
                        </Text>
                    </View>
                </View>

                {/* Summary (Only relevant if dynamic calculation needed, simplified here) */}
                <View style={styles.orderSummary}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Toplam Tutar</Text>
                        <Text style={styles.totalPrice}>{price || '0'} TL</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.disabledButton]}
                    onPress={handleSendRequest}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <Text style={styles.submitButtonText}>İsteği Gönder</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: spacing['3xl'], // Status bar
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: '#1E293B',
    },
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: 100,
    },
    summaryCard: {
        backgroundColor: colors.white,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    label: {
        fontSize: 10,
        fontWeight: typography.bold,
        color: colors.textLight,
        marginBottom: 8,
        letterSpacing: 1,
    },
    serviceTitle: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: '#1E293B',
        marginBottom: 12,
        lineHeight: 24,
    },
    freelancerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    freelancerLabel: {
        fontSize: typography.sm,
        color: colors.textMuted,
    },
    freelancerName: {
        fontSize: typography.sm,
        fontWeight: typography.bold,
        color: colors.primary,
    },
    formSection: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: typography.lg,
        fontWeight: typography.black,
        color: '#1E293B',
        marginBottom: spacing.md,
    },
    inputGroup: {
        marginBottom: spacing.lg,
    },
    inputLabel: {
        fontSize: typography.sm,
        fontWeight: typography.bold,
        color: '#1E293B',
        marginBottom: 8,
    },
    textArea: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: borderRadius.lg,
        padding: 12,
        height: 120,
        fontSize: typography.sm,
        color: '#1E293B',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#EFF6FF',
        padding: 12,
        borderRadius: borderRadius.lg,
        gap: 12,
    },
    infoText: {
        flex: 1,
        fontSize: typography.sm,
        color: '#1E40AF',
        lineHeight: 20,
    },
    orderSummary: {
        backgroundColor: colors.white,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    summaryRow: {
        flexDirection: 'row',
        gap: 24,
        marginBottom: 16,
    },
    summaryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    summaryText: {
        fontSize: typography.sm,
        color: colors.textMuted,
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 16,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: '#1E293B',
    },
    totalPrice: {
        fontSize: typography['2xl'],
        fontWeight: typography.black,
        color: colors.primary,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        padding: spacing.xl,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    submitButton: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: borderRadius.xl,
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        fontSize: typography.md,
        fontWeight: typography.black,
        color: colors.white,
    },
    input: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: borderRadius.lg,
        padding: 12,
        fontSize: typography.sm,
        color: '#1E293B',
    },
    disabledInput: {
        backgroundColor: '#F1F5F9',
        color: colors.textMuted,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    }
});

export default JobRequestScreen;
