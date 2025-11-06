# Deploy Instructions - Cloud Run

## Error yang Sudah Diperbaiki

✅ **Upload Error Fixed**: 
- Problem: `Cannot insert legacy ACL for an object when uniform bucket-level access is enabled`
- Solution: Menggunakan `blob.makePublic()` instead of `public: true` option
- File updated: `app/api/uploads/route.js`

## Deploy ke Cloud Run (Manual)

Karena GitHub memblokir push (ada secret di commit history), deploy manual menggunakan gcloud CLI:

### 1. Pastikan sudah login:
```bash
gcloud auth login
gcloud config set project pisang-ijo-403206
```

### 2. Deploy dari source code:
```bash
cd "d:\10. Website\catering-pisjo\pisang-ijo"
gcloud run deploy pisang-ijo \
  --source . \
  --region asia-southeast2 \
  --platform managed \
  --allow-unauthenticated
```

### 3. Atau build Docker image dulu:
```bash
# Build
docker build -t gcr.io/pisang-ijo-403206/pisang-ijo:latest .

# Push to Container Registry
docker push gcr.io/pisang-ijo-403206/pisang-ijo:latest

# Deploy
gcloud run deploy pisang-ijo \
  --image gcr.io/pisang-ijo-403206/pisang-ijo:latest \
  --region asia-southeast2 \
  --platform managed \
  --allow-unauthenticated
```

## Test Upload Setelah Deploy

1. Login ke dashboard: https://pisang-ijo-403206662227.asia-southeast2.run.app/dashboard
2. Masuk dengan: admin@pisangijo.com
3. Buka Pengaturan Produk
4. Upload gambar produk baru atau edit produk existing
5. Verify gambar URL: harus format `https://storage.googleapis.com/biolink_pisjo/products/...`
6. Pastikan gambar bisa diakses (tidak 404)

## Perubahan yang Sudah Dilakukan

### 1. Upload API (`app/api/uploads/route.js`):
```javascript
// BEFORE (Error):
await blob.save(buf, {
  metadata: { contentType: file.type },
  public: true, // ❌ Error dengan Uniform Bucket-Level Access
});

// AFTER (Fixed):
await blob.save(buf, {
  metadata: {
    contentType: file.type || 'image/jpeg',
    cacheControl: 'public, max-age=31536000',
  },
});
await blob.makePublic(); // ✅ Compatible dengan Uniform Bucket-Level Access
```

### 2. Next.js Config (`next.config.mjs`):
```javascript
images: {
  minimumCacheTTL: 60,
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'storage.googleapis.com',
      pathname: '/biolink_pisjo/**',
    },
  ],
}
```

### 3. Package Dependencies:
- Installed: `@google-cloud/storage`

## Bucket Permissions (Jika Error Masih Terjadi)

Jika setelah deploy masih ada error akses, pastikan bucket publicly accessible:

1. Buka: https://console.cloud.google.com/storage/browser/biolink_pisjo
2. Tab "Permissions" > "GRANT ACCESS"
3. New principals: `allUsers`
4. Role: **Storage Object Viewer**
5. SAVE

Atau via gcloud:
```bash
gsutil iam ch allUsers:objectViewer gs://biolink_pisjo
```

## Environment Variables di Cloud Run

Pastikan env vars sudah di-set:
- `GCS_PROJECT_ID` = `pisang-ijo-403206`
- `GCS_BUCKET_NAME` = `biolink_pisjo`
- `GCS_SERVICE_ACCOUNT_KEY_BASE64` = (base64 encoded service account JSON)

Set via Cloud Run console:
1. Buka service `pisang-ijo`
2. EDIT & DEPLOY NEW REVISION
3. Variables & Secrets > ADD VARIABLE
4. Deploy

## Troubleshooting

### Error: "Could not load the default credentials"
```bash
# Create service account key
gcloud iam service-accounts keys create key.json \
  --iam-account=pisang-ijo-storage@pisang-ijo-403206.iam.gserviceaccount.com

# Encode to base64 (PowerShell)
$content = Get-Content "key.json" -Raw
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($content))

# Set in Cloud Run as GCS_SERVICE_ACCOUNT_KEY_BASE64
```

### Error: "Bucket not found"
```bash
# Verify bucket exists
gsutil ls gs://biolink_pisjo

# Create if not exists
gsutil mb -p pisang-ijo-403206 -l asia-southeast2 gs://biolink_pisjo
```

### Error: "Access denied"
```bash
# Grant service account access
gcloud storage buckets add-iam-policy-binding gs://biolink_pisjo \
  --member=serviceAccount:pisang-ijo-storage@pisang-ijo-403206.iam.gserviceaccount.com \
  --role=roles/storage.objectAdmin
```

## GitHub Secret Issue (Optional Fix Later)

Untuk menghapus secret dari git history dan push ke GitHub:

```bash
# Install git-filter-repo
pip install git-filter-repo

# Remove cloudbuild.yaml from history
git filter-repo --path cloudbuild.yaml --invert-paths

# Force push
git push origin main --force
```

Atau gunakan GitHub's allow secret link yang diberikan di error message.
