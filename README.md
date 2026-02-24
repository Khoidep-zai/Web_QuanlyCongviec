# 📝 Task Manager — Ứng dụng Quản lý Công việc Cá nhân

> **Đồ án cuối kì** — Môn Lập trình Web Nâng cao  
> Stack: **MongoDB · Express.js · React.js · Node.js (MERN)**

---

## 📖 Giới thiệu

Ứng dụng web cho phép người dùng tạo tài khoản, đăng nhập và quản lý toàn bộ công việc cá nhân của mình. Mỗi công việc có thể được phân loại, gắn nhãn, đặt deadline, chia nhỏ thành subtask và lọc/tìm kiếm linh hoạt.

**Luồng hoạt động tổng quát:**

```
Người dùng (Trình duyệt)
        │  HTTP Request (JSON)
        ▼
   React Frontend  ──────────────────────────────────────────┐
   (port 3000)                                               │
        │  Axios gọi API                                     │
        ▼                                                    │
  Express Backend                                            │
   (port 5000)                                               │
        │  Mongoose ODM                                      │
        ▼                                                    │
  MongoDB Atlas  ◄────────── Lưu trữ dữ liệu trên Cloud   ───┘
```

---

## ✨ Tính năng

| Nhóm | Chức năng |
|------|-----------|
| 🔐 **Tài khoản** | Đăng ký, Đăng nhập, Xem / Cập nhật profile |
| ✅ **Công việc** | Tạo · Sửa · Xóa · Đánh dấu hoàn thành |
| 🏷️ **Phân loại** | Danh mục màu sắc, Tags tự do, 4 mức độ ưu tiên |
| 📅 **Deadline**  | Đặt ngày hết hạn, cảnh báo quá hạn |
| 🔢 **Subtask**   | Chia nhỏ công việc, theo dõi tiến độ từng bước |
| 🔍 **Tìm kiếm**  | Tìm theo tên, lọc theo trạng thái / độ ưu tiên / danh mục |
| 📊 **Thống kê**  | Số lượng theo trạng thái, quá hạn, hoàn thành hôm nay |

---

## 🛠️ Thành phần được sử dụng

### Backend
|      Thư viện      |                   Vai trò                      |
|--------------------|------------------------------------------------|
| **Node.js 18**     | Môi trường chạy JavaScript phía server         |
| **Express.js 4**   | Framework tạo REST API                         |
| **MongoDB Atlas**  | Cơ sở dữ liệu NoSQL trên Cloud                 |
| **Mongoose 7**     | ODM — ánh xạ Object ↔ MongoDB Document         |
| **jsonwebtoken**   | Tạo và xác thực JWT token                      |
| **bcryptjs**       | Mã hóa mật khẩu (hash + salt)                  |
| **cors**           | Cho phép frontend gọi API từ domain khác       |
| **dotenv**         | Quản lý biến môi trường qua file `.env`        |
| **nodemon**        | Tự động restart server khi code thay đổi (dev) |

### Frontend
|       Thư viện     |                    Vai trò              |
|--------------------|-----------------------------------------|
| **React.js 18**    | Xây dựng giao diện theo dạng Component  |
| **React Router 6** | Điều hướng trang (client-side routing)  |
| **Context API**    | Quản lý trạng thái đăng nhập toàn app   |
| **Axios 1**        | Gọi HTTP request đến backend API        |
| **react-toastify** | Hiển thị thông báo (toast notification) |
| **react-icons**    | Bộ icon phong phú                       |
| **CSS thuần**      | Tự viết CSS, có CSS Variables cho theme |

---

## 📋 Yêu cầu môi trường

