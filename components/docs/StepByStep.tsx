'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  id: string
  title: string
  content: React.ReactNode
  image?: string
  video?: string
}

interface StepByStepProps {
  steps: Step[]
  onComplete?: () => void
}

export function StepByStep({ steps, onComplete }: StepByStepProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  const handleStepComplete = (stepId: string, checked: boolean) => {
    const newCompleted = new Set(completedSteps)
    if (checked) {
      newCompleted.add(stepId)
    } else {
      newCompleted.delete(stepId)
    }
    setCompletedSteps(newCompleted)

    if (newCompleted.size === steps.length && onComplete) {
      onComplete()
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (index: number) => {
    setCurrentStep(index)
  }

  const currentStepData = steps[currentStep]
  const isCompleted = completedSteps.has(currentStepData.id)

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">
            Bước {currentStep + 1} / {steps.length}
          </span>
          <span className="text-sm text-gray-600">
            Hoàn thành: {completedSteps.size}/{steps.length}
          </span>
        </div>
        <div className="flex space-x-2">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => goToStep(index)}
              className={cn(
                "flex-1 h-2 rounded-full transition-colors",
                index === currentStep
                  ? "bg-blue-500"
                  : completedSteps.has(step.id)
                  ? "bg-green-500"
                  : index < currentStep
                  ? "bg-gray-400"
                  : "bg-gray-200"
              )}
            />
          ))}
        </div>
      </div>

      {/* Step navigation */}
      <div className="mb-4">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => goToStep(index)}
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors",
                index === currentStep
                  ? "bg-blue-100 text-blue-700 border border-blue-300"
                  : completedSteps.has(step.id)
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {completedSteps.has(step.id) && (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>{step.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Current step content */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{currentStepData.title}</span>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`step-${currentStepData.id}`}
                checked={isCompleted}
                onCheckedChange={(checked) => 
                  handleStepComplete(currentStepData.id, checked as boolean)
                }
              />
              <label 
                htmlFor={`step-${currentStepData.id}`}
                className="text-sm text-gray-600 cursor-pointer"
              >
                Đánh dấu hoàn thành
              </label>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            {currentStepData.content}
          </div>
          
          {currentStepData.image && (
            <div className="mt-4">
              <Image
                src={currentStepData.image}
                alt={currentStepData.title}
                width={800}
                height={600}
                className="w-full rounded-lg shadow-md"
              />
            </div>
          )}
          
          {currentStepData.video && (
            <div className="mt-4">
              <video
                src={currentStepData.video}
                controls
                className="w-full rounded-lg shadow-md"
              >
                Trình duyệt của bạn không hỗ trợ video.
              </video>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Bước trước
        </Button>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {currentStep + 1} / {steps.length}
          </span>
        </div>

        <Button
          onClick={nextStep}
          disabled={currentStep === steps.length - 1}
        >
          Bước tiếp
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Completion message */}
      {completedSteps.size === steps.length && (
        <Card className="mt-6 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Chúc mừng! Bạn đã hoàn thành tất cả các bước
              </h3>
              <p className="text-green-700">
                Bạn đã nắm vững cách sử dụng tính năng này. Hãy thử áp dụng vào thực tế!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
