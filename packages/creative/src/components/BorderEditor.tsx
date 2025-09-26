import React, { useState, useCallback } from 'react';
import './BorderEditor.css';

interface BorderConfig {
  width: number;
  style: string;
  color: string;
  radius: {
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
  };
}

const BorderEditor: React.FC = () => {
  const [borderConfig, setBorderConfig] = useState<BorderConfig>({
    width: 2,
    style: 'solid',
    color: '#000000',
    radius: {
      topLeft: 0,
      topRight: 0,
      bottomLeft: 0,
      bottomRight: 0,
    },
  });

  const [isUniformRadius, setIsUniformRadius] = useState(true);

  const borderStyles = [
    'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'
  ];

  const updateBorderConfig = useCallback((updates: Partial<BorderConfig>) => {
    setBorderConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const updateRadius = useCallback((corner: keyof BorderConfig['radius'], value: number) => {
    if (isUniformRadius) {
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
        radius: {
          ...prev.radius,
          [corner]: value,
        }
      }));
    }
  }, [isUniformRadius]);

  const generateCSS = useCallback(() => {
    const { width, style, color, radius } = borderConfig;
    const borderRadiusValue = isUniformRadius 
      ? `${radius.topLeft}px`
      : `${radius.topLeft}px ${radius.topRight}px ${radius.bottomRight}px ${radius.bottomLeft}px`;
    
    return `border: ${width}px ${style} ${color};
border-radius: ${borderRadiusValue};`;
  }, [borderConfig, isUniformRadius]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(generateCSS());
  }, [generateCSS]);

  const previewStyle = {
    border: `${borderConfig.width}px ${borderConfig.style} ${borderConfig.color}`,
    borderRadius: isUniformRadius 
      ? `${borderConfig.radius.topLeft}px`
      : `${borderConfig.radius.topLeft}px ${borderConfig.radius.topRight}px ${borderConfig.radius.bottomRight}px ${borderConfig.radius.bottomLeft}px`,
  };

  return (
    <div className="border-editor">
      <div className="border-editor-header">
        <h2>CSS Border Editor</h2>
        <p>可视化编辑 CSS 边框样式</p>
      </div>

      <div className="border-editor-content">
        <div className="border-editor-controls">
          <div className="control-group">
            <label>边框宽度 (px)</label>
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
          </div>

          <div className="control-group">
            <label>边框样式</label>
            <select
              value={borderConfig.style}
              onChange={(e) => updateBorderConfig({ style: e.target.value })}
            >
              {borderStyles.map(style => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>边框颜色</label>
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
                placeholder="#000000"
              />
            </div>
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
            </div>

            {isUniformRadius ? (
              <div className="radius-uniform">
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={borderConfig.radius.topLeft}
                  onChange={(e) => updateRadius('topLeft', Number(e.target.value))}
                />
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={borderConfig.radius.topLeft}
                  onChange={(e) => updateRadius('topLeft', Number(e.target.value))}
                  className="number-input"
                />
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
                    onChange={(e) => updateRadius('topLeft', Number(e.target.value))}
                    className="number-input small"
                  />
                </div>
                <div className="radius-corner">
                  <label>右上</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={borderConfig.radius.topRight}
                    onChange={(e) => updateRadius('topRight', Number(e.target.value))}
                    className="number-input small"
                  />
                </div>
                <div className="radius-corner">
                  <label>左下</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={borderConfig.radius.bottomLeft}
                    onChange={(e) => updateRadius('bottomLeft', Number(e.target.value))}
                    className="number-input small"
                  />
                </div>
                <div className="radius-corner">
                  <label>右下</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={borderConfig.radius.bottomRight}
                    onChange={(e) => updateRadius('bottomRight', Number(e.target.value))}
                    className="number-input small"
                  />
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