- **Node.js** >= 18.0.0 — [Tải tại nodejs.org](https://nodejs.org)
- **npm** >= 9.0.0 (đi kèm Node.js)
- Tài khoản **MongoDB Atlas** (hoặc MongoDB local)
- **Git**
- **Docker** >= 20.0 *(chỉ cần nếu chạy bằng Docker)*

---

## 🚀 Hướng dẫn cài đặt và chạy

### Cách 1 — Chạy nhanh (1 lệnh)

```bash
# Clone về
git clone https://github.com/yourusername/task-manager.git
cd task-manager

# Cài dependencies lần đầu
npm install
npm run install-all

# Khởi động cả backend lẫn frontend cùng lúc
npm run dev
```

> ✅ Backend tại **http://localhost:5000**  
> ✅ Frontend tại **http://localhost:3000**  
> ✅ Nhấn **Ctrl+C** để dừng cả hai

**Chạy riêng từng phần (khi cần test):**

```bash
npm run backend    # Chỉ backend (port 5000)
npm run frontend   # Chỉ frontend (port 3000)
```

### Cách 2 — Chạy bằng Docker

```bash
cd Docker

# Lần đầu hoặc khi có thay đổi code
docker compose up --build

# Kèm MongoDB Admin UI tại http://localhost:8081
docker compose --profile dev up --build

# Chạy nền
docker compose up --build -d

# Dừng
docker compose down
```

> ✅ Truy cập tại **http://localhost:3000**  
> ✅ Docker tự quản lý MongoDB — không cần MongoDB Atlas

### Cấu hình Backend (.env)

File `backend/.env` đã có sẵn. Nếu cần tạo lại:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

### Truy cập ứng dụng

1. Mở trình duyệt → **http://localhost:3000**
2. Nhấn **"Đăng ký"** để tạo tài khoản mới
3. Khi đăng ký, hệ thống tự tạo **5 danh mục mặc định** (Cá nhân, Công việc, Mua sắm, Sức khỏe, Học tập)
4. Đăng nhập và bắt đầu thêm công việc

---

## 📁 Cấu trúc thư mục

```
task-manager/                          ← Root project
│
├── 📂 backend/                        ← Toàn bộ code phía server (Node.js + Express)
│   │
│   ├── 📄 server.js                   ← Điểm khởi động server, nạp routes và middleware
│   ├── 📄 package.json                ← Khai báo dependencies và scripts của backend
│   ├── 📄 .env                        ← Biến môi trường (KHÔNG commit lên git)
│   │
│   ├── 📂 config/                     ← Cấu hình kết nối
│   │   └── database.js                ← Hàm kết nối Mongoose tới MongoDB Atlas
│   │
│   ├── 📂 models/                     ← Định nghĩa cấu trúc dữ liệu (Schema)
│   │   ├── User.js                    ← Schema người dùng: username, email, password (đã hash)
│   │   ├── Task.js                    ← Schema công việc: title, status, priority, subtasks...
│   │   └── Category.js                ← Schema danh mục: name, color (mỗi user có danh mục riêng)
│   │
│   ├── 📂 controllers/                ← Xử lý logic nghiệp vụ cho từng nhóm chức năng
│   │   ├── authController.js          ← Đăng ký, đăng nhập, lấy/cập nhật thông tin user
│   │   ├── taskController.js          ← CRUD công việc, thống kê, toggle subtask
│   │   └── categoryController.js      ← CRUD danh mục
│   │
│   ├── 📂 routes/                     ← Định nghĩa các endpoint URL của API
│   │   ├── authRoutes.js              ← /api/auth/register, /login, /me, /profile
│   │   ├── taskRoutes.js              ← /api/tasks (GET, POST), /:id (PUT, DELETE), /stats/overview
│   │   └── categoryRoutes.js          ← /api/categories (GET, POST), /:id (PUT, DELETE)
│   │
│   └── 📂 middleware/                 ← Lớp xử lý trung gian (chạy trước khi vào controller)
│       ├── authMiddleware.js           ← Kiểm tra JWT token, bảo vệ các route cần đăng nhập
│       └── errorMiddleware.js          ← Bắt và xử lý lỗi toàn cục (validation, duplicate, 404...)
│
├── 📂 frontend/                       ← Toàn bộ code giao diện (React.js)
│   │
│   ├── 📄 package.json                ← Dependencies frontend + proxy config → port 5000
│   │
│   ├── 📂 public/
│   │   └── index.html                 ← Template HTML gốc, React gắn vào thẻ <div id="root">
│   │
│   └── 📂 src/                        ← Toàn bộ source code React
│       │
│       ├── 📄 index.js                ← Điểm khởi động React, render <App /> vào DOM
│       ├── 📄 App.js                  ← Component gốc: bọc AuthProvider, quyết định hiện trang nào
│       ├── 📄 App.css                 ← CSS toàn bộ giao diện (~600 dòng, có responsive)
│       ├── 📄 index.css               ← CSS reset + khai báo CSS Variables (màu sắc, font...)
│       │
│       ├── 📂 context/                ← Quản lý state dùng chung (React Context API)
│       │   └── AuthContext.js         ← Lưu thông tin user đăng nhập, cung cấp cho toàn app
│       │
│       ├── 📂 services/               ← Tầng giao tiếp với Backend API (dùng Axios)
│       │   ├── api.js                 ← Cấu hình axios: baseURL, tự gắn token vào header, xử lý 401
│       │   ├── authService.js         ← Gọi API đăng ký / đăng nhập / lấy thông tin user
│       │   ├── taskService.js         ← Gọi API CRUD công việc và thống kê
│       │   └── categoryService.js     ← Gọi API CRUD danh mục
│       │
│       ├── 📂 pages/                  ← Các trang chính của ứng dụng
│       │   ├── AuthPage.js            ← Trang đăng nhập / đăng ký (toggle giữa 2 form)
│       │   └── DashboardPage.js       ← Trang chính sau khi đăng nhập (sidebar + danh sách task)
│       │
│       └── 📂 components/             ← Các component tái sử dụng, chia theo nhóm chức năng
│           │
│           ├── 📂 Layout/             ← Bố cục chung của trang
│           │   ├── Navbar.js          ← Thanh điều hướng trên cùng (logo, tên user, nút đăng xuất)
│           │   └── Sidebar.js         ← Cột bên trái (bộ lọc, thống kê nhanh, quản lý danh mục)
│           │
│           ├── 📂 Auth/               ← Components liên quan đến xác thực
│           │   ├── LoginForm.js       ← Form đăng nhập (email + password)
│           │   └── RegisterForm.js    ← Form đăng ký (fullName, username, email, password)
│           │
│           └── 📂 Task/               ← Components liên quan đến công việc
│               ├── TaskCard.js        ← Thẻ hiển thị 1 công việc (badge, deadline, subtask, actions)
│               ├── TaskForm.js        ← Modal form tạo / chỉnh sửa công việc
│               └── TaskList.js        ← Danh sách công việc (search, sort, pagination, CRUD)
│
├── 📂 server/                         ← Script khởi động & database schema
│   ├── 📂 DB/
│   │   ├── database-schema.js         ← Schema đầy đủ (User, Task, Category, ActivityLog, Notification)
│   │   └── init-mongo.js              ← Script khởi tạo collections & indexes (dùng cho Docker)
│   ├── 📄 package.json                ← Scripts chạy từ thư mục server/
│   └── 📄 start.bat                   ← Double-click để chạy cả 2 trên Windows
│
├── 📂 Docker/                         ← Toàn bộ cấu hình Docker
│   ├── 📄 docker-compose.yml          ← Orchestrate MongoDB + Backend + Frontend
│   └── 📄 .env.example                ← Mẫu biến môi trường cho Docker
│
├── 📂 scripts/                        ← Scripts tiện ích (backup, deploy, rollback)
│
├── 📄 package.json                    ← Root: lệnh npm run dev / backend / frontend
├── 📄 start.bat                       ← Double-click để chạy trên Windows
├── 📄 .env.example                    ← Mẫu file .env
├── 📄 THIET_KE_PIPELINE_VI.md         ← Tài liệu thiết kế pipeline chi tiết
└── 📄 README.md                       ← File này
```

---

## 🔄 Luồng dữ liệu — Cách các phần kết nối với nhau

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│                                                                 │
│  [AuthPage]          [DashboardPage]                            │
│  LoginForm ──┐       Sidebar ──── TaskList                      │
│  RegisterForm┘           │             │                        │
│                          │       TaskCard  TaskForm             │
│                          │                                      │
│  [Context]               │                                      │
│  AuthContext  ◄──────────┘  (cung cấp user info toàn app)       │
│                                                                 │
│  [Services / Axios]                                             │
│  authService ──────┐                                            │
│  taskService ──────┼──► api.js (tự gắn Bearer Token vào header) │
│  categoryService ──┘                                            │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTP Request (JSON)
                               │ GET /api/tasks?status=todo
                               │ POST /api/auth/login
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND (Express)                         │
│                                                                 │
│  server.js  ──►  Routes  ──►  Middleware  ──►  Controller       │
│                                                                 │
│  /api/auth  ──►  authRoutes  ──►  authMiddleware  ──►  authController   │
│  /api/tasks ──►  taskRoutes  ──►  (protect)       ──►  taskController   │
│  /api/cats  ──►  catRoutes   ──►  (protect)       ──►  categoryController│
│                                                                 │
│  Controllers ──► Models (Mongoose Schema) ──► MongoDB Atlas     │
│                  User / Task / Category                         │
└─────────────────────────────────────────────────────────────────┘
```

**Ví dụ luồng đăng nhập:**
1. User nhập email + password → `LoginForm.js`
2. Gọi `authService.login()` → Axios POST `/api/auth/login`
3. Backend `authController` kiểm tra email tồn tại, so sánh password hash
4. Trả về `{ success: true, token: "eyJ..." }`
5. Frontend lưu token vào `localStorage`, cập nhật `AuthContext`
6. App chuyển sang hiển thị `DashboardPage`

**Ví dụ luồng tạo công việc:**
1. User nhấn "+ Tạo mới" → mở `TaskForm.js` (modal)
2. Điền thông tin, nhấn Lưu → `taskService.createTask(data)`
3. Axios POST `/api/tasks` với header `Authorization: Bearer <token>`
4. Backend `authMiddleware` giải mã token → lấy `userId`
5. `taskController.createTask()` tạo document mới trong MongoDB
6. Trả về task vừa tạo → `TaskList` tự động cập nhật

---

## 🌐 API Reference

### Auth — `/api/auth`

| Method |   Endpoint  |     Mô tả                  | Auth? |
|--------|-------------|----------------------------|-------|
| `POST` | `/register` | Đăng ký tài khoản mới      |   ❌  |
| `POST` | `/login`    | Đăng nhập, nhận JWT token  |   ❌  |
| `GET`  | `/me`       | Lấy thông tin user hiện tại|   ✅  |
| `PUT`  | `/profile`  | Cập nhật thông tin cá nhân |   ✅  |

### Tasks — `/api/tasks`

| Method | Endpoint | Mô tả | Auth? |
|--------|----------|-------|-------|
| `GET`  |  `/` | Lấy danh sách công việc (có filter, sort, phân trang) | ✅ |
| `POST` | `/` | Tạo công việc mới | ✅ |
| `GET`  | `/:id` | Lấy chi tiết 1 công việc | ✅ |
| `PUT`  | `/:id` | Cập nhật công việc | ✅ |
| `DELETE` | `/:id` | Xóa công việc | ✅ |
| `GET`  | `/stats/overview` | Thống kê theo trạng thái, độ ưu tiên | ✅ |
| `PUT`  | `/:id/subtasks/:subtaskId` | Toggle hoàn thành subtask | ✅ |

**Query params cho GET /api/tasks:**

```
?status=todo          # Lọc: todo | in-progress | completed | archived
?priority=high        # Lọc: low | medium | high | urgent
?category=<id>        # Lọc theo ID danh mục
?search=tên công việc # Tìm kiếm theo title
?sort=dueDate         # Sắp xếp: createdAt | dueDate | priority | title
?page=1&limit=10      # Phân trang
```

### Categories — `/api/categories`

| Method | Endpoint | Mô tả | Auth? |
|--------|----------|-------|-------|
| `GET`  | `/` | Lấy danh sách danh mục của user | ✅ |
| `POST` | `/` | Tạo danh mục mới | ✅ |
| `PUT`  | `/:id` | Cập nhật danh mục | ✅ |
| `DELETE` | `/:id` | Xóa danh mục (task liên quan không bị xóa) | ✅ |

---

## 🗄️ Cấu trúc Database (MongoDB)

### Collection `users`
```js
{
  username:      String,   // Tên đăng nhập, duy nhất
  email:         String,   // Email, duy nhất, lowercase
  password:      String,   // Hash bcrypt 12 rounds — không lưu plaintext
  fullName:      String,   // Họ tên đầy đủ
  avatar:        String,   // URL ảnh đại diện
  isActive:      Boolean,  // Tài khoản có bị khóa không
  emailVerified: Boolean,  // Email đã xác minh chưa
  lastLogin:     Date,     // Lần đăng nhập gần nhất (tự cập nhật)
  preferences: {
    theme:       String,   // "light" | "dark" | "auto"
    defaultView: String,   // "list" | "grid" | "kanban"
  },
  createdAt:     Date
}
```

### Collection `tasks`
```js
{
  userId:      ObjectId,  // Tham chiếu tới User
  title:       String,    // Tiêu đề công việc
  description: String,    // Mô tả chi tiết
  status:      String,    // "todo" | "in-progress" | "completed" | "archived"
  priority:    String,    // "low" | "medium" | "high" | "urgent"
  category:    ObjectId,  // Tham chiếu tới Category (có thể null)
  tags:        [String],  // Mảng tag tự do
  dueDate:     Date,      // Hạn hoàn thành
  completedAt: Date,      // Tự set khi status → "completed"
  isArchived:  Boolean,   // Ẩn khỏi danh sách chính
  subtasks: [{
    title:       String,
    completed:   Boolean,
    completedAt: Date     // Tự set khi tick xong
  }]
  // Virtuals (tính toán, không lưu DB):
  // isOverdue:            Boolean — quá deadline chưa?
  // completionPercentage: Number  — % subtask hoàn thành
}
```

### Collection `categories`
```js
{
  userId:    ObjectId,  // Danh mục thuộc về user nào
  name:      String,    // Tên danh mục (unique per user)
  color:     String,    // Mã màu HEX, ví dụ "#4F46E5"
  icon:      String,    // Tên icon (person, work, school...)
  isDefault: Boolean,   // True = tự tạo lúc đăng ký
  description: String
}
```

> **Khi user đăng ký**, hệ thống tự động tạo 5 danh mục mặc định: Cá nhân, Công việc, Mua sắm, Sức khỏe, Học tập.

---

## 🔐 Cơ chế xác thực JWT

```
1. Đăng nhập thành công
   └─► Server tạo token: jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" })
   └─► Gửi token về client

2. Client lưu token vào localStorage

3. Mọi request tiếp theo:
   └─► Axios tự gắn header: Authorization: Bearer <token>

4. Backend nhận request vào route bảo vệ:
   └─► authMiddleware.js chạy trước
   └─► Giải mã token: jwt.verify(token, JWT_SECRET)
   └─► Tìm user trong DB, gắn vào req.user
   └─► Chuyển sang controller xử lý

5. Token hết hạn (7 ngày) hoặc sai:
   └─► Server trả về 401
   └─► Axios interceptor tự redirect về trang đăng nhập
```

---

## 🔒 Bảo mật

- Mật khẩu hash bằng **bcrypt** (12 salt rounds) — không lưu plaintext
- **JWT** với thời hạn 7 ngày, tự redirect về login khi hết hạn
- **CORS** chỉ cho phép request từ domain frontend
- Biến nhạy cảm (URI, secret) lưu trong `.env`, không commit lên git
- Mỗi user chỉ được đọc/sửa/xóa dữ liệu của chính mình
- `lastLogin` được cập nhật mỗi lần đăng nhập thành công
- Indexes MongoDB tự động tạo khi server khởi động

---

## 🤝 Hướng dẫn đóng góp (cho team)

```bash
# 1. Tạo branch riêng cho tính năng của bạn
git checkout -b feature/ten-tinh-nang

# 2. Code, commit thường xuyên với message rõ ràng
git add .
git commit -m "feat: thêm chức năng lọc theo deadline"

# 3. Push lên GitHub
git push origin feature/ten-tinh-nang

# 4. Tạo Pull Request trên GitHub để review và merge vào main
```

**Quy ước đặt tên branch:**
- `feature/...` — Tính năng mới
- `fix/...` — Sửa lỗi
- `docs/...` — Cập nhật tài liệu

---

## 📄 Tài liệu liên quan

- [THIET_KE_PIPELINE_VI.md](THIET_KE_PIPELINE_VI.md) — Thiết kế pipeline chi tiết (tiếng Việt)

---

## 👥 Thành viên nhóm

| Tên | MSSV | Vai trò |
|-----|------|---------|
| Nguyễn Văn A | ... | Frontend |
| Trần Thị B | ... | Backend |

---

*Đồ án cuối kì — Môn Lập trình Web Nâng cao*
