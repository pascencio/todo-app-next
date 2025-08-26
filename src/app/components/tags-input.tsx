"use client"

import React, { useState, useRef, KeyboardEvent, forwardRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TagsInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (tags: string[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  maxTags?: number
  allowDuplicates?: boolean
  separators?: string[]
}

const TagsInput = forwardRef<HTMLInputElement, TagsInputProps>(
  ({
    value,
    defaultValue = [],
    onValueChange,
    placeholder = "Agregar etiquetas...",
    className,
    disabled = false,
    maxTags,
    allowDuplicates = false,
    separators = [',', ';', 'Enter'],
    ...props
  }, ref) => {
    const [tags, setTags] = useState<string[]>(value || defaultValue)
    const [inputValue, setInputValue] = useState('')
    const internalInputRef = useRef<HTMLInputElement>(null)

    // Combine refs - use forwarded ref if provided, otherwise use internal ref
    const inputRef = (ref as React.RefObject<HTMLInputElement>) || internalInputRef

    const currentTags = value || tags

    const updateTags = (newTags: string[]) => {
      if (!value) {
        setTags(newTags)
      }
      onValueChange?.(newTags)
    }

    const addTag = (tag: string) => {
      const trimmedTag = tag.trim()
      if (!trimmedTag) return

      if (!allowDuplicates && currentTags.includes(trimmedTag)) return
      if (maxTags && currentTags.length >= maxTags) return

      const newTags = [...currentTags, trimmedTag]
      updateTags(newTags)
      setInputValue('')
    }

    const removeTag = (indexToRemove: number) => {
      const newTags = currentTags.filter((_, index) => index !== indexToRemove)
      updateTags(newTags)
    }

    const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return

      const target = e.target as HTMLInputElement
      const trimmedValue = target.value.trim()

      // Handle separators
      if (separators.includes(e.key) || (e.key === 'Enter' && separators.includes('Enter'))) {
        e.preventDefault()
        if (trimmedValue) {
          addTag(trimmedValue)
        }
        return
      }

      // Handle backspace to remove last tag
      if (e.key === 'Backspace' && !target.value && currentTags.length > 0) {
        e.preventDefault()
        removeTag(currentTags.length - 1)
        return
      }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      
      // Check for separators in the pasted/typed content
      const lastChar = newValue.slice(-1)
      if (separators.includes(lastChar) && lastChar !== 'Enter') {
        const tagValue = newValue.slice(0, -1).trim()
        if (tagValue) {
          addTag(tagValue)
        }
        return
      }

      setInputValue(newValue)
    }

    const handleContainerClick = () => {
      inputRef?.current?.focus()
    }

    const handleInputBlur = () => {
      if (inputValue.trim()) {
        addTag(inputValue.trim())
      }
    }

    return (
      <div
        className={cn(
          "flex min-h-10 w-full rounded-md border border-input bg-background text-sm ring-offset-background",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        onClick={handleContainerClick}
      >
        <div className="flex flex-wrap items-center gap-1 p-2 w-full">
          {currentTags.map((tag, index) => (
            <div
              key={`${tag}-${index}`}
              className={cn(
                "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors",
                "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              )}
            >
              <span className="max-w-xs truncate">{tag}</span>
              {!disabled && (
                <button
                  type="button"
                  className={cn(
                    "ml-1 rounded-sm hover:bg-secondary-foreground/20 focus:bg-secondary-foreground/20",
                    "focus:outline-none focus:ring-1 focus:ring-ring"
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    removeTag(index)
                  }}
                  aria-label={`Eliminar ${tag}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onBlur={handleInputBlur}
            placeholder={currentTags.length === 0 ? placeholder : ''}
            disabled={disabled || (maxTags ? currentTags.length >= maxTags : false)}
            className={cn(
              "flex-1 bg-transparent outline-none placeholder:text-muted-foreground",
              "min-w-[120px] px-1 py-0.5",
              disabled && "cursor-not-allowed"
            )}
            {...props}
          />
        </div>
      </div>
    )
  }
)

TagsInput.displayName = "TagsInput"

export { TagsInput }
