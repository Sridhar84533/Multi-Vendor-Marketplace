const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  readAllNotifications,
} = require('../controllers/NotificationController');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);

router.get('/', getNotifications);
router.put('/read-all', readAllNotifications);
router.put('/:id/read', markAsRead);

module.exports = router;
