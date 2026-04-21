#!/bin/bash
# AIPyram Toplu Deploy Script'i
PROJECTS=("trtex.com" "hometex.ai" "didimemlak.ai" "aipyram.com")
BASE_DIR="C:/Users/MSI/Desktop/projeler zip"

for project in "${PROJECTS[@]}"; do
  echo "=== DEPLOYING: $project ==="
  cd "$BASE_DIR/$project"
  
  if [ -f "firebase.json" ]; then
    npm run build && npx firebase-tools deploy --only hosting
    echo "✅ $project DEPLOYED"
  else
    echo "⚠️ $project: firebase.json yok, atlanıyor."
  fi
done

echo "🎉 TOPLU DEPLOY TAMAMLANDI"
