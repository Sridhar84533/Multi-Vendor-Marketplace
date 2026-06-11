const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: String,
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
});

const chatSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: [messageSchema],
    lastMessage: String,
    lastMessageTime: Date,
    type: { type: String, enum: ['customer-seller', 'customer-admin'], default: 'customer-seller' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Chat', chatSchema);
