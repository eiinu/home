import React, { useCallback, useMemo, useState, useEffect } from 'react'
import './CronHelper.css'
import CodeMirrorEditor from './CodeMirrorEditor'
import Button from './Button'
import useToast from './useToast'
import { ToastContainer } from './Toast'

interface CronHelperProps {
  theme?: 'light' | 'dark' | 'auto'
}

type CronParts = {
  minute: string
  hour: string
  dayOfMonth: string
  month: string
  dayOfWeek: string
}

const presets: { label: string; expr: string }[] = [
  { label: '每分钟', expr: '* * * * *' },
  { label: '每5分钟', expr: '*/5 * * * *' },
  { label: '每小时', expr: '0 * * * *' },
  { label: '每天 00:00', expr: '0 0 * * *' },
  { label: '每周一 09:00', expr: '0 9 * * 1' },
  { label: '每月1日 10:00', expr: '0 10 1 * *' },
]

function parseCron(expr: string): CronParts | null {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return null
  const [minute, hour, dom, month, dow] = parts
  return { minute, hour, dayOfMonth: dom, month, dayOfWeek: dow }
}

// 一个简单、可选的 next run 估算（非完整 cron 解析器）
function estimateNextRuns(expr: string, count = 5): string[] {
  // 为了避免引入依赖，这里做极简估算：仅处理常见模式
  // 提示：复杂表达式建议使用成熟库，如 cron-parser
  try {
    const parts = parseCron(expr)
    if (!parts) return ['表达式不完整（需要5段）']

    const now = new Date()
    const results: string[] = []
    const cursor = new Date(now.getTime())

    // 简化：仅支持 "*"、固定数字、*/n 的分钟与小时；日/月/星期仅支持 * 或固定数字
    const parseField = (field: string, min: number): ((v: number) => boolean) => {
      if (field === '*') return () => true
      if (field.includes('/')) {
        const step = parseInt(field.split('/')[1], 10)
        return (v: number) => (v - min) % step === 0
      }
      const fixed = parseInt(field, 10)
      if (!Number.isNaN(fixed)) return (v: number) => v === fixed
      // 简化：不支持列表与范围
      return () => false
    }

    const matchMinute = parseField(parts.minute, 0)
    const matchHour = parseField(parts.hour, 0)
    const matchDom = parts.dayOfMonth === '*' ? () => true : (v: number) => v === parseInt(parts.dayOfMonth, 10)
    const matchMonth = parts.month === '*' ? () => true : (v: number) => v === parseInt(parts.month, 10)
    const matchDow = parts.dayOfWeek === '*' ? () => true : (v: number) => v === parseInt(parts.dayOfWeek, 10)

    // 暴力向前搜索，最多推进 60 天
    for (let i = 0; i < 60 * 24 * 60 && results.length < count; i++) {
      cursor.setMinutes(cursor.getMinutes() + 1)
      const m = cursor.getMinutes()
      const h = cursor.getHours()
      const dom = cursor.getDate()
      const mon = cursor.getMonth() + 1
      const dow = cursor.getDay() // 0-6（周日-周六）

      if (matchMinute(m) && matchHour(h) && matchDom(dom) && matchMonth(mon) && matchDow(dow)) {
        results.push(cursor.toLocaleString())
      }
    }

    return results.length ? results : ['未在搜索窗口内命中，下次时间未知']
  } catch {
    return ['解析失败']
  }
}

const CronHelper: React.FC<CronHelperProps> = ({ theme = 'auto' }) => {
  const [expr, setExpr] = useState('* * * * *')
  const [parts, setParts] = useState<CronParts | null>(() => parseCron(expr))
  const [nextRuns, setNextRuns] = useState<string[]>([])
  const { showSuccess, showError, showInfo, messages, removeToast } = useToast()

  useEffect(() => {
    setParts(parseCron(expr))
    setNextRuns(estimateNextRuns(expr, 5))
  }, [expr])

  const applyPreset = useCallback((preset: string) => {
    setExpr(preset)
    showInfo('已应用预设')
  }, [showInfo])

  const copyExpr = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(expr)
      showSuccess('表达式已复制')
    } catch {
      showError('复制失败')
    }
  }, [expr, showSuccess, showError])

  const parsedFields = useMemo(() => {
    if (!parts) return []
    return [
      { label: '分钟', value: parts.minute, hint: '0-59，支持 *、数字、*/n' },
      { label: '小时', value: parts.hour, hint: '0-23，支持 *、数字、*/n' },
      { label: '日', value: parts.dayOfMonth, hint: '1-31，支持 * 或数字' },
      { label: '月', value: parts.month, hint: '1-12，支持 * 或数字' },
      { label: '星期', value: parts.dayOfWeek, hint: '0-6（周日-周六），支持 * 或数字' },
    ]
  }, [parts])

  return (
    <div className="cron-helper">
      <ToastContainer messages={messages} onRemove={removeToast} />
      <div className="cron-helper-header">
        <h2 className="cron-helper-title">Cron 表达式助手</h2>
        <div className="cron-helper-mode">
          <Button variant="secondary" size="small" onClick={copyExpr}>复制表达式</Button>
        </div>
      </div>

      <div className="cron-sections">
        <div className="cron-section">
          <div className="section-header">
            <h3 className="section-title">表达式编辑</h3>
            <div className="section-subtitle">格式：分钟 小时 日 月 星期</div>
          </div>
          <CodeMirrorEditor
            value={expr}
            onChange={setExpr}
            language="plain"
            theme={theme}
            placeholder={'例如：0 0 * * * 表示每天 00:00'}
          />

          <div className="preset-list" style={{ marginTop: 8 }}>
            {presets.map(p => (
              <Button key={p.expr} variant="secondary" size="small" onClick={() => applyPreset(p.expr)}>
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="cron-section">
          <div className="section-header">
            <h3 className="section-title">语义解析</h3>
          </div>

          {!parts && (
            <div className="section-subtitle">表达式不完整（需要5段，以空格分隔）</div>
          )}

          {parts && (
            <div className="field-grid">
              {parsedFields.map((f) => (
                <>
                  <div className="field-row-label">{f.label}</div>
                  <div>
                    <code>{f.value}</code>
                    <div className="section-subtitle">{f.hint}</div>
                  </div>
                </>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="cron-section">
        <div className="output-row">
          <h3 className="section-title">下次执行时间（估算）</h3>
          <div className="section-subtitle">仅支持常见模式，复杂表达式建议使用专业库</div>
        </div>
        <div className="next-times">
          {nextRuns.map((t, i) => (
            <div key={i}>• {t}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CronHelper