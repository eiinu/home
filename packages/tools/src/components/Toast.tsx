import React, { useState, useEffect } from 'react';
import './Toast.css';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastProps {
  message: ToastMessage;
  onRemove: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ message, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 显示动画
    const showTimer = setTimeout(() => setIsVisible(true), 10);
    
    // 自动隐藏
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(message.id), 300); // 等待动画完成
    }, message.duration || 4000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [message.id, message.duration, onRemove]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(message.id), 300);
  };

  return (
    <div className={`toast toast-${message.type} ${isVisible ? 'toast-visible' : ''}`}>
      <div className="toast-content">
        <span className="toast-message">{message.message}</span>
        <button className="toast-close" onClick={handleClose} aria-label="关闭">
          ×
        </button>
      </div>
    </div>
  );
};

interface ToastContainerProps {
  messages: ToastMessage[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ messages, onRemove }) => {
  return (
    <div className="toast-container">
      {messages.map((message) => (
        <Toast key={message.id} message={message} onRemove={onRemove} />
      ))}
    </div>
  );
};