# Google Cloud Storage Setup untuk Upload Gambar

## 1. Buat Service Account Key

1. Buka Google Cloud Console: https://console.cloud.google.com/
2. Pilih project `pisang-ijo-403206`
3. Menu > IAM & Admin > Service Accounts
4. Klik "CREATE SERVICE ACCOUNT"
   - Name: `pisang-ijo-storage`
   - Description: `Service account for product image uploads`
5. Klik "CREATE AND CONTINUE"
6. Grant role: **Storage Admin** atau **Storage Object Admin**
7. Klik "CONTINUE" lalu "DONE"
8. Klik service account yang baru dibuat
9. Tab "KEYS" > "ADD KEY" > "Create new key"
10. Pilih format **JSON**
11. Download file JSON (contoh: `pisang-ijo-403206-xxxxx.json`)

## 2. Setup Bucket (Jika Belum Ada)

Bucket `biolink_pisjo` sudah ada dengan **Uniform Bucket-Level Access** enabled.

### Pastikan Bucket Publicly Accessible:

1. Buka Cloud Storage: https://console.cloud.google.com/storage/
2. Klik bucket `biolink_pisjo`
3. Tab "Permissions"
4. Klik "GRANT ACCESS"
5. New principals: `allUsers`
6. Role: **Storage Object Viewer**
7. SAVE

**Note:** Dengan Uniform Bucket-Level Access, semua object dalam bucket akan memiliki permissions yang sama. Kode upload sudah diupdate untuk menggunakan `blob.makePublic()` yang kompatibel dengan mode ini.

## 3. Upload Service Account Key ke Cloud Run

Ada 2 cara:

### Option A: Environment Variable (Recommended untuk Cloud Run)
1. Encode file JSON ke base64:
   ```bash
   # PowerShell
   $content = Get-Content "pisang-ijo-403206-xxxxx.json" -Raw
   [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($content))
   ```
2. Di Cloud Run Console:
   - Pilih service `pisang-ijo`
   - EDIT & DEPLOY NEW REVISION
   - Variables & Secrets > ADD VARIABLE
   - Name: `GCS_SERVICE_ACCOUNT_KEY_BASE64`
   - Value: paste base64 string
   - ADD VARIABLE lagi:
     - `GCS_PROJECT_ID` = `pisang-ijo-403206`
     - `GCS_BUCKET_NAME` = `biolink_pisjo`

### Option B: Secret Manager (Lebih aman)
1. Buka Secret Manager: https://console.cloud.google.com/security/secret-manager
2. CREATE SECRET
   - Name: `gcs-service-account-key`
   - Secret value: paste isi file JSON
3. Grant access ke service account Cloud Run
4. Di Cloud Run, mount secret sebagai environment variable

## 4. Update Upload API (Sudah Selesai ✅)

File `app/api/uploads/route.js` sudah diupdate untuk:
- Menggunakan `@google-cloud/storage`
- Upload ke bucket `biolink_pisjo`
- Folder `products/`
- Generate public URL: `https://storage.googleapis.com/biolink_pisjo/products/xxxxx.jpg`

## 5. Update Kode untuk Decode Base64 (PENTING!)

Tambahkan di awal file `app/api/uploads/route.js`:

```javascript
// Decode service account key from base64 if provided
let credentials;
if (process.env.GCS_SERVICE_ACCOUNT_KEY_BASE64) {
  const decoded = Buffer.from(process.env.GCS_SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString('utf-8');
  credentials = JSON.parse(decoded);
}

const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID || 'pisang-ijo-403206',
  credentials: credentials,
});
```

## 6. Test Upload

1. Deploy ke Cloud Run dengan environment variables
2. Login ke dashboard admin
3. Upload gambar produk
4. Cek URL gambar: harus berformat `https://storage.googleapis.com/biolink_pisjo/products/...`
5. Verify gambar bisa diakses langsung di browser

## 7. Migrate Existing Images (Opsional)

Jika ada produk lama dengan path `/uploads/xxxxx.jpg`:

1. Query semua produk: `db.products.find({ imageUrl: /^\/uploads\// })`
2. Download gambar dari path lama (jika masih ada)
3. Re-upload ke GCS
4. Update MongoDB dengan URL baru

## Troubleshooting

### Error: "Could not load the default credentials"
- Pastikan `GCS_SERVICE_ACCOUNT_KEY_BASE64` sudah di-set
- Atau set `GOOGLE_APPLICATION_CREDENTIALS` ke path file JSON

### Error: "Access denied"
- Service account butuh role **Storage Object Admin**
- Atau bucket perlu public access untuk public URLs

### Error: "Bucket not found"
- Cek nama bucket: `biolink_pisjo`
- Pastikan bucket ada di project `pisang-ijo-403206`

### Gambar masih 404
- Cek URL: harus `https://storage.googleapis.com/...`
- Bukan: `https://pisang-ijo-403206662227.asia-southeast2.run.app/uploads/...`
- Verify bucket permissions: public read

## Security Notes

- **JANGAN commit** file JSON service account ke Git
- Tambahkan ke `.gitignore`: `*.json` (kecuali package.json)
- Gunakan environment variables atau Secret Manager
- Untuk production, gunakan Workload Identity (lebih aman)
