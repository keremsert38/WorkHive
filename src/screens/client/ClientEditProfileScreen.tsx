import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { X, User, Phone, FileText, Camera } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { updateUser } from '../../services/userService';
import { pickImage, uploadImage } from '../../services/storageService';

interface Props {
    onBack: () => void;
    onSuccess: () => void;
}

const ClientEditProfileScreen: React.FC<Props> = ({ onBack, onSuccess }) => {
    const { user, userData, setUserData } = useAuth();
    const [loading, setLoading] = useState(false);

    // Form State
    const [displayName, setDisplayName] = useState(userData?.displayName || '');
    const [phone, setPhone] = useState(userData?.phone || '');
    const [avatar, setAvatar] = useState(userData?.avatar || 'https://picsum.photos/seed/profile/150/150');

    const handleImagePick = async () => {
        const uri = await pickImage([1, 1]); // Square aspect ratio for profile
        if (uri) {
            setAvatar(uri);
        }
    };

    const handleSave = async () => {
        if (!user?.uid) return;

        if (!displayName.trim()) {
            Alert.alert('Hata', 'İsim alanı boş bırakılamaz.');
            return;
        }

        setLoading(true);
        try {
            let finalAvatarUrl = userData?.avatar || 'https://picsum.photos/seed/profile/150/150';

            // Upload image if changed and new (local uri)
            if (avatar && avatar !== userData?.avatar && !avatar.startsWith('http')) {
                const path = `avatars/${user.uid}/${Date.now()}.jpg`;
                finalAvatarUrl = await uploadImage(avatar, path);
            } else if (avatar) {
                finalAvatarUrl = avatar;
            }

            const updates = {
                displayName: displayName.trim(),
                phone: phone.trim(),
                avatar: finalAvatarUrl
            };

            await updateUser(user.uid, updates);

            // Update local context
            setUserData({ ...userData!, ...updates });

            Alert.alert('Başarılı', 'Profiliniz güncellendi!', [
                { text: 'Tamam', onPress: onSuccess }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.closeButton}>
                    <X size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profili Düzenle</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                    <Image source={{ uri: avatar }} style={styles.avatar} />
                    <TouchableOpacity style={styles.cameraButton} onPress={handleImagePick}>
                        <Camera size={20} color={colors.white} />
                    </TouchableOpacity>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    {/* Display Name */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Ad Soyad</Text>
                        <View style={styles.inputContainer}>
                            <User size={20} color={colors.textMuted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={displayName}
                                onChangeText={setDisplayName}
                                placeholder="Ad Soyad"
                                placeholderTextColor={colors.textMuted}
                            />
                        </View>
                    </View>

                    {/* Phone */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Telefon</Text>
                        <View style={styles.inputContainer}>
                            <Phone size={20} color={colors.textMuted} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="555 123 45 67"
                                placeholderTextColor={colors.textMuted}
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.disabledButton]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <Text style={styles.saveButtonText}>Kaydet</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
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
    closeButton: {
        padding: 8,
        marginLeft: -8,
        width: 40,
    },
    headerTitle: {
        fontSize: typography.lg,
        fontWeight: typography.bold,
        color: '#1E293B',
    },
    content: {
        flex: 1,
    },
    avatarContainer: {
        alignItems: 'center',
        marginVertical: spacing.xl,
        position: 'relative',
        alignSelf: 'center',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: colors.white,
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.primary,
        padding: 8,
        borderRadius: 20,
        borderWidth: 3,
        borderColor: colors.white,
    },
    form: {
        paddingHorizontal: spacing.lg,
    },
    formGroup: {
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: typography.sm,
        fontWeight: typography.bold,
        color: '#1E293B',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: borderRadius.xl,
    },
    inputIcon: {
        marginLeft: 12,
    },
    input: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: typography.sm,
        color: '#1E293B',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        padding: spacing.lg,
        paddingBottom: spacing['2xl'],
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    saveButton: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: borderRadius['2xl'],
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    disabledButton: {
        opacity: 0.7,
    },
    saveButtonText: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: '#1E293B',
    },
});

export default ClientEditProfileScreen;
