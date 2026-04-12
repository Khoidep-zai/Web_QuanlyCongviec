const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = 4173;
const BUILD_DIR = path.resolve(__dirname, '../../src/frontend/build');

let nextUserId = 100;
let nextCategoryId = 100;
let nextTaskId = 100;

const users = [
  {
    _id: 'u-admin',
    fullName: 'Administrator',
    username: 'admin',
    email: 'admin@taskmanager.com',
    password: 'admin123',
    role: 'admin',
    isActive: true,
  },
  {
    _id: 'u-user',
    fullName: 'Demo User',
    username: 'demo',
    email: 'demo@example.com',
    password: 'demo123',
    role: 'user',
    isActive: true,
  },
];

const categories = [
  {
    _id: 'c-user-personal',
    userId: 'u-user',
    name: 'Ca nhan',
    color: '#3B82F6',
    description: 'Viec ca nhan',
    isDefault: true,
  },
  {
    _id: 'c-user-work',
    userId: 'u-user',
    name: 'Cong viec',
    color: '#EF4444',
    description: 'Viec cong ty',
    isDefault: true,
  },
  {
    _id: 'c-admin',
    userId: 'u-admin',
    name: 'Quan tri',
    color: '#8B5CF6',
    description: 'Noi dung quan tri',
    isDefault: true,
  },
];

let tasks = [];

const tokenToUserId = new Map([
  ['demo-admin-token', 'u-admin'],
  ['demo-user-token', 'u-user'],
]);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

function nowIso() {
  return new Date().toISOString();
}

function isoPlusDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function localDateOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function createTask(input) {
  const task = {
    _id: `t-${nextTaskId++}`,
    userId: input.userId,
    title: input.title || 'Cong viec moi',
    description: input.description || '',
    status: input.status || 'todo',
    priority: input.priority || 'medium',
    category: input.category || null,
    dueDate: input.dueDate || null,
    tags: Array.isArray(input.tags) ? input.tags : [],
    subtasks: Array.isArray(input.subtasks) ? input.subtasks : [],
    scheduleStart: input.scheduleStart || null,
    scheduleEnd: input.scheduleEnd || null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  tasks.unshift(task);
  return task;
}

function seedUserTasks() {
  tasks = tasks.filter((task) => task.userId !== 'u-user');

  createTask({
    userId: 'u-user',
    title: 'Hoan thien README bao cao',
    description: 'Cap nhat tai lieu va bo sung hinh demo',
    status: 'in-progress',
    priority: 'high',
    category: 'c-user-work',
    dueDate: isoPlusDays(1),
    tags: ['readme', 'bao-cao'],
    subtasks: [
      { _id: 'st-1', title: 'Cap nhat muc luc', completed: true },
      { _id: 'st-2', title: 'Them anh demo', completed: false },
    ],
    scheduleStart: new Date(`${localDateOffset(0)}T09:00:00`).toISOString(),
    scheduleEnd: new Date(`${localDateOffset(0)}T10:30:00`).toISOString(),
  });

  createTask({
    userId: 'u-user',
    title: 'Kiem thu smoke test',
    description: 'Dang nhap, tao task, kiem tra dashboard',
    status: 'todo',
    priority: 'medium',
    category: 'c-user-personal',
    dueDate: isoPlusDays(2),
    tags: ['test'],
    subtasks: [],
    scheduleStart: new Date(`${localDateOffset(1)}T14:00:00`).toISOString(),
    scheduleEnd: new Date(`${localDateOffset(1)}T15:00:00`).toISOString(),
  });
}

function seedAdminTasks() {
  if (tasks.some((task) => task.userId === 'u-admin')) {
    return;
  }

  createTask({
    userId: 'u-admin',
    title: 'Theo doi he thong',
    description: 'Kiem tra so lieu dashboard quan tri',
    status: 'completed',
    priority: 'low',
    category: 'c-admin',
    dueDate: isoPlusDays(-1),
    tags: ['admin'],
    subtasks: [],
  });
}

seedUserTasks();
seedAdminTasks();

function json(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function sanitizeUser(user) {
  return {
    _id: user._id,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };
}

function withCategory(task) {
  const category = categories.find((cat) => cat._id === task.category);
  return {
    ...task,
    category: category
      ? {
          _id: category._id,
          name: category.name,
          color: category.color,
        }
      : null,
  };
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        reject(new Error('Body too large'));
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function getCurrentUser(req) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice('Bearer '.length).trim();
  const userId = tokenToUserId.get(token);
  if (!userId) {
    return null;
  }

  return users.find((user) => user._id === userId) || null;
}

function requireAuth(req, res) {
  const user = getCurrentUser(req);
  if (!user) {
    json(res, 401, { success: false, message: 'Unauthorized' });
    return null;
  }
  return user;
}

function requireAdmin(req, res) {
  const user = requireAuth(req, res);
  if (!user) return null;
  if (user.role !== 'admin') {
    json(res, 403, { success: false, message: 'Forbidden' });
    return null;
  }
  return user;
}

function html(res, content) {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(content);
}

function demoAuthPage(token, user) {
  return `<!doctype html>
<html>
  <head><meta charset="utf-8"><title>Demo Login</title></head>
  <body>
    <script>
      localStorage.setItem('token', ${JSON.stringify(token)});
      localStorage.setItem('user', JSON.stringify(${JSON.stringify(user)}));
      location.href = '/';
    </script>
  </body>
</html>`;
}

function applyTaskFilters(list, query) {
  let output = [...list];

  if (query.status) {
    output = output.filter((task) => task.status === query.status);
  }

  if (query.category) {
    output = output.filter((task) => task.category === query.category);
  }

  if (query.search) {
    const keyword = String(query.search).toLowerCase();
    output = output.filter((task) => {
      return (
        String(task.title || '').toLowerCase().includes(keyword) ||
        String(task.description || '').toLowerCase().includes(keyword)
      );
    });
  }

  const sortBy = query.sortBy || 'createdAt';
  const order = query.order === 'asc' ? 1 : -1;

  output.sort((a, b) => {
    const av = a[sortBy] || '';
    const bv = b[sortBy] || '';
    if (av > bv) return order;
    if (av < bv) return -order;
    return 0;
  });

  return output;
}

async function handleApi(req, res, pathname, searchParams) {
  const method = req.method || 'GET';

  if (method === 'POST' && pathname === '/api/auth/login') {
    const body = await parseBody(req);
    const identifier = (body.email || body.username || '').toLowerCase();
    const password = body.password || '';

    const user = users.find(
      (item) =>
        (item.email.toLowerCase() === identifier || item.username.toLowerCase() === identifier) &&
        item.password === password
    );

    if (!user) {
      json(res, 401, { success: false, message: 'Sai thong tin dang nhap' });
      return;
    }

    const token = user.role === 'admin' ? 'demo-admin-token' : 'demo-user-token';
    tokenToUserId.set(token, user._id);

    json(res, 200, {
      success: true,
      message: 'Dang nhap thanh cong',
      data: {
        ...sanitizeUser(user),
        token,
      },
    });
    return;
  }

  if (method === 'POST' && pathname === '/api/auth/register') {
    const body = await parseBody(req);
    const username = String(body.username || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    if (!username || !email || !password) {
      json(res, 400, { success: false, message: 'Thieu thong tin bat buoc' });
      return;
    }

    if (users.some((item) => item.username.toLowerCase() === username.toLowerCase())) {
      json(res, 400, { success: false, message: 'Username da ton tai' });
      return;
    }

    if (users.some((item) => item.email.toLowerCase() === email)) {
      json(res, 400, { success: false, message: 'Email da ton tai' });
      return;
    }

    const newUser = {
      _id: `u-${nextUserId++}`,
      fullName: body.fullName || username,
      username,
      email,
      password,
      role: 'user',
      isActive: true,
    };

    users.push(newUser);

    const personalCat = {
      _id: `c-${nextCategoryId++}`,
      userId: newUser._id,
      name: 'Ca nhan',
      color: '#3B82F6',
      description: 'Danh muc mac dinh',
      isDefault: true,
    };

    const workCat = {
      _id: `c-${nextCategoryId++}`,
      userId: newUser._id,
      name: 'Cong viec',
      color: '#EF4444',
      description: 'Danh muc mac dinh',
      isDefault: true,
    };

    categories.push(personalCat, workCat);

    const token = 'demo-user-token';
    tokenToUserId.set(token, newUser._id);

    json(res, 201, {
      success: true,
      message: 'Dang ky thanh cong',
      data: {
        ...sanitizeUser(newUser),
        token,
      },
    });
    return;
  }

  if (method === 'GET' && pathname === '/api/auth/me') {
    const user = requireAuth(req, res);
    if (!user) return;

    json(res, 200, { success: true, data: sanitizeUser(user) });
    return;
  }

  if (method === 'GET' && pathname === '/api/tasks/stats/overview') {
    const user = requireAuth(req, res);
    if (!user) return;

    const userTasks = tasks.filter((task) => task.userId === user._id);
    const byStatus = {
      todo: 0,
      'in-progress': 0,
      completed: 0,
      archived: 0,
    };

    userTasks.forEach((task) => {
      if (Object.prototype.hasOwnProperty.call(byStatus, task.status)) {
        byStatus[task.status] += 1;
      }
    });

    const now = new Date();
    const todayString = now.toISOString().slice(0, 10);
    const overdue = userTasks.filter(
      (task) =>
        task.dueDate &&
        new Date(task.dueDate) < now &&
        task.status !== 'completed' &&
        task.status !== 'archived'
    ).length;

    const completedToday = userTasks.filter(
      (task) => task.status === 'completed' && String(task.updatedAt || '').slice(0, 10) === todayString
    ).length;

    json(res, 200, {
      success: true,
      data: {
        total: userTasks.length,
        byStatus,
        overdue,
        completedToday,
      },
    });
    return;
  }

  if (method === 'GET' && pathname === '/api/tasks/schedule/week') {
    const user = requireAuth(req, res);
    if (!user) return;

    const weekStartParam = searchParams.get('weekStart');
    const start = weekStartParam ? new Date(`${weekStartParam}T00:00:00`) : new Date();
    start.setHours(0, 0, 0, 0);
    const day = start.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + diff);

    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    const userTasks = tasks
      .filter((task) => task.userId === user._id)
      .filter((task) => task.scheduleStart && task.scheduleEnd)
      .filter((task) => {
        const scheduleStart = new Date(task.scheduleStart);
        return scheduleStart >= start && scheduleStart < end;
      })
      .map(withCategory);

    json(res, 200, {
      success: true,
      data: {
        weekStart: start.toISOString(),
        tasks: userTasks,
      },
    });
    return;
  }

  if (method === 'GET' && pathname === '/api/tasks/alerts/deadlines') {
    const user = requireAuth(req, res);
    if (!user) return;

    const limit = Number(searchParams.get('limit') || 5);
    const now = Date.now();

    const alertTasks = tasks
      .filter((task) => task.userId === user._id)
      .filter((task) => task.dueDate)
      .filter((task) => task.status !== 'completed' && task.status !== 'archived')
      .map((task) => {
        const dueTime = new Date(task.dueDate).getTime();
        return {
          ...withCategory(task),
          remainingMs: dueTime - now,
          isOverdue: dueTime < now,
        };
      })
      .sort((a, b) => Math.abs(a.remainingMs) - Math.abs(b.remainingMs))
      .slice(0, limit);

    json(res, 200, {
      success: true,
      data: alertTasks,
    });
    return;
  }

  if (method === 'GET' && pathname === '/api/tasks') {
    const user = requireAuth(req, res);
    if (!user) return;

    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = Math.max(1, Number(searchParams.get('limit') || 12));

    const filtered = applyTaskFilters(
      tasks.filter((task) => task.userId === user._id),
      {
        status: searchParams.get('status'),
        category: searchParams.get('category'),
        search: searchParams.get('search'),
        sortBy: searchParams.get('sortBy'),
        order: searchParams.get('order'),
      }
    );

    const totalTasks = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalTasks / limit));
    const startIndex = (page - 1) * limit;

    const data = filtered.slice(startIndex, startIndex + limit).map(withCategory);

    json(res, 200, {
      success: true,
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalTasks,
      },
    });
    return;
  }

  if (method === 'POST' && pathname === '/api/tasks') {
    const user = requireAuth(req, res);
    if (!user) return;

    const body = await parseBody(req);
    const task = createTask({
      userId: user._id,
      title: body.title,
      description: body.description,
      status: body.status,
      priority: body.priority,
      category: body.category,
      dueDate: body.dueDate,
      tags: body.tags,
      subtasks: body.subtasks,
      scheduleStart: body.scheduleStart,
      scheduleEnd: body.scheduleEnd,
    });

    json(res, 201, {
      success: true,
      data: withCategory(task),
    });
    return;
  }

  if (method === 'PUT' && /^\/api\/tasks\/[^/]+$/.test(pathname)) {
    const user = requireAuth(req, res);
    if (!user) return;

    const taskId = pathname.split('/').pop();
    const task = tasks.find((item) => item._id === taskId && item.userId === user._id);
    if (!task) {
      json(res, 404, { success: false, message: 'Khong tim thay task' });
      return;
    }

    const body = await parseBody(req);

    const fields = [
      'title',
      'description',
      'status',
      'priority',
      'category',
      'dueDate',
      'tags',
      'subtasks',
      'scheduleStart',
      'scheduleEnd',
    ];

    fields.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        task[key] = body[key];
      }
    });

    task.updatedAt = nowIso();

    json(res, 200, {
      success: true,
      data: withCategory(task),
    });
    return;
  }

  if (method === 'DELETE' && /^\/api\/tasks\/[^/]+$/.test(pathname)) {
    const user = requireAuth(req, res);
    if (!user) return;

    const taskId = pathname.split('/').pop();
    const before = tasks.length;
    tasks = tasks.filter((item) => !(item._id === taskId && item.userId === user._id));

    if (tasks.length === before) {
      json(res, 404, { success: false, message: 'Khong tim thay task' });
      return;
    }

    json(res, 200, {
      success: true,
      message: 'Da xoa task',
    });
    return;
  }

  if (method === 'GET' && pathname === '/api/categories') {
    const user = requireAuth(req, res);
    if (!user) return;

    const data = categories.filter((cat) => cat.userId === user._id);
    json(res, 200, { success: true, data });
    return;
  }

  if (method === 'POST' && pathname === '/api/categories') {
    const user = requireAuth(req, res);
    if (!user) return;

    const body = await parseBody(req);
    const category = {
      _id: `c-${nextCategoryId++}`,
      userId: user._id,
      name: body.name || 'Danh muc moi',
      color: body.color || '#3498DB',
      description: body.description || '',
      isDefault: false,
    };
    categories.unshift(category);

    json(res, 201, { success: true, data: category });
    return;
  }

  if (method === 'PUT' && /^\/api\/categories\/[^/]+$/.test(pathname)) {
    const user = requireAuth(req, res);
    if (!user) return;

    const categoryId = pathname.split('/').pop();
    const category = categories.find((cat) => cat._id === categoryId && cat.userId === user._id);
    if (!category) {
      json(res, 404, { success: false, message: 'Khong tim thay danh muc' });
      return;
    }

    const body = await parseBody(req);
    category.name = body.name || category.name;
    category.color = body.color || category.color;
    category.description = body.description || category.description;

    json(res, 200, { success: true, data: category });
    return;
  }

  if (method === 'DELETE' && /^\/api\/categories\/[^/]+$/.test(pathname)) {
    const user = requireAuth(req, res);
    if (!user) return;

    const categoryId = pathname.split('/').pop();
    const before = categories.length;

    for (let i = tasks.length - 1; i >= 0; i -= 1) {
      if (tasks[i].userId === user._id && tasks[i].category === categoryId) {
        tasks[i].category = null;
      }
    }

    const remaining = categories.filter((cat) => !(cat._id === categoryId && cat.userId === user._id));
    if (remaining.length === before) {
      json(res, 404, { success: false, message: 'Khong tim thay danh muc' });
      return;
    }

    categories.length = 0;
    remaining.forEach((item) => categories.push(item));

    json(res, 200, { success: true, message: 'Da xoa danh muc' });
    return;
  }

  if (method === 'GET' && pathname === '/api/admin/overview') {
    const admin = requireAdmin(req, res);
    if (!admin) return;

    const totalUsers = users.length;
    const activeUsers = users.filter((user) => user.isActive).length;
    const adminUsers = users.filter((user) => user.role === 'admin').length;

    json(res, 200, {
      success: true,
      data: {
        totalUsers,
        activeUsers,
        adminUsers,
        totalTasks: tasks.length,
        totalCategories: categories.length,
      },
    });
    return;
  }

  if (method === 'GET' && pathname === '/api/admin/users') {
    const admin = requireAdmin(req, res);
    if (!admin) return;

    json(res, 200, { success: true, data: users.map(sanitizeUser) });
    return;
  }

  if (method === 'PUT' && /^\/api\/admin\/users\/[^/]+\/status$/.test(pathname)) {
    const admin = requireAdmin(req, res);
    if (!admin) return;

    const userId = pathname.split('/')[4];
    const body = await parseBody(req);

    const user = users.find((item) => item._id === userId);
    if (!user) {
      json(res, 404, { success: false, message: 'Khong tim thay user' });
      return;
    }

    user.isActive = Boolean(body.isActive);
    json(res, 200, { success: true, data: sanitizeUser(user) });
    return;
  }

  if (method === 'PUT' && /^\/api\/admin\/users\/[^/]+\/reset-password$/.test(pathname)) {
    const admin = requireAdmin(req, res);
    if (!admin) return;

    const userId = pathname.split('/')[4];
    const body = await parseBody(req);
    const user = users.find((item) => item._id === userId);

    if (!user) {
      json(res, 404, { success: false, message: 'Khong tim thay user' });
      return;
    }

    if (body.newPassword) {
      user.password = body.newPassword;
    }

    json(res, 200, { success: true, message: 'Da reset mat khau' });
    return;
  }

  if (method === 'GET' && pathname === '/api/admin/tasks') {
    const admin = requireAdmin(req, res);
    if (!admin) return;

    const data = tasks.map((task) => {
      const owner = users.find((item) => item._id === task.userId);
      return {
        ...withCategory(task),
        userId: owner
          ? {
              _id: owner._id,
              username: owner.username,
              fullName: owner.fullName,
            }
          : null,
      };
    });

    json(res, 200, { success: true, data });
    return;
  }

  if (method === 'DELETE' && /^\/api\/admin\/tasks\/[^/]+$/.test(pathname)) {
    const admin = requireAdmin(req, res);
    if (!admin) return;

    const taskId = pathname.split('/').pop();
    const before = tasks.length;
    tasks = tasks.filter((task) => task._id !== taskId);

    if (tasks.length === before) {
      json(res, 404, { success: false, message: 'Khong tim thay task' });
      return;
    }

    json(res, 200, { success: true, message: 'Da xoa task' });
    return;
  }

  if (method === 'GET' && pathname === '/api/admin/categories') {
    const admin = requireAdmin(req, res);
    if (!admin) return;

    const data = categories.map((category) => {
      const owner = users.find((item) => item._id === category.userId);
      return {
        ...category,
        userId: owner
          ? {
              _id: owner._id,
              username: owner.username,
              email: owner.email,
            }
          : null,
      };
    });

    json(res, 200, { success: true, data });
    return;
  }

  if (method === 'POST' && pathname === '/api/admin/categories') {
    const admin = requireAdmin(req, res);
    if (!admin) return;

    const body = await parseBody(req);
    const ownerId = body.userId || 'u-user';

    const category = {
      _id: `c-${nextCategoryId++}`,
      userId: ownerId,
      name: body.name || 'Danh muc moi',
      color: body.color || '#3498DB',
      description: body.description || '',
      isDefault: false,
    };

    categories.unshift(category);

    json(res, 201, {
      success: true,
      data: {
        ...category,
        userId: users.find((item) => item._id === ownerId) || null,
      },
    });
    return;
  }

  if (method === 'PUT' && /^\/api\/admin\/categories\/[^/]+$/.test(pathname)) {
    const admin = requireAdmin(req, res);
    if (!admin) return;

    const categoryId = pathname.split('/').pop();
    const category = categories.find((item) => item._id === categoryId);
    if (!category) {
      json(res, 404, { success: false, message: 'Khong tim thay danh muc' });
      return;
    }

    const body = await parseBody(req);
    category.name = body.name || category.name;
    category.color = body.color || category.color;
    category.description = body.description || category.description;

    json(res, 200, { success: true, data: category });
    return;
  }

  if (method === 'DELETE' && /^\/api\/admin\/categories\/[^/]+$/.test(pathname)) {
    const admin = requireAdmin(req, res);
    if (!admin) return;

    const categoryId = pathname.split('/').pop();
    const before = categories.length;

    for (let i = tasks.length - 1; i >= 0; i -= 1) {
      if (tasks[i].category === categoryId) {
        tasks[i].category = null;
      }
    }

    const remaining = categories.filter((item) => item._id !== categoryId);
    if (remaining.length === before) {
      json(res, 404, { success: false, message: 'Khong tim thay danh muc' });
      return;
    }

    categories.length = 0;
    remaining.forEach((item) => categories.push(item));

    json(res, 200, { success: true, message: 'Da xoa danh muc' });
    return;
  }

  json(res, 404, {
    success: false,
    message: 'Not found',
  });
}

