# --- Build stage (dependencies only) ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# --- Runtime stage ---
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
# Writeable temp dir for uploads in serverless/container platforms
ENV UPLOAD_DIR=/tmp
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 5000
# Vercel provides PORT; we must listen on 0.0.0.0:$PORT
ENV PORT=5000
CMD ["node", "index.js"]