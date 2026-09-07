# Etapa 1: build
FROM node:22-alpine AS builder

WORKDIR /app

# Recibimos la variable como argumento de build
ARG VITE_API_URL
ARG VITE_FEATURABLE_WIDGET_ID
ARG VITE_SITE_URL=https://shop.wetech.ar
ARG SEO_API_URL
ARG SEO_MIN_PRODUCTS=50

# Pasamos las variables al entorno para que Vite las use
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_FEATURABLE_WIDGET_ID=$VITE_FEATURABLE_WIDGET_ID
ENV VITE_SITE_URL=$VITE_SITE_URL
ENV SEO_API_URL=$SEO_API_URL
ENV SEO_MIN_PRODUCTS=$SEO_MIN_PRODUCTS

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Etapa 2: servidor liviano para servir los archivos
FROM node:22-alpine

WORKDIR /app

# Copiamos los archivos construidos desde la etapa anterior
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/scripts/serve-seo.mjs ./scripts/serve-seo.mjs

# Servimos el contenido
EXPOSE 3000
CMD ["node", "scripts/serve-seo.mjs"]
