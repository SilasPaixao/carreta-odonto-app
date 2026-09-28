# Build da aplicação OdontoMóvel
FROM node:20-alpine AS builder

WORKDIR /app

# Instala dependências tolerando variações de peer dependencies do React 19
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copia código e compila a aplicação
COPY . .
RUN npm run build

# Imagem final de produção ultraleve com Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

