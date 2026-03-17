# ==============================
# STAGE 1: COMPILACIÓN (BUILD)
# ==============================
FROM node:18-alpine AS build

WORKDIR /app

# Copiamos solo manifiestos primero para cachear capas de npm i
COPY package*.json ./
RUN npm install

# Copiamos todo el resto del código Angular
COPY . .

# Compilamos el proyecto (asegúrate que exista "build" en tus scripts)
RUN npm run build -- --configuration production

# ==============================
# STAGE 2: SERVIDOR (NGINX)
# ==============================
FROM nginx:alpine

# Copiamos la configuración pura de Nginx diseñada para SPA (Angular Routing)
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# IMPORTANTE: Cambia "sistema-control-multitienda" si el "outputPath" de tu angular.json es diferente o si genera subcarpetas. Por defecto en Angular 16 es dist/nombre-proyecto
COPY --from=build /app/dist/sistema-control-multitienda /usr/share/nginx/html

# Exponer puerto de NGINX interno
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
