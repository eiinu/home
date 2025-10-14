import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';

export interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
  style?: React.CSSProperties;
}

export interface MarkdownEditorRef {
  focus: () => void;
}

const MarkdownEditor = forwardRef<MarkdownEditorRef, MarkdownEditorProps>(({ value, onChange, theme = 'auto', className = '', style = {} }, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const isDarkMode = useRef(false);

  const getCurrentTheme = (): boolean => {
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme) return currentTheme === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  useImperativeHandle(ref, () => ({
    focus: () => viewRef.current?.focus()
  }));

  useEffect(() => {
    if (!editorRef.current) return;
    isDarkMode.current = getCurrentTheme();

    const extensions = [
      lineNumbers(),
      history(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      markdown(),
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
        '.cm-focused': { outline: 'none' },
        '.cm-editor': {
          borderRadius: '8px',
          border: isDarkMode.current ? '1px solid #374151' : '1px solid #d1d5db',
          backgroundColor: isDarkMode.current ? '#1f2937' : '#ffffff',
        },
        '.cm-line': { color: isDarkMode.current ? '#e5e7eb' : '#374151' },
        '.cm-gutters': {
          backgroundColor: isDarkMode.current ? '#111827' : '#f9fafb',
          color: isDarkMode.current ? '#9ca3af' : '#6b7280',
          border: 'none',
        },
        '.cm-activeLineGutter': { backgroundColor: isDarkMode.current ? '#374151' : '#e5e7eb' },
        '.cm-activeLine': { backgroundColor: isDarkMode.current ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.3)' },
        '.cm-cursor': { borderLeftColor: isDarkMode.current ? '#528bff' : '#0969da' },
        '.cm-selectionBackground, ::selection': { backgroundColor: isDarkMode.current ? '#3392FF44' : '#0969da44' },
      }, { dark: isDarkMode.current })
    ];

    const state = EditorState.create({ doc: value, extensions });
    const view = new EditorView({ state, parent: editorRef.current });
    viewRef.current = view;
    return () => view.destroy();
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const currentDoc = view.state.doc.toString();
    if (value !== currentDoc) {
      view.dispatch({ changes: { from: 0, to: currentDoc.length, insert: value } });
    }
  }, [value]);

  useEffect(() => {
    const handleThemeChange = () => {
      const newDark = getCurrentTheme();
      if (newDark !== isDarkMode.current && viewRef.current && editorRef.current) {
        const currentValue = viewRef.current.state.doc.toString();
        viewRef.current.destroy();
        isDarkMode.current = newDark;
        const state = EditorState.create({ doc: currentValue });
        const view = new EditorView({ state, parent: editorRef.current });
        viewRef.current = view;
      }
    };
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleThemeChange);
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);
      observer.disconnect();
    };
  }, []);

  return <div ref={editorRef} className={className} style={style} />;
});

MarkdownEditor.displayName = 'MarkdownEditor';
export default MarkdownEditor;