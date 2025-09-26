'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  ChevronRight, 
  ChevronDown, 
  BookOpen, 
  Clock,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TOCItem {
  id: string
  title: string
  level: number
  children?: TOCItem[]
  anchor?: string
}

interface TableOfContentsProps {
  items: TOCItem[]
  className?: string
  showProgress?: boolean
  showReadingTime?: boolean
  sticky?: boolean
}

export function TableOfContents({ 
  items, 
  className, 
  showProgress = true, 
  showReadingTime = true,
  sticky = true 
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [readProgress, setReadProgress] = useState(0)
  const [readingTime, setReadingTime] = useState(0)
  const [visitedItems, setVisitedItems] = useState<Set<string>>(new Set())
  const [isVisible, setIsVisible] = useState(true)

  // Calculate reading time on mount
  useEffect(() => {
    const calculateReadingTime = () => {
      const content = document.querySelector('article') || document.body
      const text = content.textContent || ''
      const wordsPerMinute = 200
      const words = text.trim().split(/\s+/).length
      const time = Math.ceil(words / wordsPerMinute)
      setReadingTime(time)
    }

    calculateReadingTime()
  }, [])

  // Track scroll position and active section
  useEffect(() => {
    const handleScroll = () => {
      // Calculate reading progress
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (scrollTop / docHeight) * 100
      setReadProgress(Math.min(100, Math.max(0, progress)))

      // Find active section
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
      let activeHeading = ''

      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect()
        if (rect.top <= 100) {
          activeHeading = heading.id
        }
      })

      if (activeHeading) {
        setActiveId(activeHeading)
        setVisitedItems(prev => new Set([...prev, activeHeading]))
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial check

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-expand parent items of active section
  useEffect(() => {
    if (activeId) {
      const findParents = (items: TOCItem[], targetId: string, parents: string[] = []): string[] => {
        for (const item of items) {
          if (item.id === targetId) {
            return parents
          }
          if (item.children) {
            const result = findParents(item.children, targetId, [...parents, item.id])
            if (result.length > 0) {
              return result
            }
          }
        }
        return []
      }

      const parentIds = findParents(items, activeId)
      setExpandedItems(prev => new Set([...prev, ...parentIds]))
    }
  }, [activeId, items])

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const scrollToSection = (anchor: string) => {
    const element = document.getElementById(anchor)
    if (element) {
      const offset = 80 // Account for fixed header
      const elementPosition = element.offsetTop - offset
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
  }

  const renderTOCItem = (item: TOCItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.has(item.id)
    const isActive = activeId === item.id
    const isVisited = visitedItems.has(item.id)
    const anchor = item.anchor || item.id

    return (
      <li key={item.id} className="relative">
        <div
          className={cn(
            "flex items-center py-2 px-3 rounded-lg transition-all duration-200 cursor-pointer group",
            depth > 0 && "ml-4 border-l border-gray-200 dark:border-gray-700 pl-4",
            isActive 
              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-l-2 border-blue-500" 
              : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
            isVisited && !isActive && "text-gray-500 dark:text-gray-400"
          )}
        >
          {/* Expand/collapse button */}
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                toggleExpanded(item.id)
              }}
              className="p-1 h-6 w-6 mr-2"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </Button>
          )}

          {/* TOC item content */}
          <button
            onClick={() => scrollToSection(anchor)}
            className="flex-1 text-left flex items-center space-x-2"
          >
            {/* Level indicator */}
            <div
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                isActive 
                  ? "bg-blue-500" 
                  : isVisited 
                  ? "bg-green-400" 
                  : "bg-gray-300 dark:bg-gray-600"
              )}
            />

            {/* Title */}
            <span className={cn(
              "text-sm truncate",
              isActive && "font-medium"
            )}>
              {item.title}
            </span>

            {/* Status indicators */}
            <div className="flex items-center space-x-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
              {isVisited && !isActive && (
                <CheckCircle className="w-3 h-3 text-green-500" />
              )}
            </div>
          </button>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <ul className="mt-1 space-y-1">
            {item.children!.map(child => renderTOCItem(child, depth + 1))}
          </ul>
        )}
      </li>
    )
  }

  const completedItems = items.filter(item => visitedItems.has(item.id)).length
  const totalItems = items.length

  return (
    <div className={cn(
      "w-full max-w-sm",
      sticky && "sticky top-20 h-fit",
      className
    )}>
      <Card className="shadow-sm border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Mục lục
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(!isVisible)}
              className="p-2 h-8 w-8"
            >
              {isVisible ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Reading stats */}
          {isVisible && (
            <div className="space-y-3 pt-2">
              {/* Reading progress */}
              {showProgress && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Tiến độ đọc</span>
                    <span>{Math.round(readProgress)}%</span>
                  </div>
                  <Progress value={readProgress} className="h-2" />
                </div>
              )}

              {/* Reading time and completion */}
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                {showReadingTime && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{readingTime} phút đọc</span>
                  </div>
                )}
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span>{completedItems}/{totalItems}</span>
                </div>
              </div>
            </div>
          )}
        </CardHeader>

        {isVisible && (
          <CardContent className="pt-0">
            <nav>
              <ul className="space-y-1 max-h-96 overflow-y-auto">
                {items.map(item => renderTOCItem(item))}
              </ul>
            </nav>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
