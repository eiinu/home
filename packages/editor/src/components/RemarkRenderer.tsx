import React, { useMemo, useState } from 'react';
import './MarkdownRenderer.css';
import MarkdownEditor from './MarkdownEditor';
import { CodeMirrorEditor } from '@eiinu/tools';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

interface RemarkRendererProps {
  theme?: 'light' | 'dark' | 'auto';
}

const RemarkRenderer: React.FC<RemarkRendererProps> = ({ theme = 'auto' }) => {
  const [input, setInput] = useState<string>(`# RemarkJS 编辑器\n\n- 使用 remark-parse 解析 AST\n- 可切换渲染 HTML 或查看 AST JSON`);
  const [mode, setMode] = useState<'html' | 'ast'>('html');

  // 统一处理器，使用 any 规避不同版本插件的类型不匹配
  const htmlProcessor = useMemo(() =>
    unified()
      .use(remarkParse as any)
      .use(remarkRehype as any)
      .use(rehypeStringify as any)
  , []);

  const renderedHtml = useMemo(() => {
    try {
      return htmlProcessor.processSync(input).toString();
    } catch {
      return '<p></p>';
    }
  }, [htmlProcessor, input]);

  const astJson = useMemo(() => {
    try {
      const tree = unified().use(remarkParse as any).parse(input);
      return JSON.stringify(tree, null, 2);
    } catch {
      return '{}';
    }
  }, [input]);

  return (
    <div className="markdown-renderer">
      <div className="markdown-header">
        <h2>RemarkJS</h2>
        <div className="markdown-actions">
          <button className={`tab-btn ${mode === 'html' ? 'active' : ''}`} onClick={() => setMode('html')}>预览 HTML</button>
          <button className={`tab-btn ${mode === 'ast' ? 'active' : ''}`} onClick={() => setMode('ast')}>查看 AST</button>
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
            <CodeMirrorEditor value={astJson} language="json" readOnly className="editor" />
          )}
        </div>
      </div>
    </div>
  );
};

export default RemarkRenderer;