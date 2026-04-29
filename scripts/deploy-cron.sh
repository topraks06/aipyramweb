#!/bin/bash
# Sovereign OS - Otonom Görsel Tarama İçin Google Cloud Scheduler (Cron)
# Vercel Cron mekanizmasının Google Cloud Native karşılığı.

PROJECT_ID="aipyram-sovereign"
LOCATION="europe-west1"
SERVICE_URL="https://aipyram.ai/api/cron/scan-images"

echo "🛡️ Sovereign OS Cron Yükleniyor..."

gcloud scheduler jobs create http sovereign-image-scanner \
  --schedule="0 2 * * *" \
  --uri="$SERVICE_URL" \
  --http-method=GET \
  --time-zone="Europe/Istanbul" \
  --location="$LOCATION" \
  --project="$PROJECT_ID" \
  --headers="Authorization=Bearer YOUR_CRON_SECRET"

echo "✅ Google Cloud Scheduler başarıyla yapılandırıldı!"
