# Etapa 1: build
FROM node:22-alpine AS builder

WORKDIR /app

# Activar pnpm usando Corepack con versión fija
RUN corepack enable && corepack prepare pnpm@10.30.3 --activate

# Recibimos las variables como argumentos de build
ARG VITE_API_URL
ARG VITE_FEATURABLE_WIDGET_ID
ARG VITE_API_BEARER_TOKEN
ARG VITE_CHECKOUT_PASSWORD_ENABLED
ARG VITE_CHECKOUT_ACCESS_PASSWORD
ARG VITE_GOOGLE_MAPS_API_KEY
ARG VITE_READ_API_TOKEN
ARG VITE_SITE_URL=https://shop.wetech.ar
ARG SEO_API_URL
ARG SEO_MIN_PRODUCTS=50

# Pasamos las variables al entorno para que Vite y los scripts SEO las usen
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_FEATURABLE_WIDGET_ID=$VITE_FEATURABLE_WIDGET_ID
ENV VITE_API_BEARER_TOKEN=$VITE_API_BEARER_TOKEN
ENV VITE_CHECKOUT_PASSWORD_ENABLED=$VITE_CHECKOUT_PASSWORD_ENABLED
ENV VITE_CHECKOUT_ACCESS_PASSWORD=$VITE_CHECKOUT_ACCESS_PASSWORD
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY
ENV VITE_READ_API_TOKEN=$VITE_READ_API_TOKEN
ENV VITE_SITE_URL=$VITE_SITE_URL
ENV SEO_API_URL=$SEO_API_URL
ENV SEO_MIN_PRODUCTS=$SEO_MIN_PRODUCTS

# Instalación de dependencias con pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

# Etapa 2: servidor liviano para servir los archivos
FROM node:22-alpine

WORKDIR /app

# Copiamos los archivos construidos desde la etapa anterior
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/scripts/serve-seo.mjs ./scripts/serve-seo.mjs

# Servimos el contenido
EXPOSE 3000

CMD ["node", "scripts/serve-seo.mjs"]