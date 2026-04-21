FROM node:20-bullseye-slim

# The 1.5 Model - Dual Core Sandbox (AIPYRAM IDE Çekirdeği)
# Sadece otonom yazılım testleri için kullanılır.
# Canlı sisteme asla fiziksel müdahalede bulunamaz, yalıtılmış hücredir.

RUN apt-get update && apt-get install -y \
    curl \
    git \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# İzolasyon için ayrı ve yetkisiz bir kullanıcı oluştur
RUN groupadd -r sandbox && useradd -r -g sandbox sandboxuser

WORKDIR /sandbox

# TypeScript derleyici ve execution araçları
RUN npm install -g tsx typescript

# Yetkileri kısıtla
RUN chown -R sandboxuser:sandbox /sandbox
USER sandboxuser

# FAZ 6: THE PRODUCTION DAEMON
# Aloha, artık bir fonksiyon değil; 7/24 GCP ortamında Redlock Redis kuyruklarını yiyen bir İnfazcı (Daemon) oldu.
CMD ["npx", "tsx", "src/core/swarm/worker-daemon.ts"]
