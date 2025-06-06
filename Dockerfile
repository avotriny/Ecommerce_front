# 1. Build stage avec Node 22.15.1 + npm 10.9.2
FROM node:22.15.1-alpine AS builder
WORKDIR /app

# Copier package.json & lock pour tirer parti du cache Docker
COPY package.json package-lock.json ./
RUN npm ci

# Copier le reste du code et builder
COPY . .
RUN npm run build

# 2. Production stage avec Nginx
FROM nginx:stable-alpine

# Supprimer la conf Nginx par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Copier votre conf
COPY nginx.conf /etc/nginx/conf.d/

# Copier le build React généré
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
