# Setup Facebook Comments Plugin

## 📋 Langkah-Langkah Setup

### 1. Buat Facebook App

1. **Kunjungi Facebook Developers**
   - Buka: https://developers.facebook.com/
   - Login dengan akun Facebook Anda

2. **Buat App Baru**
   - Klik "My Apps" > "Create App"
   - Pilih "Consumer" atau "Business" (pilih Consumer untuk blog)
   - Klik "Next"

3. **Isi Detail App**
   - **App Name**: Pisang Ijo Evi Blog
   - **App Contact Email**: pisangijo@cateringsamarasa.com
   - Klik "Create App"

4. **Dapatkan App ID**
   - Setelah app dibuat, Anda akan melihat **App ID** di Dashboard
   - Copy App ID tersebut

### 2. Konfigurasi App

1. **Tambahkan Platform**
   - Di Dashboard, klik "Settings" > "Basic"
   - Scroll ke bawah, klik "+ Add Platform"
   - Pilih "Website"
   - **Site URL**: `https://yourdomain.com` (atau `http://localhost:3000` untuk dev)
   - Klik "Save Changes"

2. **Tambahkan App Domain**
   - Masih di "Settings" > "Basic"
   - **App Domains**: `yourdomain.com` (tanpa https://)
   - Untuk development, tambahkan: `localhost`
   - Klik "Save Changes"

3. **Set Privacy Policy URL** (Opsional tapi direkomendasikan)
   - **Privacy Policy URL**: `https://yourdomain.com/privacy`
   - Klik "Save Changes"

### 3. Update Environment Variable

1. **Buka file `.env.local`**
   ```bash
   NEXT_PUBLIC_FACEBOOK_APP_ID=your-app-id-here
   ```

2. **Ganti dengan App ID yang sudah Anda copy**
   ```bash
   NEXT_PUBLIC_FACEBOOK_APP_ID=1234567890123456
   ```

3. **Save file** `.env.local`

### 4. Restart Development Server

```powershell
# Stop server (Ctrl + C)
# Kemudian jalankan lagi
npm run dev
```

## ✅ Verifikasi Setup

### Test di Development

1. Buka artikel blog: `http://localhost:3000/blog/artikel-slug`
2. Scroll ke bawah ke section "💬 Komentar"
3. Anda akan melihat Facebook Comments plugin
4. Login dengan Facebook untuk berkomentar

### Test di Production

1. Deploy website Anda
2. Pastikan domain sudah ditambahkan di Facebook App Settings
3. Buka artikel di domain production
4. Comments akan muncul dan bisa digunakan

## 🎨 Fitur Facebook Comments

- ✅ **Login dengan Facebook** - User harus login Facebook untuk komentar
- ✅ **Moderasi** - Anda bisa moderasi komentar dari Facebook
- ✅ **Notifikasi** - Dapat notif saat ada komentar baru
- ✅ **Spam Filter** - Facebook otomatis filter spam
- ✅ **Social Integration** - Komentar bisa dibagikan ke Facebook

## 🔧 Kustomisasi

Anda bisa mengubah pengaturan di file `components/FacebookComments.jsx`:

```javascript
<FacebookComments 
  url={shareUrl}        // URL artikel
  numPosts={10}         // Jumlah komentar yang ditampilkan (default: 10)
/>
```

### Ubah Jumlah Komentar:
```javascript
<FacebookComments url={shareUrl} numPosts={20} />  // Tampilkan 20 komentar
```

### Ubah Bahasa:
Edit di `FacebookComments.jsx`, baris:
```javascript
js.src = "https://connect.facebook.net/id_ID/sdk.js";
```

Ganti `id_ID` dengan:
- `en_US` - English (US)
- `id_ID` - Bahasa Indonesia
- `ms_MY` - Bahasa Melayu

## 📊 Moderasi Komentar

### Via Facebook Dashboard

1. Kunjungi: https://developers.facebook.com/tools/comments/
2. Pilih App Anda
3. Masukkan URL artikel
4. Anda bisa:
   - Hapus komentar spam
   - Ban user tertentu
   - Lihat semua komentar

### Via Facebook Page (Recommended)

1. Link Facebook App dengan Facebook Page Anda
2. Komentar akan masuk ke Page inbox
3. Moderasi langsung dari Page

## 🚀 Tips

1. **Aktifkan Moderasi Otomatis**
   - Di Facebook App Settings > Comments
   - Enable "Profanity Filter"
   - Enable "Spam Detection"

2. **Backup Komentar**
   - Export komentar secara berkala
   - Facebook menyimpan semua komentar

3. **Privacy**
   - Buat Privacy Policy yang mencantumkan penggunaan Facebook Comments
   - Link di footer website

## ⚠️ Troubleshooting

### Comments Tidak Muncul?

1. **Check App ID**
   - Pastikan NEXT_PUBLIC_FACEBOOK_APP_ID benar
   - Restart dev server setelah ubah .env.local

2. **Check Domain**
   - Domain harus terdaftar di Facebook App Settings
   - Untuk localhost, tambahkan `localhost` di App Domains

3. **Check Console**
   - Buka browser DevTools (F12)
   - Lihat Console untuk error messages

4. **Clear Cache**
   - Clear browser cache
   - Reload page (Ctrl + Shift + R)

### Komentar Tidak Tersimpan?

1. **App Not Live**
   - Di Facebook App Dashboard, check status
   - Jika "In Development", hanya admin/developer yang bisa komentar
   - Switch ke "Live" untuk public access

2. **Missing Permissions**
   - Check Facebook App permissions
   - Pastikan tidak ada permission yang di-reject

## 📞 Support

Jika ada masalah:
1. Check Facebook Developers docs: https://developers.facebook.com/docs/plugins/comments
2. Visit Facebook Developer Community
3. Atau hubungi support
