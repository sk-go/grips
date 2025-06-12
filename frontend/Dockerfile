FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Fix permissions for node_modules binaries after copying files
RUN chmod +x node_modules/.bin/next || true
RUN chmod +x node_modules/.bin/* || true
# Use npx as more reliable alternative
RUN npx next build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm ci --production

EXPOSE 8080
CMD ["npm", "start", "--", "-p", "8080"]