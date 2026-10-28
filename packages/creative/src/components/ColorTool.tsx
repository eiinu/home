import React, { useState, useCallback, useMemo } from 'react'
import './ColorTool.css'
import Button from './Button'

interface ColorToolProps {
  theme?: 'light' | 'dark' | 'auto'
}

interface ColorFormats {
  hex: string
  rgb: string
  hsl: string
  hsv: string
  cmyk: string
}

interface HSL {
  h: number
  s: number
  l: number
}

interface HSV {
  h: number
  s: number
  v: number
}

interface RGB {
  r: number
  g: number
  b: number
}

interface CMYK {
  c: number
  m: number
  y: number
  k: number
}

const ColorTool: React.FC<ColorToolProps> = () => {
  const [currentColor, setCurrentColor] = useState('#3b82f6')
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'picker' | 'palette' | 'gradient'>('picker')

  const showMessage = useCallback((msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }, [])

  // 颜色转换函数
  const hexToRgb = useCallback((hex: string): RGB | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }, [])

  const rgbToHex = useCallback((r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  }, [])

  const rgbToHsl = useCallback((r: number, g: number, b: number): HSL => {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s = 0
    const l = (max + min) / 2

    if (max === min) {
      h = s = 0
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
  }, [])

  const rgbToHsv = useCallback((r: number, g: number, b: number): HSV => {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s = 0
    const v = max

    const d = max - min
    s = max === 0 ? 0 : d / max

    if (max === min) {
      h = 0
    } else {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) }
  }, [])

  const rgbToCmyk = useCallback((r: number, g: number, b: number): CMYK => {
    r /= 255
    g /= 255
    b /= 255

    const k = 1 - Math.max(r, Math.max(g, b))
    const c = (1 - r - k) / (1 - k) || 0
    const m = (1 - g - k) / (1 - k) || 0
    const y = (1 - b - k) / (1 - k) || 0

    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100)
    }
  }, [])

  // 计算所有颜色格式
  const colorFormats = useMemo((): ColorFormats => {
    const rgb = hexToRgb(currentColor)
    if (!rgb) return { hex: currentColor, rgb: '', hsl: '', hsv: '', cmyk: '' }

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b)
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b)

    return {
      hex: currentColor.toUpperCase(),
      rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      hsv: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
      cmyk: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`
    }
  }, [currentColor, hexToRgb, rgbToHsl, rgbToHsv, rgbToCmyk])

  // 复制颜色值
  const copyColor = useCallback(async (format: keyof ColorFormats) => {
    try {
      await navigator.clipboard.writeText(colorFormats[format])
      showMessage(`已复制 ${format.toUpperCase()} 格式: ${colorFormats[format]}`)
    } catch {
      showMessage('复制失败')
    }
  }, [colorFormats, showMessage])

  // 预设颜色
  const presetColors = [
    '#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00', '#00ff80',
    '#00ffff', '#0080ff', '#0000ff', '#8000ff', '#ff00ff', '#ff0080',
    '#ffffff', '#e5e5e5', '#cccccc', '#b3b3b3', '#999999', '#808080',
    '#666666', '#4d4d4d', '#333333', '#1a1a1a', '#000000', '#f5f5f5'
  ]

  // 生成调色板
  const generatePalette = useCallback((baseColor: string) => {
    const rgb = hexToRgb(baseColor)
    if (!rgb) return []

    const palette = []
    
    // 生成明度变化
    for (let i = 0; i < 10; i++) {
      const factor = i / 9
      const r = Math.round(rgb.r + (255 - rgb.r) * factor)
      const g = Math.round(rgb.g + (255 - rgb.g) * factor)
      const b = Math.round(rgb.b + (255 - rgb.b) * factor)
      palette.push(rgbToHex(r, g, b))
    }

    return palette
  }, [hexToRgb, rgbToHex])

  // 生成渐变色
  const generateGradient = useCallback((color1: string, color2: string, steps: number = 10) => {
    const rgb1 = hexToRgb(color1)
    const rgb2 = hexToRgb(color2)
    if (!rgb1 || !rgb2) return []

    const gradient = []
    for (let i = 0; i < steps; i++) {
      const factor = i / (steps - 1)
      const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor)
      const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor)
      const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor)
      gradient.push(rgbToHex(r, g, b))
    }

    return gradient
  }, [hexToRgb, rgbToHex])

  const [gradientStart, setGradientStart] = useState('#ff0000')
  const [gradientEnd, setGradientEnd] = useState('#0000ff')

  const gradientColors = useMemo(() => {
    return generateGradient(gradientStart, gradientEnd, 10)
  }, [gradientStart, gradientEnd, generateGradient])

  const paletteColors = useMemo(() => {
    return generatePalette(currentColor)
  }, [currentColor, generatePalette])

  // 随机颜色
  const generateRandomColor = useCallback(() => {
    const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
    setCurrentColor(randomColor)
    showMessage(`生成随机颜色: ${randomColor}`)
  }, [showMessage])

  // 颜色输入处理
  const handleColorInput = useCallback((value: string, format: 'hex' | 'rgb' | 'hsl') => {
    try {
      let newColor = currentColor
      
      if (format === 'hex') {
        if (/^#[0-9A-F]{6}$/i.test(value)) {
          newColor = value
        }
      } else if (format === 'rgb') {
        const match = value.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
        if (match) {
          const r = parseInt(match[1])
          const g = parseInt(match[2])
          const b = parseInt(match[3])
          if (r <= 255 && g <= 255 && b <= 255) {
            newColor = rgbToHex(r, g, b)
          }
        }
      }
      
      setCurrentColor(newColor)
    } catch {
      // 忽略无效输入
    }
  }, [currentColor, rgbToHex])

  return (
    <div className="color-tool">
      <div className="color-tool-header">
        <h2 className="color-tool-title">颜色工具</h2>
        <div className="color-tool-actions">
          <Button variant="secondary" size="small" onClick={generateRandomColor}>
            随机颜色
          </Button>
        </div>
      </div>

      {message && (
        <div className="color-tool-message">
          {message}
        </div>
      )}

      <div className="color-tool-tabs">
        <button
          className={`tab-button ${activeTab === 'picker' ? 'active' : ''}`}
          onClick={() => setActiveTab('picker')}
        >
          颜色选择器
        </button>
        <button
          className={`tab-button ${activeTab === 'palette' ? 'active' : ''}`}
          onClick={() => setActiveTab('palette')}
        >
          调色板
        </button>
        <button
          className={`tab-button ${activeTab === 'gradient' ? 'active' : ''}`}
          onClick={() => setActiveTab('gradient')}
        >
          渐变生成
        </button>
      </div>

      <div className="color-tool-content">
        {activeTab === 'picker' && (
          <div className="picker-tab">
            {/* 主颜色显示 */}
            <div className="color-display">
              <div 
                className="color-preview"
                style={{ backgroundColor: currentColor }}
              />
              <div className="color-info">
                <h3>当前颜色</h3>
                <p className="color-name">{currentColor}</p>
              </div>
            </div>

            {/* 颜色输入 */}
            <div className="color-inputs">
              <div className="input-group">
                <label>颜色选择器:</label>
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => setCurrentColor(e.target.value)}
                  className="color-picker"
                />
              </div>
              <div className="input-group">
                <label>HEX:</label>
                <input
                  type="text"
                  value={currentColor}
                  onChange={(e) => handleColorInput(e.target.value, 'hex')}
                  className="color-input"
                  placeholder="#000000"
                />
              </div>
            </div>

            {/* 颜色格式 */}
            <div className="color-formats">
              <h3>颜色格式</h3>
              <div className="formats-grid">
                {Object.entries(colorFormats).map(([format, value]) => (
                  <div key={format} className="format-item">
                    <div className="format-header">
                      <span className="format-label">{format.toUpperCase()}</span>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => copyColor(format as keyof ColorFormats)}
                      >
                        复制
                      </Button>
                    </div>
                    <div className="format-value">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 预设颜色 */}
            <div className="preset-colors">
              <h3>预设颜色</h3>
              <div className="colors-grid">
                {presetColors.map((color, index) => (
                  <button
                    key={index}
                    className="preset-color"
                    style={{ backgroundColor: color }}
                    onClick={() => setCurrentColor(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'palette' && (
          <div className="palette-tab">
            <div className="palette-header">
              <h3>基于当前颜色的调色板</h3>
              <p>从深到浅的明度变化</p>
            </div>
            <div className="palette-colors">
              {paletteColors.map((color, index) => (
                <div key={index} className="palette-item">
                  <div
                    className="palette-color"
                    style={{ backgroundColor: color }}
                    onClick={() => setCurrentColor(color)}
                  />
                  <div className="palette-info">
                    <span className="palette-hex">{color}</span>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => copyColor('hex')}
                    >
                      复制
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'gradient' && (
          <div className="gradient-tab">
            <div className="gradient-controls">
              <div className="gradient-inputs">
                <div className="input-group">
                  <label>起始颜色:</label>
                  <input
                    type="color"
                    value={gradientStart}
                    onChange={(e) => setGradientStart(e.target.value)}
                    className="color-picker"
                  />
                  <span className="color-value">{gradientStart}</span>
                </div>
                <div className="input-group">
                  <label>结束颜色:</label>
                  <input
                    type="color"
                    value={gradientEnd}
                    onChange={(e) => setGradientEnd(e.target.value)}
                    className="color-picker"
                  />
                  <span className="color-value">{gradientEnd}</span>
                </div>
              </div>
            </div>

            <div className="gradient-preview">
              <div
                className="gradient-bar"
                style={{
                  background: `linear-gradient(to right, ${gradientStart}, ${gradientEnd})`
                }}
              />
            </div>

            <div className="gradient-colors">
              <h3>渐变色阶</h3>
              <div className="gradient-steps">
                {gradientColors.map((color, index) => (
                  <div key={index} className="gradient-step">
                    <div
                      className="step-color"
                      style={{ backgroundColor: color }}
                      onClick={() => setCurrentColor(color)}
                    />
                    <div className="step-info">
                      <span className="step-number">{index + 1}</span>
                      <span className="step-hex">{color}</span>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(color)
                            showMessage(`已复制: ${color}`)
                          } catch {
                            showMessage('复制失败')
                          }
                        }}
                      >
                        复制
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="css-gradient">
              <h3>CSS 渐变代码</h3>
              <div className="css-code">
                <code>background: linear-gradient(to right, {gradientStart}, {gradientEnd});</code>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={async () => {
                    const cssCode = `background: linear-gradient(to right, ${gradientStart}, ${gradientEnd});`
                    try {
                      await navigator.clipboard.writeText(cssCode)
                      showMessage('CSS 代码已复制')
                    } catch {
                      showMessage('复制失败')
                    }
                  }}
                >
                  复制
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ColorTool