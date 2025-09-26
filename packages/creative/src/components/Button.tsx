import React from 'react';
import './Button.css';

export type ButtonVariant = 'default' | 'primary' | 'secondary' | 'danger' | 'warning';
export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonState = 'default' | 'active' | 'disabled';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * 按钮变体样式
   */
  variant?: ButtonVariant;
  
  /**
   * 按钮尺寸
   */
  size?: ButtonSize;
  
  /**
   * 按钮状态
   */
  state?: ButtonState;
  
  /**
   * 是否为激活状态
   */
  active?: boolean;
  
  /**
   * 按钮图标（可选）
   */
  icon?: React.ReactNode;
  
  /**
   * 图标位置
   */
  iconPosition?: 'left' | 'right';
  
  /**
   * 是否为块级按钮（占满宽度）
   */
  block?: boolean;
  
  /**
   * 是否显示加载状态
   */
  loading?: boolean;
  
  /**
   * 子元素
   */
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'medium',
  state = 'default',
  active = false,
  icon,
  iconPosition = 'left',
  block = false,
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}) => {
  // 确定最终的禁用状态
  const isDisabled = disabled || state === 'disabled' || loading;
  
  // 确定最终的激活状态
  const isActive = active || state === 'active';
  
  // 构建CSS类名
  const classNames = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    isActive && 'btn-active',
    isDisabled && 'btn-disabled',
    block && 'btn-block',
    loading && 'btn-loading',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classNames}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <span className="btn-loading-spinner" />
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="btn-icon btn-icon-left">{icon}</span>
      )}
      
      {children && (
        <span className="btn-content">{children}</span>
      )}
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="btn-icon btn-icon-right">{icon}</span>
      )}
    </button>
  );
};

export default Button;