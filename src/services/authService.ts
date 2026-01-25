import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    sendEmailVerification,
    updateProfile,
    User,
    reload,
    GoogleAuthProvider,
    signInWithCredential,
    signInWithPopup
} from 'firebase/auth';
import { Platform } from 'react-native';
// import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { auth } from '../config/firebase';
import { createUser, getUser } from './userService';
import { Alert } from 'react-native';

// Configure Google Signin
// GoogleSignin.configure({
//     webClientId: '708259486885-778981abfed9e9ce1c014c.apps.googleusercontent.com', // Get this from Firebase Console (Authentication > Google)
// });

export interface RegisterData {
    email: string;
    password: string;
    displayName: string;
    accountType: 'client' | 'freelancer';
    expertise?: string;
}

// ... existing register ...
export const register = async (data: RegisterData): Promise<User> => {
    // ... existing implementation ...
    const { email, password, displayName, accountType, expertise } = data;

    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, { displayName });

    // Send email verification
    await sendEmailVerification(user);

    try {
        // Create user document in Firestore
        await createUser(user.uid, {
            email,
            displayName,
            accountType,
            expertise: expertise || null,
            avatar: '',
            rating: 0,
            verified: false,
            emailVerified: false,
            createdAt: new Date(),
        });
    } catch (error) {
        console.error("Firestore creation failed, rolling back auth user:", error);
        await user.delete();
        throw error;
    }

    return user;
};

// ... existing login ...
export const login = async (email: string, password: string): Promise<User> => {
    // ... existing implementation ...
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check if email is verified
    if (!user.emailVerified) {
        await signOut(auth);
        throw { code: 'auth/email-not-verified', message: 'Email adresi doğrulanmamış.' };
    }

    return user;
};


// New Google Sign-In
export const signInWithGoogle = async (role?: 'client' | 'freelancer'): Promise<User> => {
    // Expo Go does not support Google Sign In directly.
    // To use this, you must create a development build.
    // For testing in Expo Go, we will show an alert.

    Alert.alert(
        "Expo Go Uyarısı",
        "Google ile Giriş yapabilmek için 'Development Build' almanız gerekmektedir. Expo Go uygulamasında bu özellik çalışmaz. Lütfen E-posta/Şifre ile giriş yapın."
    );
    throw new Error('Google Sign-In not supported in Expo Go');

    /*
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Get the users ID token
    const { idToken } = await GoogleSignin.signIn();

    // Create a Google credential with the token
    const googleCredential = GoogleAuthProvider.credential(idToken);

    // Sign-in the user with the credential
    const userCredential = await signInWithCredential(auth, googleCredential);
    const user = userCredential.user;

    // Check if user document exists
    const userDoc = await getUser(user.uid);

    if (!userDoc && role) {
        // New user, create document
        await createUser(user.uid, {
            email: user.email || '',
            displayName: user.displayName || 'Kullanıcı',
            accountType: role,
            expertise: null,
            avatar: user.photoURL || '',
            rating: 0,
            verified: false,
            emailVerified: true, // Google accounts are verified
            createdAt: new Date(),
        });
    } else if (!userDoc && !role) {
        await createUser(user.uid, {
            email: user.email || '',
            displayName: user.displayName || 'Kullanıcı',
            accountType: 'client', // Default fallback
            expertise: null,
            avatar: user.photoURL || '',
            rating: 0,
            verified: false,
            emailVerified: true,
            createdAt: new Date(),
        });
    }

    return user;
    */
};

export const logout = async (): Promise<void> => {
    await signOut(auth);
    try {
        // await GoogleSignin.signOut();
    } catch (error) {
        console.error('Google signout error:', error);
    }
};

export const resetPassword = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
};

export const resendVerificationEmail = async (): Promise<void> => {
    const user = auth.currentUser;
    if (user) {
        await sendEmailVerification(user);
    }
};

export const checkEmailVerified = async (): Promise<boolean> => {
    const user = auth.currentUser;
    if (user) {
        await reload(user);
        return user.emailVerified;
    }
    return false;
};

export const getCurrentUser = (): User | null => {
    return auth.currentUser;
};

export const isLoggedIn = (): boolean => {
    const user = auth.currentUser;
    return user !== null && user.emailVerified;
};
export const deleteAccount = async (): Promise<void> => {
    const user = auth.currentUser;
    if (user) {
        // Here you might want to delete user data from Firestore as well
        // await deleteDoc(doc(db, 'users', user.uid));
        await user.delete();
    }
};
