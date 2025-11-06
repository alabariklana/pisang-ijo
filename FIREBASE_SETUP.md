# 🔥 Firebase Setup Guide untuk Dashboard Login

## Langkah-langkah Setup di Firebase Console

### 1️⃣ Akses Firebase Console
- Buka: https://console.firebase.google.com/
- Login dengan akun Google Anda
- Pilih project: **cateringsamarasa**

---

### 2️⃣ Enable Google Sign-In

1. Di sidebar kiri, klik **Authentication**
2. Klik tab **Sign-in method** (atau **Metode Login**)
3. Cari **Google** dalam daftar providers
4. Klik pada baris **Google**
5. Toggle **Enable** (Aktifkan)
6. Pilih **Project support email** dari dropdown
7. Klik **Save** (Simpan)

**✅ Status seharusnya: Google - Enabled**

---

### 3️⃣ Enable Email/Password Sign-In

1. Masih di tab **Sign-in method**
2. Cari **Email/Password** dalam daftar
3. Klik pada baris **Email/Password**
4. Toggle **Enable** (Aktifkan)
   - **JANGAN** centang "Email link (passwordless sign-in)"
   - Hanya enable yang pertama saja
5. Klik **Save**

**✅ Status seharusnya: Email/Password - Enabled**

---

### 4️⃣ Tambahkan Authorized Domains

1. Masih di **Authentication**
2. Klik tab **Settings** (atau **Setelan**)
3. Scroll ke bagian **Authorized domains**
4. Secara default sudah ada:
   - `cateringsamarasa.firebaseapp.com`
   - `localhost`
5. **Pastikan `localhost` ada dalam daftar**
6. Jika tidak ada, klik **Add domain** dan tambahkan: `localhost`

**Domain untuk Production:**
Jika deploy ke production (misalnya Vercel, Cloud Run), tambahkan juga:
- `pisang-ijo-403206662227.asia-southeast2.run.app` (Google Cloud Run)
- Domain custom Anda jika ada

---

### 5️⃣ Buat Akun Admin (untuk Email/Password Login)

1. Klik tab **Users** (masih di Authentication)
2. Klik tombol **Add user** di pojok kanan atas
3. Isi form:
   - **User identifier**: Pilih salah satu email yang diizinkan:
     - `admin@pisangijo.com` ✅ (RECOMMENDED)
     - `admin@cateringsamarasa.com` ✅
     - `alaunasbariklana@gmail.com` ✅
     - `zelvidiana@gmail.com` ✅
     - `pisangijo@cateringsamarasa.com` ✅
   - **Password**: Minimal 6 karakter (contoh: `Admin123!`)
4. Klik **Add user**

**💡 Tips:**
- Gunakan password yang kuat
- Simpan credentials di tempat aman
- Anda bisa membuat beberapa akun admin dengan email berbeda

---

### 6️⃣ Verifikasi Setup

Setelah semua langkah di atas selesai, cek bahwa:

**Tab Sign-in method:**
- ✅ Google: Enabled
- ✅ Email/Password: Enabled

**Tab Settings:**
- ✅ Authorized domains mengandung: `localhost`

**Tab Users:**
- ✅ Minimal ada 1 user dengan email yang diizinkan

---

## 🧪 Testing Login

### Test 1: Login dengan Google
1. Buka: http://localhost:3000/dashboard
2. Pastikan tab **Google** aktif
3. Klik **Sign in with Google**
4. Browser akan redirect ke halaman login Google
5. Pilih/login dengan salah satu akun:
   - `alaunasbariklana@gmail.com`
   - `zelvidiana@gmail.com`
6. Setelah login, browser kembali ke dashboard
7. **Hasil:** Redirect ke `/dashboard/home`

**Console logs yang benar:**
```
🔄 Starting Google sign-in with redirect...
Auth domain: cateringsamarasa.firebaseapp.com
🔄 Redirect initiated...
✅ Redirect result user: alaunasbariklana@gmail.com
Checking email: alaunasbariklana@gmail.com - Allowed: true
✅ Email authorized, user logged in
👤 User state changed: alaunasbariklana@gmail.com
✅ User authorized and set
```

### Test 2: Login dengan Email/Password
1. Buka: http://localhost:3000/dashboard
2. Klik tab **Email & Password**
3. Masukkan:
   - Email: `admin@pisangijo.com` (atau email lain yang sudah dibuat)
   - Password: Password yang Anda set saat membuat user
4. Klik **Login**
5. **Hasil:** Redirect ke `/dashboard/home`

**Console logs yang benar:**
```
Checking email: admin@pisangijo.com - Allowed: true
👤 User state changed: admin@pisangijo.com
✅ User authorized and set
```

---

## ❌ Troubleshooting

### Error: "Email tidak memiliki akses admin"
**Penyebab:** Email yang digunakan tidak ada dalam `allowedEmails`

**Solusi:**
1. Cek email yang digunakan di browser console
2. Tambahkan email tersebut di `contexts/AuthContext.js`:
```javascript
const allowedEmails = new Set([
  'alaunasbariklana@gmail.com',
  'zelvidiana@gmail.com',
  'pisangijo@cateringsamarasa.com',
  'admin@pisangijo.com',
  'admin@cateringsamarasa.com',
  'email-baru-anda@example.com' // Tambahkan di sini
]);
```

### Error: "auth/popup-blocked"
**Penyebab:** Browser memblokir popup (seharusnya tidak terjadi karena kita pakai redirect)

**Solusi:** Sudah diatasi dengan menggunakan redirect method

### Error: "auth/unauthorized-domain"
**Penyebab:** Domain tidak terdaftar di Authorized domains

**Solusi:**
1. Buka Firebase Console → Authentication → Settings
2. Tambahkan domain ke Authorized domains
3. Untuk local: `localhost`
4. Untuk production: domain deployment Anda

### Error: "auth/user-not-found" atau "auth/wrong-password"
**Penyebab:** User belum dibuat di Firebase atau password salah

**Solusi:**
1. Buka Firebase Console → Authentication → Users
2. Pastikan user dengan email tersebut ada
3. Atau buat user baru dengan email yang benar
4. Coba reset password jika lupa

---

## 📝 Email yang Diizinkan Login

Email berikut sudah dikonfigurasi dalam kode untuk memiliki akses admin:

1. ✅ `alaunasbariklana@gmail.com`
2. ✅ `zelvidiana@gmail.com`
3. ✅ `pisangijo@cateringsamarasa.com`
4. ✅ `admin@pisangijo.com`
5. ✅ `admin@cateringsamarasa.com`

**Untuk menambah email baru:**
Edit file `contexts/AuthContext.js` bagian `allowedEmails`

---

## 🚀 Deploy ke Production

Saat deploy ke production (Google Cloud Run, Vercel, dll):

1. **Tambahkan domain production** ke Authorized domains:
   - Firebase Console → Authentication → Settings → Authorized domains
   - Klik "Add domain"
   - Masukkan domain production (contoh: `pisang-ijo-403206662227.asia-southeast2.run.app`)

2. **Update environment variables** di platform hosting dengan nilai dari `.env.local`

3. **Test login** di URL production

---

## 📞 Support

Jika masih ada masalah:
1. Cek browser console untuk error logs
2. Cek Firebase Console → Authentication → Users untuk melihat user yang terdaftar
3. Pastikan semua langkah setup sudah dilakukan dengan benar
