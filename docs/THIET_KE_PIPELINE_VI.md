# THIẾT KẾ QUY TRÌNH (PIPELINE) - ỨNG DỤNG QUẢN LÝ CÔNG VIỆC CÁ NHÂN

## 📋 TỔNG QUAN DỰ ÁN

**Tên dự án:** Trình Quản lý Công việc - Ứng dụng Quản lý Công việc Cá nhân  
**Cơ sở dữ liệu:** MongoDB  
**Công nghệ:** MERN Stack (MongoDB, Express.js, React.js, Node.js)  
**Mục đích:** Giúp người dùng quản lý công việc cá nhân với đầy đủ tính năng: tạo, xem, sửa, xóa (CRUD), phân loại theo danh mục, đặt mức độ ưu tiên và theo dõi tiến độ hoàn thành

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

```
┌─────────────────────────────────────────────────────────────┐
│         LỚP GIAO DIỆN NGƯỜI DÙNG (Frontend - Client)        │
│          React.js + Redux/Context API + Axios               │
└──────────────────┬──────────────────────────────────────────┘
                   │ REST API / GraphQL
┌──────────────────▼──────────────────────────────────────────┐
│            LỚP ỨNG DỤNG (Backend - Server)                  │
│         Node.js + Express.js + Xác thực JWT                 │
└──────────────────┬──────────────────────────────────────────┘
                   │ Mongoose ODM
┌──────────────────▼──────────────────────────────────────────┐
│                 LỚP CƠ SỞ DỮ LIỆU                           │
│            MongoDB Atlas / MongoDB Cục bộ                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 1. QUY TRÌNH TÍCH HỢP VÀ TRIỂN KHAI TỰ ĐỘNG (CI/CD)

### 1.1 Quy trình Phát triển

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Viết    │───▶│  Commit  │───▶│   Đẩy    │───▶│  Kiểm    │───▶│  Triển   │
│  Code    │    │  lên Git │    │ lên Repo │    │ thử tự độ│    │  khai    │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
```

#### **Giai đoạn 1: Phát triển (Môi trường Cục bộ)**
```yaml
Các bước thực hiện:
  1. Phát triển Code
     - Sử dụng VSCode hoặc IDE khác
     - ESLint + Prettier để kiểm tra và format code  
     - Git hooks (Husky) để kiểm tra trước khi commit
  
  2. Kiểm thử Cục bộ
     - Unit tests (Kiểm thử đơn vị) với Jest
     - Integration tests (Kiểm thử tích hợp)
     - MongoDB chạy trên máy local
  
  3. Xem xét Code
     - Git  commit với thông điệp rõ ràng
     - Pre-commit hooks tự động kiểm tra
     - Kiểm tra chất lượng code
```

#### **Giai đoạn 2: Tích hợp Liên tục (Continuous Integration)**
```yaml
Kích hoạt: Khi đẩy code lên nhánh (branch)
Nền tảng: GitHub Actions / GitLab CI / Jenkins

Các bước trong Pipeline:
  1. Lấy Code từ Repository
     - git checkout branch (chuyển sang nhánh)
  
  2. Cài đặt Thư viện Phụ thuộc
     Frontend (Giao diện):
       - npm install (cài đặt thư viện React)
     Backend (Server):
       - npm install (cài đặt thư viện Node.js)
  
  3. Kiểm tra Linting & Format
     - npm run lint (kiểm tra lỗi cú pháp)
     - npm run format:check (kiểm tra định dạng code)
  
  4. Build Ứng dụng
     Frontend:
       - npm run build (tạo bản build production)
     Backend:
       - Biên dịch TypeScript (nếu sử dụng)
  
  5. Chạy Kiểm thử
     - npm run test:unit (kiểm thử từng phần nhỏ)
     - npm run test:integration (kiểm thử tích hợp)
     - npm run test:e2e (kiểm thử end-to-end với Cypress/Playwright)
  
  6. Đo độ Phủ Code (Code Coverage)
     - Tạo báo cáo độ phủ kiểm thử
     - Upload lên CodeCov/Coveralls để theo dõi
  
  7. Quét Bảo mật
     - npm audit (kiểm tra lỗ hổng bảo mật)
     - Snyk security check (quét bảo mật chuyên sâu)
     - OWASP dependency check (kiểm tra thư viện phụ thuộc)
```

#### **Giai đoạn 3: Triển khai Liên tục (Continuous Deployment)**
```yaml
Kích hoạt: Khi merge (gộp) code vào nhánh main/master

Các môi trường:
  - Development (Phát triển): Tự động triển khai khi push lên nhánh dev
  - Staging (Dàn dựng): Tự động triển khai khi push lên nhánh staging
  - Production (Sản xuất): Yêu cầu phê duyệt thủ công trước khi triển khai

Các bước Triển khai:
  1. Tạo Docker Images (Hình ảnh Container)
     - Frontend image (hình ảnh giao diện)
     - Backend image (hình ảnh server)
  
  2. Đẩy lên Registry (Kho chứa Image)
     - Docker Hub / AWS ECR / GCP Container Registry
  
  3. Triển khai lên Môi trường
     Development (Phát triển):
       - Triển khai lên server Dev
       - Cập nhật MongoDB Dev
     
     Staging (Dàn dựng):
       - Triển khai lên server Staging
       - Chạy smoke tests (kiểm tra nhanh)
       - Cập nhật MongoDB Staging
     
     Production (Sản xuất):
       - Chờ phê duyệt thủ công
       - Triển khai Blue-Green (không downtime)
       - Triển khai lên Production
       - Cập nhật MongoDB Production
       - Chạy health checks (kiểm tra sức khỏe hệ thống)
  
  4. Sau Triển khai
     - Xác minh triển khai thành công
     - Giám sát logs (nhật ký hệ thống)
     - Rollback (khôi phục) nếu cần
```

### 1.2 Ví dụ Cấu hình CI/CD

#### **GitHub Actions Workflow**
```yaml
name: Quy trình CI/CD

on:
  push:
    branches: [dev, staging, main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:6.0
        ports:
          - 27017:27017
        env:
          MONGO_INITDB_ROOT_USERNAME: admin
          MONGO_INITDB_ROOT_PASSWORD: password
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Cài đặt Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Cài đặt Thư viện Backend
        working-directory: ./src/backend
        run: npm ci
      
      - name: Cài đặt Thư viện Frontend
        working-directory: ./src/frontend
        run: npm ci
      
      - name: Chạy Linting
        run: |
          cd src/backend && npm run lint
          cd ../frontend && npm run lint
      
      - name: Chạy Kiểm thử Backend
        working-directory: ./src/backend
        env:
          MONGODB_URI: mongodb://admin:password@localhost:27017/test?authSource=admin
          JWT_SECRET: test_secret
        run: npm run test:coverage
      
      - name: Chạy Kiểm thử Frontend
        working-directory: ./src/frontend
        run: npm run test:coverage
      
      - name: Build Frontend
        working-directory: ./src/frontend
        run: npm run build
      
      - name: Upload Báo cáo Coverage
        uses: codecov/codecov-action@v3
  
  deploy-dev:
    needs: test
    if: github.ref == 'refs/heads/dev'
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Build và Đẩy Docker Images
        run: |
          docker build -t task-manager-backend:dev ./src/backend
          docker build -t task-manager-frontend:dev ./src/frontend
          # Đẩy lên registry
      
      - name: Triển khai lên Development
        run: |
          # Lệnh triển khai
          echo "Đang triển khai lên môi trường Development"
  
  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/staging'
    runs-on: ubuntu-latest
    
    steps:
      - name: Triển khai lên Staging
        run: echo "Đang triển khai lên môi trường Staging"
  
  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://taskmanager.example.com
    
    steps:
      - name: Triển khai lên Production
        run: echo "Đang triển khai lên môi trường Production"
```

