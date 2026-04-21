FROM node:18-alpine

WORKDIR /app

# Paketleri kur
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Kaynak kodları kopyala ve inşa et
COPY . .
RUN pnpm build

# Cloud Run PORT 8080 kullanır
EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

# Standalone mode: serverExternalPackages (firebase-admin) node_modules'a ihtiyaç duyar
# Bu yüzden standalone dizinine kopyala
RUN cp -r node_modules .next/standalone/node_modules 2>/dev/null || true
RUN cp -r public .next/standalone/public 2>/dev/null || true
RUN cp -r .next/static .next/standalone/.next/static 2>/dev/null || true

# Standalone server — doğru yol
CMD ["node", ".next/standalone/server.js"]
