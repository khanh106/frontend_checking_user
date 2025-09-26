'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  ThumbsUp, 
  ThumbsDown,
  MessageCircle 
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  helpful: number
  notHelpful: number
  tags?: string[]
}

interface FAQSectionProps {
  faqs: FAQ[]
  categories?: string[]
}

export function FAQSection({ faqs, categories = [] }: FAQSectionProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [feedback, setFeedback] = useState<Record<string, 'helpful' | 'not-helpful' | null>>({})

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const handleFeedback = (faqId: string, type: 'helpful' | 'not-helpful') => {
    setFeedback(prev => ({
      ...prev,
      [faqId]: prev[faqId] === type ? null : type
    }))
  }

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const allCategories = ['all', ...new Set(faqs.map(faq => faq.category)), ...categories]

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Search and filter */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Tìm kiếm câu hỏi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {allCategories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'Tất cả' : category}
            </Button>
          ))}
        </div>
      </div>

      {/* FAQ Results */}
      <div className="space-y-4">
        {filteredFAQs.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Không tìm thấy câu hỏi nào phù hợp với từ khóa tìm kiếm.</p>
              <p className="text-sm mt-2">Hãy thử từ khóa khác hoặc liên hệ hỗ trợ.</p>
            </CardContent>
          </Card>
        ) : (
          filteredFAQs.map(faq => {
            const isExpanded = expandedItems.has(faq.id)
            const userFeedback = feedback[faq.id]

            return (
              <Card key={faq.id} className="transition-shadow hover:shadow-md">
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => toggleExpanded(faq.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-medium text-gray-900">
                        {faq.question}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {faq.category}
                        </Badge>
                        {faq.tags?.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="ml-4">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent>
                    <div className="prose max-w-none text-gray-700 mb-4">
                      {faq.answer}
                    </div>

                    {/* Feedback section */}
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          Câu trả lời này có hữu ích không?
                        </p>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFeedback(faq.id, 'helpful')}
                              className={cn(
                                "p-2",
                                userFeedback === 'helpful' 
                                  ? "text-green-600 bg-green-50" 
                                  : "text-gray-400 hover:text-green-600"
                              )}
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </Button>
                            <span className="text-sm text-gray-500">
                              {faq.helpful}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFeedback(faq.id, 'not-helpful')}
                              className={cn(
                                "p-2",
                                userFeedback === 'not-helpful' 
                                  ? "text-red-600 bg-red-50" 
                                  : "text-gray-400 hover:text-red-600"
                              )}
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </Button>
                            <span className="text-sm text-gray-500">
                              {faq.notHelpful}
                            </span>
                          </div>
                        </div>
                      </div>

                      {userFeedback && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            {userFeedback === 'helpful' 
                              ? "Cảm ơn bạn đã đánh giá! Chúng tôi rất vui vì câu trả lời này hữu ích."
                              : "Cảm ơn phản hồi của bạn. Chúng tôi sẽ cải thiện câu trả lời này."
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })
        )}
      </div>

      {/* Contact support */}
      <Card className="mt-8 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-blue-900 mb-2">
              Không tìm thấy câu trả lời?
            </h3>
            <p className="text-blue-800 mb-4">
              Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn
            </p>
            <Button variant="outline" className="border-blue-300 text-blue-700">
              Liên hệ hỗ trợ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
