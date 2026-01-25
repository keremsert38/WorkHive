import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { Screen } from './src/types';
import { colors } from './src/theme';
import { logout } from './src/services/authService';

// Auth Screens
import SplashScreen from './src/screens/auth/SplashScreen';
import OnboardingScreen from './src/screens/auth/OnboardingScreen';
import AccountTypeScreen from './src/screens/auth/AccountTypeScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import EmailVerificationScreen from './src/screens/auth/EmailVerificationScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import ClientRegisterScreen from './src/screens/auth/ClientRegisterScreen';

// Freelancer Screens
import DashboardScreen from './src/screens/freelancer/DashboardScreen';
import ListingManagementScreen from './src/screens/freelancer/ListingManagementScreen';
import JobManagementScreen from './src/screens/freelancer/JobManagementScreen';
import MessagesScreen from './src/screens/freelancer/MessagesScreen';
import CategoriesScreen from './src/screens/freelancer/CategoriesScreen';
import FreelancerProfileScreen from './src/screens/freelancer/FreelancerProfileScreen';
import EditProfileScreen from './src/screens/freelancer/EditProfileScreen';
import NotificationSettingsScreen from './src/screens/freelancer/NotificationSettingsScreen';
import SettingsScreen from './src/screens/freelancer/SettingsScreen';
import CreateListingScreen from './src/screens/freelancer/CreateListingScreen';
import JobBoardScreen from './src/screens/freelancer/JobBoardScreen';
import JobDetailsScreen from './src/screens/freelancer/JobDetailsScreen';
import { getOrCreateConversation, subscribeToTotalUnreadCount } from './src/services/messageService';
import { auth } from './src/config/firebase';
import SubmitProposalScreen from './src/screens/freelancer/SubmitProposalScreen';
import { ServiceListing } from './src/services/freelancerService';
import { JobPosting } from './src/services/jobService';

// Client Screens
import ClientHomeScreen from './src/screens/client/ClientHomeScreen';
import ClientOrdersScreen from './src/screens/client/ClientOrdersScreen';
import ClientMessagesScreen from './src/screens/client/ClientMessagesScreen';
import ClientFavoritesScreen from './src/screens/client/ClientFavoritesScreen';
import ClientProfileScreen from './src/screens/client/ClientProfileScreen';
import ClientEditProfileScreen from './src/screens/client/ClientEditProfileScreen';
import ClientSearchScreen from './src/screens/client/ClientSearchScreen';
import ServiceDetailScreen from './src/screens/client/ServiceDetailScreen';
import JobRequestScreen from './src/screens/client/JobRequestScreen';
import CreateJobScreen from './src/screens/client/CreateJobScreen';
import ClientJobDetailsScreen from './src/screens/client/ClientJobDetailsScreen';
import ChatScreen from './src/screens/common/ChatScreen';
import ClientFreelancerProfileScreen from './src/screens/client/ClientFreelancerProfileScreen';

// Components
import BottomNav from './src/components/BottomNav';
import ClientBottomNav from './src/components/ClientBottomNav';

