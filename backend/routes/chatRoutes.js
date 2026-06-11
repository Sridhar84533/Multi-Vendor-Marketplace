const express = require('express');
const router = express.Router();
const {
  getChats,
  startChat,
  sendMessage,
} = require('../controllers/ChatController');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);

router.route('/')
  .get(getChats)
  .post(startChat);

router.post('/:id/messages', sendMessage);

module.exports = router;
