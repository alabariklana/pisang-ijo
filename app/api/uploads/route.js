import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import path from 'path';

// Decode service account key from base64 if provided
let credentials;
if (process.env.GCS_SERVICE_ACCOUNT_KEY_BASE64) {
  try {
    const decoded = Buffer.from(process.env.GCS_SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString('utf-8');
    credentials = JSON.parse(decoded);
  } catch (err) {
    console.error('Failed to decode GCS credentials:', err);
  }
}

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID || 'pisang-ijo-403206',
  ...(credentials && { credentials }),
});

const bucketName = process.env.GCS_BUCKET_NAME || 'biolink_pisjo';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Get file buffer
    const buf = Buffer.from(await file.arrayBuffer());
    const originalName = file.name || 'upload';
    const ext = path.extname(originalName) || '.jpg';
    const filename = `products/${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;

    // Upload to Google Cloud Storage
    const bucket = storage.bucket(bucketName);
    const blob = bucket.file(filename);
    
    // Upload file tanpa public: true (karena bucket menggunakan Uniform Bucket-Level Access)
    await blob.save(buf, {
      metadata: {
        contentType: file.type || 'image/jpeg',
        cacheControl: 'public, max-age=31536000',
      },
    });

    // Make the file publicly accessible (compatible dengan Uniform Bucket-Level Access)
    await blob.makePublic();

    // Get public URL
    const imageUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;
    
    return NextResponse.json({ 
      success: true, 
      url: imageUrl, 
      imageUrl, 
      filename 
    });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ 
      error: 'Upload failed', 
      detail: err?.message 
    }, { status: 500 });
  }
}