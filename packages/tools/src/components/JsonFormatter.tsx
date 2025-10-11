import React, { useState, useEffect } from 'react';
import './JsonFormatter.css';
import useToast from './useToast';
import { ToastContainer } from './Toast';
import Button from './Button';
import CodeMirrorEditor from './CodeMirrorEditor';

interface JsonFormatterProps {
  theme?: 'light' | 'dark' | 'auto';
}

const JsonFormatter: React.FC<JsonFormatterProps> = ({ theme = 'auto' }) => {
  const [input, setInput] = useState('{\n  "name": "JSON Formatter",\n  "version": "1.0.0",\n  "description": "A beautiful JSON formatter with syntax highlighting"\n}');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // 检查父组件传入的主题或从 DOM 获取当前主题
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    
    // 优先从 DOM 获取当前主题状态
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme) return currentTheme === 'dark';
    
    // 回退到系统主题
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const { showError, messages, removeToast } = useToast();

  // 监听主题变化
  useEffect(() => {
    const updateTheme = () => {
      let shouldBeDark = false;
      
      if (theme === 'dark') {
        shouldBeDark = true;
      } else if (theme === 'light') {
        shouldBeDark = false;
      } else {
        // auto 模式：优先从 DOM 获取，然后是系统主题
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme) {
          shouldBeDark = currentTheme === 'dark';
        } else {
          shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
      }
      
      setIsDarkMode(shouldBeDark);
    };

    updateTheme();

    // 监听 DOM 主题变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          updateTheme();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    // 如果是 auto 模式，也监听系统主题变化
    let mediaQuery: MediaQueryList | null = null;
    if (theme === 'auto') {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', updateTheme);
    }

    return () => {
      observer.disconnect();
      if (mediaQuery) {
        mediaQuery.removeEventListener('change', updateTheme);
      }
    };
  }, [theme]);

  const formatJson = () => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setInput(formatted);
    } catch {
      showError('Invalid JSON format');
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setInput(minified);
    } catch {
      showError('Invalid JSON format');
    }
  };

  const clearEditor = () => {
    setInput('');
  };

  return (
    <div className="json-formatter" data-theme={isDarkMode ? 'dark' : 'light'}>
      <div className="toolbar">
        <div className="toolbar-left">
          <Button variant="primary" size="medium" onClick={formatJson} icon="✨">
            格式化
          </Button>
          <Button variant="secondary" size="medium" onClick={minifyJson} icon="🗜️">
            压缩
          </Button>
          <Button variant="danger" size="medium" onClick={clearEditor} icon="🗑️">
            清空
          </Button>
        </div>
      </div>
      <div className="editor-container">
        <CodeMirrorEditor
          value={input}
          onChange={setInput}
          language="json"
          theme={theme}
          className="editor"
        />
      </div>
      <ToastContainer messages={messages} onRemove={removeToast} />
    </div>
  );
};

export default JsonFormatter;