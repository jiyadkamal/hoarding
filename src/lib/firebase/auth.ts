import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser,
    updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { User, UserRole } from '@/types';

// Sign in with email and password
export const loginWithEmail = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
};

// Register new user
export const registerWithEmail = async (
    email: string,
    password: string,
    displayName: string,
    role: UserRole
) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, { displayName });

    // Create user document in Firestore
    const userData: Omit<User, 'uid'> = {
        email,
        displayName,
        role,
        isApproved: true, // All users auto-approved
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
    };

    await setDoc(doc(db, 'users', user.uid), { ...userData, uid: user.uid });

    return user;
};

// Sign out
export const logoutUser = async () => {
    await signOut(auth);
};

// Get current user data from Firestore
export const getUserData = async (uid: string): Promise<User | null> => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
        return userDoc.data() as User;
    }
    return null;
};

// Auth state observer
export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

export { auth };
