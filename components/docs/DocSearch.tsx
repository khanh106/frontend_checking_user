'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  X, 
  ExternalLink, 
  Clock, 
  BookOpen,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchResult {
  title: string
  excerpt: string
  url: string
  category: string
  score: number
  type: 'page' | 'section' | 'faq'
}

interface DocSearchProps {
  onResultClick?: (result: SearchResult) => void
  placeholder?: string
  className?: string
}

export function DocSearch({ onResultClick, placeholder = "Tìm kiếm tài liệu...", className }: DocSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)

  const searchData: SearchResult[] = useMemo(() => [], [])

  const popularSearches = [
    "đăng nhập",
    "quên mật khẩu",
    "xuất báo cáo",
    "thêm vị trí",
    "xem lịch sử"
  ]

  // Search function with fuzzy matching
  const performSearch = useCallback((searchQuery: string): SearchResult[] => {
    if (!searchQuery.trim()) return []

    const lowercaseQuery = searchQuery.toLowerCase()
    const words = lowercaseQuery.split(' ').filter(word => word.length > 0)

    return searchData
      .map(item => {
        let score = 0
        const title = item.title.toLowerCase()
        const excerpt = item.excerpt.toLowerCase()
        const category = item.category.toLowerCase()

        // Exact title match gets highest score
        if (title.includes(lowercaseQuery)) {
          score += 1
        }

        // Word matches in title
        words.forEach(word => {
          if (title.includes(word)) score += 0.8
          if (excerpt.includes(word)) score += 0.3
          if (category.includes(word)) score += 0.5
        })

        // Partial matches
        if (score === 0) {
          words.forEach(word => {
            if (title.includes(word.substring(0, 3))) score += 0.2
            if (excerpt.includes(word.substring(0, 3))) score += 0.1
          })
        }

        return { ...item, score }
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
  }, [searchData])

  // Auto-suggestions
  const generateSuggestions = useCallback((searchQuery: string): string[] => {
    if (!searchQuery.trim() || searchQuery.length < 2) return []

    const lowercaseQuery = searchQuery.toLowerCase()
    const matchingSuggestions = searchData
      .filter(item => 
        item.title.toLowerCase().includes(lowercaseQuery) ||
        item.category.toLowerCase().includes(lowercaseQuery)
      )
      .map(item => item.title)
      .slice(0, 5)

    return [...new Set(matchingSuggestions)]
  }, [searchData])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        setIsSearching(true)
        const searchResults = performSearch(query)
        setResults(searchResults)
        setSuggestions(generateSuggestions(query))
        setIsSearching(false)
        setShowResults(true)
      } else {
        setResults([])
        setSuggestions([])
        setShowResults(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, performSearch, generateSuggestions])

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('doc-recent-searches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
    
    // Save to recent searches
    if (searchQuery.trim()) {
      const newRecentSearches = [
        searchQuery,
        ...recentSearches.filter(s => s !== searchQuery)
      ].slice(0, 5)
      
      setRecentSearches(newRecentSearches)
      localStorage.setItem('doc-recent-searches', JSON.stringify(newRecentSearches))
    }
  }

  const handleResultClick = (result: SearchResult) => {
    setShowResults(false)
    setQuery('')
    onResultClick?.(result)
    
    // Navigate to result
    if (result.url.startsWith('#')) {
      document.getElementById(result.url.substring(1))?.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.location.href = result.url
    }
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setShowResults(false)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'faq': return <BookOpen className="w-4 h-4" />
      case 'section': return <BookOpen className="w-4 h-4" />
      default: return <BookOpen className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'faq': return 'FAQ'
      case 'section': return 'Hướng dẫn'
      case 'page': return 'Trang'
      default: return type
    }
  }

  return (
    <div className={cn("relative w-full max-w-2xl", className)}>
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowResults(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search results dropdown */}
      {showResults && (
        <Card className="absolute top-full mt-2 w-full z-50 shadow-lg border">
          <CardContent className="p-0">
            {/* Loading state */}
            {isSearching && (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2 text-sm">Đang tìm kiếm...</p>
              </div>
            )}

            {/* Search results */}
            {!isSearching && results.length > 0 && (
              <div className="max-h-96 overflow-y-auto">
                <div className="p-3 border-b bg-gray-50">
                  <p className="text-sm text-gray-600">
                    Tìm thấy {results.length} kết quả cho &quot;{query}&quot;
                  </p>
                </div>
                {results.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleResultClick(result)}
                    className="w-full text-left p-4 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-blue-500 mt-1">
                        {getTypeIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {result.title}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            {getTypeLabel(result.type)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {result.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {result.excerpt}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No results */}
            {!isSearching && query && results.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="font-medium mb-2">Không tìm thấy kết quả nào</p>
                <p className="text-sm">Hãy thử từ khóa khác hoặc liên hệ hỗ trợ</p>
              </div>
            )}

            {/* Suggestions and popular searches when no query */}
            {!query && (
              <div className="p-4 space-y-4">
                {recentSearches.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Tìm kiếm gần đây
                    </h4>
                    <div className="space-y-1">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearch(search)}
                          className="block w-full text-left px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Tìm kiếm phổ biến
                  </h4>
                  <div className="space-y-1">
                    {popularSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(search)}
                        className="block w-full text-left px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Auto-suggestions */}
            {query && suggestions.length > 0 && results.length === 0 && (
              <div className="p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Có phải bạn muốn tìm:
                </h4>
                <div className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(suggestion)}
                      className="block w-full text-left px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Backdrop to close results */}
      {showResults && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  )
}
