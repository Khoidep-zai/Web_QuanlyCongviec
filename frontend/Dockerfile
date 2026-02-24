# ============================================
# Frontend Dockerfile — React (multi-stage build)
# ============================================

# ---- Stage 1: Build React app ----
FROM node:18-alpine AS build

WORKDIR /app

# Copy package.json trước để cache
COPY package*.json ./
RUN npm install

# Nhận API URL từ docker-compose (build arg)
ARG REACT_APP_API_URL=http://localhost:5000/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Copy source và build
COPY . .
RUN npm run build

# ---- Stage 2: Serve bằng Nginx ----
FROM nginx:alpine

# Copy kết quả build sang nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy cấu hình nginx (xử lý React Router + proxy API)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
