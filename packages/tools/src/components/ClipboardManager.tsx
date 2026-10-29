import React, { useEffect, useRef, useState } from 'react'
import './ClipboardManager.css'
import ClipboardCodeEditor from './ClipboardCodeEditor'
import useToast from './useToast'
import { ToastContainer } from './Toast'

interface ClipboardData { type: string; blob: Blob; text?: string; url?: string }
type View = 'source' | 'split' | 'preview'

function Glyph({ name }: { name: 'copy' | 'expand' | 'download' | 'clipboard' | View }) {
  const paths = {
    copy: <><rect x="8" y="8" width="12" height="13" rx="2" /><path d="M16 8V3H3v13h5" /></>,
    expand: <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />,
    download: <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />,
    clipboard: <><rect x="5" y="5" width="14" height="16" rx="2" /><rect x="8" y="2" width="8" height="5" rx="1" /></>,
    source: <path d="m8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16" />,
    split: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M12 4v16" /></>,
    preview: <rect x="3" y="4" width="18" height="16" rx="2" />,
  }
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function previewDocument(source: string) {
  const doc = new DOMParser().parseFromString(source, 'text/html')
  doc.querySelectorAll('script,iframe,object,embed,base,meta,link,form').forEach(node => node.remove())
  doc.querySelectorAll('*').forEach(node => {
    for (const attr of [...node.attributes]) {
      if (/^on/i.test(attr.name) || ['href', 'target', 'action', 'formaction', 'srcdoc', 'http-equiv'].includes(attr.name.toLowerCase())) {
        node.removeAttribute(attr.name)
      }
    }
  })
  const policy = doc.createElement('meta')
  policy.httpEquiv = 'Content-Security-Policy'
  policy.content = "default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; form-action 'none'; base-uri 'none'"
  doc.head.prepend(policy)
  const style = doc.createElement('style')
  style.textContent = 'html{color-scheme:light;background:#fff;color:#292b29}body{margin:28px;font-family:system-ui,sans-serif;line-height:1.7;overflow-wrap:anywhere}img,svg,video{max-width:100%;height:auto}pre{white-space:pre-wrap}a{text-decoration:underline}'
  doc.head.insertBefore(style, policy.nextSibling)
  return '<!doctype html>' + doc.documentElement.outerHTML
}
function sizeLabel(size: number) { return size < 1024 ? `${size} B` : `${(size / 1024).toFixed(1)} KB` }
function formatLabel(type: string) {
  return type === 'text/html' ? 'HTML' : type === 'text/plain' ? '纯文本' : type.startsWith('image/') ? '图片' : type
}

const ClipboardManager: React.FC = () => {
  const [content, setContent] = useState<ClipboardData[]>([])
  const [selected, setSelected] = useState(0)
  const [mode, setMode] = useState<'read' | 'write'>('read')
  const [busy, setBusy] = useState(false)
  const [writeText, setWriteText] = useState('')
  const [writeHtml, setWriteHtml] = useState('')
  const [asText, setAsText] = useState(true)
  const [asHtml, setAsHtml] = useState(false)
  const [writeType, setWriteType] = useState<'text/plain' | 'text/html'>('text/plain')
  const [view, setView] = useState<View>('split')
  const [mobileView, setMobileView] = useState<'source' | 'preview'>('preview')
  const [wrap, setWrap] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [previewWidth, setPreviewWidth] = useState('desktop')
  const [ratio, setRatio] = useState(50)
  const [dragging, setDragging] = useState(false)
  const urls = useRef<string[]>([])
  const version = useRef(0)
  const panel = useRef<HTMLDivElement>(null)
  const { showError, showSuccess, showWarning, messages, removeToast } = useToast()

  useEffect(() => () => { version.current++; urls.current.forEach(URL.revokeObjectURL) }, [])
  useEffect(() => {
    if (!dragging) return
    const move = (event: PointerEvent) => {
      const rect = panel.current?.getBoundingClientRect()
      if (rect) setRatio(Math.max(25, Math.min(75, (event.clientX - rect.left) / rect.width * 100)))
    }
    const stop = () => setDragging(false)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', stop)
    window.addEventListener('pointercancel', stop)
    window.addEventListener('blur', stop)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', stop)
      window.removeEventListener('pointercancel', stop)
      window.removeEventListener('blur', stop)
    }
  }, [dragging])
  useEffect(() => {
    if (!expanded) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const close = (e: KeyboardEvent) => { if (e.key === 'Escape') setExpanded(false) }
    window.addEventListener('keydown', close)
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', close) }
  }, [expanded])

  async function acceptBlobs(entries: { type: string; blob: Blob }[], request: number) {
    const next = await Promise.all(entries.map(async entry => ({
      ...entry,
      text: entry.type.startsWith('text/') || entry.type === 'image/svg+xml' ? await entry.blob.text() : undefined,
    })))
    if (version.current !== request) return
    if (!next.length) { showWarning('剪贴板中没有可读取的内容'); return }
    urls.current.forEach(URL.revokeObjectURL)
    urls.current = []
    const items = next.map(entry => {
      if (entry.type.startsWith('image/')) {
        const url = URL.createObjectURL(entry.blob)
        urls.current.push(url)
        return { ...entry, url }
      }
      return entry
    })
    setContent(items)
    const htmlIndex = items.findIndex(entry => entry.type === 'text/html')
    setSelected(htmlIndex >= 0 ? htmlIndex : 0)
    setMobileView('preview')
  }

  async function readClipboard() {
    const request = ++version.current
    setBusy(true)
    try {
      if (!navigator.clipboard) throw new Error('当前浏览器不支持读取，请在内容区直接粘贴。')
      const entries: { type: string; blob: Blob }[] = []
      if (navigator.clipboard.read) {
        for (const item of await navigator.clipboard.read()) {
          for (const type of item.types) entries.push({ type, blob: await item.getType(type) })
        }
      } else {
        entries.push({ type: 'text/plain', blob: new Blob([await navigator.clipboard.readText()], { type: 'text/plain' }) })
      }
      await acceptBlobs(entries, request)
    } catch {
      if (version.current === request) showError('无法读取剪贴板，请允许访问，或在内容区直接粘贴。')
    } finally { if (version.current === request) setBusy(false) }
  }

  async function handlePaste(e: React.ClipboardEvent) {
    if (mode !== 'read' || (e.target instanceof HTMLElement && e.target.closest('input,textarea'))) return
    e.preventDefault()
    const entries: { type: string; blob: Blob }[] = []
    for (const type of e.clipboardData.types) {
      if (type !== 'Files') entries.push({ type, blob: new Blob([e.clipboardData.getData(type)], { type }) })
    }
    for (const file of Array.from(e.clipboardData.files)) entries.push({ type: file.type || 'application/octet-stream', blob: file })
    const request = ++version.current
    setBusy(false)
    try { await acceptBlobs(entries, request) } catch { showError('粘贴失败，请重试。') }
  }

  async function copy(text: string) {
    try { await navigator.clipboard.writeText(text); showSuccess('已复制') }
    catch { showError('复制失败，请允许访问剪贴板。') }
  }

  async function writeClipboard() {
    if (!asText && !asHtml) { showWarning('请至少选择一种写入格式'); return }
    if ((asText && !writeText) || (asHtml && !writeHtml)) { showWarning('请填写已选择格式的内容'); return }
    setBusy(true)
    try {
      if (asText && !asHtml) await navigator.clipboard.writeText(writeText)
      else {
        const data: Record<string, Blob> = {}
        if (asText) data['text/plain'] = new Blob([writeText], { type: 'text/plain' })
        if (asHtml) data['text/html'] = new Blob([writeHtml], { type: 'text/html' })
        await navigator.clipboard.write([new ClipboardItem(data)])
      }
      showSuccess('已写入剪贴板')
    } catch { showError('写入失败，请检查浏览器支持情况和剪贴板权限。') }
    finally { setBusy(false) }
  }

  const item = mode === 'read' ? content[selected] : undefined
  const type = mode === 'write' ? writeType : item?.type
  const text = mode === 'write' ? (writeType === 'text/html' ? writeHtml : writeText) : item?.text ?? ''
  const markup = type === 'text/html' || type === 'image/svg+xml'
  const image = type?.startsWith('image/') && !markup
  const hasContent = mode === 'write' || !!item
  const source = markup ? previewDocument(text) : ''
  const showSource = !image && (!markup || view !== 'preview')
  const showPreview = image || (markup && view !== 'source')

  function download() {
    const blob = mode === 'read' ? item?.blob : new Blob([text], { type })
    if (!blob) return
    const extension = type === 'text/html' ? 'html' : type === 'image/svg+xml' ? 'svg' : type === 'text/plain' ? 'txt' : type?.split('/')[1]?.replace(/[^a-z0-9]/gi, '') || 'bin'
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url; anchor.download = `clipboard.${extension}`
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  function resize(e: React.PointerEvent<HTMLDivElement>) {
    const rect = panel.current?.getBoundingClientRect()
    if (rect) setRatio(Math.max(25, Math.min(75, (e.clientX - rect.left) / rect.width * 100)))
  }

  return <>
    <section className={`clip-workspace ${expanded ? 'clip-expanded' : ''}`} onPaste={handlePaste} aria-label="剪贴板管理">
      <div className="clip-topbar">
        <div className="clip-mode" role="group" aria-label="剪贴板操作">
          <button aria-pressed={mode === 'read'} onClick={() => setMode('read')}>读取</button>
          <button aria-pressed={mode === 'write'} onClick={() => setMode('write')}>写入</button>
        </div>
        <div className="clip-actions">
          {mode === 'read' && <span className="clip-paste-hint">Ctrl / ⌘ V 粘贴</span>}
          <button className="clip-primary" disabled={busy} onClick={mode === 'read' ? readClipboard : writeClipboard}>
            <Glyph name="clipboard" />{busy ? '处理中…' : mode === 'read' ? '读取剪贴板' : '写入剪贴板'}
          </button>
        </div>
      </div>
      {mode === 'write' && <div className="clip-write-formats" role="group" aria-label="写入格式">
        <label><input type="checkbox" checked={asText} onChange={e => setAsText(e.target.checked)} />纯文本</label>
        <label><input type="checkbox" checked={asHtml} onChange={e => setAsHtml(e.target.checked)} />HTML</label>
        <span>同时勾选可写入两种格式</span>
      </div>}
      {!hasContent ? <div className="clip-empty" tabIndex={0} aria-label="粘贴剪贴板内容">
        <Glyph name="clipboard" /><h3>粘贴到这里</h3><p>Ctrl / ⌘ V，或点击「读取剪贴板」</p>
      </div> : <>
        <div className="clip-formatbar">
          <div className="clip-formats" role="group" aria-label="内容格式">
            {mode === 'read' ? content.map((entry, i) => <button key={i} aria-pressed={selected === i} onClick={() => setSelected(i)}>{formatLabel(entry.type)}{content.filter(other => other.type === entry.type).length > 1 ? ` ${i + 1}` : ''}</button>)
              : (['text/plain', 'text/html'] as const).map(format => <button key={format} aria-pressed={writeType === format} onClick={() => { setWriteType(format); setMobileView('source') }}>{formatLabel(format)}</button>)}
          </div>
          <div className="clip-view-actions">
            <span className="clip-meta">{type} · {sizeLabel(item?.blob.size ?? new Blob([text]).size)}</span>
            {markup && <div className="clip-view-switch" role="group" aria-label="查看方式">
              {(['source', 'split', 'preview'] as const).map(value => <button key={value} className={value === 'split' ? 'clip-split-option' : ''} aria-pressed={view === value} aria-label={{ source: '仅源码', split: '左右对照', preview: '仅预览' }[value]} onClick={() => { setView(value); if (value !== 'split') setMobileView(value) }}><Glyph name={value} /></button>)}
            </div>}
            <button className="clip-expand-button" aria-label={expanded ? '退出展开' : '展开内容区'} title={expanded ? '退出展开（Esc）' : '展开内容区'} onClick={() => setExpanded(!expanded)}><Glyph name="expand" /></button>
          </div>
        </div>
        {markup && <div className="clip-mobile-tabs" role="group" aria-label="移动端查看方式">
          <button aria-pressed={mobileView === 'source'} onClick={() => { setView('split'); setMobileView('source') }}>源码</button>
          <button aria-pressed={mobileView === 'preview'} onClick={() => { setView('split'); setMobileView('preview') }}>预览</button>
        </div>}
        <div ref={panel} className={`clip-viewer ${markup ? 'clip-markup' : ''} clip-view-${view} clip-mobile-${mobileView} ${dragging ? 'clip-dragging' : ''}`} style={{ '--clip-ratio': `${ratio}%` } as React.CSSProperties}>
          {showSource && <div className="clip-pane clip-source-pane">
            <div className="clip-pane-bar"><span>{markup ? '源码' : '纯文本'}</span><div>
              <button aria-pressed={wrap} onClick={() => setWrap(!wrap)}>换行</button>
              <button disabled={mode === 'read' && item?.text === undefined} onClick={() => copy(text)}><Glyph name="copy" />复制</button>
            </div></div>
            {mode === 'write' ? <textarea aria-label={markup ? 'HTML 内容' : '纯文本内容'} spellCheck={false} placeholder={markup ? '输入 HTML…' : '输入纯文本…'} value={text} onChange={e => markup ? setWriteHtml(e.target.value) : setWriteText(e.target.value)} wrap={wrap ? 'soft' : 'off'} />
              : item?.text !== undefined ? <ClipboardCodeEditor value={text} markup={!!markup} wrap={wrap} /> : <div className="clip-binary">此格式无法预览，可下载原文件查看。</div>}
          </div>}
          {markup && view === 'split' && <div className="clip-divider" role="separator" aria-label="调整源码与预览宽度" aria-orientation="vertical" aria-valuenow={Math.round(ratio)} aria-valuemin={25} aria-valuemax={75} tabIndex={0}
            onPointerDown={e => { e.preventDefault(); setDragging(true); resize(e) }}
            onKeyDown={e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); setRatio(r => Math.max(25, Math.min(75, r + (e.key === 'ArrowRight' ? 5 : -5)))) } }}><span /></div>}
          {showPreview && <div className="clip-pane clip-preview-pane">
            <div className="clip-pane-bar"><span>预览</span>{markup && <select aria-label="预览宽度" value={previewWidth} onChange={e => setPreviewWidth(e.target.value)}><option value="desktop">自适应</option><option value="mobile">手机 · 375px</option></select>}</div>
            {image ? <div className="clip-image-canvas"><img src={item?.url} alt="剪贴板图片" /></div>
              : <div className="clip-preview-canvas"><iframe title="HTML 渲染预览" sandbox="" referrerPolicy="no-referrer" srcDoc={source} style={{ width: previewWidth === 'mobile' ? '375px' : '100%' }} /></div>}
          </div>}
        </div>
        <div className="clip-status"><span>{markup ? '隔离预览 · 不加载外部资源' : image ? '原始图片' : `${text.length.toLocaleString()} 字符`}</span><div>
          {mode === 'read' && <button onClick={() => { version.current++; urls.current.forEach(URL.revokeObjectURL); urls.current = []; setContent([]); setBusy(false) }}>清空</button>}
          <button onClick={download}><Glyph name="download" />下载{type === 'image/svg+xml' ? ' SVG' : markup ? ' HTML' : ''}</button>
        </div></div>
      </>}
    </section>
    <ToastContainer messages={messages} onRemove={removeToast} />
  </>
}
export default ClipboardManager
