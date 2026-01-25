import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Image, Alert, Modal } from 'react-native';
import { ChevronLeft, Send, Phone, Video, Camera, X, MapPin, Briefcase, Star } from 'lucide-react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { Message, sendMessage, subscribeToMessages, markConversationAsRead } from '../../services/messageService';
import { pickImage, uploadImage } from '../../services/storageService';
import { getUser } from '../../services/userService';
import { UserData } from '../../context/AuthContext';

interface Props {
    route: any;
    navigation: any;
}

const ChatScreen: React.FC<Props> = ({ route, navigation }) => {
    const { conversationId, recipientName, recipientId } = route.params;
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [recipientData, setRecipientData] = useState<UserData | null>(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    // Load recipient profile data
    useEffect(() => {
        const loadRecipientData = async () => {
            if (recipientId) {
                try {
                    const data = await getUser(recipientId);
                    setRecipientData(data);
                } catch (error) {
                    console.error('Error loading recipient data:', error);
                }
            }
        };
        loadRecipientData();
    }, [recipientId]);

    useEffect(() => {
        if (!conversationId || !user) return;

        // Mark as read immediately
        markConversationAsRead(conversationId, user.uid);

        const unsubscribe = subscribeToMessages(conversationId, (newMessages) => {
            setMessages(newMessages);
            setLoading(false);

            // Also mark as read when new messages arrive while screen is open
            markConversationAsRead(conversationId, user.uid);

            // Scroll to bottom on new message
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        });

        return () => unsubscribe();
    }, [conversationId, user]);

    const handleSend = async () => {
        if (!inputText.trim() || !user) return;

        const text = inputText.trim();
        setInputText('');

        try {
            await sendMessage(conversationId, user.uid, text);
        } catch (error) {
            console.error('Error sending message:', error);
            // Ideally show error toast
        }
    };

    const handleImagePick = async () => {
        if (!user) return;

        try {
            const uri = await pickImage();
            if (!uri) return;

            setSending(true);
            const path = `chat/${conversationId}/${Date.now()}.jpg`;
            const imageUrl = await uploadImage(uri, path);

            await sendMessage(conversationId, user.uid, '', imageUrl);
        } catch (error) {
            console.error('Error sending image:', error);
            Alert.alert('Hata', 'Fotoğraf gönderilemedi.');
        } finally {
            setSending(false);
        }
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isMyMessage = item.senderId === user?.uid;

        return (
            <View style={[
                styles.messageContainer,
                isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
            ]}>
                <View style={[
                    styles.messageBubble,
                    isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble
                ]}>
                    {item.imageUrl ? (
                        <Image
                            source={{ uri: item.imageUrl }}
                            style={styles.messageImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <Text style={[
                            styles.messageText,
                            isMyMessage ? styles.myMessageText : styles.otherMessageText
                        ]}>
                            {item.text}
                        </Text>
                    )}
                    <Text style={[
                        styles.timeText,
                        isMyMessage ? styles.myTimeText : styles.otherTimeText
                    ]}>
                        {item.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft size={24} color="#1E293B" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.headerProfile}
                        onPress={() => recipientData && setShowProfileModal(true)}
                    >
                        {recipientData?.avatar ? (
                            <Image source={{ uri: recipientData.avatar }} style={styles.headerAvatar} />
                        ) : (
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{recipientName?.charAt(0) || '?'}</Text>
                            </View>
                        )}
                        <View style={styles.headerInfo}>
                            <Text style={styles.headerTitle}>{recipientData?.displayName || recipientName || 'Sohbet'}</Text>
                            {recipientData?.expertise && (
                                <Text style={styles.headerSubtitle}>{recipientData.expertise}</Text>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.headerRight} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.messagesList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                />
            )}

            {/* Input Area */}
            <View style={styles.inputContainer}>
                <TouchableOpacity
                    style={styles.attachButton}
                    onPress={handleImagePick}
                    disabled={sending}
                >
                    {sending ? (
                        <ActivityIndicator size="small" color={colors.textMuted} />
                    ) : (
                        <Camera size={24} color={colors.textMuted} />
                    )}
                </TouchableOpacity>

                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Mesaj yazın..."
                    placeholderTextColor="#94A3B8"
                    multiline
                />
                <TouchableOpacity
                    style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                    onPress={handleSend}
                    disabled={!inputText.trim()}
                >
                    <Send size={20} color={inputText.trim() ? '#fff' : '#94A3B8'} />
                </TouchableOpacity>
            </View>

            {/* Profile Modal */}
            <Modal
                visible={showProfileModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowProfileModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Profil Bilgileri</Text>
                            <TouchableOpacity onPress={() => setShowProfileModal(false)}>
                                <X size={24} color="#1E293B" />
                            </TouchableOpacity>
                        </View>

                        {recipientData && (
                            <View style={styles.profileContent}>
                                {/* Avatar */}
                                <View style={styles.profileAvatarContainer}>
                                    {recipientData.avatar ? (
                                        <Image source={{ uri: recipientData.avatar }} style={styles.profileAvatar} />
                                    ) : (
                                        <View style={styles.profileAvatarPlaceholder}>
                                            <Text style={styles.profileAvatarText}>
                                                {recipientData.displayName?.charAt(0) || '?'}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* Name */}
                                <Text style={styles.profileName}>{recipientData.displayName}</Text>

                                {/* Rating */}
                                {recipientData.rating && (
                                    <View style={styles.profileRating}>
                                        <Star size={16} color="#FBBF24" fill="#FBBF24" />
                                        <Text style={styles.profileRatingText}>{recipientData.rating.toFixed(1)}</Text>
                                    </View>
                                )}

                                {/* Info Cards */}
                                <View style={styles.profileInfoCards}>
                                    {recipientData.expertise && (
                                        <View style={styles.profileInfoCard}>
                                            <Briefcase size={18} color={colors.primary} />
                                            <Text style={styles.profileInfoLabel}>Uzmanlık</Text>
                                            <Text style={styles.profileInfoValue}>{recipientData.expertise}</Text>
                                        </View>
                                    )}

                                    {recipientData.title && (
                                        <View style={styles.profileInfoCard}>
                                            <Briefcase size={18} color={colors.primary} />
                                            <Text style={styles.profileInfoLabel}>Ünvan</Text>
                                            <Text style={styles.profileInfoValue}>{recipientData.title}</Text>
                                        </View>
                                    )}
                                </View>

                                {/* Bio */}
                                {recipientData.bio && (
                                    <View style={styles.profileBioContainer}>
                                        <Text style={styles.profileBioLabel}>Hakkında</Text>
                                        <Text style={styles.profileBioText}>{recipientData.bio}</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
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
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xl,
        paddingBottom: spacing.md,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backButton: {
        padding: 4,
        marginLeft: -4,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: '#64748B',
    },
    headerTitle: {
        fontSize: typography.md,
        fontWeight: typography.bold,
        color: '#1E293B',
    },
    headerRight: {
        flexDirection: 'row',
        gap: 8,
    },
    headerIcon: {
        padding: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messagesList: {
        padding: spacing.md,
    },
    messageContainer: {
        marginBottom: 12,
        maxWidth: '80%',
    },
    myMessageContainer: {
        alignSelf: 'flex-end',
    },
    otherMessageContainer: {
        alignSelf: 'flex-start',
    },
    messageBubble: {
        borderRadius: 16,
        padding: 12,
        paddingBottom: 6,
    },
    myMessageBubble: {
        backgroundColor: colors.primary,
        borderBottomRightRadius: 4,
    },
    otherMessageBubble: {
        backgroundColor: colors.white,
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    messageText: {
        fontSize: typography.md,
        marginBottom: 4,
    },
    messageImage: {
        width: 200,
        height: 200,
        borderRadius: 8,
        marginBottom: 4,
    },
    myMessageText: {
        color: '#1E293B', // Dark text on yellow primary
    },
    otherMessageText: {
        color: '#1E293B',
    },
    timeText: {
        fontSize: 10,
        alignSelf: 'flex-end',
    },
    myTimeText: {
        color: 'rgba(30, 41, 59, 0.6)',
    },
    otherTimeText: {
        color: '#94A3B8',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    attachButton: {
        padding: 8,
        marginRight: 8,
    },
    input: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        maxHeight: 100,
        color: '#1E293B',
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
    },
    sendButtonDisabled: {
        backgroundColor: '#E2E8F0',
    },
    headerProfile: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    headerInfo: {
        flexDirection: 'column',
    },
    headerSubtitle: {
        fontSize: typography.xs,
        color: '#64748B',
        marginTop: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
        paddingBottom: 32,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    modalTitle: {
        fontSize: typography.lg,
        fontWeight: typography.bold,
        color: '#1E293B',
    },
    profileContent: {
        padding: 24,
        alignItems: 'center',
    },
    profileAvatarContainer: {
        marginBottom: 16,
    },
    profileAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: colors.primary,
    },
    profileAvatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileAvatarText: {
        fontSize: 36,
        fontWeight: typography.bold,
        color: '#64748B',
    },
    profileName: {
        fontSize: typography.xl,
        fontWeight: typography.bold,
        color: '#1E293B',
        marginBottom: 8,
    },
    profileRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 20,
    },
    profileRatingText: {
        fontSize: typography.md,
        fontWeight: typography.semibold,
        color: '#1E293B',
    },
    profileInfoCards: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 20,
        width: '100%',
    },
    profileInfoCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 16,
        minWidth: 120,
        alignItems: 'center',
    },
    profileInfoLabel: {
        fontSize: typography.xs,
        color: '#64748B',
        marginTop: 8,
    },
    profileInfoValue: {
        fontSize: typography.sm,
        fontWeight: typography.semibold,
        color: '#1E293B',
        marginTop: 4,
        textAlign: 'center',
    },
    profileBioContainer: {
        width: '100%',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 16,
    },
    profileBioLabel: {
        fontSize: typography.sm,
        fontWeight: typography.bold,
        color: '#1E293B',
        marginBottom: 8,
    },
    profileBioText: {
        fontSize: typography.sm,
        color: '#475569',
        lineHeight: 22,
    },
});

export default ChatScreen;
