import React, { useState } from 'react';
import './chatting.css';

const Chatting = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Mock data for users
  const [users] = useState([
    { id: 1, name: 'Alice Johnson', avatar: 'AJ', status: 'online', lastMessage: 'Hey! How are you?', time: '2m ago', unread: 2 },
    { id: 2, name: 'Bob Smith', avatar: 'BS', status: 'online', lastMessage: 'See you later!', time: '15m ago', unread: 0 },
    { id: 3, name: 'Charlie Brown', avatar: 'CB', status: 'offline', lastMessage: 'Thanks for the help', time: '1h ago', unread: 0 },
    { id: 4, name: 'Diana Prince', avatar: 'DP', status: 'online', lastMessage: 'Can we meet tomorrow?', time: '2h ago', unread: 1 },
    { id: 5, name: 'Ethan Hunt', avatar: 'EH', status: 'away', lastMessage: 'Mission accomplished!', time: '3h ago', unread: 0 },
    { id: 6, name: 'Fiona Green', avatar: 'FG', status: 'online', lastMessage: 'Got it!', time: '5h ago', unread: 0 },
  ]);

  // Mock messages for selected user
  const [messages, setMessages] = useState({
    1: [
      { id: 1, text: 'Hey! How are you?', sender: 'them', time: '10:30 AM' },
      { id: 2, text: 'I\'m doing great! Thanks for asking.', sender: 'me', time: '10:31 AM' },
      { id: 3, text: 'That\'s wonderful! What have you been up to?', sender: 'them', time: '10:32 AM' },
      { id: 4, text: 'Working on a new chat application. It\'s pretty exciting!', sender: 'me', time: '10:33 AM' },
      { id: 5, text: 'Sounds interesting! Tell me more about it.', sender: 'them', time: '10:35 AM' },
    ],
    2: [
      { id: 1, text: 'Hello Bob!', sender: 'me', time: '9:00 AM' },
      { id: 2, text: 'Hi there! How can I help?', sender: 'them', time: '9:05 AM' },
      { id: 3, text: 'Just wanted to catch up', sender: 'me', time: '9:10 AM' },
      { id: 4, text: 'Sure! Let\'s talk later.', sender: 'them', time: '9:15 AM' },
      { id: 5, text: 'See you later!', sender: 'them', time: '9:20 AM' },
    ],
    3: [
      { id: 1, text: 'Thanks for the help with the project', sender: 'them', time: 'Yesterday' },
      { id: 2, text: 'No problem! Happy to help.', sender: 'me', time: 'Yesterday' },
    ],
    4: [
      { id: 1, text: 'Can we meet tomorrow?', sender: 'them', time: '2:00 PM' },
      { id: 2, text: 'Sure! What time works for you?', sender: 'me', time: '2:05 PM' },
    ],
    5: [
      { id: 1, text: 'Mission accomplished!', sender: 'them', time: '11:00 AM' },
      { id: 2, text: 'Great work!', sender: 'me', time: '11:05 AM' },
    ],
    6: [
      { id: 1, text: 'Did you get my email?', sender: 'me', time: '8:00 AM' },
      { id: 2, text: 'Got it!', sender: 'them', time: '8:30 AM' },
    ],
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && selectedUser) {
      const newMessage = {
        id: messages[selectedUser.id].length + 1,
        text: message,
        sender: 'me',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages({
        ...messages,
        [selectedUser.id]: [...messages[selectedUser.id], newMessage]
      });
      setMessage('');
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setIsSidebarOpen(false);
  };

  return (
    <div className="chat-container">
      {/* Sidebar with users list */}
      <div className={`chat-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Messages</h2>
          <button className="close-sidebar" onClick={() => setIsSidebarOpen(false)}>×</button>
        </div>
        
        <div className="search-box">
          <input type="text" placeholder="Search conversations..." />
          <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div className="users-list">
          {users.map(user => (
            <div
              key={user.id}
              className={`user-item ${selectedUser?.id === user.id ? 'active' : ''}`}
              onClick={() => handleUserSelect(user)}
            >
              <div className="user-avatar-wrapper">
                <div className="user-avatar">{user.avatar}</div>
                <span className={`status-indicator ${user.status}`}></span>
              </div>
              <div className="user-info">
                <div className="user-header">
                  <h4>{user.name}</h4>
                  <span className="message-time">{user.time}</span>
                </div>
                <div className="user-preview">
                  <p>{user.lastMessage}</p>
                  {user.unread > 0 && <span className="unread-badge">{user.unread}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat window */}
      <div className="chat-main">
        {selectedUser ? (
          <>
            {/* Chat header */}
            <div className="chat-header">
              <button className="menu-toggle" onClick={() => setIsSidebarOpen(true)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <div className="chat-user-info">
                <div className="user-avatar-wrapper">
                  <div className="user-avatar small">{selectedUser.avatar}</div>
                  <span className={`status-indicator ${selectedUser.status}`}></span>
                </div>
                <div>
                  <h3>{selectedUser.name}</h3>
                  <span className="user-status-text">{selectedUser.status}</span>
                </div>
              </div>
              <div className="chat-actions">
                <button className="icon-button">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
                <button className="icon-button">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="1" fill="currentColor"/>
                    <circle cx="12" cy="5" r="1" fill="currentColor"/>
                    <circle cx="12" cy="19" r="1" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div className="messages-area">
              {messages[selectedUser.id]?.map(msg => (
                <div key={msg.id} className={`message ${msg.sender}`}>
                  <div className="message-bubble">
                    <p>{msg.text}</p>
                    <span className="message-time">{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Message input */}
            <form className="message-input-area" onSubmit={handleSendMessage}>
              <button type="button" className="icon-button">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button type="button" className="icon-button">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <button type="submit" className="send-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <div className="empty-state">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h2>Welcome to Alap Chat</h2>
              <p>Select a conversation from the left to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatting;
