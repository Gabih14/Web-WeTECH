# Etapa 1: build
FROM node:18-alpine AS builder

WORKDIR /app

# Recibimos la variable como argumento de build
ARG VITE_API_URL
ARG VITE_FEATURABLE_WIDGET_ID

# Pasamos las variables al entorno para que Vite las use
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_FEATURABLE_WIDGET_ID=$VITE_FEATURABLE_WIDGET_ID

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: servidor liviano para servir los archivos
FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve

# Copiamos los archivos construidos desde la etapa anterior
COPY --from=builder /app/dist .

# Servimos el contenido
EXPOSE 3000
CMD ["serve", "-s", ".", "-l", "3000"]
