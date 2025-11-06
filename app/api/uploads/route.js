import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import fs from 'fs/promises';
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

// Initialize Google Cloud Storage client (only used if USE_GCS is true)
const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID || 'pisang-ijo-403206',
  ...(credentials && { credentials }),
});

const bucketName = process.env.GCS_BUCKET_NAME || 'biolink_pisjo';
const USE_GCS = String(process.env.USE_GCS || '').toLowerCase() === 'true';

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
    const safeExt = ext && ext.length <= 6 ? ext : '.jpg';
    const baseName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${safeExt}`;

    // If USE_GCS=true, try uploading to Google Cloud Storage
    if (USE_GCS) {
      const filename = `products/${baseName}`;
      const bucket = storage.bucket(bucketName);
      const blob = bucket.file(filename);

      try {
        await blob.save(buf, {
          metadata: {
            contentType: file.type || 'image/jpeg',
            cacheControl: 'public, max-age=31536000',
          },
        });

        // Determine URL: public URL or signed URL if bucket isn't public
        let imageUrl;
        if (String(process.env.GCS_PUBLIC_READ).toLowerCase() === 'true') {
          imageUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;
        } else {
          const expires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
          const [signedUrl] = await blob.getSignedUrl({ action: 'read', version: 'v4', expires });
          imageUrl = signedUrl;
        }

        return NextResponse.json({ success: true, url: imageUrl, imageUrl, filename });
      } catch (gcsErr) {
        // If GCS upload fails and local fallback is allowed, continue to local save; otherwise throw
        if (String(process.env.ALLOW_LOCAL_FALLBACK).toLowerCase() !== 'true') {
          throw gcsErr;
        }
        // else fall through to local save below
        console.warn('GCS upload failed, falling back to local save:', gcsErr?.message);
      }
    }

    // Local filesystem fallback (default when USE_GCS !== true)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    const localFilename = baseName;
    const dest = path.join(uploadDir, localFilename);
    await fs.writeFile(dest, buf);
    const imageUrl = `/uploads/${localFilename}`;
    
    return NextResponse.json({ 
      success: true, 
      url: imageUrl, 
      imageUrl, 
      filename: localFilename 
    });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ 
      error: 'Upload failed', 
      detail: err?.message 
    }, { status: 500 });
  }
}