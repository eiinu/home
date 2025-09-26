import React, { useState, useRef, useEffect } from 'react';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { html } from '@codemirror/lang-html';
import { foldGutter } from '@codemirror/language';
import { lineNumbers } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { keymap } from '@codemirror/view';
import './HtmlFormatter.css';
import { useToast } from './Toast';
import { Button } from './Button';

interface HtmlFormatterProps {
  theme?: 'light' | 'dark' | 'auto';
}

const HtmlFormatter: React.FC<HtmlFormatterProps> = ({ theme = 'auto' }) => {
  const [input, setInput] = useState('<!DOCTYPE html>\n<html>\n<head>\n<title>HTML Formatter</title>\n</head>\n<body>\n<h1>Hello World</h1>\n<p>This is a sample HTML document.</p>\n</body>\n</html>');
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
  const { showError, ToastContainer } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

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

    // 初始化主题
    updateTheme();

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => updateTheme();
    mediaQuery.addEventListener('change', handleChange);

    // 监听 DOM 主题变化
    const observer = new MutationObserver(() => updateTheme());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      observer.disconnect();
    };
  }, [theme]);

  // 初始化编辑器
  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: input,
      extensions: [
        lineNumbers(),
        foldGutter(),
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        html(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            setInput(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          '&': {
            fontSize: '14px',
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
          },
          '.cm-content': {
            padding: '16px',
          },
          '.cm-focused': {
            outline: 'none',
          },
          '.cm-editor': {
            borderRadius: '8px',
            border: isDarkMode ? '1px solid #374151' : '1px solid #d1d5db',
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
          },
          '.cm-scroller': {
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
          },
          '.cm-line': {
            color: isDarkMode ? '#e5e7eb' : '#374151',
          },
          '.cm-gutters': {
            backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
            color: isDarkMode ? '#9ca3af' : '#6b7280',
            border: 'none',
          },
          '.cm-activeLineGutter': {
            backgroundColor: isDarkMode ? '#374151' : '#e5e7eb',
          },
          '.cm-activeLine': {
            backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.3)',
          },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [isDarkMode]);

  // HTML格式化函数
  const formatHtml = (html: string): string => {
    try {
      let formatted = html;
      let indent = 0;
      const indentSize = 2;
      
      // 移除多余的空白字符
      formatted = formatted.replace(/>\s+</g, '><');
      
      // 分割标签
      const tokens = formatted.split(/(<[^>]*>)/);
      let result = '';
      
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        
        if (token.match(/^<\/\w/)) {
          // 结束标签
          indent -= indentSize;
          result += ' '.repeat(Math.max(0, indent)) + token;
          if (i < tokens.length - 1) result += '\n';
        } else if (token.match(/^<\w[^>]*[^\/]>$/)) {
          // 开始标签
          result += ' '.repeat(indent) + token;
          if (i < tokens.length - 1) result += '\n';
          indent += indentSize;
        } else if (token.match(/^<\w[^>]*\/>$/)) {
          // 自闭合标签
          result += ' '.repeat(indent) + token;
          if (i < tokens.length - 1) result += '\n';
        } else if (token.match(/^<!DOCTYPE/i) || token.match(/^<\?xml/)) {
          // DOCTYPE 或 XML 声明
          result += token;
          if (i < tokens.length - 1) result += '\n';
        } else if (token.trim()) {
          // 文本内容
          result += ' '.repeat(indent) + token.trim();
          if (i < tokens.length - 1) result += '\n';
        }
      }
      
      return result;
    } catch (error) {
      throw new Error('HTML格式化失败');
    }
  };

  // HTML转义函数
  const escapeHtml = (html: string): string => {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  };

  // HTML反转义函数
  const unescapeHtml = (html: string): string => {
    // 创建一个映射表来处理常见的HTML实体
    const htmlEntities: { [key: string]: string } = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&apos;': "'",
      '&#39;': "'",
      '&nbsp;': ' ',
      '&copy;': '©',
      '&reg;': '®',
      '&trade;': '™',
      '&hellip;': '…',
      '&mdash;': '—',
      '&ndash;': '–',
      '&lsquo;': `'`,
      '&rsquo;': `'`,
      '&ldquo;': '"',
      '&rdquo;': '"',
      '&bull;': '•',
      '&middot;': '·',
      '&sect;': '§',
      '&para;': '¶',
      '&dagger;': '†',
      '&Dagger;': '‡',
      '&permil;': '‰',
      '&lsaquo;': '‹',
      '&rsaquo;': '›',
      '&euro;': '€',
      '&pound;': '£',
      '&yen;': '¥',
      '&cent;': '¢'
    };

    let result = html;
    
    // 处理命名实体
    for (const [entity, char] of Object.entries(htmlEntities)) {
      result = result.replace(new RegExp(entity, 'g'), char);
    }
    
    // 处理数字实体 (&#数字;)
    result = result.replace(/&#(\d+);/g, (match, num) => {
      const code = parseInt(num, 10);
      if (code >= 0 && code <= 1114111) { // Unicode范围检查
        return String.fromCharCode(code);
      }
      return match; // 如果不是有效的Unicode码点，保持原样
    });
    
    // 处理十六进制实体 (&#x十六进制;)
    result = result.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
      const code = parseInt(hex, 16);
      if (code >= 0 && code <= 1114111) { // Unicode范围检查
        return String.fromCharCode(code);
      }
      return match; // 如果不是有效的Unicode码点，保持原样
    });
    
    return result;
  };

  // 压缩HTML
  const minifyHtml = (html: string): string => {
    return html
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .replace(/^\s+|\s+$/g, '');
  };

  const handleFormat = () => {
    try {
      const formatted = formatHtml(input);
      updateEditor(formatted);
    } catch (error) {
      showError('HTML格式化失败，请检查HTML语法是否正确');
    }
  };

  const handleMinify = () => {
    try {
      const minified = minifyHtml(input);
      updateEditor(minified);
    } catch (error) {
      showError('HTML压缩失败');
    }
  };

  const handleEscape = () => {
    try {
      const escaped = escapeHtml(input);
      updateEditor(escaped);
    } catch (error) {
      showError('HTML转义失败');
    }
  };

  const handleUnescape = () => {
    try {
      const unescaped = unescapeHtml(input);
      updateEditor(unescaped);
    } catch (error) {
      showError('HTML反转义失败');
    }
  };

  const updateEditor = (newContent: string) => {
    if (viewRef.current) {
      const transaction = viewRef.current.state.update({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: newContent,
        },
      });
      viewRef.current.dispatch(transaction);
    }
    setInput(newContent);
  };

  const handleClear = () => {
    updateEditor('');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(input);
    } catch (error) {
      showError('复制失败，请手动选择文本复制');
    }
  };

  return (
    <div className={`html-formatter ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="html-formatter-header">
        <h2>HTML 工具</h2>
        <div className="html-formatter-actions">
          <Button onClick={handleFormat} variant="primary" size="small">
            格式化
          </Button>
          <Button onClick={handleMinify} variant="secondary" size="small">
            压缩
          </Button>
          <Button onClick={handleEscape} variant="secondary" size="small">
            转义
          </Button>
          <Button onClick={handleUnescape} variant="secondary" size="small">
            反转义
          </Button>
          <Button onClick={handleCopy} variant="secondary" size="small">
            复制
          </Button>
          <Button onClick={handleClear} variant="secondary" size="small">
            清空
          </Button>
        </div>
      </div>
      
      <div className="html-formatter-editor">
        <div ref={editorRef} />
      </div>
      
      <div className="html-formatter-info">
        <span>字符数: {input.length}</span>
        <span>行数: {input.split('\n').length}</span>
      </div>
      
      <ToastContainer />
    </div>
  );
};

export default HtmlFormatter;