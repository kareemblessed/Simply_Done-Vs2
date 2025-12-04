# Use Node.js as base image
FROM node:18-alpine

# Install git
RUN apk add --no-cache git

# Set up the working directory
WORKDIR /app

# Copy ONLY specific files first
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./

# Install dependencies
RUN npm ci

# Copy the rest
COPY src ./src
COPY tasks ./tasks
COPY run_tests.sh ./
COPY index.html ./
COPY index.tsx ./

# Build the app
RUN npm run build

# Make test runner executable
RUN chmod +x run_tests.sh

# Create a non-root user for security
RUN addgroup -g 1001 appgroup && \
    adduser -D -u 1001 -G appgroup appuser && \
    chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Set the entrypoint to your test runner
ENTRYPOINT ["./run_tests.sh"]