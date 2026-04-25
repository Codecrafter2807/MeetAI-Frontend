# Use Node.js 20 alpine as the base image
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Use a smaller image for production
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production
ENV PORT 7860

# Copy necessary files from the builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose the port HF Spaces expects
EXPOSE 7860

# Start the application
CMD ["npm", "start"]
