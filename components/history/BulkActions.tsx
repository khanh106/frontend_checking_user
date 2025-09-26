'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Edit, Trash2, X } from 'lucide-react'

interface BulkActionsProps {
  selectedCount: number
  onAction: (action: string) => void
  onClear: () => void
}

export function BulkActions({ selectedCount, onAction, onClear }: BulkActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="gap-1">
        {selectedCount} đã chọn
      </Badge>
      
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAction('export')}
          className="gap-1"
        >
          <Download className="h-4 w-4" />
          Xuất
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAction('edit')}
          className="gap-1"
        >
          <Edit className="h-4 w-4" />
          Sửa ghi chú
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAction('delete')}
          className="gap-1 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Xóa
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="gap-1"
        >
          <X className="h-4 w-4" />
          Bỏ chọn
        </Button>
      </div>
    </div>
  )
}
