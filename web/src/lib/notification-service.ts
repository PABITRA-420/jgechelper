import { getToken } from "firebase/messaging";
import { getClientMessaging } from "./firebase-messaging";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export async function requestNotificationPermission(): Promise<NotificationPermission> {
    if (typeof window === "undefined" || !("Notification" in window)) {
        throw new Error("Notifications not supported in this browser.");
    }

    const permission = await Notification.requestPermission();
    return permission;
}

export async function getFCMToken(): Promise<string | null> {
    const messaging = await getClientMessaging();
    if (!messaging) return null;

    try {
        const token = await getToken(messaging, { vapidKey: VAPID_KEY });
        return token;
    } catch (error) {
        console.error("Failed to get FCM token:", error);
        return null;
    }
}
