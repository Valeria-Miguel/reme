ARG VERSION=latest

# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app

ARG VERSION

# Copia package.json primero para caché de layers
COPY package*.json ./

RUN npm ci --only=production --no-optional

COPY . .

RUN npm run build && echo "Version: ${VERSION}" > /app/build/version.txt

# Stage 2: Runtime con NGINX
FROM nginx:alpine
ARG VERSION

# Copia assets del build
COPY --from=build /app/build /usr/share/nginx/html

# Healthz: Archivo simple en root (nginx lo servirá en /healthz como texto)
RUN echo "ok" > /usr/share/nginx/html/healthz && \
    echo "Version: ${VERSION}" > /usr/share/nginx/html/version.txt

# Opcional: Config NGINX custom para SPAs (redirige rutas a index.html)
# Si no lo necesitas, comenta o remueve esta línea
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
LABEL version=${VERSION}

# Healthcheck en nginx (verifica HTTP real)
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]