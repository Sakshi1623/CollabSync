# Backend production image using Node.js 20 on Alpine Linux
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy dependency manifests first so Docker can cache npm install layers
COPY package*.json ./

# Install only production dependencies from package-lock.json
RUN npm ci --omit=dev

# Copy backend source code
COPY src ./src

# Document the port Express + Socket.IO listen on
EXPOSE 5000

# Start the Node.js server
CMD ["node", "src/server.js"]

