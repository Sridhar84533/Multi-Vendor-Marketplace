import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useSocket } from '../../context/SocketContext';
import { MessageSquare, Send, X, Minimize2, Maximize2 } from 'lucide-react';
import API from '../../services/api';

const LiveChat = ({ recipientId, recipientName, recipientRole }) => {
  const socket = useSocket();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [chat, setChat] = useState(null);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);

  // Scroll to bottom helper
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  // Load chat or start new chat session
  useEffect(() => {
    if (isOpen && isAuthenticated && recipientId) {
      const initChat = async () => {
        try {
          const type = user.role === 'customer' 
            ? (recipientRole === 'admin' ? 'customer-admin' : 'customer-seller')
            : 'customer-seller';
          
          const res = await API.post('/chats', { recipientId, type });
          setChat(res.data);
        } catch (err) {
          console.error('Failed to initialize chat:', err);
        }
      };
      initChat();
    }
  }, [isOpen, recipientId, isAuthenticated]);

  // Live updates handler
  useEffect(() => {
    if (socket) {
      socket.on('chat-message', (data) => {
        if (chat && data.chatId === chat._id) {
          setChat((prev) => ({
            ...prev,
            messages: [...prev.messages, data.message],
          }));
        }
      });
    }
    return () => {
      if (socket) socket.off('chat-message');
    };
  }, [socket, chat]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !chat) return;

    try {
      const res = await API.post(`/chats/${chat._id}/messages`, { content: messageText });
      
      setChat((prev) => ({
        ...prev,
        messages: [...prev.messages, { sender: user._id, content: messageText, timestamp: new Date() }],
      }));
      
      // Emit message event to socket
      if (socket) {
        socket.emit('chat-message', {
          chatId: chat._id,
          recipientId,
          message: { sender: user._id, content: messageText, timestamp: new Date() },
        });
      }

      setMessageText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (!isAuthenticated || !recipientId || user._id === recipientId) return null;

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: 'var(--primary)',
            color: 'var(--secondary)',
            border: 'none',
            borderRadius: '50%',
            width: '56px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-lg)',
            cursor: 'pointer',
            zIndex: 1000,
          }}
          title={`Chat with ${recipientName}`}
        >
          <MessageSquare size={24} />
        </button>
      )}

      {isOpen && (
        <div className="chat-widget">
          <div className="chat-header">
            <span style={{ fontSize: '0.95rem' }}>Chat with {recipientName}</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <X size={18} style={{ cursor: 'pointer' }} onClick={() => setIsOpen(false)} />
            </div>
          </div>

          <div className="chat-messages">
            {chat?.messages?.map((msg, index) => {
              const isSentByMe = msg.sender === user._id;
              return (
                <div
                  key={index}
                  className={`chat-message ${isSentByMe ? 'sent' : 'received'}`}
                >
                  <p>{msg.content}</p>
                  <span style={{ fontSize: '0.65rem', color: '#888', display: 'block', textAlign: 'right', marginTop: '4px' }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="chat-input-area">
            <input
              type="text"
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="chat-input"
            />
            <button
              type="submit"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-dark)',
                cursor: 'pointer',
                padding: '0 8px',
              }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default LiveChat;
