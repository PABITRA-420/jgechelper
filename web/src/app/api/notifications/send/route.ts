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

        // Verify Admin role in Firestore
        const adminDb = getAdminDb();
        const userDoc = await adminDb.collection("users").doc(uid).get();
        if (!userDoc.exists || userDoc.data()?.role !== "admin") {
            return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
        }

        const { title, body, topic, topics, link } = await request.json();
        if (!title || !body) {
            return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
        }

        const app = getAdminApp();
        const messaging = admin.messaging(app);

        // Keep a record of the sent announcement in Firestore for audit log
        await adminDb.collection("announcements").add({
            title,
            body,
            topic: topic || null,
            topics: topics || null,
            link: link || null,
            sentBy: uid,
            sentByName: userDoc.data()?.displayName || "Admin",
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Auto-prune announcements if there are more than 15
        try {
            const announcementsSnap = await adminDb.collection("announcements")
                .orderBy("sentAt", "desc")
                .get();
            
            if (announcementsSnap.size > 15) {
                const batch = adminDb.batch();
                // Get all announcements after the 15th one
                const docsToDelete = announcementsSnap.docs.slice(15);
                docsToDelete.forEach((doc) => {
                    batch.delete(doc.ref);
                });
                await batch.commit();
            }
        } catch (pruneErr) {
            console.error("FCM Send Announcement Prune Error:", pruneErr);
            // Non-blocking, continue execution even if pruning logs fails
        }

        // Send push notifications
        if (Array.isArray(topics) && topics.length > 0) {
            const sendPromises = topics.map(async (t) => {
                try {
                    return await messaging.send({
                        notification: { title, body },
                        data: link ? { link } : {},
                        topic: t,
                    });
                } catch (err) {
                    console.error(`FCM failed for topic ${t}:`, err);
                    return null;
                }
            });
            await Promise.all(sendPromises);
        } else if (topic) {
            await messaging.send({
                notification: { title, body },
                data: link ? { link } : {},
                topic,
            });
        } else {
            return NextResponse.json({ error: "Target topic or topics array required" }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("FCM Send Notification Error:", error);
        const errMsg = error instanceof Error ? error.message : "Failed to send notification";
        return NextResponse.json({ error: errMsg }, { status: 500 });
    }
}
