# 📊 Setup Google Sheets Sync - SIMPATI

## Prerequisites
- Akun Google dengan akses ke Google Cloud Console
- Akses ke spreadsheet: https://docs.google.com/spreadsheets/d/1QISdbLzLPwwErHk23db0uC2tTTYcFLCsF59ASSh5b5E/edit

---

## Step 1: Buat Project di Google Cloud Console

1. Buka https://console.cloud.google.com/
2. Login dengan akun Google
3. Klik **"Select a project"** di header → **"New Project"**
4. Nama project: `simpati-sheets-sync`
5. Klik **Create**

---

## Step 2: Enable Google Sheets API

1. Di project baru, buka **"APIs & Services"** → **"Library"**
2. Cari **"Google Sheets API"**
3. Klik → **Enable**

---

## Step 3: Buat Service Account

1. Buka **"APIs & Services"** → **"Credentials"**
2. Klik **"Create Credentials"** → **"Service Account"**
3. Service account name: `simpati-sheets`
4. Description: `Service account for SIMPATI Google Sheets sync`
5. Klik **Create and Continue**
6. Skip "Grant users access" → Klik **Done**

---

## Step 4: Generate JSON Key

1. Buka **"APIs & Services"** → **"Credentials"**
2. Klik pada service account yang baru dibuat
3. Tab **"Keys"**
4. Klik **"Add Key"** → **"Create new key"**
5. Pilih **"JSON"** → **Create**
6. File JSON akan ter-download otomatis
7. **SIMPAN FILE JSON INI** - kita butuh isinya nanti

---

## Step 5: Share Spreadsheet dengan Service Account

1. Buka spreadsheet: https://docs.google.com/spreadsheets/d/1QISdbLzLPwwErHk23db0uC2tTTYcFLCsF59ASSh5b5E/edit
2. Klik **Share** → **Share with people and groups**
3. Masukkan email service account (dari file JSON, field `client_email`):
   ```
   contoh: simpati-sheets@simpati-sheets-sync.iam.gserviceaccount.com
   ```
4. Role: **Editor**
5.勾选 "Notify people" → Uncheck
6. Klik **Share**

---

## Step 6: Setup Sheet "Agenda"

1. Pastikan spreadsheet punya sheet dengan nama **"Agenda"**
2. Jika tidak ada:
   - Klik **"+"** untuk add sheet baru
   - Rename menjadi **Agenda**

---

## Step 7: Set Environment Variables di Vercel

1. Buka https://vercel.com/simpati-pesawaran/simpati/settings/environment-variables
2. Add variables:

### Variable 1: GOOGLE_SERVICE_ACCOUNT_EMAIL
```
Name: GOOGLE_SERVICE_ACCOUNT_EMAIL
Value: (email dari file JSON, field "client_email")
Contoh: simpati-sheets@simpati-sheets-sync.iam.gserviceaccount.com
```

### Variable 2: GOOGLE_SERVICE_ACCOUNT_KEY
```
Name: GOOGLE_SERVICE_ACCOUNT_KEY
Value: (ISI LENGKAP FILE JSON, dalam 1 baris)
Contoh:
{"type":"service_account","project_id":"simpati-sheets-sync","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n","client_email":"simpati-sheets@simpati-sheets-sync.iam.gserviceaccount.com",...}
```

⚠️ **PENTING:**
- Copy-paste JSON content LENGKAP
- Jaga spacing dan line breaks
- Pastikan tidak ada karakter yang hilang

---

## Step 8: Redeploy

1. Di Vercel → **Deployments**
2. Klik **Redeploy** pada deployment terbaru
3. Tunggu selesai (±2 menit)

---

## Step 9: Test Sync

1. Buka aplikasi SIMPATI
2. Login sebagai admin
3. Buka menu **Agenda**
4. Klik tombol **cloud upload** di header
5. Buka spreadsheet → data harusnya sudah muncul

---

## Troubleshooting

### Error: "Google Sheets credentials not configured"
→ Environment variables belum di-set dengan benar
→ Pastikan GOOGLE_SERVICE_ACCOUNT_EMAIL dan GOOGLE_SERVICE_ACCOUNT_KEY sudah ada

### Error: "The caller does not have permission"
→ Spreadsheet belum di-share dengan service account
→ Share spreadsheet dengan email "client_email" dari JSON

### Error: "Unable to parse service account key"
→ Format JSON salah
→ Pastikan GOOGLE_SERVICE_ACCOUNT_KEY berisi JSON valid yang lengkap

### Error: "Sheet 'Agenda' not found"
→ Sheet dengan nama "Agenda" belum ada di spreadsheet
→ Buat sheet baru bernama "Agenda"

---

## Spreadsheet Info

- **Spreadsheet ID:** `1QISdbLzLPwwErHk23db0uC2tTTYcFLCsF59ASSh5b5E`
- **Sheet Name:** `Agenda`
- **URL:** https://docs.google.com/spreadsheets/d/1QISdbLzLPwwErHk23db0uC2tTTYcFLCsF59ASSh5b5E/edit

## Data Format

| Column | Field |
|--------|-------|
| A | ID |
| B | Jenis |
| C | Sub Jenis |
| D | Judul Agenda |
| E | Tanggal |
| F | Waktu Mulai |
| G | Waktu Selesai |
| H | Lokasi |
| I | Penanggung Jawab |
| J | No. PIC |
| K | Deskripsi |
| L | Status |
| M | Dibuat Oleh |
| N | Dibuat Pada |
| O | Diperbarui Pada |
