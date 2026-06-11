const Chat = require('../models/Chat');

// @GET /api/chats
exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', 'name avatar role')
      .sort({ updatedAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/chats
exports.startChat = async (req, res) => {
  try {
    const { recipientId, type } = req.body;
    
    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, recipientId] },
      type: type || 'customer-seller',
    }).populate('participants', 'name avatar role');

    if (!chat) {
      chat = await Chat.create({
        participants: [req.user._id, recipientId],
        type: type || 'customer-seller',
        messages: [],
      });
      chat = await chat.populate('participants', 'name avatar role');
    }

    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/chats/:id/messages
exports.sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    const message = {
      sender: req.user._id,
      content,
      timestamp: new Date(),
    };

    chat.messages.push(message);
    chat.lastMessage = content;
    chat.lastMessageTime = new Date();
    await chat.save();

    // Trigger realtime notification through socket.io if user is connected
    const io = req.app.get('socketio');
    if (io) {
      const recipient = chat.participants.find((p) => p.toString() !== req.user._id.toString());
      if (recipient) {
        io.to(recipient.toString()).emit('chat-message', {
          chatId: chat._id,
          message,
        });
      }
    }

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
