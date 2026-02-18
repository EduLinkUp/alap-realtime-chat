import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FaFile, FaImage, FaVideo, FaMusic, FaCheck, FaCheckDouble } from 'react-icons/fa';
import './MessageItem.css';

const MessageItem = ({ message, isOwn, showAvatar = true }) => {
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (messageType) => {
    switch (messageType) {
      case 'image':
        return <FaImage />;
      case 'video':
        return <FaVideo />;
      case 'audio':
        return <FaMusic />;
      default:
        return <FaFile />;
    }
  };

  const renderMessageContent = () => {
    if (message.messageType === 'image') {
      return (
        <>
          {message.content && <p className="message-text">{message.content}</p>}
          <img
            src={message.fileUrl}
            alt={message.fileName || 'Image'}
            className="message-image"
            onClick={() => window.open(message.fileUrl, '_blank')}
          />
        </>
      );
    }

    if (message.messageType !== 'text' && message.fileUrl) {
      return (
        <>
          {message.content && <p className="message-text">{message.content}</p>}
          <div className="message-file" onClick={() => window.open(message.fileUrl, '_blank')}>
            <span className="message-file-icon">{getFileIcon(message.messageType)}</span>
            <div className="message-file-info">
              <div className="message-file-name">{message.fileName}</div>
              {message.fileSize && (
                <div className="message-file-size">{formatFileSize(message.fileSize)}</div>
              )}
            </div>
          </div>
        </>
      );
    }

    return <p className="message-text">{message.content}</p>;
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

  const renderDeliveryStatus = () => {
    if (!isOwn) return null;

    if (message.deliveryStatus === 'read') {
      return <FaCheckDouble className="message-status read" />;
    } else if (message.deliveryStatus === 'delivered') {
      return <FaCheckDouble className="message-status delivered" />;
    } else {
      return <FaCheck className="message-status" />;
    }
  };

  return (
    <div className={`message-item ${isOwn ? 'sent' : 'received'}`}>
      {showAvatar && !isOwn && (
        <div className="message-avatar">
          {message.sender?.avatar ? (
            <img src={message.sender.avatar} alt={message.sender.name} />
          ) : (
            getInitials(message.sender?.name)
          )}
        </div>
      )}
      
      <div className="message-content">
        <div className="message-bubble">
          {renderMessageContent()}
        </div>
        
        <div className="message-time">
          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          {renderDeliveryStatus()}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
