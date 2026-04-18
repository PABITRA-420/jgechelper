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
    sendPasswordResetEmail,
    sendEmailVerification,
    ActionCodeSettings
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
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
        let snapshotUnsubscribe: (() => void) | null = null;

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);

            // Clean up any existing snapshot listener
            if (snapshotUnsubscribe) {
                snapshotUnsubscribe();
                snapshotUnsubscribe = null;
            }

            if (currentUser) {
                // Determine if the user is truly "verified" (Google users are auto-verified)
                const isEmailUser = currentUser.providerData.some(p => p.providerId === 'password');
                const isVerified = isEmailUser ? currentUser.emailVerified : true;

                setUser(currentUser);
                setRole(null); // IMMEDIATE FIX: Clear any old role state while we fetch the new one from Firestore

                // If not verified, we don't fetch role to prevent access to role-protected features
                if (isEmailUser && !isVerified) {
                    setRole(null);
                    setLoading(false);
                    return;
                }

                try {
                    const userRef = doc(db, "users", currentUser.uid);

                    // INSTANT ROLE LISTENER
                    snapshotUnsubscribe = onSnapshot(userRef, async (userSnap) => {
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

                            // Update role instantly across the app
                            setRole(userData.role as UserRole);

                            // Note: We avoid updating lastLogin inside onSnapshot to prevent recursive loops
                        } else {
                            // NEW USER LOGIC: Only runs once when document isn't found
                            const isAdmin = currentUser.email && ADMIN_EMAILS.includes(currentUser.email);
                            const initialRole: UserRole = isAdmin ? "admin" : "user";

                            const newUserData: Record<string, unknown> = {
                                uid: currentUser.uid,
                                email: currentUser.email,
                                role: initialRole,
                                createdAt: serverTimestamp(),
                                lastLogin: serverTimestamp(),
                            };

                            const tempName = typeof window !== 'undefined' ? localStorage.getItem("tempDisplayName") : null;
                            if (currentUser.displayName) {
                                newUserData.displayName = currentUser.displayName;
                            } else if (tempName) {
                                newUserData.displayName = tempName;
                            } else if (currentUser.email) {
                                newUserData.displayName = currentUser.email.split('@')[0];
                            } else {
                                newUserData.displayName = "User";
                            }

                            if (currentUser.photoURL) newUserData.photoURL = currentUser.photoURL;

                            // Create User Document
                            await setDoc(userRef, newUserData, { merge: true });

                            // Clean up localStorage
                            if (tempName) {
                                localStorage.removeItem("tempDisplayName");
                            }

                            setRole(initialRole);
                        }

                        // Unlock UI
                        setLoading(false);
                    }, (error) => {
                        console.error("Error with user snapshot:", error);
                        setRole(null);
                        setLoading(false);
                    });

                    // Update last login time independently so as not to spam snapshot
                    await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });

                } catch (error) {
                    console.error("Error setting up user listener:", error);
                    setRole(null); // Fallback to no role on error
                    setLoading(false);
                }

            } else {
                // User logged out
                setUser(null);
                setRole(null);
                setLoading(false);
            }
        });

        return () => {
            if (snapshotUnsubscribe) {
                snapshotUnsubscribe();
            }
            unsubscribe();
        };
    }, [router]);

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

    // Dynamic URL for action code settings based on environment
    const getActionCodeSettings = (): ActionCodeSettings => {
        // In Nuxt/Next.js you can rely on checking window.location or process.env
        const url = typeof window !== "undefined"
            ? `${window.location.origin}/auth/action`
            : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000/auth/action";

        return {
            url,
            handleCodeInApp: true,
        };
    };

    const registerWithEmail = async (name: string, email: string, pass: string) => {
        try {
            // Save the name temporarily in localStorage before creating the user
            localStorage.setItem("tempDisplayName", name);
            const result = await createUserWithEmailAndPassword(auth, email, pass);
            await updateProfile(result.user, { displayName: name });
            await sendEmailVerification(result.user, getActionCodeSettings());
            // Immediately sign out to prevent session hijacking before verification
            await signOut(auth);
            // Remove the manual setDoc here to avoid the race condition completely
        } catch (error) {
            console.error("Error registering", error);
            throw error;
        }
    }


    const resetPassword = async (email: string) => {
        try {
            await sendPasswordResetEmail(auth, email, getActionCodeSettings());
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
