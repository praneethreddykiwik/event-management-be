# FROM node:20

# WORKDIR /server
# COPY package.json package-lock.json ./

# RUN npm ci --omit-dev

# COPY . .

# EXPOSE 3000
# CMD ["npm", "start"]


# Use official Node.js runtime as base image
FROM node:20-alpine

# Set working directory in container
WORKDIR /server

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of the app directory to nodejs user
RUN chown -R nodejs:nodejs /server
USER nodejs

# Expose port 8080 (App Runner default)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Start the application
CMD ["npm", "start"]
