import type { Transform } from '@dnd-kit/utilities'
import { CSS } from '@dnd-kit/utilities'
import classNames from 'classnames'
import { useEffect, forwardRef, memo } from 'react'

const styles = {} as any

export interface Props {
  dragOverlay?: boolean
  color?: string
  disabled?: boolean
  dragging?: boolean
  handle?: boolean
  handleProps?: any
  height?: number
  index?: number
  fadeIn?: boolean
  transform?: Transform | null
  props?: React.HTMLProps<any>
  sorting?: boolean
  style?: React.CSSProperties
  transition?: string | null
  wrapperStyle?: React.CSSProperties
  value: React.ReactNode
  onRemove?(): void
}

export const Item = memo(
  forwardRef<any, Props>(
    (
      {
        color,
        dragOverlay,
        dragging,
        disabled,
        fadeIn,
        handle,
        handleProps,
        height,
        index,
        onRemove,
        sorting,
        style,
        transition,
        transform,
        value,
        wrapperStyle,
        props: outerProps,
        ...props
      },
      ref
    ) => {
      useEffect(() => {
        if (!dragOverlay) {
          return
        }
        document.body.style.cursor = 'grabbing'
        return () => {
          document.body.style.cursor = ''
        }
      }, [dragOverlay])

      return (
        <li className={classNames('list-none')} ref={ref}>
          <div
            style={{
              ...wrapperStyle,
            }}
            {...props}
          >
            <div
              style={style}
              {...outerProps}
              className={classNames(
                'mb-2 h-20 w-72 p-4 border border-gray-300 bg-indigo-100',
                dragging && 'opacity-0'
              )}
            >
              {value}
              {onRemove ? <button onClick={onRemove}>x</button> : null}
            </div>
          </div>
        </li>
      )
    }
  )
)

////////////// container

export interface ContainerProps {
  children: React.ReactNode
  columns?: number
  label?: string
  style?: React.CSSProperties
  horizontal?: boolean
  hover?: boolean
  handleProps?: React.HTMLAttributes<any>
  scrollable?: boolean
  shadow?: boolean
  placeholder?: boolean
  unstyled?: boolean
  onClick?(): void
  onRemove?(): void
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      children,
      columns = 1,
      handleProps,
      horizontal,
      hover,
      onClick,
      onRemove,
      label,
      placeholder,
      style,
      scrollable,
      shadow,
      unstyled,
      ...props
    },
    ref
  ) => {
    return (
      <div
        {...props}
        ref={ref}
        style={
          {
            ...style,
            '--columns': columns,
          } as React.CSSProperties
        }
        className={classNames('mx-2 w-72 h-window-column flex flex-col')}
        onClick={onClick}
        tabIndex={onClick ? 0 : undefined}
        {...(placeholder ? {} : handleProps)}
      >
        {label ? (
          <div>
            {label}
            <div>
              {onRemove ? <button onClick={onRemove}>x</button> : undefined}
            </div>
          </div>
        ) : null}
        {placeholder ? (
          <div className="w-72">{children}</div>
        ) : (
          <ul className="overflow-y-auto overflow-x-hidden flex flex-col justify-start items-start h-full">
            {children}
          </ul>
        )}
      </div>
    )
  }
)
