'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Loader2 } from 'lucide-react'
import type { Location } from '@/types'

interface DeleteLocationDialogProps {
  location: Location
  open: boolean
  onOpenChange: (open: boolean) => void
  onDelete: (id: string) => Promise<void>
  isLoading?: boolean
}

export function DeleteLocationDialog({
  location,
  open,
  onOpenChange,
  onDelete,
  isLoading = false
}: DeleteLocationDialogProps) {
  const handleDelete = async () => {
    try {
      await onDelete(location.id)
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting location:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>Xác nhận xóa vị trí</span>
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa vị trí <strong>{location.name}</strong>?
            <br />
            <br />
            <span className="text-red-600 font-medium">
              Hành động này không thể hoàn tác!
            </span>
            <br />
            <br />
            Thông tin vị trí:
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Địa chỉ: {location.address}</li>
              <li>• Tọa độ: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</li>
              <li>• Bán kính: {location.radius}m</li>
              <li>• Trạng thái: {location.isActive ? 'Hoạt động' : 'Không hoạt động'}</li>
            </ul>
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Xóa vị trí
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
