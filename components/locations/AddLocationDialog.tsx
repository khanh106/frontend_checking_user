'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { LocationForm } from './LocationForm'
import type { LocationFormData } from '@/lib/validators'

interface AddLocationDialogProps {
  onAdd: (data: LocationFormData) => Promise<void>
  isLoading?: boolean
}

export function AddLocationDialog({ onAdd, isLoading = false }: AddLocationDialogProps) {
  const [open, setOpen] = useState(false)

  const handleSubmit = async (data: LocationFormData) => {
    try {
      await onAdd(data)
      setOpen(false)
    } catch (error) {
      console.error('Error adding location:', error)
    }
  }

  const handleCancel = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Thêm vị trí
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm vị trí mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin chi tiết để tạo vị trí chấm công mới
          </DialogDescription>
        </DialogHeader>
        <LocationForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
}
