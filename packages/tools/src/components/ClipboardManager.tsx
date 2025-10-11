import React, { useState, useRef } from 'react'
import './ClipboardManager.css'
import useToast from './useToast'
import { ToastContainer } from './Toast'

interface ClipboardData {
  type: string
  data: string | Blob
  preview?: string
}

const ClipboardManager: React.FC = () => {
  const [clipboardContent, setClipboardContent] = useState<ClipboardData[]>([])
  const [isReading, setIsReading] = useState(false)
  const [writeText, setWriteText] = useState('')
  const [writeHtml, setWriteHtml] = useState('')
  const [writeAsText, setWriteAsText] = useState(true)
  const [writeAsHtml, setWriteAsHtml] = useState(false)
  const [isWriting, setIsWriting] = useState(false)
  const pasteAreaRef = useRef<HTMLDivElement>(null)
  const { showError, showSuccess, showWarning, messages, removeToast } = useToast()

  // 读取剪贴板内容
  const readClipboard = async () => {
    if (!navigator.clipboard) {
      showError('您的浏览器不支持剪贴板 API')
      return
    }

    setIsReading(true)
    try {
      const clipboardItems = await navigator.clipboard.read()
      const content: ClipboardData[] = []

      for (const item of clipboardItems) {
        for (const type of item.types) {
          const blob = await item.getType(type)
          
          if (type === 'text/plain') {
            const text = await blob.text()
            content.push({
              type: 'text/plain',
              data: text,
              preview: text
            })
          } else if (type === 'text/html') {
            const html = await blob.text()
            content.push({
              type: 'text/html',
              data: html,
              preview: html
            })
          } else if (type.startsWith('image/')) {
            const imageUrl = URL.createObjectURL(blob)
            content.push({
              type,
              data: blob,
              preview: imageUrl
            })
          } else if (type === 'image/svg+xml') {
            const svgText = await blob.text()
            content.push({
              type: 'image/svg+xml',
              data: svgText,
              preview: svgText
            })
          } else {
            // 其他类型尝试读取为文本
            try {
              const text = await blob.text()
              content.push({
                type,
                data: text,
                preview: text
              })
            } catch {
              content.push({
                type,
                data: blob,
                preview: `[${type}] 二进制数据 (${blob.size} bytes)`
              })
            }
          }
        }
      }

      setClipboardContent(content)
    } catch (error) {
      console.error('读取剪贴板失败:', error)
      showError('读取剪贴板失败，请确保已授予权限')
    } finally {
      setIsReading(false)
    }
  }

  // 写入剪贴板
  const writeClipboard = async () => {
    if (!navigator.clipboard) {
      showError('您的浏览器不支持剪贴板 API')
      return
    }

    if (!writeAsText && !writeAsHtml) {
      showWarning('请至少选择一种写入格式')
      return
    }

    if (writeAsText && !writeText.trim()) {
      showWarning('请输入要写入的文本内容')
      return
    }

    if (writeAsHtml && !writeHtml.trim()) {
      showWarning('请输入要写入的 HTML 内容')
      return
    }

    setIsWriting(true)
    try {
      const clipboardItems: Record<string, Blob> = {}

      if (writeAsText && writeText.trim()) {
        clipboardItems['text/plain'] = new Blob([writeText], { type: 'text/plain' })
      }

      if (writeAsHtml && writeHtml.trim()) {
        clipboardItems['text/html'] = new Blob([writeHtml], { type: 'text/html' })
      }

      const clipboardItem = new ClipboardItem(clipboardItems)
      await navigator.clipboard.write([clipboardItem])
      
      showSuccess('内容已成功写入剪贴板')
    } catch (error) {
      console.error('写入剪贴板失败:', error)
      showError('写入剪贴板失败，请确保已授予权限')
    } finally {
      setIsWriting(false)
    }
  }

  // 处理粘贴区域的粘贴事件
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    readClipboard()
  }

  // 渲染剪贴板内容
  const renderClipboardContent = (item: ClipboardData) => {
    switch (item.type) {
      case 'text/plain':
        return (
          <div className="clipboard-text">
            <pre>{item.preview}</pre>
          </div>
        )
      case 'text/html':
        return (
          <div className="clipboard-html">
            <div className="html-raw">
              <h4>HTML 原始数据:</h4>
              <pre>{item.preview}</pre>
            </div>
            <div className="html-rendered">
              <h4>HTML 渲染效果:</h4>
              <div dangerouslySetInnerHTML={{ __html: item.preview as string }} />
            </div>
          </div>
        )
      case 'image/svg+xml':
        return (
          <div className="clipboard-svg">
            <div className="svg-raw">
              <h4>SVG 原始数据:</h4>
              <pre>{item.preview}</pre>
            </div>
            <div className="svg-rendered">
              <h4>SVG 渲染效果:</h4>
              <div dangerouslySetInnerHTML={{ __html: item.preview as string }} />
            </div>
          </div>
        )
      default:
        if (item.type.startsWith('image/')) {
          return (
            <div className="clipboard-image">
              <img src={item.preview} alt="剪贴板图片" style={{ maxWidth: '100%', maxHeight: '300px' }} />
            </div>
          )
        }
        return (
          <div className="clipboard-other">
            <pre>{item.preview}</pre>
          </div>
        )
    }
  }

  return (
    <>
      <div className="clipboard-manager">
      <div className="clipboard-section">
        <h2>📋 剪贴板读取</h2>
        <div 
          ref={pasteAreaRef}
          className="paste-area"
          onPaste={handlePaste}
          tabIndex={0}
        >
          <p>在此区域粘贴内容 (Ctrl+V) 或点击下方按钮读取剪贴板</p>
        </div>
        <button 
          className="read-button"
          onClick={readClipboard}
          disabled={isReading}
        >
          {isReading ? '读取中...' : '读取剪贴板'}
        </button>
        
        {clipboardContent.length > 0 && (
          <div className="clipboard-content">
            <h3>剪贴板内容:</h3>
            {clipboardContent.map((item, index) => (
              <div key={index} className="clipboard-item">
                <div className="item-header">
                  <span className="item-type">{item.type}</span>
                </div>
                <div className="item-content">
                  {renderClipboardContent(item)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="clipboard-section">
        <h2>✏️ 剪贴板写入</h2>
        
        <div className="write-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={writeAsText}
              onChange={(e) => setWriteAsText(e.target.checked)}
            />
            写入为 text/plain
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={writeAsHtml}
              onChange={(e) => setWriteAsHtml(e.target.checked)}
            />
            写入为 text/html
          </label>
        </div>

        {writeAsText && (
          <div className="write-input">
            <label>纯文本内容:</label>
            <textarea
              value={writeText}
              onChange={(e) => setWriteText(e.target.value)}
              placeholder="输入要写入剪贴板的纯文本内容..."
              rows={6}
            />
          </div>
        )}

        {writeAsHtml && (
          <div className="write-input">
            <label>HTML 内容:</label>
            <textarea
              value={writeHtml}
              onChange={(e) => setWriteHtml(e.target.value)}
              placeholder="输入要写入剪贴板的 HTML 内容..."
              rows={6}
            />
          </div>
        )}

        <button 
          className="write-button"
          onClick={writeClipboard}
          disabled={isWriting || (!writeAsText && !writeAsHtml)}
        >
          {isWriting ? '写入中...' : '写入剪贴板'}
        </button>
      </div>
    </div>
      <ToastContainer messages={messages} onRemove={removeToast} />
    </>
  )
}

export default ClipboardManager