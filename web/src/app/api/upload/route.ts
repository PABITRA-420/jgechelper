// import { put } from '@vercel/blob';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    /* OLD SERVER UPLOAD LOGIC
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
        return NextResponse.json(
            { error: 'Filename is required' },
            { status: 400 }
        );
    }

    // Basic security check: Require a secret token to prevent unauthorized uploads
    const authHeader = request.headers.get('x-upload-secret');
    if (authHeader !== process.env.ADMIN_UPLOAD_SECRET) {
        return NextResponse.json(
            { error: 'Unauthorized: Invalid upload secret' },
            { status: 401 }
        );
    }
    */

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname, clientPayload) => {
                // We use clientPayload to decode the JWT token securely from the frontend
                try {
                    const adminAuth = getAdminAuth();
                    const adminDb = getAdminDb();
                    
                    const decodedToken = await adminAuth.verifyIdToken(clientPayload || "");
                    const uid = decodedToken.uid;
                    
                    const userDoc = await adminDb.collection("users").doc(uid).get();
                    const userData = userDoc.data();
                    
                    if (userData?.role !== "admin") {
                        throw new Error("Unauthorized: Not an admin");
                    }
                } catch (err) {
                    throw new Error("Unauthorized");
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
    } catch (error) {
        console.error('Error uploading to Vercel Blob:', error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 } // Changed status from 500 to 400
        );
    }
}
