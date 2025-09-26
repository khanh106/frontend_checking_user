'use client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LocationForm } from './LocationForm'
import type { Location } from '@/types'
import type { LocationFormData } from '@/lib/validators'

interface EditLocationDialogProps {
  location: Location
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (data: LocationFormData) => Promise<void>
  isLoading?: boolean
}

export function EditLocationDialog({
  location,
  open,
  onOpenChange,
  onUpdate,
  isLoading = false
}: EditLocationDialogProps) {
  const handleSubmit = async (data: LocationFormData) => {
    try {
      await onUpdate(data)
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating location:', error)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa vị trí</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin cho vị trí: {location.name}
          </DialogDescription>
        </DialogHeader>
        <LocationForm
          location={location}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
}
