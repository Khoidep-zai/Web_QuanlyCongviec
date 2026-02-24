# ============================================
# Backend Dockerfile — Node.js + Express
# ============================================

# Stage: dùng node 18 bản nhẹ (alpine)
FROM node:18-alpine

# Thư mục làm việc bên trong container
WORKDIR /app

# Copy package.json trước (tận dụng Docker layer cache)
# Nếu code thay đổi nhưng dependencies không đổi → không cần npm install lại
COPY package*.json ./

# Cài dependencies (chỉ production, bỏ devDependencies)
RUN npm install --omit=dev

# Copy toàn bộ source code
COPY . .

# Mở port 5000
EXPOSE 5000

# Lệnh khởi động server
CMD ["node", "server.js"]
