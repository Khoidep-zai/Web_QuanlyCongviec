// ============================================
// MongoDB Initialization Script
// ============================================
// This script runs when MongoDB container starts for the first time

print('========================================');
print('Initializing TaskManager Database');
print('========================================');

// Switch to the application database
db = db.getSiblingDB('taskmanager');

// Create application user with read/write permissions
db.createUser({
  user: 'taskmanager_user',
  pwd: 'taskmanager_password_change_in_production',
  roles: [
    {
      role: 'readWrite',
      db: 'taskmanager'
    }
  ]
});

print('✓ Application user created');

// ============================================
// CREATE COLLECTIONS
// ============================================

// Users collection
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username', 'email', 'password'],
      properties: {
        username: {
          bsonType: 'string',
          description: 'Username must be a string and is required'
        },
        email: {
          bsonType: 'string',
          pattern: '^\\S+@\\S+\\.\\S+$',
          description: 'Email must be a valid email address'
        },
        password: {
          bsonType: 'string',
          minLength: 8,
          description: 'Password must be at least 8 characters'
        },
        isActive: {
          bsonType: 'bool',
          description: 'User active status'
        }
      }
    }
  }
});

print('✓ Users collection created');

// Tasks collection
db.createCollection('tasks', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'title', 'status'],
      properties: {
        userId: {
          bsonType: 'objectId',
          description: 'User ID is required'
        },
        title: {
          bsonType: 'string',
          maxLength: 200,
          description: 'Task title is required'
        },
        status: {
          enum: ['todo', 'in-progress', 'completed', 'archived'],
          description: 'Status must be one of the enum values'
        },
        priority: {
          enum: ['low', 'medium', 'high', 'urgent'],
          description: 'Priority must be one of the enum values'
        }
      }
    }
  }
});

print('✓ Tasks collection created');

// Categories collection
db.createCollection('categories');
print('✓ Categories collection created');

// Activity logs collection
db.createCollection('activitylogs');
print('✓ Activity logs collection created');

// Notifications collection
db.createCollection('notifications');
print('✓ Notifications collection created');

// ============================================
// CREATE INDEXES
// ============================================

print('\nCreating indexes...');

// Users indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ createdAt: -1 });
print('✓ Users indexes created');

// Tasks indexes
db.tasks.createIndex({ userId: 1, status: 1 });
db.tasks.createIndex({ userId: 1, dueDate: 1 });
db.tasks.createIndex({ userId: 1, priority: 1 });
db.tasks.createIndex({ userId: 1, category: 1 });
db.tasks.createIndex({ userId: 1, createdAt: -1 });
db.tasks.createIndex({ tags: 1 });
db.tasks.createIndex({ userId: 1, status: 1, priority: -1, dueDate: 1 });
db.tasks.createIndex(
  { title: 'text', description: 'text' },
  { weights: { title: 10, description: 5 } }
);
print('✓ Tasks indexes created');

// Categories indexes
db.categories.createIndex({ userId: 1, name: 1 }, { unique: true });
print('✓ Categories indexes created');

// Activity logs indexes
db.activitylogs.createIndex({ userId: 1, timestamp: -1 });
db.activitylogs.createIndex({ taskId: 1, timestamp: -1 });
db.activitylogs.createIndex(
  { timestamp: 1 },
  { expireAfterSeconds: 7776000 }
); // 90 days TTL
print('✓ Activity logs indexes created');

// Notifications indexes
db.notifications.createIndex({ userId: 1, isRead: 1, createdAt: -1 });
db.notifications.createIndex({ userId: 1, type: 1 });
db.notifications.createIndex(
  { readAt: 1 },
  {
    expireAfterSeconds: 2592000,
    partialFilterExpression: { isRead: true }
  }
); // 30 days TTL for read notifications
print('✓ Notifications indexes created');

// ============================================
// INSERT SAMPLE DATA (Optional for development)
// ============================================

// Uncomment below for sample data in development

