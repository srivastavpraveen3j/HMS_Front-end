# Stage 1: Build the Angular app
FROM node:18 AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the full source code
COPY . .

# Build Angular app with SSR browser output
RUN npm run build --configuration=production

# Stage 2: Serve with NGINX
FROM nginx:alpine

# Remove default NGINX HTML files
RUN rm -rf /usr/share/nginx/html/*

# Copy built Angular app from builder stage (SSR path)
COPY --from=builder /app/dist/hims-frontend/browser /usr/share/nginx/html/

# Copy custom NGINX config to support Angular routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Set proper permissions (optional, safe default)
RUN chmod -R 755 /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]