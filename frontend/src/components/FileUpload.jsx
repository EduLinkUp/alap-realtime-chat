import React, { useState, useRef } from 'react';
import { FaPaperclip, FaFile, FaImage, FaVideo, FaMusic, FaTimes } from 'react-icons/fa';
import { uploadFile } from '../services/authService';
import './FileUpload.css';

const FileUpload = ({ onFileSelect }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <FaImage />;
    if (fileType.startsWith('video/')) return <FaVideo />;
    if (fileType.startsWith('audio/')) return <FaMusic />;
    return <FaFile />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSend = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const uploadedFile = await uploadFile(selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Determine message type based on file type
      let messageType = 'file';
      if (selectedFile.type.startsWith('image/')) messageType = 'image';
      else if (selectedFile.type.startsWith('video/')) messageType = 'video';
      else if (selectedFile.type.startsWith('audio/')) messageType = 'audio';

      onFileSelect({
        content: caption,
        messageType,
        fileUrl: uploadedFile.fileUrl,
        fileName: uploadedFile.fileName,
        fileSize: uploadedFile.fileSize
      });

      handleCancel();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
    setCaption('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div className="file-upload-button">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="file-upload-input"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
        />
        <FaPaperclip
          className="file-upload-icon"
          onClick={() => fileInputRef.current?.click()}
        />
      </div>

      {selectedFile && (
        <div className="file-preview">
          <div className="file-preview-content">
            <div className="file-preview-header">
              <h3 className="file-preview-title">Send File</h3>
              <button className="file-preview-close" onClick={handleCancel}>
                <FaTimes />
              </button>
            </div>

            <div className="file-preview-item">
              {preview ? (
                <img src={preview} alt="Preview" className="file-preview-image" />
              ) : (
                <div className="file-preview-info">
                  <span className="file-preview-icon">
                    {getFileIcon(selectedFile.type)}
                  </span>
                  <div className="file-preview-details">
                    <div className="file-preview-name">{selectedFile.name}</div>
                    <div className="file-preview-size">
                      {formatFileSize(selectedFile.size)}
                    </div>
                  </div>
                </div>
              )}

              <textarea
                className="file-preview-caption"
                placeholder="Add a caption (optional)"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                disabled={uploading}
              />

              {uploading && (
                <div className="upload-progress">
                  <div className="upload-progress-bar">
                    <div
                      className="upload-progress-fill"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <div className="upload-progress-text">
                    Uploading... {uploadProgress}%
                  </div>
                </div>
              )}
            </div>

            <div className="file-preview-actions">
              <button
                className="file-preview-button cancel"
                onClick={handleCancel}
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                className="file-preview-button send"
                onClick={handleSend}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FileUpload;