---

## 🗄️ 2. QUY TRÌNH CƠ SỞ DỮ LIỆU (DATABASE PIPELINE)

### 2.1 Thiết kế Cấu trúc Database

```javascript
// Bảng User (Người dùng) — backend/models/User.js
{
  _id: ObjectId,
  username:      String,   // Duy nhất, 3-30 ký tự, bắt buộc
  email:         String,   // Duy nhất, lowercase, bắt buộc
  password:      String,   // Bcrypt hash 12 rounds — select: false
  fullName:      String,
  avatar:        String,
  isActive:      Boolean,  // Tài khoản có bị khóa không (default: true)
  emailVerified: Boolean,  // Email đã xác minh chưa (default: false)
  lastLogin:     Date,     // Cập nhật tự động khi đăng nhập thành công
  preferences: {
    theme:       String,   // "light" | "dark" | "auto"
    defaultView: String,   // "list" | "grid" | "kanban"
  },
  createdAt: Date,
  updatedAt: Date
  // Virtual: taskCount (đếm số task của user)
  // Method: matchPassword() / comparePassword()
}

// Bảng Task (Công việc) — backend/models/Task.js
{
  _id: ObjectId,
  userId:      ObjectId,   // ref: User — bắt buộc
  title:       String,     // Tối đa 200 ký tự, bắt buộc
  description: String,     // Tối đa 2000 ký tự
  status:      String,     // "todo" | "in-progress" | "completed" | "archived"
  priority:    String,     // "low" | "medium" | "high" | "urgent"
  category:    ObjectId,   // ref: Category — có thể null
  tags:        [String],
  dueDate:     Date,
  completedAt: Date,       // Tự set khi status → "completed"
  isArchived:  Boolean,    // Ẩn khỏi danh sách chính
  subtasks: [{
    title:       String,
    completed:   Boolean,
    completedAt: Date      // Tự set khi tick hoàn thành
  }],
  createdAt: Date,
  updatedAt: Date
  // Virtuals: isOverdue (Boolean), completionPercentage (Number 0-100)
  // Text index: title (weight 10) + description (weight 5)
}

// Bảng Category (Danh mục) — backend/models/Category.js
{
  _id: ObjectId,
  userId:      ObjectId,   // ref: User — bắt buộc
  name:        String,     // Unique per user, tối đa 50 ký tự
  color:       String,     // Mã HEX, ví dụ "#3B82F6"
  icon:        String,     // Tên icon (person, work, school...) default: "folder"
  isDefault:   Boolean,    // true = tự tạo lúc đăng ký (5 danh mục mặc định)
  description: String,
  createdAt: Date,
  updatedAt: Date
  // Virtual: taskCount (đếm số task thuộc danh mục)
}
```

> **Lưu ý triển khai:** `createDefaultCategories()` trong `config/database.js` tự động tạo 5 danh mục (Cá nhân, Công việc, Mua sắm, Sức khỏe, Học tập) cho mỗi user khi đăng ký. Indexes được tạo tự động khi server khởi động.

### 2.2 Luồng Xử lý Dữ liệu

```
┌─────────────────────────────────────────────────────────────┐
│                   LUỒNG XỬ LÝ DỮ LIỆU                        │
└─────────────────────────────────────────────────────────────┘

1. LỚP NHẬP LIỆU (Yêu cầu từ Client)
   │
   ├─ Người dùng tạo/cập nhật công việc
   ├─ Kiểm tra dữ liệu ở Frontend
   └─ Gửi HTTP request đến API
           │
           ▼
2. LỚP API (Express Routes)
   │
   ├─ Xác thực JWT (kiểm tra đăng nhập)
   ├─ Kiểm tra dữ liệu đầu vào (express-validator)
   ├─ Rate limiting (giới hạn số request)
   └─ Chuyển đến Controller xử lý
           │
           ▼
3. LỚP LOGIC NGHIỆP VỤ (Controllers)
   │
   ├─ Xử lý yêu cầu
   ├─ Áp dụng quy tắc nghiệp vụ
   ├─ Chuyển đổi dữ liệu
   └─ Gọi Service layer
           │
           ▼
4. LỚP TRUY CẬP DỮ LIỆU (Models/Services)
   │
   ├─ Mongoose schemas (cấu trúc dữ liệu)
   ├─ Tối ưu query (truy vấn)
   ├─ Kiểm tra dữ liệu
   └─ Thực hiện CRUD operations
           │
           ▼
5. LỚP CƠ SỞ DỮ LIỆU (MongoDB)
   │
   ├─ Ghi vào collection (bảng)
   ├─ Tối ưu index
   ├─ Kích hoạt change streams (theo dõi thay đổi)
   └─ Trả về kết quả
           │
           ▼
6. LỚP TRẢ VỀ KẾT QUẢ
   │
   ├─ Định dạng response
   ├─ Xử lý lỗi
   ├─ Ghi log
   └─ Gửi về client
```

### 2.3 Chiến lược Đánh Index Database

```javascript
// Index cho Bảng User
db.users.createIndex({ email: 1 }, { unique: true })        // Email duy nhất
db.users.createIndex({ username: 1 }, { unique: true })     // Username duy nhất
db.users.createIndex({ createdAt: -1 })                     // Sắp xếp theo ngày tạo

// Index cho Bảng Task
db.tasks.createIndex({ userId: 1, status: 1 })              // Theo user và trạng thái
db.tasks.createIndex({ userId: 1, dueDate: 1 })             // Theo user và deadline
db.tasks.createIndex({ userId: 1, priority: 1 })            // Theo user và độ ưu tiên
db.tasks.createIndex({ userId: 1, category: 1 })            // Theo user và danh mục
db.tasks.createIndex({ userId: 1, createdAt: -1 })          // Theo user và ngày tạo
db.tasks.createIndex({ "tags": 1 })                         // Theo tags
// Compound index cho truy vấn phổ biến
db.tasks.createIndex({ userId: 1, status: 1, priority: -1, dueDate: 1 })

// Index cho Bảng Category
db.categories.createIndex({ userId: 1, name: 1 }, { unique: true }) // Tên danh mục duy nhất/user

// Index cho Bảng Activity Log
db.activityLogs.createIndex({ userId: 1, timestamp: -1 })   // Theo user và thời gian
db.activityLogs.createIndex({ taskId: 1, timestamp: -1 })   // Theo task và thời gian
// TTL index - Tự động xóa sau 90 ngày
db.activityLogs.createIndex({ timestamp: 1 }, { expireAfterSeconds: 7776000 })
```

