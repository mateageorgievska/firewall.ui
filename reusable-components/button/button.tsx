import React, { ReactNode } from 'react'
import classNames from 'classnames'

type ButtonSize = 'sm' | 'md' | 'lg'
type ButtonColor =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'error'
  | 'success'
  | 'info'
  | 'warning'
  | 'default'

interface ButtonProps {
  children: ReactNode
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  size?: ButtonSize
  pill?: boolean
  outline?: boolean
  disabled?: boolean
  color?: ButtonColor
  block?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string;
}

const colorClasses: Record<ButtonColor, { base: string; outline: string }> = {
  primary: {
    base: 'bg-blue-700 text-white hover:bg-blue-400',
    outline: 'text-blue-700 border border-blue-700 hover:bg-blue-100',
  },
  secondary: {
    base: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'text-gray-600 border border-gray-600 hover:bg-gray-100',
  },
  accent: {
    base: 'bg-purple-600 text-white hover:bg-purple-700',
    outline: 'text-purple-600 border border-purple-600 hover:bg-purple-100',
  },
  error: {
    base: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'text-red-600 border border-red-600 hover:bg-red-100',
  },
  success: {
    base: 'bg-green-600 text-white hover:bg-green-700',
    outline: 'text-green-600 border border-green-600 hover:bg-green-100',
  },
  info: {
    base: 'bg-cyan-600 text-white hover:bg-cyan-700',
    outline: 'text-cyan-600 border border-cyan-600 hover:bg-cyan-100',
  },
  warning: {
    base: 'bg-yellow-500 text-white hover:bg-yellow-600',
    outline: 'text-yellow-500 border border-yellow-500 hover:bg-yellow-100',
  },
  default: {
    base: 'bg-gray-300 text-gray-900 hover:bg-gray-400',
    outline: 'text-gray-600 border border-gray-600 hover:bg-gray-100',
  },
}

export const Button: React.FC<ButtonProps> = ({
  children,
  size = 'md',
  pill = false,
  outline = false,
  disabled = false,
  color = 'primary',
  block = false,
  onClick,
  type = 'button',
  className,
}) => {
  const baseColor = outline ? colorClasses[color].outline : colorClasses[color].base
  const sizeClasses =
    size === 'sm'
      ? 'text-sm px-3 py-1.5'
      : size === 'lg'
      ? 'text-lg px-5 py-3'
      : 'text-base px-4 py-2'

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={classNames(
        'inline-flex items-center justify-center font-medium transition rounded shadow-sm disabled:opacity-50 disabled:cursor-not-allowed',
        pill && 'rounded-full',
        block && 'w-full',
        baseColor,
        sizeClasses,
        className  
      )}
    >
      {children}
    </button>
  )
}
