import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { getSession, setSession } from "../utils/sesssion";

// Sign Up
export const signUp = async (fullName: string, email: string, password: string) => {
    try {
        // ✅ Create user in Firebase Auth
        const userCredential = await auth().createUserWithEmailAndPassword(email, password);
        const { uid } = userCredential.user;
        // ✅ Store fullName in Firestore
        await firestore().collection("users").doc(uid).set({
            fullName,
            email,
        });

        return userCredential.user;
    } catch (error: any) {
        handleAuthError(error)
    }
};

// Sign In
export const signIn = async (email: string, password: string) => {
    try {
        // 🔹 Authenticate user
        const userCredential = await auth().signInWithEmailAndPassword(email, password);
        const { uid } = userCredential.user;
        setSession(uid || "");

        // 🔹 Fetch user profile from Firestore
        const userDoc = await firestore().collection("users").doc(uid).get();

        if (!userDoc.exists) {
            throw new Error("User profile not found in Firestore!");
        }

        // 🔹 Return both Auth + Firestore data
        return {
            uid,
            email: userCredential.user.email,
            fullName: userDoc.data()?.fullName,
        };
    } catch (error: any) {
        console.log("SignIn Error:", error);
        handleAuthError(error)
    }
};

// Sign Out
export const logout = () => {
    return auth().signOut();
};

export const getCurrentUser = async () => {
    const userId = await getSession()
    if (userId) {
        // 🔹 Fetch user profile from Firestore
        const userDoc = await firestore().collection("users").doc(userId).get();

        if (!userDoc.exists) {
            throw new Error("User profile not found in Firestore!");
        }
        // 🔹 Return both Auth + Firestore data
        return {
            email: userDoc.data()?.email,
            fullName: userDoc.data()?.fullName,
        };
    }
    else {
        return null
    }
}

const handleAuthError = (error: any) => {
    let message = '';

    switch (error.code) {
        case 'auth/email-already-in-use':
            message = 'This email is already registered. Please login instead.';
            break;
        case 'auth/invalid-email':
            message = 'The email address is invalid.';
            break;
        case 'auth/weak-password':
            message = 'Password is too weak. Please use at least 6 characters.';
            break;
        case 'auth/network-request-failed':
            message = 'Network error. Please check your connection.';
            break;
        case 'auth/user-not-found':
            message = 'No user found with this email. Please sign up.';
            break;
        case 'auth/invalid-credential':
            message = 'Invalid credentials provided. Please try again.';
            break;
        case 'auth/wrong-password':
            message = 'Incorrect password. Please try again.';
            break;
        default:
            message = 'An unexpected error occurred. Please try again.';
    }
    console.log('Error:', message);
    throw new Error(message)
};
