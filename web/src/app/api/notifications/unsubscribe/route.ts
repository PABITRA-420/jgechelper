import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb, getAdminApp } from "@/lib/firebase-admin";
import * as admin from "firebase-admin";

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userToken = authHeader.split(" ")[1];
        const decodedToken = await getAdminAuth().verifyIdToken(userToken);
        const uid = decodedToken.uid;

        const { token } = await request.json();
        if (!token) {
            return NextResponse.json({ error: "Missing registration token" }, { status: 400 });
        }

        const adminDb = getAdminDb();
        const app = getAdminApp();
        const messaging = admin.messaging(app);

        // Sanitize token for doc ID lookup
        const tokenDocId = token.replace(/[^a-zA-Z0-9-_]/g, '_');
        const tokenRef = adminDb.collection("users").doc(uid).collection("fcm_tokens").doc(tokenDocId);

        const docSnap = await tokenRef.get();
        if (docSnap.exists) {
            const data = docSnap.data();
            const branch = data?.branch;

            // Unsubscribe from FCM topics
            try {
                await messaging.unsubscribeFromTopic(token, "global");
                if (branch) {
                    await messaging.unsubscribeFromTopic(token, `branch_${branch}`);
                }
            } catch (err) {
                console.error("FCM unsubscribeFromTopic failed:", err);
            }

            // Delete token record from Firestore
            await tokenRef.delete();
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("FCM Unsubscription Error:", error);
        const errMsg = error instanceof Error ? error.message : "Failed to unsubscribe";
        return NextResponse.json({ error: errMsg }, { status: 500 });
    }
}