### 2.4 Quy trình Cập nhật Database (Migration)

```yaml
Chiến lược Migration:

1. Quản lý Phiên bản cho Thay đổi DB
   - Lưu scripts migration trong thư mục /migrations
   - Sử dụng migrate-mongo hoặc custom scripts
   - Theo dõi phiên bản trong database

2. Quy trình Migration
   Các bước:
     a. Sao lưu database hiện tại
     b. Chạy script migration
     c. Kiểm tra tính toàn vẹn dữ liệu
     d. Rollback nếu có lỗi

3. Cấu trúc Script Migration
   Định dạng:
     - up(): Áp dụng thay đổi
     - down(): Hoàn tác thay đổi
     - Timestamp: YYYYMMDDHHMMSS_mo_ta.js

Ví dụ Migration:
```

```javascript
// migrations/20260221120000_them_do_uu_tien_task.js
module.exports = {
  async up(db) {
    // Thêm trường priority cho các task chưa có
    await db.collection('tasks').updateMany(
      { priority: { $exists: false } },
      { $set: { priority: 'medium' } }
    );
    
    // Tạo index cho trường priority
    await db.collection('tasks').createIndex({ priority: 1 });
  },

  async down(db) {
    // Xóa index
    await db.collection('tasks').dropIndex({ priority: 1 });
    
    // Xóa trường priority
    await db.collection('tasks').updateMany(
      {},
      { $unset: { priority: '' } }
    );
  }
};
```

### 2.5 Quy trình Sao lưu & Khôi phục Dữ liệu

```yaml
Chiến lược Sao lưu:

1. Sao lưu Tự động
   Tần suất:
     - Sao lưu đầy đủ: Hàng ngày lúc 2 giờ sáng
     - Sao lưu tăng dần: Mỗi 6 giờ
     - Sao lưu theo thời điểm: Bật trên MongoDB Atlas
   
   Thời gian lưu trữ:
     - Sao lưu hàng ngày: 7 ngày
     - Sao lưu hàng tuần: 4 tuần
     - Sao lưu hàng tháng: 12 tháng

2. Phương pháp Sao lưu
   Phương pháp 1 - mongodump:
     Lệnh: |
       mongodump --uri="mongodb://user:pass@host:port/dbname" \
                 --out=/backup/$(date +%Y%m%d_%H%M%S) \
                 --gzip
   
   Phương pháp 2 - MongoDB Atlas Tự động:
     - Sao lưu trên Cloud
     - Khôi phục theo thời điểm
     - Nhân bản cross-region

3. Quy trình Khôi phục
   Các bước:
     a. Xác định điểm sao lưu cần khôi phục
     b. Dừng ứng dụng
     c. Khôi phục database:
        mongorestore --uri="mongodb://..." \
                     --gzip \
                     /backup/backup_folder
     d. Kiểm tra tính toàn vẹn dữ liệu
     e. Khởi động lại ứng dụng
     f. Giám sát hệ thống

4. Xác minh Sao lưu
   Lịch trình: Hàng tuần
   Hành động:
     - Test khôi phục trên staging
     - Kiểm tra tính toàn vẹn dữ liệu
     - Lưu tài liệu kết quả
```

---

## 🔐 3. QUY TRÌNH BẢO MẬT

### 3.1 Luồng Xác thực & Phân quyền

```
┌─────────────────────────────────────────────────────────────┐
│              QUY TRÌNH XÁC THỰC NGƯỜI DÙNG                   │
└─────────────────────────────────────────────────────────────┘

1. Yêu cầu Đăng nhập
   │
   ├─ Email/Username + Mật khẩu
   └─ POST /api/auth/login
           │
           ▼
2. Kiểm tra Thông tin Đăng nhập
   │
   ├─ Kiểm tra user có tồn tại không
   ├─ Xác minh mật khẩu (dùng bcrypt)
   └─ Kiểm tra trạng thái tài khoản
           │
           ▼
3. Tạo Tokens (Mã thông báo)
   │
   ├─ Access Token (JWT, 15 phút)
   ├─ Refresh Token (JWT, 7 ngày)
   └─ Lưu refresh token vào DB
           │
           ▼
4. Trả về cho Client
   │
   ├─ Access token (httpOnly cookie - bảo mật)
   ├─ Refresh token (httpOnly cookie)
   └─ Thông tin user
           │
           ▼
5. Các Yêu cầu Tiếp theo
   │
   ├─ Gửi kèm access token
   ├─ Middleware xác minh JWT
   ├─ Kiểm tra hết hạn chưa
   └─ Trích xuất user ID
           │
           ▼
6. Làm mới Token (nếu hết hạn)
   │
   ├─ Sử dụng refresh token
   ├─ Kiểm tra trong database
   ├─ Tạo access token mới
   └─ Trả về tokens mới
```

### 3.2 Mã hóa Dữ liệu

```yaml
Chiến lược Mã hóa:

1. Dữ liệu Lưu trữ
   - Bật mã hóa MongoDB at rest
   - Mã hóa từng trường cho dữ liệu nhạy cảm
   - Sao lưu được mã hóa

2. Dữ liệu Truyền tải
   - HTTPS/TLS 1.3
   - Kết nối MongoDB với TLS
   - Xác thực chứng chỉ

3. Bảo mật Mật khẩu
   - Mã hóa bcrypt (12 salt rounds)
   - Yêu cầu mật khẩu:
     * Tối thiểu 8 ký tự
     * Chữ hoa và chữ thường
     * Số và ký tự đặc biệt
   - Lịch sử mật khẩu (không cho dùng lại)

4. Bảo mật API
   - Rate limiting (giới hạn số request)
   - Cấu hình CORS
   - Làm sạch dữ liệu đầu vào
   - Ngăn chặn SQL/NoSQL injection
   - Bảo vệ XSS
```

---

## 📊 4. QUY TRÌNH GIÁM SÁT & GHI LOG

### 4.1 Giám sát Ứng dụng

