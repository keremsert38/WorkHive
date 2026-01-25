export enum Screen {
    // Auth Screens
    SPLASH = 'Splash',
    ONBOARDING = 'Onboarding',
    ACCOUNT_TYPE = 'AccountType',
    LOGIN = 'Login',
    EMAIL_VERIFICATION = 'EmailVerification',

    // Freelancer Screens
    REGISTER = 'Register',
    DASHBOARD = 'Dashboard',
    LISTING_MANAGEMENT = 'ListingManagement',
    JOB_MANAGEMENT = 'JobManagement',
    MESSAGES = 'Messages',
    CATEGORIES = 'Categories',
    FREELANCER_PROFILE = 'FreelancerProfile',
    EDIT_PROFILE = 'EditProfile',
    NOTIFICATION_SETTINGS = 'NotificationSettings',
    SETTINGS = 'Settings',
    CREATE_LISTING = 'CreateListing',
    JOB_BOARD = 'JobBoard',
    JOB_DETAILS = 'JobDetails',
    SUBMIT_PROPOSAL = 'SubmitProposal',

    // Client Screens
    CLIENT_REGISTER = 'ClientRegister',
    CLIENT_HOME = 'ClientHome',
    CLIENT_SEARCH = 'ClientSearch',
    CREATE_JOB = 'CreateJob',
    SERVICE_DETAIL = 'ServiceDetail',
    CHAT = 'Chat',
    JOB_REQUEST = 'JobRequest',
    CLIENT_ORDERS = 'ClientOrders',
    CLIENT_MESSAGES = 'ClientMessages',
    CLIENT_FAVORITES = 'ClientFavorites',
    CLIENT_PROFILE = 'ClientProfile',
    CLIENT_FREELANCER_PROFILE = 'ClientFreelancerProfile',
    CLIENT_JOB_DETAILS = 'ClientJobDetails',
    CLIENT_EDIT_PROFILE = 'ClientEditProfile',
}

export type AccountType = 'client' | 'freelancer';

export type RootStackParamList = {
    [Screen.SPLASH]: undefined;
    [Screen.ONBOARDING]: undefined;
    [Screen.ACCOUNT_TYPE]: undefined;
    [Screen.REGISTER]: undefined;
    [Screen.CLIENT_REGISTER]: undefined;
    [Screen.DASHBOARD]: undefined;
    [Screen.CLIENT_HOME]: undefined;
    FreelancerTabs: undefined;
    ClientTabs: undefined;
};

export type FreelancerTabParamList = {
    [Screen.DASHBOARD]: undefined;
    [Screen.JOB_MANAGEMENT]: undefined;
    [Screen.MESSAGES]: undefined;
    [Screen.LISTING_MANAGEMENT]: undefined;
    [Screen.CATEGORIES]: undefined;
};

export type ClientTabParamList = {
    [Screen.CLIENT_HOME]: undefined;
    [Screen.CATEGORIES]: undefined;
    [Screen.CLIENT_FAVORITES]: undefined;
    [Screen.CLIENT_ORDERS]: undefined;
    [Screen.CLIENT_MESSAGES]: undefined;
    [Screen.CLIENT_PROFILE]: undefined;
};
