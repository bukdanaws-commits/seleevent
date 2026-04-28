# EVENTKU — Panduan Deployment GCP

Dokumen ini berisi panduan lengkap untuk men-deploy aplikasi EVENTKU ke Google Cloud Platform (GCP) menggunakan Cloud Run, Cloud SQL, dan Secret Manager.

## 🚀 Metode Deployment

| Metode | Deskripsi | Direkomendasikan |
|--------|-----------|:---:|
| **GitHub CI/CD** | Push ke GitHub → otomatis build & deploy | ✅ |
| **Manual (CLI)** | Jalankan deploy script dari terminal | Fallback |

> **PILIHAN UTAMA:** Deploy dari GitHub ke Cloud Run via Cloud Build Triggers. Baca [Step 4: Deploy dari GitHub](#step-4-deploy-dari-github-cloud-build-triggers) untuk panduan lengkap.

---

## Prasyarat

- **gcloud CLI** terinstall ([panduan install](https://cloud.google.com/sdk/docs/install))
- Akun GCP dengan **billing enabled**
- Domain kustom (opsional, bisa pakai default `run.app` URL)
- Docker terinstall (untuk build lokal, opsional jika pakai Cloud Build)

---

## Step 1: Setup GCP Project

```bash
# Login ke GCP
gcloud auth login
gcloud auth application-default login

# Buat project baru (atau gunakan existing)
gcloud projects create eventku-494416 --name="EVENTKU"

# Set project aktif
gcloud config set project eventku-494416

# Enable billing
# Buka console: https://console.cloud.google.com/billing
# Lalu hubungkan billing account ke project
```

---

## Step 2: Jalankan Setup Script

Script ini akan mengaktifkan API yang diperlukan, membuat Cloud SQL instance, Secret Manager secrets, dan Artifact Registry repository.

```bash
chmod +x gcp/setup.sh
./gcp/setup.sh eventku-494416 asia-southeast1
```

**Yang dilakukan script:**
- Enable API: Cloud Run, Cloud SQL Admin, Secret Manager, Artifact Registry, Cloud Build
- Buat PostgreSQL instance di Cloud SQL (`eventku-db`)
- Buat database `eventku` dan user `eventku`
- Buat secrets di Secret Manager (`db-password`, `jwt-secret`)
- Buat Artifact Registry repository (`docker`)

---

## Step 3: Setup Database (Migration)

EVENTKU menggunakan GORM auto-migrate, sehingga tabel akan dibuat otomatis saat aplikasi pertama kali berjalan.

```bash
# (Opsional) Connect ke Cloud SQL untuk verifikasi manual
gcloud sql connect eventku-db --user=eventku --database=eventku
```

> **Catatan:** Tidak perlu menjalankan migration manual. GORM akan auto-migrate semua model saat backend pertama kali menyala di Cloud Run.

---

## Step 4: Deploy dari GitHub (Cloud Build Triggers) ⭐

Ini adalah **cara paling mudah** untuk deploy EVENTKU. Setelah setup, setiap kali kamu push code ke GitHub, deployment akan berjalan otomatis.

### 4.1. Connect GitHub ke Cloud Build

1. Buka **Cloud Build Triggers** di Console:
   👉 https://console.cloud.google.com/cloud-build/triggers?project=eventku-494416

2. Klik **"Connect Repository"**

3. Pilih **"GitHub (Cloud Build GitHub App)"**

4. Login GitHub & pilih repository:
   - `bukdanaws-commits/seleevent`

5. Klik **"Connect"** dan tunggu sampai connected ✅

### 4.2. Buat Trigger: Backend API

Masih di halaman Cloud Build Triggers:

1. Klik **"Create Trigger"**
2. Konfigurasi:
   - **Name:** `eventku-backend-deploy`
   - **Region:** `asia-southeast1`
   - **Event:** Push to a branch
   - **Source repository:** Pilih repo `bukdanaws-commits/seleevent`
   - **Branch:** `^main$`
   - **Build configuration:** Existing Cloud Build configuration file
   - **Cloud Build configuration file location:** `gcp/cloudbuild-backend.yaml`
3. Klik **Advanced** → **Substitution variables**, tambahkan:
   | Variable | Value |
   |----------|-------|
   | `_REGION` | `asia-southeast1` |
   | `_PROJECT_ID` | `eventku-494416` |
   | `_INSTANCE_NAME` | `eventku-db` |
4. Klik **Create**

### 4.3. Buat Trigger: Frontend Web

1. Klik **"Create Trigger"** lagi
2. Konfigurasi:
   - **Name:** `eventku-frontend-deploy`
   - **Region:** `asia-southeast1`
   - **Event:** Push to a branch
   - **Source repository:** Pilih repo `bukdanaws-commits/seleevent`
   - **Branch:** `^main$`
   - **Build configuration:** Existing Cloud Build configuration file
   - **Cloud Build configuration file location:** `gcp/cloudbuild-frontend.yaml`
3. Klik **Advanced** → **Substitution variables**, tambahkan:
   | Variable | Value |
   |----------|-------|
   | `_REGION` | `asia-southeast1` |
   | `_PROJECT_ID` | `eventku-494416` |
   | `_BACKEND_URL` | `(isi setelah backend deploy berhasil)` |

   > ⚠️ `_BACKEND_URL` diisi setelah backend pertama kali berhasil deploy.
   > Format: `https://eventku-api-xxxxx-xx.a.run.app`
   > Dapatkan dari: Cloud Run → eventku-api → URL di bagian atas

4. Klik **Create**

### 4.4. Trigger Deployment!

Sekarang setiap kali kamu push ke `main`:

```bash
# Di laptop kamu, push code:
git add .
git commit -m "deploy: update backend & frontend"
git push origin main
```

Cloud Build akan otomatis:
1. 📥 Pull code dari GitHub
2. 🔨 Build Docker image
3. 📤 Push ke Artifact Registry
4. 🚀 Deploy ke Cloud Run

### 4.5. Monitoring Build

Lihat status build:
- **Console:** https://console.cloud.google.com/cloud-build/builds?project=eventku-494416
- **CLI:** `gcloud builds list --project=eventku-494416 --limit=10`

### 4.6. Via CLI Script (Alternatif)

Jika lebih suka CLI, jalankan script ini:

```bash
# Setup GitHub triggers via CLI
./gcp/setup-github-deploy.sh eventku-494416 asia-southeast1 github.com/bukdanaws-commits/seleevent
```

---

## Step 5: Deploy Manual (Fallback)

Jika GitHub trigger tidak bisa di-set, kamu bisa deploy manual dari terminal.

### 5.1. Deploy Backend

```bash
chmod +x gcp/deploy-backend.sh
./gcp/deploy-backend.sh eventku-494416 asia-southeast1
```

### 5.2. Deploy Frontend

```bash
chmod +x gcp/deploy-frontend.sh

# Dapatkan URL backend
BACKEND_URL=$(gcloud run services describe eventku-api \
  --region=asia-southeast1 \
  --format='value(status.url)')

# Deploy frontend
./gcp/deploy-frontend.sh eventku-494416 asia-southeast1 "$BACKEND_URL"
```

### 5.3. Verifikasi

```bash
# Cek status service
gcloud run services describe eventku-api --region=asia-southeast1
gcloud run services describe eventku-web --region=asia-southeast1

# Cek logs
gcloud run services logs read eventku-api --region=asia-southeast1 --limit=50
gcloud run services logs read eventku-web --region=asia-southeast1 --limit=50
```

---

## Step 6: Update Frontend Trigger (PENTING!)

Setelah backend pertama kali berhasil deploy, kamu **WAJIB** update trigger frontend agar tahu URL backend:

1. Buka: https://console.cloud.google.com/cloud-build/triggers?project=eventku-494416
2. Klik trigger `eventku-frontend-deploy`
3. Klik **Edit**
4. Di **Substitution variables**, update `_BACKEND_URL` dengan URL backend:
   - Contoh: `https://eventku-api-abc1234-as.a.run.app`
5. Klik **Save**

Sekarang setiap push ke `main`, frontend akan build dengan URL backend yang benar.

---

## Step 7: Setup Domain Kustom (Opsional)

### 6.1. Map Domain ke Cloud Run

```bash
# Map domain ke service frontend
gcloud beta run domain-mappings create \
  --service=eventku-web \
  --domain=eventku.id \
  --region=asia-southeast1

# Map domain ke service backend API
gcloud beta run domain-mappings create \
  --service=eventku-api \
  --domain=api.eventku.id \
  --region=asia-southeast1
```

### 6.2. Setup DNS

Setelah menjalankan perintah di atas, GCP akan menampilkan record DNS yang harus ditambahkan:

1. Buka dashboard DNS provider (Cloudflare, Route53, dll.)
2. Tambahkan **A record** dan **CNAME record** sesuai instruksi GCP
3. Tunggu propagasi DNS (bisa memakan waktu hingga 48 jam, biasanya 5-15 menit)

### 6.3. Setup SSL

SSL certificate akan otomatis di-provision oleh Google setelah DNS terpropagasi.

```bash
# Cek status domain mapping
gcloud beta run domain-mappings describe \
  --service=eventku-web \
  --domain=eventku.id \
  --region=asia-southeast1
```

---

## Step 7: Seed Data (Opsional)

Untuk mengisi data awal (admin user, contoh event, dll.):

```bash
# Via Cloud Run Job
gcloud run jobs create seed-data \
  --image asia-southeast1-docker.pkg.dev/eventku-494416/docker/eventku-api:latest \
  --command="./eventku-api" \
  --args="--seed" \
  --region=asia-southeast1 \
  --set-env-vars="APP_ENV=production" \
  --set-cloudsql-instances="eventku-494416:asia-southeast1:eventku-db"

# Jalankan job
gcloud run jobs execute seed-data --region=asia-southeast1 --wait
```

---

## Monitoring & Observability

### Cloud Console

- **Cloud Run Logs**: Console → Cloud Run → eventku-api/eventku-web → Logs
- **Cloud SQL Monitoring**: Console → Cloud SQL → eventku-db → Monitoring
- **Resource Metrics**: Console → Monitoring → Dashboards

### Command Line

```bash
# Lihat real-time logs backend
gcloud run services logs read eventku-api \
  --region=asia-southeast1 \
  --limit=100 \
  --format='table(timestamp,jsonPayload.message)'

# Lihat real-time logs frontend
gcloud run services logs read eventku-web \
  --region=asia-southeast1 \
  --limit=100 \
  --format='table(timestamp,jsonPayload.message)'

# Cek metrik Cloud SQL
gcloud sql instances describe eventku-db --format='value(state,settings.diskSize,settings.dataDiskSizeGb)'
```

### Alerting (Opsional)

```bash
# Buat alert untuk error rate tinggi
gcloud alpha monitoring policies create \
  --display-name="EVENTKU API Error Rate" \
  --condition-display-name="Error rate > 5%" \
  --condition-filter='resource.type="cloud_run_revision" AND metric.type="run.googleapis.com/request_count" AND metric.labels.response_code_class="5xx"' \
  --notification-channels=projects/eventku-494416/notificationChannels/YOUR_CHANNEL_ID
```

---

## Rollback

Cloud Run menyimpan riwayat revisi, sehingga rollback sangat mudah:

```bash
# Lihat daftar revisi
gcloud run revisions list --service=eventku-api --region=asia-southeast1

# Rollback ke revisi sebelumnya
gcloud run services update-traffic eventku-api \
  --to-revisions=eventku-api-00001-xxx=100 \
  --region=asia-southeast1

# Rollback frontend
gcloud run services update-traffic eventku-web \
  --to-revisions=eventku-web-00001-xxx=100 \
  --region=asia-southeast1
```

---

## Scaling & Performance

### Cloud Run Scaling

Cloud Run secara otomatis melakukan scaling berdasarkan traffic. Konfigurasi default:

```bash
# Ubah konfigurasi scaling (opsional)
gcloud run services update eventku-api \
  --region=asia-southeast1 \
  --min-instances=0 \
  --max-instances=100 \
  --cpu=1 \
  --memory=512Mi

# Untuk frontend
gcloud run services update eventku-web \
  --region=asia-southeast1 \
  --min-instances=0 \
  --max-instances=100 \
  --cpu=1 \
  --memory=256Mi
```

### Cloud SQL

```bash
# Upgrade instance (jika diperlukan)
gcloud sql instances patch eventku-db \
  --tier=db-custom-2-4096 \
  --region=asia-southeast1
```

---

## Troubleshooting

### Cek Logs

```bash
# Logs backend
gcloud run services logs read eventku-api --region=asia-southeast1

# Logs frontend
gcloud run services logs read eventku-web --region=asia-southeast1

# Logs Cloud SQL
gcloud sql instances log-flags list eventku-db
```

### Debug Container

```bash
# Jalankan container interaktif untuk debugging
gcloud run jobs execute debug-job \
  --region=asia-southeast1 \
  --wait \
  --image=asia-southeast1-docker.pkg.dev/eventku-494416/docker/eventku-api:latest
```

### Cek Cloud SQL

```bash
# Cek status instance
gcloud sql instances describe eventku-db

# Cek koneksi
gcloud sql connect eventku-db --user=eventku --database=eventku

# Restart instance (jika perlu)
gcloud sql instances restart eventku-db
```

### Masalah Umum

| Masalah | Solusi |
|---------|--------|
| `502 Bad Gateway` | Cek apakah backend sehat: `gcloud run services logs read eventku-api` |
| `503 Service Unavailable` | Cold start, tunggu beberapa detik atau set `--min-instances=1` |
| Database connection refused | Pastikan Cloud SQL instance aktif dan connection name benar |
| Permission denied | Jalankan `gcloud auth application-default login` |
| Build gagal | Cek Cloud Build logs: `gcloud builds list --limit=5` |

### Environment Variables

Untuk melihat environment variables yang aktif:

```bash
# Lihat env vars backend (tanpa menampilkan secret values)
gcloud run services describe eventku-api \
  --region=asia-southeast1 \
  --format='yaml(spec.template.spec.containers[0].env)'

# Update env var
gcloud run services update eventku-api \
  --region=asia-southeast1 \
  --update-env-vars="APP_ENV=staging"
```

---

## Arsitektur Deployment

```
                        Internet
                           │
                     ┌─────┴─────┐
                     │  Cloud CDN │ (opsional)
                     └─────┬─────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        eventku.id  api.eventku.id  run.app
              │            │            │
        ┌─────┴─────┐ ┌───┴────┐ ┌───┴────┐
        │ Cloud Run │ │Cloud Run│ │Cloud Run│
        │ (Frontend)│ │(Backend)│ │(Backend)│
        │ Next.js   │ │ Go API  │ │ Go API  │
        └───────────┘ └────┬────┘ └────────┘
                            │
                     ┌──────┴──────┐
                     │  Cloud SQL  │
                     │ PostgreSQL  │
                     └─────────────┘
                            │
                     ┌──────┴──────┐
                     │   Secret    │
                     │  Manager    │
                     └─────────────┘

### Alur CI/CD (GitHub → Cloud Build → Cloud Run)

```
  Developer (Kamu)
       │
       │ git push origin main
       ▼
  ┌───────────┐
  │  GitHub    │  ← Source code
  │  Repository│
  └─────┬─────┘
        │
        │ webhook trigger
        ▼
  ┌───────────┐
  │ Cloud Build│  ← Build Docker image
  │  Pipeline  │  ← Push ke Artifact Registry
  └─────┬─────┘
        │
        │ gcloud run deploy
        ▼
  ┌───────────┐
  │ Cloud Run  │  ← Serve production traffic
  │  Service   │  ← Auto-scaling 0 → N
  └───────────┘
```

---

## Biaya Estimasi

> **Catatan:** Biaya bervariasi tergantung penggunaan. Berikut estimasi untuk traffic rendah-sedang.

| Layanan | Estimasi Bulanan |
|---------|-----------------|
| Cloud Run (Backend) | ~$0 – $20 (serverless, bayar per request) |
| Cloud Run (Frontend) | ~$0 – $10 |
| Cloud SQL (db-f1-micro) | ~$7 – $15 |
| Secret Manager | ~$0.06 (6 requests/bulan) |
| Artifact Registry | ~$0.10 – $0.50 (storage) |
| Networking (egress) | ~$0 – $5 |
| **Total estimasi** | **~$15 – $50/bulan** |

Untuk menghemat biaya:
- Gunakan `--min-instances=0` agar instance bisa scale down ke nol
- Gunakan `db-f1-micro` untuk development/traffic rendah
- Setelah deployment, hapus resource yang tidak terpakai

---

## Setup External Secrets (WAJIB setelah Terraform Apply)

Setelah menjalankan `terraform apply`, secret berikut **HARUS diisi manual** karena berisi kredensial eksternal yang tidak bisa di-generate otomatis:

```bash
# Set Google OAuth credentials
echo -n "YOUR_GOOGLE_CLIENT_ID" | \
  gcloud secrets versions add google-client-id --data-file=-

echo -n "YOUR_GOOGLE_CLIENT_SECRET" | \
  gcloud secrets versions add google-client-secret --data-file=-

# Set Midtrans keys
echo -n "YOUR_MIDTRANS_SERVER_KEY" | \
  gcloud secrets versions add midtrans-server-key --data-file=-

echo -n "YOUR_MIDTRANS_CLIENT_KEY" | \
  gcloud secrets versions add midtrans-client-key --data-file=-
```

> **Tanpa secret ini, backend akan crash saat startup** karena GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, dan MIDTRANS_SERVER_KEY diperlukan untuk autentikasi dan payment.

---

## Keamanan

- **Secrets** disimpan di Secret Manager, bukan environment variables plaintext
- **Cloud SQL** menggunakan private IP (Unix socket) dari Cloud Run
- **HTTPS** diaktifkan secara default oleh Cloud Run
- **CORS** dikonfigurasi di backend untuk membatasi origin
- **Rate limiting** aktif di backend middleware

---

*Terakhir diperbarui: Juli 2025*