```yaml
Hệ thống Giám sát:

1. Giám sát Hiệu suất Ứng dụng (APM)
   Công cụ: New Relic / Datadog / Application Insights
   Chỉ số theo dõi:
     - Thời gian phản hồi
     - Tỷ lệ lỗi
     - Throughput (số request/giây)
     - Sử dụng bộ nhớ
     - Sử dụng CPU

2. Giám sát Database
   Công cụ: MongoDB Atlas Monitoring / Mongo Express
   Chỉ số theo dõi:
     - Hiệu suất query (truy vấn)
     - Slow queries (query chậm > 100ms)
     - Sử dụng connection pool
     - Sử dụng ổ đĩa
     - Hiệu quả index
     - Độ trễ replication

3. Giám sát Hạ tầng
   Công cụ: Prometheus + Grafana
   Chỉ số theo dõi:
     - Tình trạng server
     - Độ trễ mạng
     - Disk I/O (đọc/ghi ổ đĩa)
     - Chỉ số container
     - Thống kê load balancer

4. Giám sát Trải nghiệm Người dùng
   Công cụ: Google Analytics / Sentry
   Chỉ số theo dõi:
     - Thời gian load trang
     - Tương tác người dùng
     - Theo dõi lỗi
     - Thời gian session
```

### 4.2 Quy trình Ghi Log

```
┌─────────────────────────────────────────────────────────────┐
│                    QUY TRÌNH GHI LOG                         │
└─────────────────────────────────────────────────────────────┘

Application Logs (Logs ứng dụng)
      │
      ├─ info: Thông tin chung
      ├─ warn: Cảnh báo
      ├─ error: Thông báo lỗi
      ├─ debug: Thông tin debug
      │
      ▼
Winston/Pino Logger (Công cụ ghi log)
      │
      ├─ Format logs dạng JSON
      ├─ Thêm metadata (user ID, IP, thời gian)
      ├─ Thêm correlation ID
      │
      ▼
Log Aggregation (Thu thập logs)
      │
      ├─ Filebeat/Fluentd
      └─ Stream lên hệ thống tập trung
      │
      ▼
Log Storage & Analysis (Lưu trữ & Phân tích)
      │
      ├─ ELK Stack (Elasticsearch, Logstash, Kibana)
      │   HOẶC
      ├─ AWS CloudWatch Logs
      │   HOẶC
      └─ Splunk
      │
      ▼
Visualization & Alerts (Hiển thị & Cảnh báo)
      │
      ├─ Kibana dashboards
      ├─ Thiết lập cảnh báo
      └─ Tìm kiếm & phân tích log
```

### 4.3 Cấu trúc Log

```javascript
// Định dạng Log
{
  timestamp: "2026-02-21T10:30:00.000Z",     // Thời gian
  level: "info",                              // Mức độ: info, warn, error
  service: "task-manager-api",                // Tên service
  correlationId: "uuid-v4",                   // ID theo dõi
  userId: "user123",                          // ID người dùng
  method: "POST",                             // HTTP method
  url: "/api/tasks",                          // Đường dẫn API
  statusCode: 201,                            // Mã trả về
  responseTime: 45,                           // Thời gian xử lý (ms)
  message: "Task created successfully",       // Thông điệp
  metadata: {                                 // Dữ liệu bổ sung
    taskId: "task456",
    ip: "192.168.1.1",
    userAgent: "Mozilla/5.0..."
  }
}
```

---

## 🚀 5. QUY TRÌNH TRIỂN KHAI

### 5.0 Khởi động nhanh (Local Development)

```bash
# Khởi động cả backend + frontend bằng 1 lệnh từ thư mục gốc
npm run dev

# Hoặc từng phần riêng khi cần test
npm run backend    # Chỉ backend (port 5000, nodemon)
npm run frontend   # Chỉ frontend (port 3000, React hot-reload)

# Dừng: Ctrl+C trong terminal đang chạy
# Kill cứng nếu terminal đã bị đóng:
Get-NetTCPConnection -LocalPort 3000,5000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### 5.1 Chiến lược Container hóa

#### **Dockerfile — Backend** (`backend/Dockerfile`)
```dockerfile
# Dùng Node 18 Alpine (bản nhẹ)
FROM node:18-alpine

WORKDIR /app

# Copy package.json trước → tận dụng Docker layer cache
# (không npm install lại nếu dependencies không thay đổi)
COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

#### **Dockerfile — Frontend** (`frontend/Dockerfile`, multi-stage build)
```dockerfile
# ---- Stage 1: Build React app ----
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install

# API URL được inject lúc build (từ docker-compose args)
ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY . .
RUN npm run build

# ---- Stage 2: Serve bằng Nginx ----
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### **nginx.conf** (`frontend/nginx.conf`)
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # React Router: mọi URL đều trả về index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy /api → backend container (không cần biết port backend)
    location /api {
        proxy_pass http://backend:5000/api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Cache static assets 1 năm
    location ~* \.(js|css|png|jpg|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### **docker-compose.yml** (`docker-compose.yml`)
```yaml
version: '3.8'

services:
  mongodb:          # MongoDB tự quản lý (không cần Atlas khi Docker)
    image: mongo:6.0
    volumes:
      - mongodb_data:/data/db
      - ./ops/mongodb/init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js:ro
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet

  backend:          # Node.js Express API
    build: { context: ./src/backend }
    environment:
      MONGODB_URI: mongodb://admin:adminpassword@mongodb:27017/taskmanager?authSource=admin
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      mongodb: { condition: service_healthy }
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:5000/"]

  frontend:         # React build → Nginx
    build:
      context: ./src/frontend
      args: { REACT_APP_API_URL: /api }   # /api → nginx proxy → backend
    ports:
      - "3000:80"
    depends_on:
      backend: { condition: service_healthy }

  mongo-express:    # Admin UI cho MongoDB
    image: mongo-express:1.0.2-20
    ports: ["8081:8081"]
    profiles: [dev] # Chỉ chạy khi: docker compose --profile dev up

volumes:
  mongodb_data:
  mongodb_config:
```

**Lệnh Docker:**
```bash
# Chạy thường (build + start)
docker compose up --build

# Kèm Admin UI MongoDB tại http://localhost:8081
docker compose --profile dev up --build

# Chạy nền
docker compose up --build -d

# Dừng và xóa containers
docker compose down

# Xóa cả data (reset DB)
docker compose down -v
```

### 5.2 Lựa chọn Triển khai Cloud

#### **Lựa chọn 1: Triển khai trên AWS**
```yaml
Kiến trúc:
  Frontend:
    - S3 + CloudFront (lưu trữ tĩnh)
    - Build React triển khai lên S3
    - CDN để tải nhanh
  
  Backend:
    - EC2 / ECS / App Runner
    - Auto Scaling Group (tự động scale)
    - Application Load Balancer (cân bằng tải)
  
  Database:
    - MongoDB Atlas (khuyến nghị)
    - HOẶC DocumentDB (AWS managed)
  
  Dịch vụ Bổ sung:
    - Route 53 (DNS)
    - Certificate Manager (SSL)
    - CloudWatch (giám sát)
    - S3 (lưu file upload)

Lệnh Triển khai:
  # Frontend lên S3
  aws s3 sync ./build s3://bucket-name --delete
  aws cloudfront create-invalidation --distribution-id ID --paths "/*"
  
  # Backend lên ECS
  aws ecr get-login-password | docker login --username AWS --password-stdin
  docker push account.dkr.ecr.region.amazonaws.com/task-manager-backend:latest
  aws ecs update-service --cluster cluster-name --service backend-service --force-new-deployment
