import React, { useMemo, useState } from 'react';
import './MarkdownRenderer.css';
import MarkdownEditor from './MarkdownEditor';
import { CodeMirrorEditor } from '@eiinu/tools';
import MarkdownIt from 'markdown-it';

interface MarkdownRendererProps {
  theme?: 'light' | 'dark' | 'auto';
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ theme = 'auto' }) => {
  const [input, setInput] = useState<string>(`# Markdown 渲染器\n\n- 支持 **Markdown** 编辑\n- 右侧可切换预览 HTML 或 Tokens JSON`);
  const [mode, setMode] = useState<'html' | 'tokens'>('html');

  const md = useMemo(() => new MarkdownIt({ html: true, linkify: true, typographer: true }), []);

  const renderedHtml = useMemo(() => md.render(input), [md, input]);
  const tokensJson = useMemo(() => {
    try {
      const tokens = md.parse(input, {});
      return JSON.stringify(tokens, null, 2);
    } catch (e) {
      return '[]';
    }
  }, [md, input]);

  return (
    <div className="markdown-renderer">
      <div className="markdown-header">
        <h2>Markdown 编辑器</h2>
        <div className="markdown-actions">
          <button className={`tab-btn ${mode === 'html' ? 'active' : ''}`} onClick={() => setMode('html')}>预览 HTML</button>
          <button className={`tab-btn ${mode === 'tokens' ? 'active' : ''}`} onClick={() => setMode('tokens')}>查看 Tokens</button>
        </div>
      </div>

      <div className="markdown-split">
        <div className="markdown-pane left">
          <MarkdownEditor value={input} onChange={setInput} className="editor" theme={theme} />
        </div>
        <div className="markdown-pane right">
          {mode === 'html' ? (
            <div className="preview" dangerouslySetInnerHTML={{ __html: renderedHtml }} />
          ) : (
            <CodeMirrorEditor value={tokensJson} language="json" readOnly className="editor" />
          )}
        </div>
      </div>
    </div>
  );
};

export default MarkdownRenderer;