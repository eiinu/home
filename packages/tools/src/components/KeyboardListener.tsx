import React, { useState, useEffect, useCallback } from 'react';
import './KeyboardListener.css';
import { Button } from './Button';

interface KeyboardListenerProps {
  className?: string;
}

interface KeyEventData {
  key: string;
  keyCode: number;
  code: string;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  repeat: boolean;
  timestamp: number;
  type: 'keydown' | 'keyup';
}

interface CrossPlatformMapping {
  macOS: {
    key: string;
    modifier: string;
    description: string;
  };
  windows: {
    key: string;
    modifier: string;
    description: string;
  };
}

export const KeyboardListener: React.FC<KeyboardListenerProps> = ({ className = '' }) => {
  const [isListening, setIsListening] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<KeyEventData | null>(null);
  const [eventHistory, setEventHistory] = useState<KeyEventData[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // 判断是否需要阻止默认行为（浏览器/系统快捷键）
  const shouldPreventDefault = useCallback((event: KeyboardEvent) => {
    const { key, metaKey, ctrlKey, altKey, shiftKey } = event;

    // 功能键一般用于系统/浏览器操作
    const functionKeys = new Set([
      'F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12'
    ]);

    // 常见的浏览器/系统快捷键（Mac ⌘ / Win Ctrl）
    const commonShortcuts = new Set([
      'a','c','v','x','z','y','s','p','f','r','n','o','t','w','q','h','l'
    ]);

    // 阻止 Tab 和 Escape 导致的焦点跳转或退出
    const blockedSingleKeys = new Set(['Tab', 'Escape']);

    // 如果是功能键，直接阻止
    if (functionKeys.has(key)) return true;

    // 修饰键组合（含 Cmd/Ctrl/Alt/Shift）时阻止，避免触发系统/浏览器快捷键
    if (metaKey || ctrlKey || altKey || shiftKey) {
      // 针对字符键：只要与修饰键组合即阻止
      if (key.length === 1 && commonShortcuts.has(key.toLowerCase())) return true;
      // 针对组合键：如 Shift+Tab、Ctrl+Enter 等
      return true;
    }

    // 单独的 Tab/Escape 也阻止
    if (blockedSingleKeys.has(key)) return true;

    return false;
  }, []);

  // 获取跨平台按键映射
  const getCrossPlatformMapping = useCallback((event: KeyEventData): CrossPlatformMapping | null => {
    const { key, metaKey, ctrlKey, altKey, shiftKey } = event;
    
    // 修饰键映射
    const getModifierString = (isMac: boolean) => {
      const modifiers = [];
      if (isMac) {
        if (metaKey) modifiers.push('⌘');
        if (altKey) modifiers.push('⌥');
        if (ctrlKey) modifiers.push('⌃');
        if (shiftKey) modifiers.push('⇧');
      } else {
        if (ctrlKey) modifiers.push('Ctrl');
        if (altKey) modifiers.push('Alt');
        if (metaKey) modifiers.push('Win');
        if (shiftKey) modifiers.push('Shift');
      }
      return modifiers.join(' + ');
    };

    // 特殊按键映射
    const keyMappings: Record<string, { mac: string; win: string; desc: string }> = {
      'Meta': { mac: '⌘ Command', win: '⊞ Windows', desc: '系统修饰键' },
      'Alt': { mac: '⌥ Option', win: 'Alt', desc: '选项键' },
      'Control': { mac: '⌃ Control', win: 'Ctrl', desc: '控制键' },
      'Shift': { mac: '⇧ Shift', win: 'Shift', desc: '上档键' },
      'Backspace': { mac: '⌫ Delete', win: 'Backspace', desc: '退格键' },
      'Delete': { mac: '⌦ Forward Delete', win: 'Delete', desc: '删除键' },
      'Enter': { mac: '↩ Return', win: 'Enter', desc: '回车键' },
      'Escape': { mac: '⎋ Escape', win: 'Esc', desc: '退出键' },
      'Tab': { mac: '⇥ Tab', win: 'Tab', desc: '制表键' },
      'CapsLock': { mac: '⇪ Caps Lock', win: 'Caps Lock', desc: '大写锁定' },
      'ArrowUp': { mac: '↑', win: '↑', desc: '上箭头' },
      'ArrowDown': { mac: '↓', win: '↓', desc: '下箭头' },
      'ArrowLeft': { mac: '←', win: '←', desc: '左箭头' },
      'ArrowRight': { mac: '→', win: '→', desc: '右箭头' },
      ' ': { mac: '␣ Space', win: 'Space', desc: '空格键' }
    };

    const mapping = keyMappings[key];
    const macModifier = getModifierString(true);
    const winModifier = getModifierString(false);

    return {
      macOS: {
        key: mapping ? mapping.mac : key,
        modifier: macModifier,
        description: mapping ? mapping.desc : `字符键: ${key}`
      },
      windows: {
        key: mapping ? mapping.win : key,
        modifier: winModifier,
        description: mapping ? mapping.desc : `字符键: ${key}`
      }
    };
  }, []);

  // 键盘事件处理
  const handleKeyEvent = useCallback((event: KeyboardEvent, type: 'keydown' | 'keyup') => {
    if (!isListening) return;

    // 阻止默认行为，避免触发浏览器或系统快捷键
    if (shouldPreventDefault(event)) {
      event.preventDefault();
      event.stopPropagation();
    }

    const eventData: KeyEventData = {
      key: event.key,
      keyCode: event.keyCode,
      code: event.code,
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      shiftKey: event.shiftKey,
      repeat: event.repeat,
      timestamp: Date.now(),
      type
    };

    setCurrentEvent(eventData);
    
    // 只在 keydown 时添加到历史记录，避免重复
    if (type === 'keydown' && !event.repeat) {
      setEventHistory(prev => [eventData, ...prev.slice(0, 49)]); // 保留最近50个事件
    }
  }, [isListening, shouldPreventDefault]);

  // 监听键盘事件
  useEffect(() => {
    if (!isListening) return;

    const handleKeyDown = (event: KeyboardEvent) => handleKeyEvent(event, 'keydown');
    const handleKeyUp = (event: KeyboardEvent) => handleKeyEvent(event, 'keyup');

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [isListening, handleKeyEvent]);

  const toggleListening = useCallback(() => {
    setIsListening(prev => !prev);
    if (isListening) {
      setCurrentEvent(null);
    }
  }, [isListening]);

  const clearHistory = useCallback(() => {
    setEventHistory([]);
    setCurrentEvent(null);
  }, []);

  const formatTimestamp = useCallback((timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  }, []);

  const crossPlatformData = currentEvent ? getCrossPlatformMapping(currentEvent) : null;

  return (
    <div className={`keyboard-listener ${className}`}>
      <div className="keyboard-listener-toolbar">
        <div className="toolbar-left">
          <h3>键盘事件监听器</h3>
        </div>
        <div className="toolbar-right">
          <Button 
            variant={isListening ? 'warning' : 'primary'}
            size="small"
            active={isListening}
            onClick={toggleListening}
            title={isListening ? '停止监听' : '开始监听'}
          >
            {isListening ? '停止监听' : '开始监听'}
          </Button>
          <Button 
            variant="default"
            size="small"
            onClick={() => setShowHistory(!showHistory)}
            title="切换历史记录显示"
          >
            {showHistory ? '隐藏历史' : '显示历史'}
          </Button>
          <Button 
            variant="default"
            size="small"
            onClick={clearHistory}
            title="清空历史记录"
          >
            清空
          </Button>
        </div>
      </div>

      <div className="keyboard-listener-content">
        {!isListening && (
          <div className="listening-prompt">
            <div className="prompt-icon">⌨️</div>
            <h4>点击"开始监听"按钮开始捕获键盘事件</h4>
            <p>监听开始后，按下任意按键查看详细的事件信息</p>
          </div>
        )}

        {isListening && !currentEvent && (
          <div className="listening-active">
            <div className="pulse-indicator"></div>
            <h4>正在监听键盘事件...</h4>
            <p>按下任意按键查看事件详情</p>
          </div>
        )}

        {currentEvent && (
          <div className="event-display">
            <div className="event-header">
              <h4>当前按键事件</h4>
              <span className={`event-type ${currentEvent.type}`}>
                {currentEvent.type === 'keydown' ? '按下' : '释放'}
              </span>
            </div>

            <div className="event-details">
              <div className="detail-section">
                <h5>基本信息</h5>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>按键 (key):</label>
                    <span className="key-value">{currentEvent.key}</span>
                  </div>
                  <div className="detail-item">
                    <label>键码 (keyCode):</label>
                    <span className="code-value">{currentEvent.keyCode}</span>
                  </div>
                  <div className="detail-item">
                    <label>物理键 (code):</label>
                    <span className="code-value">{currentEvent.code}</span>
                  </div>
                  <div className="detail-item">
                    <label>重复按键:</label>
                    <span className={`boolean-value ${currentEvent.repeat}`}>
                      {currentEvent.repeat ? '是' : '否'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h5>修饰键状态</h5>
                <div className="modifier-keys">
                  <span className={`modifier ${currentEvent.metaKey ? 'active' : ''}`}>
                    Meta: {currentEvent.metaKey ? '✓' : '✗'}
                  </span>
                  <span className={`modifier ${currentEvent.ctrlKey ? 'active' : ''}`}>
                    Ctrl: {currentEvent.ctrlKey ? '✓' : '✗'}
                  </span>
                  <span className={`modifier ${currentEvent.altKey ? 'active' : ''}`}>
                    Alt: {currentEvent.altKey ? '✓' : '✗'}
                  </span>
                  <span className={`modifier ${currentEvent.shiftKey ? 'active' : ''}`}>
                    Shift: {currentEvent.shiftKey ? '✓' : '✗'}
                  </span>
                </div>
              </div>

              {crossPlatformData && (
                <div className="detail-section">
                  <h5>跨平台对比</h5>
                  <div className="platform-comparison">
                    <div className="platform-item">
                      <h6>🍎 macOS</h6>
                      <div className="platform-details">
                        <div>按键: <strong>{crossPlatformData.macOS.key}</strong></div>
                        {crossPlatformData.macOS.modifier && (
                          <div>修饰键: <strong>{crossPlatformData.macOS.modifier}</strong></div>
                        )}
                        <div className="description">{crossPlatformData.macOS.description}</div>
                      </div>
                    </div>
                    <div className="platform-item">
                      <h6>🪟 Windows</h6>
                      <div className="platform-details">
                        <div>按键: <strong>{crossPlatformData.windows.key}</strong></div>
                        {crossPlatformData.windows.modifier && (
                          <div>修饰键: <strong>{crossPlatformData.windows.modifier}</strong></div>
                        )}
                        <div className="description">{crossPlatformData.windows.description}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {showHistory && eventHistory.length > 0 && (
          <div className="event-history">
            <h4>事件历史 ({eventHistory.length})</h4>
            <div className="history-list">
              {eventHistory.map((event, index) => (
                <div key={`${event.timestamp}-${index}`} className="history-item">
                  <div className="history-time">{formatTimestamp(event.timestamp)}</div>
                  <div className="history-key">{event.key}</div>
                  <div className="history-code">{event.code}</div>
                  <div className="history-modifiers">
                    {event.metaKey && <span className="mod">Meta</span>}
                    {event.ctrlKey && <span className="mod">Ctrl</span>}
                    {event.altKey && <span className="mod">Alt</span>}
                    {event.shiftKey && <span className="mod">Shift</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KeyboardListener;