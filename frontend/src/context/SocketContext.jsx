import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { addLiveNotification } from '../redux/notificationSlice';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    let socketInstance;
    if (isAuthenticated && user) {
      socketInstance = io(import.meta.env.VITE_SOCKET_URL || 'https://multi-vendor-marketplace-backend-4jh6.onrender.com');
      setSocket(socketInstance);

      // Join room for this user
      socketInstance.emit('join', user._id);

      // Listen for notifications
      socketInstance.on('notification', (data) => {
        dispatch(addLiveNotification(data));
      });
    }

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [isAuthenticated, user, dispatch]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