```

#### **Lựa chọn 2: Google Cloud Platform**
```yaml
Kiến trúc:
  Frontend:
    - Firebase Hosting / Cloud Storage + CDN
  
  Backend:
    - Cloud Run (serverless containers)
    - Cloud Functions (serverless)
  
  Database:
    - MongoDB Atlas
  
  Dịch vụ Bổ sung:
    - Cloud Load Balancing
    - Cloud Monitoring
    - Cloud Storage (lưu file upload)
```

#### **Lựa chọn 3: Heroku (Triển khai Nhanh)**
```yaml
Triển khai:
  Backend:
    - heroku create task-manager-api
    - git push heroku main
    - heroku config:set MONGODB_URI=...
  
  Frontend:
    - Triển khai lên Netlify/Vercel
    - Kết nối GitHub repo
    - Tự động deploy khi push
  
  Database:
    - MongoDB Atlas (gói miễn phí)
```

#### **Lựa chọn 4: DigitalOcean**
```yaml
Kiến trúc:
  - App Platform (managed)
  - Droplets (VPS)
  - Kubernetes (DO Kubernetes)
  - MongoDB Atlas

Triển khai:
  - Docker containers
  - Load balancer
  - Triển khai tự động từ Git
```

### 5.3 Triển khai Không Downtime (Zero-Downtime)

```yaml
Chiến lược Blue-Green Deployment:

1. Trạng thái Hiện tại
   - Môi trường Blue (production, 100% traffic)
   - Môi trường Green (không hoạt động)

2. Quy trình Triển khai
   Bước 1: Triển khai lên Green
     - Build phiên bản mới
     - Triển khai lên môi trường Green
     - Chạy smoke tests
   
   Bước 2: Chuyển Traffic
     - Chuyển 10% traffic sang Green
     - Giám sát metrics (5 phút)
     - Tăng dần: 25% → 50% → 75% → 100%
   
   Bước 3: Hoàn tất Migration
     - Tất cả traffic sang Green
     - Green trở thành production
     - Giữ Blue để rollback nhanh nếu cần
   
   Bước 4: Dọn dẹp
     - Sau khi ổn định (24 giờ)
     - Blue trở thành Green mới (không hoạt động)

3. Kế hoạch Rollback
   Nếu phát hiện vấn đề:
     - Chuyển ngay về Blue
     - Điều tra vấn đề Green
     - Sửa lỗi và thử triển khai lại

Health Checks (Kiểm tra sức khỏe):
  - HTTP 200 từ endpoint /health
  - Kết nối database OK
  - Kết nối API ngoài OK
  - Thời gian phản hồi < 200ms
```

---

## 🧪 6. QUY TRÌNH KIỂM THỬ

### 6.1 Chiến lược Kiểm thử

```yaml
Kim tự tháp Kiểm thử:

├─ E2E Tests (5%) - Kiểm thử đầu cuối
│  - Cypress / Playwright
│  - Luồng người dùng đầy đủ
│  - Các đường đi quan trọng
│
├─ Integration Tests (20%) - Kiểm thử tích hợp
│  - Kiểm thử API endpoint
│  - Kiểm thử tích hợp Database
│  - Kiểm thử dịch vụ ngoài
│
└─ Unit Tests (75%) - Kiểm thử đơn vị
   - Kiểm thử từng function riêng lẻ
   - Kiểm thử components
   - Kiểm thử logic nghiệp vụ
```

### 6.2 Quy trình Tự động hóa Kiểm thử

```yaml
Luồng Thực thi Kiểm thử:

1. Kiểm thử Trước Commit
   - Husky git hook
   - Chạy linting
   - Chạy unit tests liên quan
   - Phản hồi nhanh (< 30 giây)

2. Kiểm thử Pull Request
   Kích hoạt: Khi tạo/cập nhật PR
   Kiểm thử:
     - Tất cả unit tests
     - Tất cả integration tests
     - Kiểm tra code coverage (tối thiểu 80%)
     - Xác minh build
   
3. Kiểm thử Merge
   Kích hoạt: Merge vào nhánh main
   Kiểm thử:
     - Toàn bộ test suite
     - E2E tests
     - Performance tests
     - Security scans

4. Kiểm thử Theo Lịch
   - Hàng đêm: Toàn bộ E2E suite
   - Hàng tuần: Load tests
   - Hàng tháng: Pentration tests
```

---

## 📈 7. TỐI ƯU HÓA HIỆU SUẤT

### 7.1 Tối ưu Frontend

```yaml
Kỹ thuật Tối ưu:

1. Code Splitting (Chia nhỏ code)
   - React.lazy() cho route-based splitting
   - Dynamic imports cho components nặng
   - Tách riêng vendor bundle

2. Tối ưu Assets
   - Nén hình ảnh (định dạng WebP)
   - Lazy loading images
   - Dùng SVG cho icons
   - Tối ưu fonts

3. Chiến lược Caching
   - Service Worker (PWA)
   - Browser caching (Cache-Control headers)
   - CDN caching
   - LocalStorage cho preferences

4. Tối ưu Bundle
   - Tree shaking (loại bỏ code không dùng)
   - Minification (rút gọn code)
   - Gzip/Brotli compression
   - Xóa dependencies không dùng

5. Hiệu suất Runtime
   - React.memo cho components tốn kém
   - useMemo/useCallback hooks
   - Virtual scrolling cho danh sách dài
   - Debounce cho ô tìm kiếm
```

### 7.2 Tối ưu Backend

```yaml
Kỹ thuật Tối ưu:

1. Truy vấn Database
   - Đánh index đúng cách
   - Tối ưu query
   - Tối ưu aggregation pipeline
   - Projection (chỉ lấy trường cần thiết)
   - Phân trang (limit/skip)

2. Caching Layer
   - Redis cho session storage
   - Cache dữ liệu thường xuyên truy cập
   - Chiến lược cache invalidation
   - TTL cho cached data

3. Tối ưu API
   - Nén response (gzip)
   - Field filtering (sparse fieldsets)
   - Batch operations
   - Rate limiting
   - Connection pooling

4. Xử lý Bất đồng bộ
   - Background jobs (Bull/Agenda)
   - Gửi email (async)
   - Xử lý file (async)
   - Webhook notifications (queue)

5. Load Balancing (Cân bằng tải)
   - Horizontal scaling
   - Load balancer (Nginx/HAProxy)
   - Sticky sessions
   - Health checks
```

### 7.3 Tinh chỉnh Hiệu suất MongoDB

```javascript
// Checklist Tối ưu Hiệu suất

1. Chiến lược Index
   - Tạo index cho tất cả query filters
   - Compound indexes cho query nhiều trường
   - Covered queries (query chỉ dùng index)
   - Giám sát sử dụng index

