import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, Alert, Modal, FlatList, Switch } from 'react-native';
import { X, Upload, ChevronRight, Plus, Minus, Check } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { createListing, updateListing, deleteListing, ServiceListing } from '../../services/freelancerService';
import { Screen } from '../../types';
import { Trash2 } from 'lucide-react-native';
import { pickImage, uploadImage } from '../../services/storageService';

interface Props {
    navigation?: any;
    onBack: () => void;
    onSuccess: () => void;
    initialData?: ServiceListing | null;
}

import { CATEGORIES, Category } from '../../constants/categories';



const CreateListingScreen: React.FC<Props> = ({ onBack, onSuccess, initialData }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const isEditing = !!initialData;

    // Form State (initialized with initialData if available)
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    // Kategori objesini bulmak biraz zor olabilir, isme göre bulmaya çalışalım
    const initialCategory = initialData ? CATEGORIES.find(c => c.name === initialData.category) : null;
    const [category, setCategory] = useState<{ id: string, name: string } | null>(initialCategory || null);

    const [subCategory, setSubCategory] = useState<string>(initialData?.subCategory || '');
    const [price, setPrice] = useState(initialData?.price ? initialData.price.toString() : '');
    const [deliveryTime, setDeliveryTime] = useState(initialData?.deliveryTime ? initialData.deliveryTime.toString() : '3');
    const [features, setFeatures] = useState<string[]>(initialData?.features || ['']);

    // UI State
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);

    const handleAddFeature = () => {
        setFeatures([...features, '']);
    };

    const handleFeatureChange = (text: string, index: number) => {
        const newFeatures = [...features];
        newFeatures[index] = text;
        setFeatures(newFeatures);
    };

    const handleRemoveFeature = (index: number) => {
        const newFeatures = features.filter((_, i) => i !== index);
        setFeatures(newFeatures);
    };

    // Image State
    const [imageUri, setImageUri] = useState<string | null>(initialData?.imageUrl || null);

    const handleImagePick = async () => {
        const uri = await pickImage([4, 3]);
        if (uri) {
            setImageUri(uri);
        }
    };

    const handleSubmit = async () => {
        if (!user?.uid) return;

        // Validation
        if (!title.trim() || !description.trim() || !category || !subCategory || !price.trim()) {
            Alert.alert('Eksik Bilgi', 'Lütfen tüm zorunlu alanları doldurun.');
            return;
        }

        setLoading(true);
        try {
            let finalImageUrl = initialData?.imageUrl || 'https://picsum.photos/seed/' + Date.now() + '/400/300';

            // Upload image if changed and new code
            if (imageUri && imageUri !== initialData?.imageUrl && !imageUri.startsWith('http')) {
                const path = `listings/${user.uid}/${Date.now()}.jpg`;
                finalImageUrl = await uploadImage(imageUri, path);
            } else if (imageUri) {
                finalImageUrl = imageUri;
            }

            const listingData = {
                title: title.trim(),
                description: description.trim(),
                category: category.name,
                subCategory,
                price: parseFloat(price),
                deliveryTime: parseInt(deliveryTime),
                features: features.filter(f => f.trim() !== ''),
                imageUrl: finalImageUrl,
                isActive: initialData?.isActive ?? true,
            };

            if (isEditing && initialData?.id) {
                await updateListing(initialData.id, listingData);
                Alert.alert('Başarılı', 'İlanınız güncellendi!', [{ text: 'Tamam', onPress: onSuccess }]);
            } else {
                await createListing(user.uid, listingData);
                Alert.alert('Başarılı', 'İlanınız başarıyla oluşturuldu!', [{ text: 'Tamam', onPress: onSuccess }]);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Hata', 'İşlem sırasında bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        if (!initialData?.id) return;

        Alert.alert(
            'İlanı Sil',
            'Bu ilanı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await deleteListing(initialData.id);
                            onSuccess();
                        } catch (error) {
                            console.error(error);
                            Alert.alert('Hata', 'İlan silinemedi.');
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const renderCategoryModal = () => (
        <Modal
            visible={showCategoryModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowCategoryModal(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Kategori Seçin</Text>
                        <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                            <X size={24} color="#1E293B" />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={CATEGORIES}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.modalItem}
                                onPress={() => {
                                    setCategory(item);
                                    setSubCategory('');
                                    setShowCategoryModal(false);
                                }}
                            >
                                <Text style={styles.modalItemText}>{item.name}</Text>
                                <ChevronRight size={20} color={colors.textMuted} />
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </View>
        </Modal>
    );

    const renderSubCategoryModal = () => (
        <Modal
            visible={showSubCategoryModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowSubCategoryModal(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Alt Kategori Seçin</Text>
                        <TouchableOpacity onPress={() => setShowSubCategoryModal(false)}>
                            <X size={24} color="#1E293B" />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={category?.subCategories || []}
                        keyExtractor={item => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.modalItem}
                                onPress={() => {
                                    setSubCategory(item);
                                    setShowSubCategoryModal(false);
                                }}
                            >
                                <Text style={styles.modalItemText}>{item}</Text>
                                {subCategory === item && <Check size={20} color={colors.primary} />}
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.closeButton}>
                    <X size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isEditing ? 'İlanı Düzenle' : 'Yeni İlan Oluştur'}</Text>
                {isEditing ? (
                    <TouchableOpacity onPress={handleDelete} style={{ padding: 8 }}>
                        <Trash2 size={24} color={colors.error} />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 40 }} />
                )}
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Image Upload Placeholder */}
                <TouchableOpacity style={styles.imageUpload} onPress={handleImagePick}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.uploadedImage} />
                    ) : (
                        <>
                            <View style={styles.uploadIcon}>
                                <Upload size={32} color={colors.primary} />
                            </View>
                            <Text style={styles.uploadText}>Kapak Görseli Yükle</Text>
                            <Text style={styles.uploadSubtext}>veya varsayılan görsel kullanın</Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Title */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>İlan Başlığı</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Örn: Modern ve minimalist logo tasarımı yapabilirim"
                        placeholderTextColor={colors.textMuted}
                        value={title}
                        onChangeText={setTitle}
                        maxLength={80}
                    />
                    <Text style={styles.charCount}>{title.length}/80</Text>
                </View>

                {/* Category Selection */}
                <View style={styles.row}>
                    <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                        <Text style={styles.label}>Kategori</Text>
                        <TouchableOpacity
                            style={styles.selectButton}
                            onPress={() => setShowCategoryModal(true)}
                        >
                            <Text style={[styles.selectText, !category && styles.placeholderText]}>
                                {category?.name || 'Seçiniz'}
                            </Text>
                            <ChevronRight size={20} color={colors.textMuted} />
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                        <Text style={styles.label}>Alt Kategori</Text>
                        <TouchableOpacity
                            style={[styles.selectButton, !category && styles.disabledButton]}
                            onPress={() => category && setShowSubCategoryModal(true)}
                            disabled={!category}
                        >
                            <Text style={[styles.selectText, !subCategory && styles.placeholderText]}>
                                {subCategory || 'Seçiniz'}
                            </Text>
                            <ChevronRight size={20} color={colors.textMuted} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Açıklama</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Hizmetinizin detaylarını, sürecini ve neleri kapsadığını anlatın..."
                        placeholderTextColor={colors.textMuted}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                    />
                </View>

                {/* Price & Delivery */}
                <View style={styles.row}>
                    <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                        <Text style={styles.label}>Fiyat (₺)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0.00"
                            placeholderTextColor={colors.textMuted}
                            value={price}
                            onChangeText={setPrice}
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                        <Text style={styles.label}>Teslim Süresi (Gün)</Text>
                        <View style={styles.numberInput}>
                            <TouchableOpacity
                                style={styles.stepperButton}
                                onPress={() => setDeliveryTime(prev => String(Math.max(1, parseInt(prev || '0') - 1)))}
                            >
                                <Minus size={16} color="#1E293B" />
                            </TouchableOpacity>
                            <TextInput
                                style={styles.numberTextInput}
                                value={deliveryTime}
                                onChangeText={setDeliveryTime}
                                keyboardType="numeric"
                            />
                            <TouchableOpacity
                                style={styles.stepperButton}
                                onPress={() => setDeliveryTime(prev => String(parseInt(prev || '0') + 1))}
                            >
                                <Plus size={16} color="#1E293B" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Features */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Özellikler (Opsiyonel)</Text>
                    <Text style={styles.helperText}>Müşteriye neleri teslim edeceğinizi listeleyin (örn: Kaynak dosyası)</Text>

                    {features.map((feature, index) => (
                        <View key={index} style={styles.featureRow}>
                            <TextInput
                                style={[styles.input, { flex: 1, marginBottom: 8 }]}
                                placeholder="Özellik ekle..."
                                placeholderTextColor={colors.textMuted}
                                value={feature}
                                onChangeText={(text) => handleFeatureChange(text, index)}
                            />
                            {features.length > 1 && (
                                <TouchableOpacity
                                    style={styles.removeFeatureButton}
                                    onPress={() => handleRemoveFeature(index)}
                                >
                                    <X size={20} color={colors.error} />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}

                    <TouchableOpacity style={styles.addFeatureButton} onPress={handleAddFeature}>
                        <Plus size={16} color={colors.primary} />
                        <Text style={styles.addFeatureText}>Yeni Özellik Ekle</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    <Text style={styles.submitButtonText}>
                        {loading ? 'İşleniyor...' : (isEditing ? 'Güncelle' : 'İlanı Yayınla')}
                    </Text>
                </TouchableOpacity>
            </View>

            {renderCategoryModal()}
            {renderSubCategoryModal()}
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
        padding: spacing.lg,
    },
    imageUpload: {
        height: 160,
        backgroundColor: colors.white,
        borderRadius: borderRadius['2xl'],
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xl,
    },
    uploadIcon: {
        width: 48,
        height: 48,
        backgroundColor: colors.primaryLight,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    uploadText: {
        fontSize: typography.sm,
        fontWeight: typography.bold,
        color: '#1E293B',
    },
    uploadSubtext: {
        fontSize: typography.xs,
        color: colors.textMuted,
        marginTop: 4,
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
    input: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: borderRadius.xl,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: typography.sm,
        color: '#1E293B',
    },
    textArea: {
        minHeight: 120,
    },
    charCount: {
        fontSize: 10,
        color: colors.textMuted,
        textAlign: 'right',
        marginTop: 4,
    },
    row: {
        flexDirection: 'row',
        marginBottom: spacing.lg,
    },
    selectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: borderRadius.xl,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    selectText: {
        fontSize: typography.sm,
        color: '#1E293B',
    },
    placeholderText: {
        color: colors.textMuted,
    },
    disabledButton: {
        backgroundColor: '#F8FAFC',
        opacity: 0.7,
    },
    numberInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: borderRadius.xl,
        padding: 4,
    },
    stepperButton: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
    },
    numberTextInput: {
        flex: 1,
        textAlign: 'center',
        fontSize: typography.sm,
        fontWeight: typography.bold,
        color: '#1E293B',
        paddingVertical: 8,
    },
    helperText: {
        fontSize: typography.xs,
        color: colors.textMuted,
        marginBottom: 12,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    removeFeatureButton: {
        padding: 8,
        marginTop: -8,
    },
    addFeatureButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: borderRadius.xl,
        borderStyle: 'dashed',
        marginTop: 8,
    },
    addFeatureText: {
        fontSize: typography.sm,
        fontWeight: typography.bold,
        color: colors.primary,
        marginLeft: 8,
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
    submitButton: {
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
    submitButtonText: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: '#1E293B',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius['3xl'],
        borderTopRightRadius: borderRadius['3xl'],
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    modalTitle: {
        fontSize: typography.lg,
        fontWeight: typography.bold,
        color: '#1E293B',
    },
    modalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xl,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F9FAFB',
    },
    modalItemText: {
        fontSize: typography.md,
        color: '#1E293B',
    },
    uploadedImage: {
        width: '100%',
        height: '100%',
        borderRadius: borderRadius['2xl'],
    }
});

export default CreateListingScreen;