/*
print('\nInserting sample data...');

// Sample user (password: 'password123' - hashed)
const sampleUserId = ObjectId();
db.users.insertOne({
  _id: sampleUserId,
  username: 'demo_user',
  email: 'demo@example.com',
  password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5PfJ3BdEz.JBi',
  fullName: 'Demo User',
  avatar: null,
  isActive: true,
  emailVerified: true,
  lastLogin: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  preferences: {
    theme: 'light',
    notifications: {
      email: true,
      push: true
    },
    defaultView: 'list'
  }
});

print('✓ Sample user created');

// Sample categories
const categoryIds = [];
const categories = [
  { name: 'Personal', color: '#3B82F6', icon: 'person' },
  { name: 'Work', color: '#EF4444', icon: 'work' },
  { name: 'Shopping', color: '#10B981', icon: 'shopping_cart' },
  { name: 'Health', color: '#F59E0B', icon: 'favorite' },
  { name: 'Learning', color: '#8B5CF6', icon: 'school' }
];

categories.forEach(cat => {
  const catId = ObjectId();
  categoryIds.push(catId);
  db.categories.insertOne({
    _id: catId,
    userId: sampleUserId,
    name: cat.name,
    color: cat.color,
    icon: cat.icon,
    description: `${cat.name} related tasks`,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
});

print('✓ Sample categories created');

// Sample tasks
const tasks = [
  {
    title: 'Complete project documentation',
    description: 'Write comprehensive documentation for the Task Manager project',
    status: 'in-progress',
    priority: 'high',
    category: categoryIds[1], // Work
    tags: ['documentation', 'urgent'],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    subtasks: [
      { title: 'Write API documentation', completed: true, completedAt: new Date() },
      { title: 'Write user guide', completed: false, completedAt: null },
      { title: 'Create diagrams', completed: false, completedAt: null }
    ]
  },
  {
    title: 'Weekly grocery shopping',
    description: 'Buy groceries for the week',
    status: 'todo',
    priority: 'medium',
    category: categoryIds[2], // Shopping
    tags: ['weekly', 'routine'],
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    subtasks: []
  },
  {
    title: 'Morning exercise',
    description: '30 minutes cardio workout',
    status: 'completed',
    priority: 'medium',
    category: categoryIds[3], // Health
    tags: ['health', 'routine', 'daily'],
    dueDate: new Date(),
    completedAt: new Date(),
    subtasks: [
      { title: 'Warm up - 5 min', completed: true, completedAt: new Date() },
      { title: 'Cardio - 20 min', completed: true, completedAt: new Date() },
      { title: 'Cool down - 5 min', completed: true, completedAt: new Date() }
    ]
  },
  {
    title: 'Learn MongoDB aggregation',
    description: 'Study and practice MongoDB aggregation pipeline',
    status: 'todo',
    priority: 'high',
    category: categoryIds[4], // Learning
    tags: ['mongodb', 'database', 'learning'],
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    subtasks: []
  },
  {
    title: 'Team meeting preparation',
    description: 'Prepare slides and agenda for weekly team meeting',
    status: 'todo',
    priority: 'urgent',
    category: categoryIds[1], // Work
    tags: ['meeting', 'presentation'],
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
    reminders: [
      {
        reminderDate: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
        sent: false
      }
    ]
  }
];

tasks.forEach(task => {
  db.tasks.insertOne({
    ...task,
    userId: sampleUserId,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date()
  });
});

print('✓ Sample tasks created');
print(`✓ Created ${tasks.length} sample tasks`);
*/

// ============================================
// DATABASE STATISTICS
// ============================================

print('\n========================================');
print('Database Initialization Complete!');
print('========================================');
print('Collections:');
db.getCollectionNames().forEach(name => {
  print(`  - ${name}`);
});

print('\nIndexes:');
db.getCollectionNames().forEach(name => {
  const indexes = db.getCollection(name).getIndexes();
  print(`  ${name}: ${indexes.length} indexes`);
});

print('\n========================================');
