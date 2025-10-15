# ---------- build stage ----------
    FROM node:20-alpine AS build
    WORKDIR /app
    
    # Install deps first (better layer caching)
    COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
    RUN \
      if [ -f package-lock.json ]; then npm ci --legacy-peer-deps; \
      elif [ -f pnpm-lock.yaml ]; then npm i -g pnpm && pnpm i --frozen-lockfile; \
      elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
      else npm install; fi
    
    # Copy the rest and build
    COPY . .
    # If you use NEXT_TELEMETRY_DISABLED in CI, it's fine to ignore here
    RUN npm run build
    
    # ---------- runtime stage ----------
    FROM node:20-alpine
    WORKDIR /app
    ENV NODE_ENV=production
    ENV PORT=3000
    
    # Copy only what's needed to run
    COPY --from=build /app ./
    
    EXPOSE 3000
    CMD ["npm","start","--","-p","3000"]
    