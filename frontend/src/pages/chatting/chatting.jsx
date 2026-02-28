import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { getConversations, getChatHistory, markMessagesAsRead, searchMessages, getUsers } from '../../services/authService';
import MessageItem from '../../components/MessageItem';
import FileUpload from '../../components/FileUpload';
import EmojiPicker from 'emoji-picker-react';
import { FaPaperPlane, FaSmile, FaSearch, FaEllipsisV, FaBars, FaTimes, FaUserPlus } from 'react-icons/fa';
import './chatting.css';

const Chatting = () => {
  const { user, logout } = useAuth();
  const { sendMessage, startTyping, stopTyping, markMessageAsRead, socket, isConnected } = useSocket();
  
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  // eslint-disable-next-line no-unused-vars
  const [searchQuery, setSearchQuery] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load all users for new chat
  useEffect(() => {
    if (showNewChat) {
      loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showNewChat, userSearchQuery]);

  const loadUsers = async () => {
    try {
      const data = await getUsers(userSearchQuery);
      // Filter out current user
      const filteredUsers = (data.users || data || []).filter(u => u._id !== user._id);
      setAllUsers(filteredUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Setup socket listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleReceiveMessage = (newMessage) => {
      if (selectedChat && 
          (newMessage.sender._id === selectedChat.user._id || 
           newMessage.receiver._id === selectedChat.user._id)) {
        setMessages(prev => [...prev, newMessage]);
        markMessageAsRead(newMessage._id, newMessage.sender._id);
        scrollToBottom();
      }
      
      // Update conversation list
      loadConversations();
    };

    const handleMessageSent = (sentMessage) => {
      setMessages(prev => [...prev, sentMessage]);
      scrollToBottom();
      loadConversations();
    };

    const handleMessageDelivered = ({ messageId, deliveredAt }) => {
      setMessages(prev => 
        prev.map(msg => 
          msg._id === messageId 
            ? { ...msg, deliveryStatus: 'delivered' }
            : msg
        )
      );
    };

    const handleMessageRead = ({ messageId, readAt }) => {
      setMessages(prev => 
        prev.map(msg => 
          msg._id === messageId 
            ? { ...msg, deliveryStatus: 'read' }
            : msg
        )
      );
    };

    const handleUserTyping = ({ userId, userName }) => {
      if (selectedChat && userId === selectedChat.user._id) {
        setTypingUsers(prev => new Set([...prev, userName]));
      }
    };

    const handleUserStopTyping = ({ userId }) => {
      setTypingUsers(prev => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });
    };

    const handleOfflineMessages = (offlineMessages) => {
      if (offlineMessages && offlineMessages.length > 0) {
        loadConversations();
        if (selectedChat) {
          loadChatHistory(selectedChat.user._id);
        }
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_sent', handleMessageSent);
    socket.on('message_delivered', handleMessageDelivered);
    socket.on('message_read_receipt', handleMessageRead);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);
    socket.on('offline_messages', handleOfflineMessages);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_sent', handleMessageSent);
      socket.off('message_delivered', handleMessageDelivered);
      socket.off('message_read_receipt', handleMessageRead);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
      socket.off('offline_messages', handleOfflineMessages);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, isConnected, selectedChat]);

  const loadConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadChatHistory = async (userId, pageNum = 1) => {
    try {
      setLoading(true);
      const data = await getChatHistory(userId, pageNum);
      
      if (pageNum === 1) {
        setMessages(data.messages || []);
      } else {
        setMessages(prev => [...data.messages, ...prev]);
      }
      
      setHasMore(data.currentPage < data.totalPages);
      setPage(pageNum);
      
      if (pageNum === 1) {
        scrollToBottom();
        // Mark messages as read
        await markMessagesAsRead(userId);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChat = (conversation) => {
    setSelectedChat(conversation);
    setMessages([]);
    setPage(1);
    setHasMore(true);
    loadChatHistory(conversation.user._id);
    setIsSidebarOpen(false);
    setShowNewChat(false);
  };

  const handleStartNewChat = (selectedUser) => {
    // Create a conversation object to start chatting
    const newConversation = {
      user: selectedUser,
      _id: selectedUser._id
    };
    setSelectedChat(newConversation);
    setMessages([]);
    setShowNewChat(false);
    setIsSidebarOpen(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim() && !e.fileData) return;
    if (!selectedChat) return;

    const messageData = e.fileData || {
      receiverId: selectedChat.user._id,
      content: message.trim(),
      messageType: 'text'
    };

    sendMessage(messageData);
    setMessage('');
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (fileData) => {
    const data = {
      receiverId: selectedChat.user._id,
      ...fileData
    };
    sendMessage(data);
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (!selectedChat) return;

    // Emit typing start
    startTyping(selectedChat.user._id);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to emit typing stop
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(selectedChat.user._id);
    }, 1000);
  };

  const handleEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (!query.trim() || !selectedChat) {
      setIsSearching(false);
      loadChatHistory(selectedChat.user._id);
      return;
    }

    try {
      setIsSearching(true);
      const data = await searchMessages(query, selectedChat.user._id);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error searching messages:', error);
    }
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current || loading || !hasMore) return;

    if (messagesContainerRef.current.scrollTop === 0) {
      loadChatHistory(selectedChat.user._id, page + 1);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className={`chat-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="user-profile">
            <div className="user-avatar">{getInitials(user?.name)}</div>
            <div>
              <h3>{user?.name}</h3>
              <span className="status-text">{isConnected ? 'Online' : 'Offline'}</span>
            </div>
          </div>
          <div className="sidebar-header-actions">
            <button className="new-chat-btn" onClick={() => setShowNewChat(true)} title="New Chat">
              <FaUserPlus />
            </button>
            <button className="close-sidebar" onClick={() => setIsSidebarOpen(false)}>
              <FaTimes />
            </button>
          </div>
        </div>

        {/* New Chat Panel */}
        {showNewChat && (
          <div className="new-chat-panel">
            <div className="new-chat-header">
              <h4>Start New Chat</h4>
              <button onClick={() => setShowNewChat(false)}><FaTimes /></button>
            </div>
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search users..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
              />
            </div>
            <div className="users-list">
              {allUsers.length === 0 ? (
                <div className="no-users">No users found</div>
              ) : (
                allUsers.map((u) => (
                  <div
                    key={u._id}
                    className="user-item"
                    onClick={() => handleStartNewChat(u)}
                  >
                    <div className="user-avatar-wrapper">
                      <div className="user-avatar">{getInitials(u.name)}</div>
                      <span className={`status-indicator ${u.status || 'offline'}`}></span>
                    </div>
                    <div className="user-info">
                      <h4>{u.name}</h4>
                      <p>{u.email}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {!showNewChat && (
          <>
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search conversations..."
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            <div className="conversations-list">
              {conversations.length === 0 ? (
                <div className="no-conversations">
                  <p>No conversations yet</p>
                  <button onClick={() => setShowNewChat(true)} className="start-chat-btn">
                    <FaUserPlus /> Find Users
                  </button>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv._id}
                    className={`conversation-item ${selectedChat?.user._id === conv.user._id ? 'active' : ''}`}
                    onClick={() => handleSelectChat(conv)}
                  >
                    <div className="conversation-avatar">
                      {getInitials(conv.user.name)}
                      <span className={`status-indicator ${conv.user.status}`}></span>
                    </div>
                    <div className="conversation-info">
                      <div className="conversation-header">
                        <h4>{conv.user.name}</h4>
                        <span className="conversation-time">
                          {conv.lastMessage?.createdAt && 
                            new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })
                          }
                        </span>
                      </div>
                      <div className="conversation-preview">
                        <p>{conv.lastMessage?.content || 'No messages yet'}</p>
                        {conv.unreadCount > 0 && (
                          <span className="unread-badge">{conv.unreadCount}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        <div className="sidebar-footer">
          <button onClick={logout} className="logout-button">Logout</button>
        </div>
      </div>

      {/* Chat Main */}
      <div className="chat-main">
        {selectedChat ? (
          <>
            <div className="chat-header">
              <button className="menu-toggle" onClick={() => setIsSidebarOpen(true)}>
                <FaBars />
              </button>
              <div className="chat-user-info">
                <div className="user-avatar-wrapper">
                  <div className="user-avatar">{getInitials(selectedChat.user.name)}</div>
                  <span className={`status-indicator ${selectedChat.user.status}`}></span>
                </div>
                <div>
                  <h3>{selectedChat.user.name}</h3>
                  <span className="user-status-text">
                    {selectedChat.user.status === 'online' ? 'Online' : 
                     selectedChat.user.lastSeen ? 
                       `Last seen ${new Date(selectedChat.user.lastSeen).toLocaleString()}` : 
                       'Offline'
                    }
                  </span>
                </div>
              </div>
              <button className="icon-button">
                <FaEllipsisV />
              </button>
            </div>

            <div 
              className="messages-area" 
              ref={messagesContainerRef}
              onScroll={handleScroll}
            >
              {loading && page > 1 && (
                <div className="loading-indicator">Loading more messages...</div>
              )}
              
              {messages.map((msg) => (
                <MessageItem
                  key={msg._id}
                  message={msg}
                  isOwn={msg.sender._id === user._id}
                />
              ))}

              {typingUsers.size > 0 && (
                <div className="typing-indicator">
                  {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing
                  <div className="typing-dots">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form className="message-input-area" onSubmit={handleSendMessage}>
              <FileUpload onFileSelect={handleFileSelect} />
              
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={handleTyping}
                className="message-input"
              />

              <button 
                type="button" 
                className="icon-button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <FaSmile />
              </button>

              {showEmojiPicker && (
                <div className="emoji-picker-wrapper">
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              )}

              <button type="submit" className="send-button" disabled={!message.trim()}>
                <FaPaperPlane />
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <div className="empty-state">
              <h2>Welcome to Alap Chat</h2>
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatting;
