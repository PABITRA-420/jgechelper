import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { del } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname, clientPayload) => {
                // We use clientPayload to decode the JWT token securely from the frontend
                try {
                    const adminAuth = getAdminAuth();
                    const adminDb = getAdminDb();

                    if (!clientPayload) {
                        throw new Error("clientPayload (Auth Token) is missing or empty.");
                    }

                    const decodedToken = await adminAuth.verifyIdToken(clientPayload);
                    const uid = decodedToken.uid;

                    const userDoc = await adminDb.collection("users").doc(uid).get();
                    const userData = userDoc.data();

                    if (!userData) {
                        throw new Error("User document not found in Firestore.");
                    }

                    if (userData.role !== "admin") {
                        throw new Error(`Unauthorized: user role is '${userData.role}'`);
                    }
                } catch (err: unknown) {
                    console.error("Auth check failed in onBeforeGenerateToken:", err);
                    const errorMessage = err instanceof Error ? err.message : "Unknown auth error";
                    // Append actual error message so it propagates to frontend & logs
                    throw new Error(`Unauthorized: ${errorMessage}`);
                }

                return {
                    allowedContentTypes: [
                        'application/pdf',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'image/jpeg',
                        'image/png',
                        'image/webp'
                    ],
                    tokenPayload: JSON.stringify({}),
                    // Limit upload size to 15MB to prevent storage quota abuse and protect your Vercel Free tier limits
                    maximumSizeInBytes: 20 * 1024 * 1024,
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                console.log('blob upload completed', blob, tokenPayload);
            },
        });
        return NextResponse.json(jsonResponse);

        /* OLD UPLOAD LOGIC
        // Process the upload
        const blob = await put(filename, request.body as ReadableStream, {
            access: 'public',
        });

        return NextResponse.json(blob);
        */
    } catch (error: unknown) {
        console.error('Error uploading to Vercel Blob:', error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const status = errorMessage.includes('Unauthorized') ? 401 : 400;
        return NextResponse.json(
            { error: errorMessage },
            { status } 
        );
    }
}

export async function DELETE(request: Request): Promise<NextResponse> {
    try {
        const body = await request.json();
        const { url, id, clientPayload } = body;

        if (!clientPayload) throw new Error("Missing auth token");

        const adminAuth = getAdminAuth();
        const adminDb = getAdminDb();

        const decodedToken = await adminAuth.verifyIdToken(clientPayload);
        const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
        if (userDoc.data()?.role !== "admin") {
            throw new Error("Unauthorized");
        }

        // Delete the physical file from Vercel Serverless storage
        if (url) {
            await del(url);
        }

        // Wipe the Firestore document entirely
        if (id) {
            await adminDb.collection("resources").doc(id).delete();
        }

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Error during hard delete:', error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const status = errorMessage.includes('Unauthorized') ? 401 : 400;
        return NextResponse.json({ error: errorMessage }, { status });
    }
}
