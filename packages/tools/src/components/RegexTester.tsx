import React, { useState, useCallback, useMemo } from 'react'
import './RegexTester.css'
import CodeMirrorEditor from './CodeMirrorEditor'
import Button from './Button'
import useToast from './useToast'
import { ToastContainer } from './Toast'

interface RegexTesterProps {
  theme?: 'light' | 'dark' | 'auto'
}

interface MatchResult {
  match: string
  index: number
  groups?: string[]
}

const RegexTester: React.FC<RegexTesterProps> = ({ theme = 'auto' }) => {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [testText, setTestText] = useState('')
  const { showSuccess, showError, showInfo, messages, removeToast } = useToast()

  const showMessage = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (type === 'success') showSuccess(msg)
    else if (type === 'error') showError(msg)
    else showInfo(msg)
  }, [showSuccess, showError, showInfo])

  // 计算匹配结果
  const matchResults = useMemo(() => {
    if (!pattern || !testText) return []

    try {
      const regex = new RegExp(pattern, flags)
      const results: MatchResult[] = []
      
      if (flags.includes('g')) {
        // 全局匹配
        let match
        while ((match = regex.exec(testText)) !== null) {
          results.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          })
          // 防止无限循环
          if (match.index === regex.lastIndex) {
            regex.lastIndex++
          }
        }
      } else {
        // 单次匹配
        const match = regex.exec(testText)
        if (match) {
          results.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          })
        }
      }
      
      return results
    } catch {
      return []
    }
  }, [pattern, flags, testText])

  // 高亮显示匹配结果的文本
  const highlightedText = useMemo(() => {
    if (!testText || matchResults.length === 0) return testText

    let result = testText

    // 按索引排序，从后往前替换以避免索引偏移
    const sortedResults = [...matchResults].sort((a, b) => b.index - a.index)

    sortedResults.forEach((match) => {
      const before = result.slice(0, match.index)
      const highlighted = `<mark class="regex-match">${match.match}</mark>`
      const after = result.slice(match.index + match.match.length)
      result = before + highlighted + after
    })

    return result
  }, [testText, matchResults])

  const handleFlagToggle = useCallback((flag: string) => {
    setFlags(prev => {
      if (prev.includes(flag)) {
        return prev.replace(flag, '')
      } else {
        return prev + flag
      }
    })
  }, [])

  const handleClearAll = useCallback(() => {
    setPattern('')
    setTestText('')
    setFlags('g')
    showMessage('已清空所有内容', 'success')
  }, [showMessage])

  const handleCopyMatches = useCallback(async () => {
    if (matchResults.length === 0) {
      showMessage('没有匹配结果可复制', 'info')
      return
    }

    const matchText = matchResults.map(result => result.match).join('\n')
    try {
      await navigator.clipboard.writeText(matchText)
      showMessage('匹配结果已复制到剪贴板', 'success')
    } catch {
      showMessage('复制失败', 'error')
    }
  }, [matchResults, showMessage])

  // 常用正则表达式模式
  const commonPatterns = [
    { name: '邮箱', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
    { name: '手机号', pattern: '1[3-9]\\d{9}' },
    { name: 'URL', pattern: 'https?://[\\w\\-._~:/?#[\\]@!$&\'()*+,;=%]+' },
    { name: 'IP地址', pattern: '\\b(?:[0-9]{1,3}\\.){3}[0-9]{1,3}\\b' },
    { name: '日期(YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}' },
    { name: '中文字符', pattern: '[\\u4e00-\\u9fa5]+' },
    { name: '数字', pattern: '\\d+' },
    { name: '单词', pattern: '\\b\\w+\\b' }
  ]

  const handlePatternSelect = useCallback((selectedPattern: string) => {
    setPattern(selectedPattern)
    showMessage('已应用正则表达式模式', 'info')
  }, [showMessage])

  const isValidRegex = useMemo(() => {
    if (!pattern) return true
    try {
      new RegExp(pattern, flags)
      return true
    } catch {
      return false
    }
  }, [pattern, flags])

  return (
    <div className="regex-tester">
      <div className="regex-tester-header">
        <h2 className="regex-tester-title">正则表达式测试器</h2>
        <div className="regex-tester-actions">
          <Button variant="secondary" size="small" onClick={handleClearAll}>
            清空
          </Button>
          <Button 
            variant="secondary" 
            size="small" 
            onClick={handleCopyMatches}
            disabled={matchResults.length === 0}
          >
            复制匹配
          </Button>
        </div>
      </div>

      {/* 使用全局 Toast 提示，移除内联消息块 */}
      <ToastContainer messages={messages} onRemove={removeToast} />

      <div className="regex-tester-content">
        {/* 正则表达式输入区 */}
        <div className="regex-pattern-section">
          <div className="section-header">
            <h3 className="section-title">正则表达式</h3>
            <div className="regex-status">
              {pattern && (
                <span className={`status-indicator ${isValidRegex ? 'valid' : 'invalid'}`}>
                  {isValidRegex ? '✓ 有效' : '✗ 无效'}
                </span>
              )}
            </div>
          </div>
          
          <div className="pattern-input-container">
            <div className="pattern-wrapper">
              <span className="pattern-delimiter">/</span>
              <input
                type="text"
                className="pattern-input"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="输入正则表达式..."
              />
              <span className="pattern-delimiter">/</span>
              <input
                type="text"
                className="flags-input"
                value={flags}
                onChange={(e) => setFlags(e.target.value)}
                placeholder="flags"
              />
            </div>
          </div>

          {/* 标志选择器 */}
          <div className="flags-selector">
            <span className="flags-label">标志:</span>
            {['g', 'i', 'm', 's', 'u', 'y'].map(flag => (
              <button
                key={flag}
                className={`flag-button ${flags.includes(flag) ? 'active' : ''}`}
                onClick={() => handleFlagToggle(flag)}
                title={getFlagDescription(flag)}
              >
                {flag}
              </button>
            ))}
          </div>

          {/* 常用模式 */}
          <div className="common-patterns">
            <span className="patterns-label">常用模式:</span>
            <div className="patterns-grid">
              {commonPatterns.map((item, index) => (
                <button
                  key={index}
                  className="pattern-button"
                  onClick={() => handlePatternSelect(item.pattern)}
                  title={item.pattern}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 测试文本区 */}
        <div className="test-text-section">
          <div className="section-header">
            <h3 className="section-title">测试文本</h3>
            <div className="section-stats">
              {testText.length} 字符 | {matchResults.length} 个匹配
            </div>
          </div>
          <div className="editor-container">
            <CodeMirrorEditor
              value={testText}
              onChange={setTestText}
              language="plain"
              theme={theme}
              placeholder="输入要测试的文本..."
            />
          </div>
        </div>

        {/* 匹配结果区 */}
        <div className="match-results-section">
          <div className="section-header">
            <h3 className="section-title">匹配结果</h3>
            <div className="section-stats">
              {matchResults.length} 个匹配项
            </div>
          </div>
          
          {matchResults.length > 0 ? (
            <div className="results-container">
              {/* 高亮显示 */}
              <div className="highlighted-text">
                <h4>高亮显示:</h4>
                <div 
                  className="highlight-content"
                  dangerouslySetInnerHTML={{ __html: highlightedText }}
                />
              </div>
              
              {/* 匹配详情 */}
              <div className="match-details">
                <h4>匹配详情:</h4>
                <div className="matches-list">
                  {matchResults.map((result, index) => (
                    <div key={index} className="match-item">
                      <div className="match-header">
                        <span className="match-index">#{index + 1}</span>
                        <span className="match-position">位置: {result.index}</span>
                      </div>
                      <div className="match-content">
                        <strong>匹配: </strong>
                        <code>{result.match}</code>
                      </div>
                      {result.groups && result.groups.length > 0 && (
                        <div className="match-groups">
                          <strong>分组: </strong>
                          {result.groups.map((group, groupIndex) => (
                            <code key={groupIndex} className="group-item">
                              ${groupIndex + 1}: {group || '(空)'}
                            </code>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="no-matches">
              {pattern && testText ? '没有找到匹配项' : '请输入正则表达式和测试文本'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getFlagDescription(flag: string): string {
  const descriptions: Record<string, string> = {
    'g': '全局匹配 (global)',
    'i': '忽略大小写 (ignore case)',
    'm': '多行模式 (multiline)',
    's': '单行模式 (single line)',
    'u': 'Unicode模式 (unicode)',
    'y': '粘性匹配 (sticky)'
  }
  return descriptions[flag] || flag
}

export default RegexTester