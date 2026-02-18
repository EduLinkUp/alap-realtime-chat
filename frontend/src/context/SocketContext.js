import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import socketService from '../services/socketService';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    if (!user) return;

    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleUserOnline = ({ userId }) => {
      setOnlineUsers(prev => new Set([...prev, userId]));
    };

    const handleUserOffline = ({ userId }) => {
      setOnlineUsers(prev => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });
    };

    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);
    socketService.on('user_online', handleUserOnline);
    socketService.on('user_offline', handleUserOffline);

    return () => {
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
      socketService.off('user_online', handleUserOnline);
      socketService.off('user_offline', handleUserOffline);
    };
  }, [user]);

  const sendMessage = useCallback((data) => {
    socketService.sendMessage(data);
  }, []);

  const sendGroupMessage = useCallback((data) => {
    socketService.sendGroupMessage(data);
  }, []);

  const startTyping = useCallback((receiverId, isGroup = false) => {
    socketService.startTyping(receiverId, isGroup);
  }, []);

  const stopTyping = useCallback((receiverId, isGroup = false) => {
    socketService.stopTyping(receiverId, isGroup);
  }, []);

  const markMessageAsRead = useCallback((messageId, senderId) => {
    socketService.markMessageAsRead(messageId, senderId);
  }, []);

  const changeStatus = useCallback((status) => {
    socketService.changeStatus(status);
  }, []);

  const joinGroup = useCallback((groupId) => {
    socketService.joinGroup(groupId);
  }, []);

  const leaveGroup = useCallback((groupId) => {
    socketService.leaveGroup(groupId);
  }, []);

  const value = {
    isConnected,
    onlineUsers,
    sendMessage,
    sendGroupMessage,
    startTyping,
    stopTyping,
    markMessageAsRead,
    changeStatus,
    joinGroup,
    leaveGroup,
    socket: socketService
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
