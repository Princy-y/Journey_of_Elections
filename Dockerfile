# Base image for building the React frontend
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Production image for serving the Express backend + built frontend
FROM node:22-alpine

WORKDIR /app
COPY package*.json ./
# Install production dependencies only
RUN npm install --production --legacy-peer-deps
COPY server/ ./server/
# Copy the built React app from the builder stage
COPY --from=builder /app/dist ./dist
# Copy the .env logic if needed, though in Cloud Run we will use env vars directly.
COPY .env* ./

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "server/proxy.js"]
