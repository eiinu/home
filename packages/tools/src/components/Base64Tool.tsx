import React, { useState, useCallback } from 'react'
import './Base64Tool.css'
import CodeMirrorEditor from './CodeMirrorEditor'
import Button from './Button'
import useToast from './useToast'
import { ToastContainer } from './Toast'

interface Base64ToolProps {
  theme?: 'light' | 'dark' | 'auto'
}

const Base64Tool: React.FC<Base64ToolProps> = ({ theme = 'auto' }) => {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const { showSuccess, showError, showInfo, messages, removeToast } = useToast()

  const showMessage = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (type === 'success') showSuccess(msg)
    else if (type === 'error') showError(msg)
    else showInfo(msg)
  }, [showSuccess, showError, showInfo])

  const handleEncode = useCallback(() => {
    try {
      if (!inputText.trim()) {
        showMessage('请输入要编码的文本')
        return
      }
      const encoded = btoa(unescape(encodeURIComponent(inputText)))
      setOutputText(encoded)
      showMessage('编码成功！', 'success')
    } catch {
      showMessage('编码失败：输入包含无效字符', 'error')
    }
  }, [inputText, showMessage])

  const handleDecode = useCallback(() => {
    try {
      if (!inputText.trim()) {
      showMessage('请输入要解码的 Base64 文本', 'info')
        return
      }
      const decoded = decodeURIComponent(escape(atob(inputText.trim())))
      setOutputText(decoded)
      showMessage('解码成功！', 'success')
    } catch {
      showMessage('解码失败：请检查 Base64 格式是否正确', 'error')
    }
  }, [inputText, showMessage])

  const handleProcess = useCallback(() => {
    if (mode === 'encode') {
      handleEncode()
    } else {
      handleDecode()
    }
  }, [mode, handleEncode, handleDecode])

  const handleClear = useCallback(() => {
    setInputText('')
    setOutputText('')
    showMessage('已清空内容', 'success')
  }, [showMessage])

  const handleCopy = useCallback(async () => {
    if (!outputText) {
      showMessage('没有可复制的内容', 'info')
      return
    }
    try {
      await navigator.clipboard.writeText(outputText)
      showMessage('已复制到剪贴板', 'success')
    } catch {
      showMessage('复制失败', 'error')
    }
  }, [outputText, showMessage])

  const handleSwap = useCallback(() => {
    const temp = inputText
    setInputText(outputText)
    setOutputText(temp)
    setMode(mode === 'encode' ? 'decode' : 'encode')
    showMessage('已交换输入输出内容', 'info')
  }, [inputText, outputText, mode, showMessage])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === 'string') {
        setInputText(result)
        showMessage('文件读取成功')
      }
    }
    reader.onerror = () => {
      showMessage('文件读取失败')
    }
    reader.readAsText(file)
  }, [showMessage])

  return (
    <div className="base64-tool">
      <ToastContainer messages={messages} onRemove={removeToast} />
      <div className="base64-tool-header">
        <h2 className="base64-tool-title">Base64 编码/解码器</h2>
        <div className="base64-tool-controls">
          <div className="mode-selector">
            <button
              className={`mode-button ${mode === 'encode' ? 'active' : ''}`}
              onClick={() => setMode('encode')}
            >
              编码
            </button>
            <button
              className={`mode-button ${mode === 'decode' ? 'active' : ''}`}
              onClick={() => setMode('decode')}
            >
              解码
            </button>
          </div>
          <div className="file-upload">
            <input
              type="file"
              id="file-input"
              accept=".txt,.json,.xml,.csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <Button
              variant="secondary"
              size="small"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              导入文件
            </Button>
          </div>
        </div>
      </div>

      {/* 使用全局 Toast 悬浮提示，移除内联消息块 */}

      <div className="base64-tool-content">
        <div className="base64-tool-section">
          <div className="section-header">
            <h3 className="section-title">
              {mode === 'encode' ? '原始文本' : 'Base64 文本'}
            </h3>
            <div className="section-stats">
              {inputText.length} 字符
            </div>
          </div>
          <div className="editor-container">
            <CodeMirrorEditor
              value={inputText}
              onChange={setInputText}
              language="plain"
              theme={theme}
              placeholder={mode === 'encode' ? '请输入要编码的文本...' : '请输入要解码的 Base64 文本...'}
            />
          </div>
        </div>

        <div className="base64-tool-actions">
          <Button variant="primary" onClick={handleProcess}>
            {mode === 'encode' ? '编码' : '解码'}
          </Button>
          <Button variant="secondary" onClick={handleSwap} disabled={!inputText && !outputText}>
            交换
          </Button>
          <Button variant="secondary" onClick={handleClear}>
            清空
          </Button>
        </div>

        <div className="base64-tool-section">
          <div className="section-header">
            <h3 className="section-title">
              {mode === 'encode' ? 'Base64 结果' : '解码结果'}
            </h3>
            <div className="section-stats">
              {outputText.length} 字符
              {outputText && (
                <Button variant="secondary" size="small" onClick={handleCopy}>
                  复制
                </Button>
              )}
            </div>
          </div>
          <div className="editor-container">
            <CodeMirrorEditor
              value={outputText}
              onChange={setOutputText}
              language="plain"
              theme={theme}
              placeholder={mode === 'encode' ? 'Base64 编码结果将显示在这里...' : '解码结果将显示在这里...'}
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Base64Tool