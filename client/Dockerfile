# Stage 1: Build the React + Vite frontend into static files
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests and install packages cleanly
COPY package*.json ./
RUN npm ci

# Vite embeds VITE_* variables into the static JS bundle at build time
ARG VITE_API_URL
ARG VITE_SOCKET_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

# Copy frontend source files and build production assets into /app/dist
COPY . .
RUN npm run build

# Stage 2: Serve the built static files with Nginx
FROM nginx:alpine

# Copy built static bundle from Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx config with React Router SPA fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx listens on port 80 inside the container
EXPOSE 80

# Keep Nginx running in the foreground so the container stays alive
CMD ["nginx", "-g", "daemon off;"]

