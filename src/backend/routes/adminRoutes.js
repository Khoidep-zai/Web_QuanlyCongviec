const express = require('express');

const {
  getAdminOverview,
  getUsers,
  updateUserStatus,
  resetUserPassword,
  getTasks,
  deleteTask,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/overview', getAdminOverview);
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/reset-password', resetUserPassword);
router.get('/tasks', getTasks);
router.delete('/tasks/:id', deleteTask);
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

module.exports = router;
