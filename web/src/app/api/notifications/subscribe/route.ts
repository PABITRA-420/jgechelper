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

        const { token, branch } = await request.json();
        if (!token) {
            return NextResponse.json({ error: "Missing registration token" }, { status: 400 });
        }

        const adminDb = getAdminDb();
        const app = getAdminApp();
        const messaging = admin.messaging(app);

        // Sanitize token for use as document ID in Firestore
        const tokenDocId = token.replace(/[^a-zA-Z0-9-_]/g, '_');
        const tokenRef = adminDb.collection("users").doc(uid).collection("fcm_tokens").doc(tokenDocId);

        // Check for old branch to unsubscribe
        const docSnap = await tokenRef.get();
        if (docSnap.exists) {
            const oldBranch = docSnap.data()?.branch;
            if (oldBranch && oldBranch !== branch) {
                try {
                    await messaging.unsubscribeFromTopic(token, `branch_${oldBranch}`);
                } catch (err) {
                    console.error("Failed to unsubscribe from old branch topic:", err);
                }
            }
        }

        // Save/Update token in Firestore
        await tokenRef.set({
            token,
            branch: branch || null,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Subscribe to global topic
        await messaging.subscribeToTopic(token, "global");

        // Subscribe to branch topic if branch is selected
        if (branch) {
            await messaging.subscribeToTopic(token, `branch_${branch}`);
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("FCM Subscription Error:", error);
        const errMsg = error instanceof Error ? error.message : "Failed to subscribe";
        return NextResponse.json({ error: errMsg }, { status: 500 });
    }
}