function tryServeStatic(res, pathname) {
  const safePath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.normalize(path.join(BUILD_DIR, safePath));

  if (!filePath.startsWith(BUILD_DIR)) {
    return false;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    fs.createReadStream(filePath).pipe(res);
    return true;
  }

  return false;
}

const server = http.createServer(async (req, res) => {
  try {
    const parsed = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = parsed.pathname;

    if (pathname === '/demo/login-user') {
      const user = sanitizeUser(users.find((item) => item._id === 'u-user'));
      html(
        res,
        demoAuthPage('demo-user-token', {
          ...user,
          token: 'demo-user-token',
        })
      );
      return;
    }

    if (pathname === '/demo/login-admin') {
      const user = sanitizeUser(users.find((item) => item._id === 'u-admin'));
      html(
        res,
        demoAuthPage('demo-admin-token', {
          ...user,
          token: 'demo-admin-token',
        })
      );
      return;
    }

    if (pathname === '/demo/task-crud') {
      seedUserTasks();
      const user = sanitizeUser(users.find((item) => item._id === 'u-user'));
      html(
        res,
        demoAuthPage('demo-user-token', {
          ...user,
          token: 'demo-user-token',
        })
      );
      return;
    }

    if (pathname.startsWith('/api/')) {
      await handleApi(req, res, pathname, parsed.searchParams);
      return;
    }

    if (tryServeStatic(res, pathname)) {
      return;
    }

    const indexPath = path.join(BUILD_DIR, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(indexPath).pipe(res);
      return;
    }

    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Build folder not found. Please run frontend build first.');
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(
      JSON.stringify({
        success: false,
        message: error.message,
      })
    );
  }
});

server.listen(PORT, () => {
  console.log(`Demo server running at http://127.0.0.1:${PORT}`);
});
