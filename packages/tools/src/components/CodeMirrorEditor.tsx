import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { EditorView, lineNumbers, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { json } from '@codemirror/lang-json';
import { html } from '@codemirror/lang-html';
import { foldGutter } from '@codemirror/language';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';

export type CodeMirrorLanguage = 'json' | 'html' | 'plain';

export interface CodeMirrorEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: CodeMirrorLanguage;
  theme?: 'light' | 'dark' | 'auto';
  placeholder?: string;
  readOnly?: boolean;
  lineNumbers?: boolean;
  foldGutter?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface CodeMirrorEditorRef {
  focus: () => void;
  blur: () => void;
  getSelection: () => string;
  insertText: (text: string) => void;
  replaceSelection: (text: string) => void;
  getView: () => EditorView | null;
}

const CodeMirrorEditor = forwardRef<CodeMirrorEditorRef, CodeMirrorEditorProps>(({
  value,
  onChange,
  language = 'plain',
  theme = 'auto',
  placeholder,
  readOnly = false,
  lineNumbers: showLineNumbers = true,
  foldGutter: showFoldGutter = true,
  className = '',
  style = {}
}, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const isDarkMode = useRef(false);

  // 获取当前主题
  const getCurrentTheme = (): boolean => {
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    
    // 优先从 DOM 获取当前主题状态
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme) return currentTheme === 'dark';
    
    // 回退到系统主题
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  // 获取语言扩展
  const getLanguageExtension = (lang: CodeMirrorLanguage) => {
    switch (lang) {
      case 'json':
        return json();
      case 'html':
        return html();
      case 'plain':
      default:
        return [];
    }
  };

  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    focus: () => {
      viewRef.current?.focus();
    },
    blur: () => {
      viewRef.current?.contentDOM.blur();
    },
    getSelection: () => {
      const view = viewRef.current;
      if (!view) return '';
      const { from, to } = view.state.selection.main;
      return view.state.doc.sliceString(from, to);
    },
    insertText: (text: string) => {
      const view = viewRef.current;
      if (!view) return;
      const { from } = view.state.selection.main;
      view.dispatch({
        changes: { from, insert: text },
        selection: { anchor: from + text.length }
      });
    },
    replaceSelection: (text: string) => {
      const view = viewRef.current;
      if (!view) return;
      const { from, to } = view.state.selection.main;
      view.dispatch({
        changes: { from, to, insert: text },
        selection: { anchor: from + text.length }
      });
    },
    getView: () => viewRef.current
  }));

  // 初始化和更新编辑器
  useEffect(() => {
    if (!editorRef.current) return;

    // 更新主题状态
    isDarkMode.current = getCurrentTheme();

    const extensions = [
      ...(showLineNumbers ? [lineNumbers()] : []),
      ...(showFoldGutter ? [foldGutter()] : []),
      history(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      getLanguageExtension(language),
      EditorView.updateListener.of((update) => {
        if (update.docChanged && onChange) {
          onChange(update.state.doc.toString());
        }
      }),
      EditorView.theme({
        '&': {
          fontSize: '14px',
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", "SF Mono", Consolas, "Liberation Mono", "Courier New", monospace',
        },
        '.cm-content': {
          padding: '16px',
          minHeight: '200px',
        },
        '.cm-focused': {
          outline: 'none',
        },
        '.cm-editor': {
          borderRadius: '8px',
          border: isDarkMode.current ? '1px solid #374151' : '1px solid #d1d5db',
          backgroundColor: isDarkMode.current ? '#1f2937' : '#ffffff',
        },
        '.cm-scroller': {
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", "SF Mono", Consolas, "Liberation Mono", "Courier New", monospace',
        },
        '.cm-line': {
          color: isDarkMode.current ? '#e5e7eb' : '#374151',
        },
        '.cm-gutters': {
          backgroundColor: isDarkMode.current ? '#111827' : '#f9fafb',
          color: isDarkMode.current ? '#9ca3af' : '#6b7280',
          border: 'none',
        },
        '.cm-activeLineGutter': {
          backgroundColor: isDarkMode.current ? '#374151' : '#e5e7eb',
        },
        '.cm-activeLine': {
          backgroundColor: isDarkMode.current ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.3)',
        },
        '.cm-cursor': {
          borderLeftColor: isDarkMode.current ? '#528bff' : '#0969da',
        },
        '.cm-selectionBackground, ::selection': {
          backgroundColor: isDarkMode.current ? '#3392FF44' : '#0969da44',
        },
        '.cm-foldGutter .cm-gutterElement': {
          color: isDarkMode.current ? '#7d8590' : '#656d76',
        },
        '.cm-foldGutter .cm-gutterElement:hover': {
          backgroundColor: isDarkMode.current ? '#30363d' : '#f3f4f6',
        },
        '.cm-placeholder': {
          color: isDarkMode.current ? '#6b7280' : '#9ca3af',
        },
      }, { dark: isDarkMode.current }),
      ...(readOnly ? [EditorView.editable.of(false)] : []),
    ];

    const state = EditorState.create({
      doc: value,
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
  }, [value, language, theme, readOnly, showLineNumbers, showFoldGutter, placeholder]);

  // 监听主题变化
  useEffect(() => {
    const updateTheme = () => {
      const newIsDarkMode = getCurrentTheme();
      if (newIsDarkMode !== isDarkMode.current) {
        isDarkMode.current = newIsDarkMode;
        // 重新创建编辑器以应用新主题
        if (viewRef.current && editorRef.current) {
          const currentValue = viewRef.current.state.doc.toString();
          viewRef.current.destroy();
          
          const extensions = [
            ...(showLineNumbers ? [lineNumbers()] : []),
            ...(showFoldGutter ? [foldGutter()] : []),
            history(),
            keymap.of([...defaultKeymap, ...historyKeymap]),
            getLanguageExtension(language),
            EditorView.updateListener.of((update) => {
              if (update.docChanged && onChange) {
                onChange(update.state.doc.toString());
              }
            }),
            EditorView.theme({
              '&': {
                fontSize: '14px',
                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", "SF Mono", Consolas, "Liberation Mono", "Courier New", monospace',
              },
              '.cm-content': {
                padding: '16px',
                minHeight: '200px',
              },
              '.cm-focused': {
                outline: 'none',
              },
              '.cm-editor': {
                borderRadius: '8px',
                border: isDarkMode.current ? '1px solid #374151' : '1px solid #d1d5db',
                backgroundColor: isDarkMode.current ? '#1f2937' : '#ffffff',
              },
              '.cm-scroller': {
                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", "SF Mono", Consolas, "Liberation Mono", "Courier New", monospace',
              },
              '.cm-line': {
                color: isDarkMode.current ? '#e5e7eb' : '#374151',
              },
              '.cm-gutters': {
                backgroundColor: isDarkMode.current ? '#111827' : '#f9fafb',
                color: isDarkMode.current ? '#9ca3af' : '#6b7280',
                border: 'none',
              },
              '.cm-activeLineGutter': {
                backgroundColor: isDarkMode.current ? '#374151' : '#e5e7eb',
              },
              '.cm-activeLine': {
                backgroundColor: isDarkMode.current ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.3)',
              },
              '.cm-cursor': {
                borderLeftColor: isDarkMode.current ? '#528bff' : '#0969da',
              },
              '.cm-selectionBackground, ::selection': {
                backgroundColor: isDarkMode.current ? '#3392FF44' : '#0969da44',
              },
              '.cm-foldGutter .cm-gutterElement': {
                color: isDarkMode.current ? '#7d8590' : '#656d76',
              },
              '.cm-foldGutter .cm-gutterElement:hover': {
                backgroundColor: isDarkMode.current ? '#30363d' : '#f3f4f6',
              },
              '.cm-placeholder': {
                color: isDarkMode.current ? '#6b7280' : '#9ca3af',
              },
            }, { dark: isDarkMode.current }),
            ...(readOnly ? [EditorView.editable.of(false)] : []),
          ];

          const state = EditorState.create({
            doc: currentValue,
            extensions,
          });

          const view = new EditorView({
            state,
            parent: editorRef.current,
          });

          viewRef.current = view;
        }
      }
    };

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => updateTheme();
    if (theme === 'auto') {
      mediaQuery.addEventListener('change', handleChange);
    }

    // 监听 DOM 主题变化
    const observer = new MutationObserver(() => updateTheme());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => {
      if (theme === 'auto') {
        mediaQuery.removeEventListener('change', handleChange);
      }
      observer.disconnect();
    };
  }, [theme, language, onChange, readOnly, showLineNumbers, showFoldGutter, placeholder]);

  return (
    <div 
      ref={editorRef} 
      className={`codemirror-editor ${className}`}
      style={style}
    />
  );
});

CodeMirrorEditor.displayName = 'CodeMirrorEditor';

export default CodeMirrorEditor;