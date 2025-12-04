# Use Node.js as base image
FROM node:18-alpine

# Install git
RUN apk add --no-cache git

# Set up the working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Build the app with Vite
RUN npm run build

# Make the test runner script executable (BEFORE switching user)
RUN chmod +x run_tests.sh

# Create a non-root user for security
RUN addgroup -g 1001 appgroup && \
    adduser -D -u 1001 -G appgroup appuser && \
    chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Set the entrypoint to your test runner
ENTRYPOINT ["./run_tests.sh"]