2. Tối ưu Query
   // Không tốt: Load tất cả trường
   Task.find({ userId });
   
   // Tốt: Chỉ lấy trường cần thiết
   Task.find({ userId }).select('title status dueDate');
   
   // Không tốt: Skip lớn cho phân trang
   Task.find().skip(10000).limit(10);
   
   // Tốt: Phân trang theo range
   Task.find({ _id: { $gt: lastId } }).limit(10);

3. Aggregation Pipeline
   // Tối ưu bằng cách filter sớm
   db.tasks.aggregate([
     { $match: { userId: ObjectId('...'), status: 'todo' } }, // Filter trước
     { $lookup: { ... } }, // Sau đó join
     { $project: { ... } }, // Sau đó project
     { $sort: { createdAt: -1 } },
     { $limit: 20 }
   ]);

4. Connection Pooling
   mongoose.connect(uri, {
     maxPoolSize: 10,        // Tối đa 10 connections
     minPoolSize: 5,         // Tối thiểu 5 connections
     socketTimeoutMS: 45000,
     serverSelectionTimeoutMS: 5000,
   });

5. Giám sát Slow Queries
   // Bật profiling
   db.setProfilingLevel(1, { slowms: 100 });
   
   // Kiểm tra slow queries
   db.system.profile.find().sort({ ts: -1 }).limit(10);
```

---

## 🔄 8. XỬ LÝ DỮ LIỆU

### 8.1 Cập nhật Dữ liệu Thời gian Thực

```yaml
Triển khai Change Streams:

Mục đích:
  - Cập nhật task theo thời gian thực
  - Tính năng cộng tác
  - Thông báo trực tiếp

Kiến trúc:
  MongoDB Change Streams
      │
      ├─ Theo dõi thay đổi collection
      └─ Phát ra events
          │
          ▼
  Node.js Event Handler
      │
      ├─ Xử lý event thay đổi
      └─ Lọc thay đổi liên quan
          │
          ▼
  WebSocket (Socket.io)
      │
      ├─ Phát đến clients đang kết nối
      └─ Broadcasting theo phòng
          │
          ▼
  Frontend WebSocket Client
      │
      └─ Cập nhật UI thời gian thực
```

```javascript
// Backend: Triển khai Change Stream
const taskChangeStream = Task.watch();

taskChangeStream.on('change', (change) => {
  console.log('Phát hiện thay đổi:', change);
  
  switch (change.operationType) {
    case 'insert':
      // Thông báo về task mới
      io.to(`user-${change.fullDocument.userId}`).emit('task:created', {
        task: change.fullDocument
      });
      break;
    
    case 'update':
      // Thông báo về cập nhật task
      io.to(`user-${change.documentKey._id}`).emit('task:updated', {
        taskId: change.documentKey._id,
        updates: change.updateDescription.updatedFields
      });
      break;
    
    case 'delete':
      // Thông báo về xóa task
      io.to(`user-${change.documentKey._id}`).emit('task:deleted', {
        taskId: change.documentKey._id
      });
      break;
  }
});

// Frontend: Kết nối WebSocket
const socket = io('http://localhost:5000', {
  auth: { token: accessToken }
});

socket.on('task:created', (data) => {
  // Thêm task mới vào state
  dispatch(addTask(data.task));
  toast.success('Đã thêm task mới');
});

socket.on('task:updated', (data) => {
  // Cập nhật task trong state
  dispatch(updateTask(data.taskId, data.updates));
});
```

### 8.2 Xử lý Background Jobs

```yaml
Hệ thống Job Queue (Bull/Agenda):

Các loại Job:
  1. Email Notifications (Thông báo Email)
     - Nhắc nhở nhiệm vụ
     - Cảnh báo deadline
     - Email tổng hợp hàng ngày
  
  2. Xử lý Dữ liệu
     - Tạo báo cáo
     - Tính toán thống kê
     - Lưu trữ tasks cũ
  
  3. Tác vụ Định kỳ
     - Tự động lưu trữ tasks hoàn thành (30 ngày)
     - Gửi tổng hợp task hàng ngày
     - Dọn dẹp sessions hết hạn

Triển khai:
```

```javascript
// Thiết lập Job Queue (Bull)
const Queue = require('bull');
const taskQueue = new Queue('task-processing', {
  redis: {
    host: '127.0.0.1',
    port: 6379
  }
});

// Định nghĩa job processors
taskQueue.process('send-reminder', async (job) => {
  const { userId, taskId } = job.data;
  
  const task = await Task.findById(taskId);
  const user = await User.findById(userId);
  
  await sendEmail({
    to: user.email,
    subject: `Nhắc nhở: ${task.title}`,
    template: 'task-reminder',
    data: { task, user }
  });
  
  return { sent: true };
});

taskQueue.process('generate-report', async (job) => {
  const { userId, period } = job.data;
  
  const stats = await Task.aggregate([
    { $match: { userId: ObjectId(userId) } },
    { $group: {
      _id: '$status',
      count: { $sum: 1 }
    }}
  ]);
  
  return { stats };
});

// Lập lịch jobs
// Gửi nhắc nhở 1 giờ trước deadline
await taskQueue.add('send-reminder', 
  { userId, taskId },
  { delay: calculateDelay(task.dueDate) }
);

// Báo cáo hàng ngày lúc 8 giờ sáng
const cron = require('node-cron');
cron.schedule('0 8 * * *', async () => {
  const users = await User.find({ isActive: true });
  
  for (const user of users) {
    await taskQueue.add('generate-report', {
      userId: user._id,
      period: 'daily'
    });
  }
});
```

---

## 📋 9. QUẢN LÝ PHÁT HÀNH (RELEASE MANAGEMENT)

### 9.1 Chiến lược Quản lý Phiên bản

```yaml
Chiến lược Git Branching (Git Flow):

