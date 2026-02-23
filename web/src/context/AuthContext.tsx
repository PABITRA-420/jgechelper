"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    sendPasswordResetEmail
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

// CONFIG: Admin Allowlist (Only used for FIRST login to assign initial role)
// After the role is saved to Firestore, this list is ignored for that user.
const ADMIN_EMAILS = ["sarkarpabitra1510@gmail.com"];

// Role type definitions
type UserRole = "admin" | "user" | null;

interface AuthContextType {
    user: User | null;
    role: UserRole;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, pass: string) => Promise<void>;
    registerWithEmail: (name: string, email: string, pass: string) => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);

            if (currentUser) {
                setUser(currentUser);

                try {
                    const userRef = doc(db, "users", currentUser.uid);
                    const userSnap = await getDoc(userRef);

                    if (userSnap.exists()) {
                        const userData = userSnap.data();

                        // Enforce ban status
                        if (userData.status === "banned") {
                            await signOut(auth);
                            setUser(null);
                            setRole(null);
                            setLoading(false);
                            router.push("/?banned=true");
                            return;
                        }

                        // RETURNING USER: Trust Firestore Role
                        setRole(userData.role as UserRole);

                        // Optional: Update last login time
                        await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });

                    } else {
                        // NEW USER: Determine Role based on Allowlist
                        const isAdmin = currentUser.email && ADMIN_EMAILS.includes(currentUser.email);
                        const initialRole: UserRole = isAdmin ? "admin" : "user";

                        // Create User Document
                        await setDoc(userRef, {
                            uid: currentUser.uid,
                            email: currentUser.email,
                            displayName: currentUser.displayName,
                            photoURL: currentUser.photoURL,
                            role: initialRole,
                            createdAt: serverTimestamp(),
                            lastLogin: serverTimestamp(),
                        });

                        setRole(initialRole);
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error);
                    setRole(null); // Fallback to no role on error
                }

            } else {
                // User logged out
                setUser(null);
                setRole(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google", error);
            throw error;
        }
    };

    const signInWithEmail = async (email: string, pass: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, pass);
        } catch (error) {
            console.error("Error signing in with Email", error);
            throw error;
        }
    }

    const registerWithEmail = async (name: string, email: string, pass: string) => {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, pass);
            await updateProfile(result.user, { displayName: name });

            // Trigger the onAuthStateChanged Logic to save user to Firestore
            // ...handled automatically by the useEffect hook when it detects the new user

        } catch (error) {
            console.error("Error registering", error);
            throw error;
        }
    }


    const resetPassword = async (email: string) => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            console.error("Error resetting password", error);
            throw error;
        }
    }

    const logout = async () => {
        try {
            await signOut(auth);
            setRole(null);
            setUser(null);
            router.push("/");
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, role, loading, signInWithGoogle, signInWithEmail, registerWithEmail, resetPassword, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
