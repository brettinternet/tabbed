import type {
  DraggableSyntheticListeners,
  UniqueIdentifier,
} from '@dnd-kit/core'
import type { Transform } from '@dnd-kit/utilities'
import classNames from 'classnames'
import { motion } from 'framer-motion'
import { useEffect, forwardRef, memo } from 'react'

const styles = {} as any

export interface Props {
  id: UniqueIdentifier
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
  listeners?: DraggableSyntheticListeners
  sorting?: boolean
  style?: React.CSSProperties
  transition?: string | null
  wrapperStyle?: React.CSSProperties
  value: React.ReactNode
  onRemove?(): void
  sortProps?: any
  renderItem?(args: {
    dragOverlay: boolean
    dragging: boolean
    sorting: boolean
    index: number | undefined
    fadeIn: boolean
    listeners: DraggableSyntheticListeners
    ref: React.Ref<HTMLElement>
    style: React.CSSProperties | undefined
    transform: Props['transform']
    transition: Props['transition']
    value: Props['value']
  }): React.ReactElement
}

export const Item = memo(
  forwardRef<HTMLLIElement, Props>(
    (
      {
        id,
        color,
        dragOverlay,
        dragging,
        disabled,
        fadeIn,
        handle,
        handleProps,
        height,
        index,
        listeners,
        onRemove,
        renderItem,
        sorting,
        style,
        transition,
        transform,
        value,
        sortProps,
        wrapperStyle,
        ...props
      },
      ref
    ) => {
      useEffect(() => {
        if (!dragOverlay) {
          return
        }
        console.log('id', id)
        document.body.style.cursor = 'grabbing'
        return () => {
          document.body.style.cursor = ''
        }
      }, [dragOverlay])

      return (
        <motion.li
          className={classNames('relative h-20 w-72 list-none mb-2')}
          layoutId={id.toString() + dragOverlay ? 'overlay' : 'item'}
          style={style}
          animate={
            transform
              ? {
                  x: transform.x,
                  y: transform.y,
                  zIndex: dragging ? 1 : 0,
                }
              : { x: 0, y: 0 }
          }
          transition={{
            duration: !dragging ? 0.25 : 0,
            easings: {
              type: 'spring',
            },
            zIndex: {
              delay: dragging ? 0 : 0.25,
            },
          }}
          // style={
          // {
          //   ...wrapperStyle,
          //   transition: [transition, wrapperStyle?.transition]
          //     .filter(Boolean)
          //     .join(', '),
          //   '--translate-x': transform
          //     ? `${Math.round(transform.x)}px`
          //     : undefined,
          //   '--translate-y': transform
          //     ? `${Math.round(transform.y)}px`
          //     : undefined,
          //   '--scale-x': transform?.scaleX
          //     ? `${transform.scaleX}`
          //     : undefined,
          //   '--scale-y': transform?.scaleY
          //     ? `${transform.scaleY}`
          //     : undefined,
          //   '--index': index,
          //   '--color': color,
          // } as React.CSSProperties
          // }
          ref={ref}
        >
          <div
            className={classNames(
              'h-20 w-72 p-4 border border-gray-300 bg-indigo-100',
              dragging && 'opacity-0',
              styles.Item,
              dragging && styles.dragging,
              handle && styles.withHandle,
              dragOverlay && styles.dragOverlay,
              disabled && styles.disabled,
              color && styles.color
            )}
            data-cypress="draggable-item"
            {...sortProps}
            {...props}
            tabIndex={!handle ? 0 : undefined}
          >
            {value}
            <span className={styles.Actions}>
              {onRemove ? <button onClick={onRemove}>x</button> : null}
            </span>
          </div>
        </motion.li>
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
        className={classNames(
          'mx-4 w-72 h-window-column flex flex-col',
          styles.Container,
          unstyled && styles.unstyled,
          horizontal && styles.horizontal,
          hover && styles.hover,
          placeholder && styles.placeholder,
          scrollable && styles.scrollable,
          shadow && styles.shadow
        )}
        onClick={onClick}
        tabIndex={onClick ? 0 : undefined}
        {...handleProps}
      >
        {label ? (
          <div className={styles.Header}>
            {label}
            <div className={styles.Actions}>
              {onRemove ? <button onClick={onRemove}>x</button> : undefined}
            </div>
          </div>
        ) : null}
        {placeholder ? (
          children
        ) : (
          <ul className="overflow-y-auto overflow-x-hidden flex flex-col justify-start items-start h-full">
            {children}
          </ul>
        )}
      </div>
    )
  }
)
