'use client'

import { useState } from 'react'
import { HistoryFilters } from '@/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import { exportAttendanceHistory, bulkExportRecords } from '@/lib/api/history'
import { toast } from 'sonner'

interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
  filters: HistoryFilters
  totalRecords: number
  selectedRecords?: string[]
}

const exportFormats = [
  { value: 'csv', label: 'CSV', icon: FileText, description: 'Tệp CSV có thể mở bằng Excel' },
  { value: 'excel', label: 'Excel', icon: FileSpreadsheet, description: 'Tệp Excel với định dạng đẹp' }
]

export function ExportDialog({ 
  isOpen, 
  onClose, 
  filters, 
  totalRecords, 
  selectedRecords = [] 
}: ExportDialogProps) {
  const [format, setFormat] = useState<'csv' | 'excel'>('excel')
  const [exportSelectedOnly, setExportSelectedOnly] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      let blob: Blob
      
      if (exportSelectedOnly && selectedRecords.length > 0) {
        blob = await bulkExportRecords(selectedRecords, format)
      } else {
        blob = await exportAttendanceHistory(filters, format)
      }
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `attendance-history-${timestamp}.${format === 'csv' ? 'csv' : 'xlsx'}`
      
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Xuất dữ liệu thành công!')
      onClose()
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Có lỗi xảy ra khi xuất dữ liệu')
    } finally {
      setIsExporting(false)
    }
  }

  const getExportCount = () => {
    if (exportSelectedOnly && selectedRecords.length > 0) {
      return selectedRecords.length
    }
    return totalRecords
  }

  const getExportDescription = () => {
    const count = getExportCount()
    if (exportSelectedOnly && selectedRecords.length > 0) {
      return `Xuất ${count} bản ghi đã chọn`
    }
    return `Xuất tất cả ${count} bản ghi`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Xuất dữ liệu chấm công
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="format">Định dạng file</Label>
              <Select value={format} onValueChange={(value: 'csv' | 'excel') => setFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {exportFormats.map((fmt) => (
                    <SelectItem key={fmt.value} value={fmt.value}>
                      <div className="flex items-center gap-2">
                        <fmt.icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{fmt.label}</div>
                          <div className="text-xs text-muted-foreground">{fmt.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedRecords.length > 0 && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="export-selected"
                  checked={exportSelectedOnly}
                  onCheckedChange={(checked) => setExportSelectedOnly(checked as boolean)}
                />
                <Label htmlFor="export-selected" className="text-sm">
                  Chỉ xuất các bản ghi đã chọn ({selectedRecords.length} bản ghi)
                </Label>
              </div>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Thông tin xuất dữ liệu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Số bản ghi:</span>
                <span className="font-medium">{getExportCount()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Định dạng:</span>
                <span className="font-medium">
                  {exportFormats.find(f => f.value === format)?.label}
                </span>
              </div>
              {filters.dateFrom && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Từ ngày:</span>
                  <span className="font-medium">
                    {filters.dateFrom.toLocaleDateString('vi-VN')}
                  </span>
                </div>
              )}
              {filters.dateTo && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Đến ngày:</span>
                  <span className="font-medium">
                    {filters.dateTo.toLocaleDateString('vi-VN')}
                  </span>
                </div>
              )}
              {filters.status && filters.status.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Trạng thái:</span>
                  <span className="font-medium">
                    {filters.status.join(', ')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isExporting}>
              Hủy
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xuất...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Xuất dữ liệu
                </>
              )}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            {getExportDescription()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
