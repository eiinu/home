import { useEffect, useRef } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, lineNumbers } from '@codemirror/view'
import { defaultHighlightStyle, HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { html } from '@codemirror/lang-html'

const clipboardHighlightStyle = HighlightStyle.define(defaultHighlightStyle.specs.map(spec => ({
  ...spec,
  ...(spec.color ? { color: `color-mix(in srgb, ${spec.color} var(--clip-highlight-strength, 100%), var(--clip-ink, #292b29))` } : {}),
})))

export default function ClipboardCodeEditor({ value, markup, wrap }: {
  value: string; markup: boolean; wrap: boolean
}) {
  const host = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!host.current) return
    const view = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          lineNumbers(), EditorState.readOnly.of(true), EditorView.editable.of(false),
          EditorView.contentAttributes.of({ 'aria-label': markup ? 'HTML 源码' : '剪贴板文本', tabindex: '0' }),
          syntaxHighlighting(clipboardHighlightStyle),
          ...(markup ? [html()] : []),
          ...(wrap ? [EditorView.lineWrapping] : []),
        ],
      }),
    })
    return () => view.destroy()
  }, [value, markup, wrap])
  return <div className="clip-code" ref={host} />
}
