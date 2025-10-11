import React, { useState, useCallback } from 'react';
import './BorderEditor.css';

interface BorderSideConfig {
  width: number;
  style: string;
  color: string;
}

interface BorderImageConfig {
  enabled: boolean;
  source: string;
  slice: number;
  width: number;
  outset: number;
  repeat: 'stretch' | 'repeat' | 'round' | 'space';
}

interface OutlineConfig {
  enabled: boolean;
  width: number;
  style: string;
  color: string;
  offset: number;
}

interface BorderConfig {
  // 统一边框设置（所有边相同）
  width: number;
  style: string;
  color: string;
  // 各边独立设置
  sides: {
    top: BorderSideConfig;
    right: BorderSideConfig;
    bottom: BorderSideConfig;
    left: BorderSideConfig;
  };
  // 圆角（水平半径）
  radius: {
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
  };
  // 圆角（垂直半径，用于椭圆圆角）
  radiusVertical: {
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
  };
  // 是否启用椭圆圆角
  useEllipticalRadius: boolean;
  // border-image 配置
  borderImage: BorderImageConfig;
  // outline 配置
  outline: OutlineConfig;
}

const BorderEditor: React.FC = () => {
  const [borderConfig, setBorderConfig] = useState<BorderConfig>({
    width: 2,
    style: 'solid',
    color: '#000000',
    sides: {
      top: { width: 2, style: 'solid', color: '#000000' },
      right: { width: 2, style: 'solid', color: '#000000' },
      bottom: { width: 2, style: 'solid', color: '#000000' },
      left: { width: 2, style: 'solid', color: '#000000' },
    },
    radius: {
      topLeft: 0,
      topRight: 0,
      bottomLeft: 0,
      bottomRight: 0,
    },
    radiusVertical: {
      topLeft: 0,
      topRight: 0,
      bottomLeft: 0,
      bottomRight: 0,
    },
    useEllipticalRadius: false,
    borderImage: {
      enabled: false,
      source: '',
      slice: 100,
      width: 0,
      outset: 0,
      repeat: 'stretch',
    },
    outline: {
      enabled: false,
      width: 0,
      style: 'solid',
      color: '#000000',
      offset: 0,
    },
  });

  const [isUniformRadius, setIsUniformRadius] = useState(true);
  const [isUniformBorder, setIsUniformBorder] = useState(true);

  const borderStyles = [
    'none', 'hidden', 'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'
  ];

  const updateBorderConfig = useCallback((updates: Partial<BorderConfig>) => {
    setBorderConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const updateRadius = useCallback((corner: keyof BorderConfig['radius'], value: number, axis: 'horizontal' | 'vertical' = 'horizontal') => {
    if (isUniformRadius) {
      if (axis === 'horizontal') {
        setBorderConfig(prev => ({
          ...prev,
          radius: {
            topLeft: value,
            topRight: value,
            bottomLeft: value,
            bottomRight: value,
          }
        }));
      } else {
        setBorderConfig(prev => ({
          ...prev,
          radiusVertical: {
            topLeft: value,
            topRight: value,
            bottomLeft: value,
            bottomRight: value,
          }
        }));
      }
    } else {
      if (axis === 'horizontal') {
        setBorderConfig(prev => ({
          ...prev,
          radius: {
            ...prev.radius,
            [corner]: value,
          }
        }));
      } else {
        setBorderConfig(prev => ({
          ...prev,
          radiusVertical: {
            ...prev.radiusVertical,
            [corner]: value,
          }
        }));
      }
    }
  }, [isUniformRadius]);

  const generateCSS = useCallback(() => {
    const { width, style, color, sides, radius, radiusVertical, useEllipticalRadius, borderImage, outline } = borderConfig;
    const cssParts: string[] = [];

    if (isUniformBorder) {
      cssParts.push(`border: ${width}px ${style} ${color};`);
    } else {
      cssParts.push(
        `border-top: ${sides.top.width}px ${sides.top.style} ${sides.top.color};`,
        `border-right: ${sides.right.width}px ${sides.right.style} ${sides.right.color};`,
        `border-bottom: ${sides.bottom.width}px ${sides.bottom.style} ${sides.bottom.color};`,
        `border-left: ${sides.left.width}px ${sides.left.style} ${sides.left.color};`
      );
    }

    if (useEllipticalRadius) {
      if (isUniformRadius) {
        cssParts.push(`border-radius: ${radius.topLeft}px ${radiusVertical.topLeft}px;`);
      } else {
        cssParts.push(
          `border-top-left-radius: ${radius.topLeft}px ${radiusVertical.topLeft}px;`,
          `border-top-right-radius: ${radius.topRight}px ${radiusVertical.topRight}px;`,
          `border-bottom-right-radius: ${radius.bottomRight}px ${radiusVertical.bottomRight}px;`,
          `border-bottom-left-radius: ${radius.bottomLeft}px ${radiusVertical.bottomLeft}px;`
        );
      }
    } else {
      const borderRadiusValue = isUniformRadius 
        ? `${radius.topLeft}px`
        : `${radius.topLeft}px ${radius.topRight}px ${radius.bottomRight}px ${radius.bottomLeft}px`;
      cssParts.push(`border-radius: ${borderRadiusValue};`);
    }

    if (borderImage.enabled) {
      const src = borderImage.source.trim();
      const sourceExpr = src.startsWith('url(') || src.includes('gradient') ? src : `url(${src})`;
      cssParts.push(
        `border-image-source: ${sourceExpr};`,
        `border-image-slice: ${borderImage.slice};`,
        `border-image-width: ${borderImage.width};`,
        `border-image-outset: ${borderImage.outset};`,
        `border-image-repeat: ${borderImage.repeat};`
      );
    }

    if (outline.enabled) {
      cssParts.push(
        `outline: ${outline.width}px ${outline.style} ${outline.color};`,
        `outline-offset: ${outline.offset}px;`
      );
    }

    return cssParts.join('\n');
  }, [borderConfig, isUniformBorder, isUniformRadius]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(generateCSS());
  }, [generateCSS]);

  const previewStyle: React.CSSProperties = {
    ...(isUniformBorder
      ? { border: `${borderConfig.width}px ${borderConfig.style} ${borderConfig.color}` }
      : {
          borderTop: `${borderConfig.sides.top.width}px ${borderConfig.sides.top.style} ${borderConfig.sides.top.color}`,
          borderRight: `${borderConfig.sides.right.width}px ${borderConfig.sides.right.style} ${borderConfig.sides.right.color}`,
          borderBottom: `${borderConfig.sides.bottom.width}px ${borderConfig.sides.bottom.style} ${borderConfig.sides.bottom.color}`,
          borderLeft: `${borderConfig.sides.left.width}px ${borderConfig.sides.left.style} ${borderConfig.sides.left.color}`,
        }
    ),
    ...(borderConfig.useEllipticalRadius
      ? (isUniformRadius
        ? { borderRadius: `${borderConfig.radius.topLeft}px ${borderConfig.radiusVertical.topLeft}px` }
        : {
            borderTopLeftRadius: `${borderConfig.radius.topLeft}px ${borderConfig.radiusVertical.topLeft}px`,
            borderTopRightRadius: `${borderConfig.radius.topRight}px ${borderConfig.radiusVertical.topRight}px`,
            borderBottomRightRadius: `${borderConfig.radius.bottomRight}px ${borderConfig.radiusVertical.bottomRight}px`,
            borderBottomLeftRadius: `${borderConfig.radius.bottomLeft}px ${borderConfig.radiusVertical.bottomLeft}px`,
          }
      )
      : (isUniformRadius
        ? { borderRadius: `${borderConfig.radius.topLeft}px` }
        : {
            borderTopLeftRadius: `${borderConfig.radius.topLeft}px`,
            borderTopRightRadius: `${borderConfig.radius.topRight}px`,
            borderBottomRightRadius: `${borderConfig.radius.bottomRight}px`,
            borderBottomLeftRadius: `${borderConfig.radius.bottomLeft}px`,
          }
      )
    ),
    ...(borderConfig.borderImage.enabled
      ? {
          borderImageSource: borderConfig.borderImage.source.startsWith('url(') || borderConfig.borderImage.source.includes('gradient')
            ? borderConfig.borderImage.source
            : `url(${borderConfig.borderImage.source})`,
          borderImageSlice: borderConfig.borderImage.slice,
          borderImageWidth: borderConfig.borderImage.width,
          borderImageOutset: borderConfig.borderImage.outset,
          borderImageRepeat: borderConfig.borderImage.repeat,
        }
      : {}
    ),
    ...(borderConfig.outline.enabled
      ? {
          outline: `${borderConfig.outline.width}px ${borderConfig.outline.style} ${borderConfig.outline.color}`,
          outlineOffset: `${borderConfig.outline.offset}px`,
        }
      : {}
    ),
  };

  return (
    <div className="border-editor">
      <div className="border-editor-header">
        <h2>CSS Border Editor</h2>
        <p>可视化编辑 CSS 边框样式</p>
      </div>

      <div className="border-editor-content">
        <div className="border-editor-controls">
          <div className="control-group toggle-row">
            <label className="inline-label">
              <input
                type="checkbox"
                checked={isUniformBorder}
                onChange={(e) => setIsUniformBorder(e.target.checked)}
              />
              统一设置所有边
            </label>
          </div>

          <div className="control-group">
            <label>边框宽度 (px)</label>
            {isUniformBorder ? (
              <>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={borderConfig.width}
                  onChange={(e) => updateBorderConfig({ width: Number(e.target.value) })}
                />
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={borderConfig.width}
                  onChange={(e) => updateBorderConfig({ width: Number(e.target.value) })}
                  className="number-input"
                />
              </>
            ) : (
              <div className="side-controls">
                {(['top','right','bottom','left'] as const).map((side) => (
                  <div key={side} className="side-section">
                    <label className="side-label">{side === 'top' ? '上' : side === 'right' ? '右' : side === 'bottom' ? '下' : '左'} 宽度 (px)</label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={borderConfig.sides[side].width}
                      onChange={(e) => setBorderConfig(prev => ({
                        ...prev,
                        sides: {
                          ...prev.sides,
                          [side]: { ...prev.sides[side], width: Number(e.target.value) }
                        }
                      }))}
                    />
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={borderConfig.sides[side].width}
                      onChange={(e) => setBorderConfig(prev => ({
                        ...prev,
                        sides: {
                          ...prev.sides,
                          [side]: { ...prev.sides[side], width: Number(e.target.value) }
                        }
                      }))}
                      className="number-input"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="control-group">
            <label>边框样式</label>
            {isUniformBorder ? (
              <select
                value={borderConfig.style}
                onChange={(e) => updateBorderConfig({ style: e.target.value })}
              >
                {borderStyles.map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            ) : (
              <div className="side-controls">
                {(['top','right','bottom','left'] as const).map((side) => (
                  <div key={side} className="side-section">
                    <label className="side-label">{side === 'top' ? '上' : side === 'right' ? '右' : side === 'bottom' ? '下' : '左'} 样式</label>
                    <select
                      value={borderConfig.sides[side].style}
                      onChange={(e) => setBorderConfig(prev => ({
                        ...prev,
                        sides: {
                          ...prev.sides,
                          [side]: { ...prev.sides[side], style: e.target.value }
                        }
                      }))}
                    >
                      {borderStyles.map(style => (
                        <option key={style} value={style}>{style}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="control-group">
            <label>边框颜色</label>
            {isUniformBorder ? (
              <div className="color-input-group">
                <input
                  type="color"
                  value={borderConfig.color}
                  onChange={(e) => updateBorderConfig({ color: e.target.value })}
                  className="color-picker"
                />
                <input
                  type="text"
                  value={borderConfig.color}
                  onChange={(e) => updateBorderConfig({ color: e.target.value })}
                  className="color-text"
                  placeholder="#000000 或 rgba(0,0,0,0.5)"
                />
              </div>
            ) : (
              <div className="side-controls">
                {(['top','right','bottom','left'] as const).map((side) => (
                  <div key={side} className="side-section">
                    <label className="side-label">{side === 'top' ? '上' : side === 'right' ? '右' : side === 'bottom' ? '下' : '左'} 颜色</label>
                    <div className="color-input-group">
                      <input
                        type="color"
                        value={borderConfig.sides[side].color}
                        onChange={(e) => setBorderConfig(prev => ({
                          ...prev,
                          sides: {
                            ...prev.sides,
                            [side]: { ...prev.sides[side], color: e.target.value }
                          }
                        }))}
                        className="color-picker"
                      />
                      <input
                        type="text"
                        value={borderConfig.sides[side].color}
                        onChange={(e) => setBorderConfig(prev => ({
                          ...prev,
                          sides: {
                            ...prev.sides,
                            [side]: { ...prev.sides[side], color: e.target.value }
                          }
                        }))}
                        className="color-text"
                        placeholder="#000000 或 rgba(0,0,0,0.5)"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="control-group">
            <div className="radius-header">
              <label>边框圆角 (px)</label>
              <label className="uniform-toggle">
                <input
                  type="checkbox"
                  checked={isUniformRadius}
                  onChange={(e) => setIsUniformRadius(e.target.checked)}
                />
                统一圆角
              </label>
              <label className="uniform-toggle">
                <input
                  type="checkbox"
                  checked={borderConfig.useEllipticalRadius}
                  onChange={(e) => updateBorderConfig({ useEllipticalRadius: e.target.checked })}
                />
                椭圆圆角
              </label>
            </div>

            {isUniformRadius ? (
              <div className="radius-uniform">
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={borderConfig.radius.topLeft}
                  onChange={(e) => updateRadius('topLeft', Number(e.target.value), 'horizontal')}
                />
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={borderConfig.radius.topLeft}
                  onChange={(e) => updateRadius('topLeft', Number(e.target.value), 'horizontal')}
                  className="number-input"
                />

                {borderConfig.useEllipticalRadius && (
                  <>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={borderConfig.radiusVertical.topLeft}
                      onChange={(e) => updateRadius('topLeft', Number(e.target.value), 'vertical')}
                    />
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={borderConfig.radiusVertical.topLeft}
                      onChange={(e) => updateRadius('topLeft', Number(e.target.value), 'vertical')}
                      className="number-input"
                    />
                  </>
                )}
              </div>
            ) : (
              <div className="radius-individual">
                <div className="radius-corner">
                  <label>左上</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={borderConfig.radius.topLeft}
                    onChange={(e) => updateRadius('topLeft', Number(e.target.value), 'horizontal')}
                    className="number-input small"
                  />
                  {borderConfig.useEllipticalRadius && (
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={borderConfig.radiusVertical.topLeft}
                      onChange={(e) => updateRadius('topLeft', Number(e.target.value), 'vertical')}
                      className="number-input small"
                    />
                  )}
                </div>
                <div className="radius-corner">
                  <label>右上</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={borderConfig.radius.topRight}
                    onChange={(e) => updateRadius('topRight', Number(e.target.value), 'horizontal')}
                    className="number-input small"
                  />
                  {borderConfig.useEllipticalRadius && (
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={borderConfig.radiusVertical.topRight}
                      onChange={(e) => updateRadius('topRight', Number(e.target.value), 'vertical')}
                      className="number-input small"
                    />
                  )}
                </div>
                <div className="radius-corner">
                  <label>左下</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={borderConfig.radius.bottomLeft}
                    onChange={(e) => updateRadius('bottomLeft', Number(e.target.value), 'horizontal')}
                    className="number-input small"
                  />
                  {borderConfig.useEllipticalRadius && (
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={borderConfig.radiusVertical.bottomLeft}
                      onChange={(e) => updateRadius('bottomLeft', Number(e.target.value), 'vertical')}
                      className="number-input small"
                    />
                  )}
                </div>
                <div className="radius-corner">
                  <label>右下</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={borderConfig.radius.bottomRight}
                    onChange={(e) => updateRadius('bottomRight', Number(e.target.value), 'horizontal')}
                    className="number-input small"
                  />
                  {borderConfig.useEllipticalRadius && (
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={borderConfig.radiusVertical.bottomRight}
                      onChange={(e) => updateRadius('bottomRight', Number(e.target.value), 'vertical')}
                      className="number-input small"
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="control-group">
            <div className="radius-header">
              <label>Border Image</label>
              <label className="uniform-toggle">
                <input
                  type="checkbox"
                  checked={borderConfig.borderImage.enabled}
                  onChange={(e) => updateBorderConfig({ borderImage: { ...borderConfig.borderImage, enabled: e.target.checked } })}
                />
                启用 border-image
              </label>
            </div>
            {borderConfig.borderImage.enabled && (
              <div className="border-image-controls">
                <label>来源 (url(...) 或 linear-gradient(...))</label>
                <input
                  type="text"
                  value={borderConfig.borderImage.source}
                  onChange={(e) => updateBorderConfig({ borderImage: { ...borderConfig.borderImage, source: e.target.value } })}
                  className="color-text"
                  placeholder="url(/image.png) 或 linear-gradient(...)"
                />

                <div className="side-controls">
                  <div className="side-section">
                    <label>slice</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={borderConfig.borderImage.slice}
                      onChange={(e) => updateBorderConfig({ borderImage: { ...borderConfig.borderImage, slice: Number(e.target.value) } })}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={borderConfig.borderImage.slice}
                      onChange={(e) => updateBorderConfig({ borderImage: { ...borderConfig.borderImage, slice: Number(e.target.value) } })}
                      className="number-input"
                    />
                  </div>
                  <div className="side-section">
                    <label>width</label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={borderConfig.borderImage.width}
                      onChange={(e) => updateBorderConfig({ borderImage: { ...borderConfig.borderImage, width: Number(e.target.value) } })}
                    />
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={borderConfig.borderImage.width}
                      onChange={(e) => updateBorderConfig({ borderImage: { ...borderConfig.borderImage, width: Number(e.target.value) } })}
                      className="number-input"
                    />
                  </div>
                  <div className="side-section">
                    <label>outset</label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={borderConfig.borderImage.outset}
                      onChange={(e) => updateBorderConfig({ borderImage: { ...borderConfig.borderImage, outset: Number(e.target.value) } })}
                    />
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={borderConfig.borderImage.outset}
                      onChange={(e) => updateBorderConfig({ borderImage: { ...borderConfig.borderImage, outset: Number(e.target.value) } })}
                      className="number-input"
                    />
                  </div>
                  <div className="side-section">
                    <label>repeat</label>
                    <select
                      value={borderConfig.borderImage.repeat}
                      onChange={(e) => updateBorderConfig({ borderImage: { ...borderConfig.borderImage, repeat: e.target.value as BorderImageConfig['repeat'] } })}
                    >
                      {(['stretch','repeat','round','space'] as const).map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="control-group">
            <div className="radius-header">
              <label>Outline</label>
              <label className="uniform-toggle">
                <input
                  type="checkbox"
                  checked={borderConfig.outline.enabled}
                  onChange={(e) => updateBorderConfig({ outline: { ...borderConfig.outline, enabled: e.target.checked } })}
                />
                启用 outline
              </label>
            </div>
            {borderConfig.outline.enabled && (
              <div className="outline-controls">
                <div className="side-controls">
                  <div className="side-section">
                    <label>宽度 (px)</label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={borderConfig.outline.width}
                      onChange={(e) => updateBorderConfig({ outline: { ...borderConfig.outline, width: Number(e.target.value) } })}
                    />
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={borderConfig.outline.width}
                      onChange={(e) => updateBorderConfig({ outline: { ...borderConfig.outline, width: Number(e.target.value) } })}
                      className="number-input"
                    />
                  </div>
                  <div className="side-section">
                    <label>样式</label>
                    <select
                      value={borderConfig.outline.style}
                      onChange={(e) => updateBorderConfig({ outline: { ...borderConfig.outline, style: e.target.value } })}
                    >
                      {borderStyles.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="side-section">
                    <label>颜色</label>
                    <div className="color-input-group">
                      <input
                        type="color"
                        value={borderConfig.outline.color}
                        onChange={(e) => updateBorderConfig({ outline: { ...borderConfig.outline, color: e.target.value } })}
                        className="color-picker"
                      />
                      <input
                        type="text"
                        value={borderConfig.outline.color}
                        onChange={(e) => updateBorderConfig({ outline: { ...borderConfig.outline, color: e.target.value } })}
                        className="color-text"
                        placeholder="#000000 或 rgba(0,0,0,0.5)"
                      />
                    </div>
                  </div>
                  <div className="side-section">
                    <label>offset (px)</label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={borderConfig.outline.offset}
                      onChange={(e) => updateBorderConfig({ outline: { ...borderConfig.outline, offset: Number(e.target.value) } })}
                    />
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={borderConfig.outline.offset}
                      onChange={(e) => updateBorderConfig({ outline: { ...borderConfig.outline, offset: Number(e.target.value) } })}
                      className="number-input"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-editor-preview">
          <div className="preview-container">
            <div className="preview-box" style={previewStyle}>
              <span>预览效果</span>
            </div>
          </div>

          <div className="css-output">
            <div className="css-header">
              <h3>生成的 CSS</h3>
              <button onClick={copyToClipboard} className="copy-button">
                复制代码
              </button>
            </div>
            <pre className="css-code">{generateCSS()}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BorderEditor;