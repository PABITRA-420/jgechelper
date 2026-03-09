import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
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

    try {
        // Process the upload
        const blob = await put(filename, request.body as any, {
            access: 'public',
        });

        return NextResponse.json(blob);
    } catch (error) {
        console.error('Error uploading to Vercel Blob:', error);
        return NextResponse.json(
            { error: 'Error uploading file' },
            { status: 500 }
        );
    }
}