Các nhánh:
  main:
    - Code sẵn sàng cho production
    - Nhánh được bảo vệ
    - Yêu cầu phê duyệt PR
  
  develop:
    - Nhánh tích hợp
    - Các thay đổi phát triển mới nhất
    - Nền tảng cho feature branches
  
  feature/*:
    - Tính năng mới
    - Nhánh từ: develop
    - Merge vào: develop
  
  hotfix/*:
    - Sửa lỗi khẩn cấp production
    - Nhánh từ: main
    - Merge vào: main và develop
  
  release/*:
    - Chuẩn bị phát hành
    - Nhánh từ: develop
    - Merge vào: main và develop

Quy trình:
  1. Tạo feature branch
     git checkout -b feature/them-nhac-nho-task develop
  
  2. Phát triển tính năng
     git add .
     git commit -m "feat: thêm tính năng nhắc nhở công việc"
  
  3. Đẩy và tạo PR
     git push origin feature/them-nhac-nho-task
  
  4. Code review và merge vào develop
  
  5. Tạo release branch
     git checkout -b release/v1.2.0 develop
  
  6. Kiểm thử cuối và sửa bugs
  
  7. Merge vào main
     git checkout main
     git merge release/v1.2.0
     git tag -a v1.2.0 -m "Phát hành phiên bản 1.2.0"
  
  8. Merge về develop
     git checkout develop
     git merge release/v1.2.0
```

### 9.2 Đánh Phiên bản Theo Ngữ nghĩa (Semantic Versioning)

```yaml
Định dạng Phiên bản: MAJOR.MINOR.PATCH (ví dụ: 1.2.3)

MAJOR (Phiên bản lớn):
  - Thay đổi không tương thích ngược
  - Thay đổi API không tương thích
  - Ví dụ: 1.x.x → 2.0.0

MINOR (Phiên bản nhỏ):
  - Tính năng mới
  - Tương thích ngược
  - Ví dụ: 1.2.x → 1.3.0

PATCH (Vá lỗi):
  - Sửa lỗi
  - Tương thích ngược
  - Ví dụ: 1.2.3 → 1.2.4

Quy ước Commit Message (Conventional Commits):
  feat: Tính năng mới (MINOR)
  fix: Sửa lỗi (PATCH)
  docs: Thay đổi tài liệu
  style: Thay đổi style code
  refactor: Tái cấu trúc code
  test: Cập nhật tests
  chore: Thay đổi build/công cụ
  BREAKING CHANGE: Thay đổi không tương thích (MAJOR)

Ví dụ:
  feat: thêm tính năng chia sẻ task
  fix: sửa lỗi múi giờ deadline
  feat!: thiết kế lại API endpoints (BREAKING CHANGE)
```

### 9.3 Checklist Phát hành

```yaml
Checklist Trước Phát hành:

□ Chất lượng Code
  □ Tất cả tests đều pass (unit, integration, E2E)
  □ Code coverage > 80%
  □ Không có lỗ hổng bảo mật critical/high
  □ Code đã được review và approve
  □ Không có TODO/FIXME trong code quan trọng

□ Tài liệu
  □ API documentation đã cập nhật
  □ CHANGELOG.md đã cập nhật
  □ README.md đã cập nhật
  □ Hướng dẫn migration (nếu có breaking changes)
  □ User guide đã cập nhật

□ Kiểm thử
  □ Feature testing hoàn tất
  □ Regression testing passed
  □ Performance testing passed
  □ Security testing passed
  □ User acceptance testing (UAT) hoàn tất

□ Database
  □ Scripts migration đã chuẩn bị
  □ Scripts rollback đã chuẩn bị
  □ Backup đã được xác minh
  □ Index optimization đã xác minh

□ Triển khai
  □ Environment variables đã cấu hình
  □ Secrets đã cập nhật (nếu cần)
  □ SSL certificates còn hiệu lực
  □ DNS đã cấu hình
  □ Kế hoạch xóa CDN cache

□ Giám sát
  □ Monitoring dashboards đã cập nhật
  □ Alerts đã cấu hình
  □ Log aggregation đang hoạt động
  □ Error tracking đang hoạt động

□ Giao tiếp
  □ Release notes đã chuẩn bị
  □ Stakeholders đã được thông báo
  □ Support team đã được brief
  □ Downtime window đã thông báo

Checklist Sau Phát hành:

□ Ngay lập tức (0-2 giờ)
  □ Xác minh triển khai thành công
  □ Chạy smoke tests
  □ Kiểm tra error rates
  □ Giám sát performance metrics
  □ Kiểm tra kết nối database

□ Ngắn hạn (2-24 giờ)
  □ Giám sát phản hồi người dùng
  □ Kiểm tra application logs
  □ Xác minh tất cả tính năng hoạt động
  □ Giám sát sử dụng tài nguyên
  □ Kiểm tra tích hợp bên thứ ba

□ Dài hạn (1-7 ngày)
  □ Phân tích xu hướng hiệu suất
  □ Xem xét báo cáo lỗi
  □ Thu thập phản hồi người dùng
  □ Lên kế hoạch iteration tiếp theo
```

---

## 🎯 10. LỘ TRÌNH TRIỂN KHAI

### Giai đoạn 1: Nền tảng (Tuần 1-2)

```yaml
Tuần 1:
  □ Thiết lập dự án
    - Khởi tạo Git repository
    - Thiết lập môi trường phát triển
    - Tạo cấu trúc dự án
    - Cấu hình ESLint, Prettier
    - Thiết lập CI/CD cơ bản

Tuần 2:
  □ Thiết lập Database
    - Tạo tài khoản MongoDB Atlas
    - Thiết kế schemas
    - Tạo collections
    - Thiết lập indexes
    - Tạo migration scripts
  
  □ Nền tảng Backend
    - Thiết lập Express server
    - Kết nối MongoDB
    - Xác thực (JWT)
    - CRUD APIs cơ bản
    - Error handling middleware
```

### Giai đoạn 2: Tính năng Cốt lõi (Tuần 3-4)

```yaml
Tuần 3:
  □ Quản lý Người dùng
    - Đăng ký
    - Đăng nhập/Đăng xuất
    - Đặt lại mật khẩu
    - Quản lý profile
  
  □ Quản lý Task
    - Tạo task
    - Đọc tasks (danh sách, chi tiết)
    - Cập nhật task
    - Xóa task

Tuần 4:
  □ Tính năng Nâng cao
    - Categories (Danh mục)
    - Lọc task
    - Sắp xếp task
    - Tìm kiếm
    - Phân trang
```

### Giai đoạn 3: Phát triển Frontend (Tuần 5-6)

```yaml
Tuần 5:
  □ Thiết lập Frontend
    - Khởi tạo React app
    - State management (Redux/Context)
    - Routing (React Router)
    - UI library (Material-UI/Ant Design)
  
  □ Các trang Cốt lõi
    - Trang Đăng nhập/Đăng ký
    - Dashboard (Bảng điều khiển)
    - Danh sách task
    - Chi tiết task

Tuần 6:
  □ Cải thiện UI
    - Form tạo/sửa task
    - Bộ lọc và sắp xếp
    - Giao diện tìm kiếm
    - Quản lý danh mục
    - Responsive design (Tương thích mobile)
```

### Giai đoạn 4: Kiểm thử & Chất lượng (Tuần 7-8)

```yaml
Tuần 7:
  □ Triển khai Kiểm thử
    - Unit tests (backend)
    - Unit tests (frontend)
    - Integration tests
    - Thiết lập E2E tests
  
  □ Chất lượng Code
    - Code review
    - Refactoring (Tái cấu trúc)
    - Tối ưu hiệu suất
    - Security audit (Kiểm tra bảo mật)

Tuần 8:
  □ Tài liệu
    - API documentation
    - User guide (Hướng dẫn người dùng)
    - Developer guide (Hướng dẫn lập trình viên)
    - Deployment guide (Hướng dẫn triển khai)
  
  □ Kiểm thử Cuối
    - Full test suite
    - UAT
    - Load testing
    - Security testing
```

### Giai đoạn 5: Triển khai & Ra mắt (Tuần 9-10)

```yaml
Tuần 9:
  □ Chuẩn bị Production
    - Thiết lập môi trường
    - Database migration
    - Cấu hình secrets
    - SSL certificates
  
  □ Triển khai
    - Deploy lên staging
    - Staging testing
    - Deploy lên production
    - Xác minh sau triển khai

Tuần 10:
  □ Ra mắt
    - Soft launch (Ra mắt thử)
    - Giám sát metrics
    - Thu thập phản hồi
    - Sửa lỗi
  
  □ Sau Ra mắt
    - Cập nhật tài liệu
    - Giám sát hiệu suất
    - Hỗ trợ người dùng
    - Lên kế hoạch tính năng tiếp theo
```

---

## 📊 11. CHỈ SỐ HIỆU SUẤT QUAN TRỌNG (KPIs)

### 11.1 KPIs Kỹ thuật

```yaml
Hiệu suất Ứng dụng:
  - Thời gian phản hồi: < 200ms (p95)
  - API uptime: > 99.9%
  - Tỷ lệ lỗi: < 0.1%
  - Thời gian load trang: < 2 giây
  - Time to Interactive (TTI): < 3 giây

Hiệu suất Database:
  - Thời gian phản hồi query: < 100ms (p95)
  - Sử dụng connection pool: < 80%
  - Slow queries: < 1% tổng queries
  - Database uptime: > 99.9%

Chất lượng Code:
  - Test coverage: > 80%
  - Thời gian response code review: < 24 giờ
  - Tỷ lệ build thành công: > 95%
  - Lỗ hổng bảo mật: 0 critical/high

Triển khai:
  - Tần suất triển khai: Hàng ngày (cho releases nhỏ)
  - Tỷ lệ triển khai thành công: > 98%
  - Mean time to recovery (MTTR): < 1 giờ
  - Tỷ lệ rollback: < 5%
```

### 11.2 KPIs Nghiệp vụ

```yaml
Chỉ số Người dùng:
  - Daily active users (DAU) - Người dùng hoạt động hàng ngày
  - Monthly active users (MAU) - Người dùng hoạt động hàng tháng
  - Tỷ lệ giữ chân người dùng
  - Thời gian session trung bình
  - Tasks được tạo/người dùng/ngày

Sử dụng Tính năng:
  - Tỷ lệ hoàn thành task
  - Tỷ lệ áp dụng tính năng
  - Tính năng được dùng nhiều nhất
  - Sử dụng tìm kiếm
  - Sử dụng danh mục
```

---

## 🔧 12. CÔNG CỤ & CÔNG NGHỆ

### 12.1 Stack Phát triển

```yaml
Frontend:
  - Framework: React.js 18+
  - State Management: Redux Toolkit / Zustand
  - Routing: React Router 6
  - UI Library: Material-UI / Tailwind CSS
  - HTTP Client: Axios
  - Form Management: React Hook Form
  - Xử lý Ngày: date-fns / Moment.js
  - Real-time: Socket.io-client

Backend:
  - Runtime: Node.js 18 LTS
  - Framework: Express.js
  - ODM: Mongoose
  - Authentication: jsonwebtoken, bcrypt
  - Validation: express-validator / Joi
  - File Upload: Multer
  - Email: Nodemailer
  - Task Queue: Bull / Agenda
  - Real-time: Socket.io

Database:
  - Primary: MongoDB 6.0+
  - Hosting: MongoDB Atlas
  - Backup: mongodump, Atlas Backup
  - Migration: migrate-mongo

DevOps & Infrastructure:
  - Version Control: Git, GitHub
  - CI/CD: GitHub Actions
  - Containerization: Docker, Docker Compose
  - Cloud Platform: AWS / GCP / Azure
  - Monitoring: Datadog / New Relic
  - Logging: Winston, ELK Stack
  - Error Tracking: Sentry

Testing:
  - Unit Testing: Jest
  - E2E Testing: Cypress / Playwright
  - API Testing: Supertest
  - Load Testing: k6 / Apache JMeter
  - Code Coverage: Istanbul / NYC

Security:
  - Vulnerability Scanning: Snyk / npm audit
  - API Security: Helmet.js, express-rate-limit
  - HTTPS: Let's Encrypt
  - Secrets Management: AWS Secrets Manager / Vault
```

### 12.2 Công cụ Phát triển

```yaml
IDE & Editors:
  - Visual Studio Code
  - WebStorm
  - Extensions: ESLint, Prettier, GitLens

Phát triển API:
  - Postman / Insomnia
  - Swagger / OpenAPI

Công cụ Database:
  - MongoDB Compass
  - Robo 3T / Studio 3T
  - MongoDB Atlas UI

Cộng tác:
  - Slack / Microsoft Teams
  - Jira / Linear
  - Confluence / Notion
  - Figma (thiết kế)
```

---

## 📝 TÓM TẮT

Bản thiết kế quy trình này cung cấp lộ trình đầy đủ để phát triển, triển khai và vận hành ứng dụng Quản lý Công việc Cá nhân với MongoDB. Quy trình bao gồm:

### ✅ Các thành phần chính:

1. **Quy trình CI/CD** - Tự động hóa kiểm thử, build và triển khai
2. **Quy trình Database** - Thiết kế schema, indexing, migration và backup
3. **Quy trình Bảo mật** - Xác thực, mã hóa, bảo mật API
4. **Giám sát & Logging** - Giám sát hiệu suất và ghi nhật ký
5. **Chiến lược Triển khai** - Container hóa và triển khai cloud
6. **Quy trình Kiểm thử** - Unit, integration và E2E testing
7. **Tối ưu Hiệu suất** - Tối ưu frontend, backend và database
8. **Xử lý Dữ liệu** - Cập nhật real-time và background jobs
9. **Quản lý Phát hành** - Version control, semantic versioning
10. **Lộ trình Triển khai** - Kế hoạch 10 tuần triển khai chi tiết

### 🚀 Bước tiếp theo:

1. Xem xét và điều chỉnh quy trình phù hợp với yêu cầu cụ thể
2. Thiết lập môi trường phát triển
3. Bắt đầu triển khai theo lộ trình 10 tuần
4. Thiết lập CI/CD pipeline ngay từ đầu
5. Triển khai giám sát và logging từ giai đoạn đầu

Quy trình này đảm bảo ứng dụng được phát triển theo các phương pháp hay nhất (best practices) với khả năng mở rộng, bảo trì và vận hành ổn định trong thời gian dài.

---

**📌 Lưu ý:** Đây là tài liệu thiết kế quy trình cho đồ án cuối kì môn Lập trình Web Nâng cao. Tất cả các khái niệm kỹ thuật đã được giải thích bằng tiếng Việt để dễ hiểu, tuy nhiên vẫn giữ lại các thuật ngữ chuyên ngành quan trọng để tham khảo và tra cứu.
