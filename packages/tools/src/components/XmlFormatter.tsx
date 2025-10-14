import React, { useState, useEffect } from 'react';
import './XmlFormatter.css';
import useToast from './useToast';
import { ToastContainer } from './Toast';
import Button from './Button';
import CodeMirrorEditor from './CodeMirrorEditor';

interface XmlFormatterProps {
  theme?: 'light' | 'dark' | 'auto';
}

const XmlFormatter: React.FC<XmlFormatterProps> = ({ theme = 'auto' }) => {
  const [input, setInput] = useState('<?xml version="1.0" encoding="UTF-8"?>\n<note>\n  <to>Tove</to>\n  <from>Jani</from>\n  <heading>Reminder</heading>\n  <body>Don\'t forget me this weekend!</body>\n</note>');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme) return currentTheme === 'dark';
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

  // XML 格式化
  const formatXml = (xml: string): string => {
    try {
      const indentSize = 2;
      let indent = 0;
      let result = '';

      // 先规范标签间的空白（不影响文本节点内部的内容）
      let normalized = xml.replace(/\r?\n/g, '').replace(/>\s+</g, '><');

      // 令牌化：捕获各种标签、注释、CDATA 与处理指令
      const tokenRegex = /(<\/?[^>]+>|<\?[^>]+\?>|<!\[CDATA\[[\s\S]*?\]\]>|<!--[\s\S]*?-->|<![^>]+>)/;
      const tokens = normalized.split(tokenRegex).filter(Boolean);

      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        if (/^<\/.+?>$/.test(token)) {
          // 结束标签
          indent = Math.max(0, indent - indentSize);
          result += ' '.repeat(indent) + token + (i < tokens.length - 1 ? '\n' : '');
        } else if (/^<[^!?][^>]*[^\/]>$/.test(token)) {
          // 开始标签（非自闭合、非声明/注释）
          result += ' '.repeat(indent) + token + (i < tokens.length - 1 ? '\n' : '');
          indent += indentSize;
        } else if (/^<[^!?][^>]*\/>$/.test(token)) {
          // 自闭合标签
          result += ' '.repeat(indent) + token + (i < tokens.length - 1 ? '\n' : '');
        } else if (/^<\?[^>]+\?>$/.test(token) || /^<!DOCTYPE/i.test(token)) {
          // 处理指令或 DOCTYPE
          result += token + (i < tokens.length - 1 ? '\n' : '');
        } else if (/^<!--[\s\S]*?-->$/.test(token) || /^<!\[CDATA\[[\s\S]*?\]\]>$/.test(token)) {
          // 注释或 CDATA 作为独立块
          result += ' '.repeat(indent) + token + (i < tokens.length - 1 ? '\n' : '');
        } else if (token.trim()) {
          // 文本节点
          result += ' '.repeat(indent) + token.trim() + (i < tokens.length - 1 ? '\n' : '');
        }
      }

      return result;
    } catch {
      throw new Error('XML 格式化失败');
    }
  };

  // XML 压缩（仅移除标签间空白与换行，不破坏文本）
  const minifyXml = (xml: string): string => {
    return xml.replace(/\r?\n/g, '').replace(/>\s+</g, '><').trim();
  };

  const handleFormat = () => {
    try {
      const formatted = formatXml(input);
      setInput(formatted);
    } catch {
      showError('XML 格式化失败，请检查 XML 语法是否正确');
    }
  };

  const handleMinify = () => {
    try {
      const minified = minifyXml(input);
      setInput(minified);
    } catch {
      showError('XML 压缩失败');
    }
  };

  const handleClear = () => {
    setInput('');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(input);
    } catch {
      showError('复制失败，请手动选择文本复制');
    }
  };

  return (
    <div className={`xml-formatter ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="xml-formatter-header">
        <h2>XML 工具</h2>
        <div className="xml-formatter-actions">
          <Button variant="primary" onClick={handleFormat} icon="✨">格式化</Button>
          <Button variant="secondary" onClick={handleMinify} icon="🗜️">压缩</Button>
          <Button variant="danger" onClick={handleClear} icon="🗑️">清空</Button>
          <Button onClick={handleCopy} icon="📋">复制</Button>
        </div>
      </div>

      <div className="xml-formatter-info">
        <span>支持 CDATA、注释与处理指令</span>
        <span>保留文本节点内的空白</span>
      </div>

      <div className="xml-formatter-editor">
        <CodeMirrorEditor
          value={input}
          onChange={setInput}
          language="html" // 复用 HTML 高亮以适配 XML 标签
          theme={theme}
          className="editor"
        />
      </div>

      <ToastContainer messages={messages} onRemove={removeToast} />
    </div>
  );
};

export default XmlFormatter;