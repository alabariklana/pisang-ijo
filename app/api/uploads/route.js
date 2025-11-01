import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const buf = Buffer.from(await file.arrayBuffer());
    const originalName = file.name || 'upload';
    const ext = path.extname(originalName) || '.jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;
    const dest = path.join(uploadDir, filename);

    await fs.writeFile(dest, buf);

    const imageUrl = `/uploads/${filename}`;
    return NextResponse.json({ imageUrl });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}