function AppContent() {
    const { user, userData, loading } = useAuth();
    // Default to ONBOARDING, but we'll show spinner until loading is false
    const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.ONBOARDING);
    const [pendingEmail, setPendingEmail] = useState<string>('');

    const [editingListing, setEditingListing] = useState<any | null>(null);
    const [selectedFreelancer, setSelectedFreelancer] = useState<any | null>(null);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [selectedRecipientName, setSelectedRecipientName] = useState<string | null>(null);
    const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
    const [searchParams, setSearchParams] = useState<any>(null);
    const [previousScreen, setPreviousScreen] = useState<Screen>(Screen.DASHBOARD);
    const [totalUnreadCount, setTotalUnreadCount] = useState(0);

    // Handle auth state changes
    useEffect(() => {
        if (!loading) {
            if (user && userData) {
                if (!user.emailVerified) {
                    setPendingEmail(user.email || '');
                    setCurrentScreen(Screen.EMAIL_VERIFICATION);
                } else if (userData.accountType === 'freelancer') {
                    setCurrentScreen(Screen.DASHBOARD);
                } else {
                    setCurrentScreen(Screen.CLIENT_HOME);
                }
            } else {
                // If not logged in, stay on ONBOARDING (which is default)
                // But we explicitly set it to ensure no stale state
                if (currentScreen === Screen.SPLASH) {
                    // Legacy check just in case, though we changed default
                    setCurrentScreen(Screen.ONBOARDING);
                }
            }
        }
    }, [user, userData, loading]);

    // Subscribe to unread messages
    useEffect(() => {
        if (user) {
            const unsubscribe = subscribeToTotalUnreadCount(user.uid, (count) => {
                setTotalUnreadCount(count);
            });
            return () => unsubscribe();
        }
    }, [user]);

    const handleAccountTypeSelect = (type: 'client' | 'freelancer') => {
        if (type === 'freelancer') {
            setCurrentScreen(Screen.REGISTER);
        } else {
            setCurrentScreen(Screen.CLIENT_REGISTER);
        }
    };

    const handleRegistrationSuccess = (email: string) => {
        setPendingEmail(email);
        setCurrentScreen(Screen.EMAIL_VERIFICATION);
    };

    const handleEmailVerified = () => {
        // After verification, check logic will auto-route thanks to useEffect
    };

    const handleLoginSuccess = () => {
        // After login, the useEffect will handle navigation
    };

    const handleLogout = async () => {
        await logout();
        setCurrentScreen(Screen.ONBOARDING);
    };

    const goToLogin = () => {
        setCurrentScreen(Screen.LOGIN);
    };

    const goToAccountType = () => {
        setCurrentScreen(Screen.ACCOUNT_TYPE);
    };

    const goToOnboarding = () => {
        setCurrentScreen(Screen.ONBOARDING);
    };

    const isFreelancerScreen = [
        Screen.DASHBOARD,
        Screen.LISTING_MANAGEMENT,
        Screen.JOB_MANAGEMENT,
        Screen.MESSAGES,
        Screen.CATEGORIES,
        Screen.FREELANCER_PROFILE,
    ].includes(currentScreen);

    const isClientScreen = [
        Screen.CLIENT_HOME,
        Screen.CLIENT_ORDERS,
        Screen.CLIENT_MESSAGES,
        Screen.CLIENT_FAVORITES,
        Screen.CLIENT_PROFILE,
        Screen.CLIENT_SEARCH,
    ].includes(currentScreen);

    // Show loading while checking auth
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const renderScreen = () => {
        switch (currentScreen) {
            // case Screen.SPLASH:
            //    return <SplashScreen onFinish={() => {}} />;

            case Screen.ONBOARDING:
                return <OnboardingScreen onNext={() => setCurrentScreen(Screen.ACCOUNT_TYPE)} />;

            case Screen.ACCOUNT_TYPE:
                return (
                    <AccountTypeScreen
                        onBack={() => setCurrentScreen(Screen.ONBOARDING)}
                        onNext={handleAccountTypeSelect}
                    />
                );

            case Screen.LOGIN:
                return (
                    <LoginScreen
                        onBack={goToAccountType}
                        onSuccess={handleLoginSuccess}
                        onRegister={goToAccountType}
                    />
                );

            case Screen.EMAIL_VERIFICATION:
                return (
                    <EmailVerificationScreen
                        email={pendingEmail}
                        onVerified={handleEmailVerified}
                        onBack={goToOnboarding}
                    />
                );

            case Screen.REGISTER:
                return (
                    <RegisterScreen
                        onBack={() => setCurrentScreen(Screen.ACCOUNT_TYPE)}
                        onSuccess={(email: string) => handleRegistrationSuccess(email)}
                        onLogin={goToLogin}
                    />
                );

            case Screen.CLIENT_REGISTER:
                return (
                    <ClientRegisterScreen
                        onBack={() => setCurrentScreen(Screen.ACCOUNT_TYPE)}
                        onSuccess={(email: string) => handleRegistrationSuccess(email)}
                        onLogin={goToLogin}
                    />
                );

            // Freelancer Screens
            case Screen.DASHBOARD:
                return (
                    <DashboardScreen
                        navigation={{
                            navigate: (screen: string) => {
                                if (screen === 'JobManagement') setCurrentScreen(Screen.JOB_MANAGEMENT);
                            }
                        }}
                    />
                );
            case Screen.LISTING_MANAGEMENT:
                return <ListingManagementScreen
                    onAddListing={() => {
                        setEditingListing(null);
                        setCurrentScreen(Screen.CREATE_LISTING);
                    }}
                    onEditListing={(listing) => {
                        setEditingListing(listing);
                        setCurrentScreen(Screen.CREATE_LISTING);
                    }}
                />;
            case Screen.JOB_MANAGEMENT:
                return <JobManagementScreen />;
            case Screen.MESSAGES:
                return (
                    <MessagesScreen
                        onConversationPress={(conversationId, recipientName, recipientId) => {
                            setSelectedConversationId(conversationId);
                            setSelectedRecipientName(recipientName);
                            setSelectedRecipientId(recipientId);
                            setPreviousScreen(Screen.MESSAGES);
                            setCurrentScreen(Screen.CHAT);
                        }}
                    />
                );
            case Screen.CATEGORIES:
                return <CategoriesScreen />;
            case Screen.FREELANCER_PROFILE:
                return <FreelancerProfileScreen
                    onLogout={handleLogout}
                    onEditProfile={() => setCurrentScreen(Screen.EDIT_PROFILE)}
                    onNotificationSettings={() => setCurrentScreen(Screen.NOTIFICATION_SETTINGS)}
                    onSettings={() => setCurrentScreen(Screen.SETTINGS)}
                />;
            case Screen.EDIT_PROFILE:
                return (
                    <EditProfileScreen
                        onBack={() => setCurrentScreen(Screen.FREELANCER_PROFILE)}
                        onSuccess={() => setCurrentScreen(Screen.FREELANCER_PROFILE)}
                    />
                );
            case Screen.NOTIFICATION_SETTINGS:
                return (
                    <NotificationSettingsScreen
                        onBack={() => setCurrentScreen(Screen.FREELANCER_PROFILE)}
                    />
                );
            case Screen.SETTINGS:
                return (
                    <SettingsScreen
                        onBack={() => setCurrentScreen(Screen.FREELANCER_PROFILE)}
                    />
                );
            case Screen.CREATE_LISTING:
                return <CreateListingScreen
                    initialData={editingListing}
                    onBack={() => {
                        setEditingListing(null);
                        setCurrentScreen(Screen.LISTING_MANAGEMENT);
                    }}
                    onSuccess={() => {
                        setEditingListing(null);
                        setCurrentScreen(Screen.LISTING_MANAGEMENT);
                    }}
                />;

            case Screen.JOB_BOARD:
                return (
                    <JobBoardScreen
                        onBack={() => setCurrentScreen(Screen.DASHBOARD)}
                        onJobPress={(job: JobPosting) => {
                            setSelectedJobId(job.id);
                            setCurrentScreen(Screen.JOB_DETAILS);
                        }}
                    />
                );


            // ... (inside switch)
            case Screen.JOB_DETAILS:
                return (
                    <JobDetailsScreen
                        route={{ params: { jobId: selectedJobId } }}
                        navigation={{ goBack: () => setCurrentScreen(Screen.JOB_BOARD) }}
                        onBack={() => setCurrentScreen(Screen.JOB_BOARD)}
                        onApply={(job) => {
                            setSelectedJobId(job.id);
                            setCurrentScreen(Screen.SUBMIT_PROPOSAL);
                        }}
                        onMessage={async (job) => {
                            try {
                                if (auth.currentUser && userData) {
                                    const convId = await getOrCreateConversation(
                                        auth.currentUser.uid,
                                        job.clientId,
                                        userData.displayName || 'Freelancer',
                                        'İş Veren'
                                    );
                                    setSelectedConversationId(convId);
                                    setSelectedRecipientName('İş Veren');
                                    setSelectedRecipientId(job.clientId);
                                    setCurrentScreen(Screen.CHAT);
                                }
                            } catch (e) {
                                console.error('Error starting conversation:', e);
                            }
                        }}
                    />
                );

            case Screen.SUBMIT_PROPOSAL:
                return (
                    <SubmitProposalScreen
                        route={{ params: { jobId: selectedJobId } }}
                        navigation={{ goBack: () => setCurrentScreen(Screen.JOB_DETAILS) }}
                    />
                );

            case Screen.CLIENT_HOME:
                return (
                    <ClientHomeScreen
                        navigation={{
                            navigate: (screen: string, params?: any) => {
                                if (screen === 'ClientSearch') {
                                    setSearchParams(params);
                                    setCurrentScreen(Screen.CLIENT_SEARCH);
                                }
                                if (screen === 'CreateJob') setCurrentScreen(Screen.CREATE_JOB);
                                if (screen === 'ClientJobDetails') {
                                    setSelectedJobId(params?.jobId);
                                    setCurrentScreen(Screen.CLIENT_JOB_DETAILS);
                                }
                                if (screen === 'Chat') {
                                    setSelectedConversationId(params?.conversationId);
                                    setSelectedRecipientName(params?.recipientName);
                                    setSelectedRecipientId(params?.recipientId);
                                    setCurrentScreen(Screen.CHAT);
                                }
                                if (screen === 'ServiceDetail') {
                                    setEditingListing(params);
                                    setCurrentScreen(Screen.SERVICE_DETAIL);
                                }
                            }
                        }}
                    />
                );
            case Screen.CREATE_JOB:
                return (
                    <CreateJobScreen
                        onBack={() => setCurrentScreen(Screen.CLIENT_HOME)}
                        onSuccess={() => setCurrentScreen(Screen.CLIENT_HOME)}
                    />
                );
            case Screen.CLIENT_JOB_DETAILS:
                return (
                    <ClientJobDetailsScreen
                        route={{ params: { jobId: selectedJobId } }}
                        navigation={{
                            goBack: () => setCurrentScreen(Screen.CLIENT_HOME),
                        }}
                    />
                );

            case Screen.CLIENT_SEARCH:
                return (
                    <ClientSearchScreen
                        onBack={() => setCurrentScreen(Screen.CLIENT_HOME)}
                        onServiceClick={(listing) => {
                            setEditingListing(listing); // Reuse editingListing state to pass data or create new state?
                            // Better create a selectedService state.
                            // But for now let's reuse editingListing as a quick hack or add a new state.
                            // Adding new state is cleaner.
                            setCurrentScreen(Screen.SERVICE_DETAIL);
                            setEditingListing(listing); // Using this to pass data for now
                        }}
                    />
                );
            // Moved import to top-level

            // ... (existing imports)

            // ...

            case Screen.SERVICE_DETAIL:
                return editingListing ? (
                    <ServiceDetailScreen
                        listing={editingListing}
                        onBack={() => setCurrentScreen(Screen.CLIENT_SEARCH)}
                        onHire={(listing, freelancer) => {
                            setEditingListing(listing);
                            setSelectedFreelancer(freelancer);
                            setCurrentScreen(Screen.JOB_REQUEST);
                        }}
                        onViewProfile={(freelancer) => {
                            setSelectedFreelancer(freelancer);
                            setCurrentScreen(Screen.CLIENT_FREELANCER_PROFILE);
                        }}
                        onMessage={async (freelancer, listing) => {
                            try {
                                if (auth.currentUser && userData) {
                                    const convId = await getOrCreateConversation(
                                        auth.currentUser.uid,
                                        freelancer.uid,
                                        userData.displayName || 'Müşteri',
                                        freelancer.displayName || 'Freelancer'
                                    );
                                    setSelectedConversationId(convId);
                                    setSelectedRecipientName(freelancer.displayName || 'Freelancer');
                                    setSelectedRecipientId(freelancer.uid);
                                    setPreviousScreen(Screen.SERVICE_DETAIL);
                                    setCurrentScreen(Screen.CHAT);
                                }
                            } catch (e) {
                                console.error('Error starting conversation:', e);
                            }
                        }}
                    />
                ) : <ClientHomeScreen />;

            case Screen.CLIENT_FREELANCER_PROFILE:
                return selectedFreelancer ? (
                    <ClientFreelancerProfileScreen
                        freelancerId={selectedFreelancer.uid}
                        onBack={() => {
                            if (editingListing) {
                                setCurrentScreen(Screen.SERVICE_DETAIL);
                            } else {
                                setCurrentScreen(Screen.CLIENT_SEARCH);
                            }
                        }}
                        onTableOffer={(freelancer) => {
                            setSelectedFreelancer(freelancer);
                            setEditingListing(null); // Clear listing for direct offer
                            setCurrentScreen(Screen.JOB_REQUEST);
                        }}
                        onServiceClick={(listing) => {
                            setEditingListing(listing);
                            setCurrentScreen(Screen.SERVICE_DETAIL);
                        }}
                    />
                ) : <ClientHomeScreen />;

            case Screen.JOB_REQUEST:
                return (selectedFreelancer) ? (
                    <JobRequestScreen
                        listing={editingListing || undefined} // Can be undefined now
                        freelancer={selectedFreelancer}
                        onBack={() => {
                            if (editingListing) {
                                setCurrentScreen(Screen.SERVICE_DETAIL);
                            } else {
                                setCurrentScreen(Screen.CLIENT_FREELANCER_PROFILE);
                            }
                        }}
                        onSuccess={() => {
                            setEditingListing(null);
                            setSelectedFreelancer(null);
                            setCurrentScreen(Screen.CLIENT_ORDERS);
                        }}
                    />
                ) : <ClientHomeScreen />;
            case Screen.CLIENT_ORDERS:
                return (
                    <ClientOrdersScreen
                        navigation={{
                            goBack: () => setCurrentScreen(Screen.CLIENT_HOME)
                        }}
                    />
                );
            case Screen.CLIENT_MESSAGES:
                return (
                    <ClientMessagesScreen
                        onConversationPress={(conversationId, recipientName, recipientId) => {
                            setSelectedConversationId(conversationId);
                            setSelectedRecipientName(recipientName);
                            setSelectedRecipientId(recipientId);
                            setPreviousScreen(Screen.CLIENT_MESSAGES);
                            setCurrentScreen(Screen.CHAT);
                        }}
                    />
                );
            case Screen.CLIENT_FAVORITES:
                return <ClientFavoritesScreen />;
            case Screen.CLIENT_PROFILE:
                return (
                    <ClientProfileScreen
                        onLogout={handleLogout}
                        onEditProfile={() => setCurrentScreen(Screen.CLIENT_EDIT_PROFILE)}
                    />
                );

            case Screen.CLIENT_EDIT_PROFILE:
                return (
                    <ClientEditProfileScreen
                        onBack={() => setCurrentScreen(Screen.CLIENT_PROFILE)}
                        onSuccess={() => setCurrentScreen(Screen.CLIENT_PROFILE)}
                    />
                );

            case Screen.CHAT:
                return (
                    <ChatScreen
                        route={{
                            params: {
                                conversationId: selectedConversationId,
                                recipientName: selectedRecipientName,
                                recipientId: selectedRecipientId
                            }
                        }}
                        navigation={{ goBack: () => setCurrentScreen(previousScreen) }}
                    />
                );

            default:
                return <OnboardingScreen onNext={() => setCurrentScreen(Screen.ACCOUNT_TYPE)} />;
        }
    };

    return (
        <View style={styles.content}>
            {renderScreen()}

            {isFreelancerScreen && (
                <BottomNav
                    activeScreen={currentScreen}
                    onNavigate={setCurrentScreen}
                    unreadCount={totalUnreadCount}
                />
            )}

            {isClientScreen && (
                <ClientBottomNav
                    activeScreen={currentScreen}
                    onNavigate={setCurrentScreen}
                    unreadCount={totalUnreadCount}
                />
            )}
        </View>
    );
}

export default function App() {
    return (
        <SafeAreaProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <AuthProvider>
                <SafeAreaView style={styles.container} edges={['top']}>
                    <AppContent />
                </SafeAreaView>
            </AuthProvider>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        position: 'relative',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
});
