'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Play, 
  Code, 
  Eye, 
  ExternalLink, 
  Copy, 
  Check,
  Lightbulb
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CodeExample {
  language: string
  code: string
  title?: string
}

interface Feature {
  id: string
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  demoUrl?: string
  codeExamples?: CodeExample[]
  interactive?: React.ReactNode
  tips?: string[]
}

interface FeatureShowcaseProps {
  features: Feature[]
}

export function FeatureShowcase({ features }: FeatureShowcaseProps) {
  const [activeFeature, setActiveFeature] = useState(features[0]?.id)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCode(id)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const activeFeatureData = features.find(f => f.id === activeFeature)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Cơ bản'
      case 'intermediate': return 'Trung bình'
      case 'advanced': return 'Nâng cao'
      default: return difficulty
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Feature selector */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Tính năng nổi bật</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(feature => (
            <Card 
              key={feature.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                activeFeature === feature.id 
                  ? "ring-2 ring-blue-500 border-blue-300" 
                  : "border-gray-200"
              )}
              onClick={() => setActiveFeature(feature.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                  <Badge 
                    className={getDifficultyColor(feature.difficulty)}
                    variant="secondary"
                  >
                    {getDifficultyLabel(feature.difficulty)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {feature.description}
                </p>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Active feature detail */}
      {activeFeatureData && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{activeFeatureData.title}</CardTitle>
                <p className="text-gray-600 mt-2">{activeFeatureData.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getDifficultyColor(activeFeatureData.difficulty)}>
                  {getDifficultyLabel(activeFeatureData.difficulty)}
                </Badge>
                <Badge variant="outline">{activeFeatureData.category}</Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="demo" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="demo" className="flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>Demo</span>
                </TabsTrigger>
                <TabsTrigger value="code" className="flex items-center space-x-2">
                  <Code className="w-4 h-4" />
                  <span>Code</span>
                </TabsTrigger>
                <TabsTrigger value="interactive" className="flex items-center space-x-2">
                  <Play className="w-4 h-4" />
                  <span>Thử nghiệm</span>
                </TabsTrigger>
                <TabsTrigger value="tips" className="flex items-center space-x-2">
                  <Lightbulb className="w-4 h-4" />
                  <span>Tips</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="demo" className="mt-6">
                {activeFeatureData.demoUrl ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Demo trực tiếp</h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(activeFeatureData.demoUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Mở trong tab mới
                      </Button>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                      <iframe
                        src={activeFeatureData.demoUrl}
                        className="w-full h-96"
                        title={`Demo: ${activeFeatureData.title}`}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Demo chưa có sẵn cho tính năng này</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="code" className="mt-6">
                {activeFeatureData.codeExamples && activeFeatureData.codeExamples.length > 0 ? (
                  <div className="space-y-4">
                    {activeFeatureData.codeExamples.map((example, index) => (
                      <div key={index}>
                        {example.title && (
                          <h4 className="font-semibold mb-2">{example.title}</h4>
                        )}
                        <div className="relative">
                          <div className="absolute top-3 right-3 z-10">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(example.code, `${activeFeatureData.id}-${index}`)}
                              className="bg-gray-800 text-white hover:bg-gray-700"
                            >
                              {copiedCode === `${activeFeatureData.id}-${index}` ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                            <code>{example.code}</code>
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Code className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Code examples chưa có sẵn cho tính năng này</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="interactive" className="mt-6">
                {activeFeatureData.interactive ? (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Thử nghiệm tương tác</h3>
                    <div className="border rounded-lg p-6 bg-gray-50">
                      {activeFeatureData.interactive}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Play className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Phần tương tác chưa có sẵn cho tính năng này</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="tips" className="mt-6">
                {activeFeatureData.tips && activeFeatureData.tips.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                      Tips & Tricks
                    </h3>
                    <div className="space-y-3">
                      {activeFeatureData.tips.map((tip, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                          <div className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-yellow-800 text-sm font-semibold flex-shrink-0 mt-0.5">
                            {index + 1}
                          </div>
                          <p className="text-yellow-800">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Tips chưa có sẵn cho tính năng này</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
