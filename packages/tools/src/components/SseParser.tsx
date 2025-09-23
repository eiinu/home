import React, { useState, useCallback } from 'react';
import './SseParser.css';
import { Button } from './Button';

interface SseParserProps {
  className?: string;
}

interface ParsedEvent {
  id?: string;
  event?: string;
  data: any;
  raw: string;
}

export const SseParser: React.FC<SseParserProps> = ({ className = '' }) => {
  const [input, setInput] = useState('');
  const [path, setPath] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  // 解析 SSE 数据
  const parseSSE = useCallback((sseData: string): ParsedEvent[] => {
    const events: ParsedEvent[] = [];
    const lines = sseData.split('\n');
    let currentEvent: Partial<ParsedEvent> = {};
    let dataLines: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine === '') {
        // 空行表示事件结束
        if (dataLines.length > 0 || currentEvent.id || currentEvent.event) {
          const dataString = dataLines.join('\n');
          let parsedData: any = dataString;
          
          // 尝试解析 JSON
          try {
            parsedData = JSON.parse(dataString);
          } catch {
            // 如果不是 JSON，保持原始字符串
          }

          events.push({
            ...currentEvent,
            data: parsedData,
            raw: dataString
          } as ParsedEvent);
        }
        
        currentEvent = {};
        dataLines = [];
        continue;
      }

      if (trimmedLine.startsWith('id:')) {
        currentEvent.id = trimmedLine.substring(3).trim();
      } else if (trimmedLine.startsWith('event:')) {
        currentEvent.event = trimmedLine.substring(6).trim();
      } else if (trimmedLine.startsWith('data:')) {
        dataLines.push(trimmedLine.substring(5).trim());
      } else if (!trimmedLine.startsWith(':')) {
        // 处理没有冒号的 data 行
        dataLines.push(trimmedLine);
      }
    }

    // 处理最后一个事件（如果没有以空行结尾）
    if (dataLines.length > 0 || currentEvent.id || currentEvent.event) {
      const dataString = dataLines.join('\n');
      let parsedData: any = dataString;
      
      try {
        parsedData = JSON.parse(dataString);
      } catch {
        // 保持原始字符串
      }

      events.push({
        ...currentEvent,
        data: parsedData,
        raw: dataString
      } as ParsedEvent);
    }

    return events;
  }, []);

  // 根据路径提取值
  const extractValueByPath = useCallback((obj: any, path: string): any => {
    if (!path || !obj) return obj;
    
    // 支持数组路径语法，如 data[0].name 或 items[1].value
    const pathParts = path.split('.').filter(part => part.trim() !== '');
    let current = obj;
    
    for (const part of pathParts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      
      // 检查是否包含数组索引语法 [index]
      const arrayMatch = part.match(/^(.+?)\[(\d+)\]$/);
      
      if (arrayMatch) {
        // 处理 key[index] 格式
        const [, key, indexStr] = arrayMatch;
        const index = parseInt(indexStr, 10);
        
        if (key) {
          // 先访问对象属性
          if (typeof current === 'object' && key in current) {
            current = current[key];
          } else {
            return undefined;
          }
        }
        
        // 然后访问数组索引
        if (Array.isArray(current) && index >= 0 && index < current.length) {
          current = current[index];
        } else {
          return undefined;
        }
      } else if (/^\d+$/.test(part)) {
        // 处理纯数字索引（用于直接访问数组）
        if (Array.isArray(current)) {
          const index = parseInt(part, 10);
          if (index >= 0 && index < current.length) {
            current = current[index];
          } else {
            return undefined;
          }
        } else {
          return undefined;
        }
      } else {
        // 处理普通对象属性
        if (typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          return undefined;
        }
      }
    }
    
    return current;
  }, []);

  // 处理解析
  const handleParse = useCallback(() => {
    try {
      setError('');
      
      if (!input.trim()) {
        setResult('');
        return;
      }

      const events = parseSSE(input);
      
      if (events.length === 0) {
        setResult('未找到有效的 SSE 事件');
        return;
      }

      if (!path.trim()) {
        // 如果没有路径，显示所有解析的事件
        setResult(JSON.stringify(events, null, 2));
        return;
      }

      // 提取指定路径的值并拼接
      const extractedValues: any[] = [];
      
      for (const event of events) {
        const value = extractValueByPath(event.data, path.trim());
        if (value !== undefined) {
          extractedValues.push(value);
        }
      }

      if (extractedValues.length === 0) {
        setResult(`路径 "${path}" 未找到任何值`);
        return;
      }

      // 如果所有值都是字符串，直接拼接
      if (extractedValues.every(v => typeof v === 'string')) {
        setResult(extractedValues.join(''));
      } else {
        // 否则以 JSON 数组形式显示
        setResult(JSON.stringify(extractedValues, null, 2));
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : '解析失败');
    }
  }, [input, path, parseSSE, extractValueByPath]);

  // 移除自动解析，改为手动触发
  // useMemo(() => {
  //   handleParse();
  // }, [handleParse]);

  const handleClear = useCallback(() => {
    setInput('');
    setPath('');
    setResult('');
    setError('');
  }, []);

  const handleCopyResult = useCallback(async () => {
    if (result) {
      try {
        await navigator.clipboard.writeText(result);
      } catch (err) {
        console.error('复制失败:', err);
      }
    }
  }, [result]);

  return (
    <div className={`sse-parser ${className}`}>
      <div className="sse-parser-toolbar">
        <div className="toolbar-left">
          <h3>SSE 事件流解析器</h3>
        </div>
        <div className="toolbar-right">
          <Button 
            variant="primary"
            size="small"
            onClick={handleParse}
            disabled={!input.trim()}
            title="解析 SSE 数据"
          >
            解析
          </Button>
          <Button 
            variant="default"
            size="small"
            onClick={handleClear}
            title="清空所有内容"
          >
            清空
          </Button>
          <Button 
            variant="default"
            size="small"
            onClick={handleCopyResult}
            disabled={!result}
            title="复制结果"
          >
            复制结果
          </Button>
        </div>
      </div>

      <div className="sse-parser-content">
        <div className="input-section">
          <div className="input-group">
            <label htmlFor="sse-input">SSE 数据:</label>
            <textarea
              id="sse-input"
              className="sse-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="粘贴 SSE 事件流数据...&#10;&#10;例如:&#10;data: {&quot;content&quot;: &quot;Hello&quot;}&#10;&#10;data: {&quot;content&quot;: &quot; World&quot;}&#10;&#10;data: {&quot;content&quot;: &quot;!&quot;}"
              rows={8}
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="path-input">提取路径:</label>
            <input
              id="path-input"
              type="text"
              className="path-input"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="例如: content 或 data.message.text 或 items[0].name"
            />
            <div className="path-help">
              输入对象路径来提取特定字段的值，支持数组索引语法（如 data[0].name），多个事件中的值会自动拼接
            </div>
          </div>
        </div>

        <div className="result-section">
          <div className="result-header">
            <label>解析结果:</label>
            {result && (
              <span className="result-info">
                {input ? `解析了 ${parseSSE(input).length} 个事件` : ''}
              </span>
            )}
          </div>
          
          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}
          
          <textarea
            className="result-output"
            value={result}
            readOnly
            rows={10}
            placeholder="解析结果将显示在这里..."
          />
        </div>
      </div>
    </div>
  );
};

export default SseParser;