import React, { useState, useRef, useEffect } from 'react';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { json } from '@codemirror/lang-json';
import { foldGutter } from '@codemirror/language';
import { lineNumbers } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { keymap } from '@codemirror/view';
import './JsonFormatter.css';
import { useToast } from './Toast';
import { Button } from './Button';

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

  // 初始化 CodeMirror 编辑器
  useEffect(() => {
    if (!editorRef.current) return;

    const extensions = [
      lineNumbers(),
      foldGutter(),
      history(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      json(),
      EditorState.transactionFilter.of((tr) => {
        if (tr.docChanged) {
          const newContent = tr.newDoc.toString();
          setInput(newContent);
        }
        return tr;
      }),
      // 使用默认主题，通过 CSS 自定义样式
      EditorView.theme({
        '&': {
          fontSize: '14px',
        },
        '.cm-content': {
          padding: '10px',
        },
        '.cm-focused .cm-cursor': {
          borderLeftColor: isDarkMode ? '#528bff' : '#0969da',
        },
        '.cm-focused .cm-selectionBackground, ::selection': {
          backgroundColor: isDarkMode ? '#3392FF44' : '#0969da44',
        },
        '.cm-editor': {
          backgroundColor: isDarkMode ? '#0d1117' : '#ffffff',
          color: isDarkMode ? '#e6edf3' : '#24292f',
        },
        '.cm-gutters': {
          backgroundColor: isDarkMode ? '#161b22' : '#f6f8fa',
          color: isDarkMode ? '#7d8590' : '#656d76',
          border: 'none',
        },
        '.cm-activeLineGutter': {
          backgroundColor: isDarkMode ? '#21262d' : '#f6f8fa',
        },
        '.cm-activeLine': {
          backgroundColor: isDarkMode ? '#21262d22' : '#f6f8fa',
        },
        '.cm-foldGutter .cm-gutterElement': {
          color: isDarkMode ? '#7d8590' : '#656d76',
        },
        '.cm-foldGutter .cm-gutterElement:hover': {
          backgroundColor: isDarkMode ? '#30363d' : '#f3f4f6',
        },
      }, { dark: isDarkMode }),
    ];

    const state = EditorState.create({
      doc: input,
      extensions,
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

  // 更新编辑器内容
  useEffect(() => {
    if (viewRef.current && viewRef.current.state.doc.toString() !== input) {
      const transaction = viewRef.current.state.update({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: input,
        },
      });
      viewRef.current.dispatch(transaction);
    }
  }, [input]);

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
        <div ref={editorRef} className="editor" />
      </div>
      <ToastContainer />
    </div>
  );
};

export default JsonFormatter;