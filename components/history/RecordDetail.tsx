'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AttendanceRecord } from '@/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MapPin, Clock, Calendar, User, Camera, Download, Edit, Save, X } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { updateAttendanceNotes } from '@/lib/api/history'

interface RecordDetailProps {
  record: AttendanceRecord | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (record: AttendanceRecord) => void
}


export function RecordDetail({ record, isOpen, onClose, onEdit }: RecordDetailProps) {
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [notes, setNotes] = useState((record as { notes?: string })?.notes || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveNotes = async () => {
    if (!record) return
    
    setIsSaving(true)
    try {
      await updateAttendanceNotes(record.id.toString(), notes)
      setIsEditingNotes(false)
      if (onEdit) {
        onEdit({ ...record, notes } as AttendanceRecord)
      }
    } catch (error) {
      console.error('Failed to update notes:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setNotes((record as { notes?: string })?.notes || '')
    setIsEditingNotes(false)
  }

  const formatTime = (date: Date) => {
    return format(new Date(date), 'HH:mm:ss', { locale: vi })
  }

  const formatDateTime = (date: Date) => {
    return format(new Date(date), 'dd/MM/yyyy HH:mm:ss', { locale: vi })
  }


  if (!record) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Chi tiết chấm công - {format(new Date((record as { date?: string })?.date || (record as { checkInTime?: string })?.checkInTime || new Date()), 'dd/MM/yyyy', { locale: vi })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Thời gian
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thời gian:</span>
                  <span className="font-medium">{formatTime(new Date(record.createdAt))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Loại:</span>
                  <span className="font-medium">
                    {record.type === 'CHECK_IN' ? 'Check In' : 'Check Out'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Vị trí
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Địa chỉ:</span>
                  <span className="font-medium text-right flex-1 ml-4">{record.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tọa độ:</span>
                  <span className="font-medium">{record.lat}, {record.lng}</span>
                </div>
                {record.Location && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vị trí:</span>
                    <span className="font-medium text-green-600">{record.Location.name}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trạng thái</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge 
                  className={cn(
                    "text-white text-lg px-3 py-1",
                    record.type === 'CHECK_IN' ? 'bg-green-600' : 'bg-blue-600'
                  )}
                >
                  {record.type === 'CHECK_IN' ? 'Check In' : 'Check Out'}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Thông tin khác
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-medium">#{record.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User ID:</span>
                  <span className="font-medium">{record.userId}</span>
                </div>
                {record.locationId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location ID:</span>
                    <span className="font-medium">{record.locationId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tạo lúc:</span>
                  <span className="font-medium text-sm">
                    {formatDateTime(new Date(record.createdAt))}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Ghi chú</CardTitle>
                {!isEditingNotes && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingNotes(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Chỉnh sửa
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditingNotes ? (
                <div className="space-y-3">
                  <Label htmlFor="notes">Ghi chú</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Nhập ghi chú..."
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveNotes}
                      disabled={isSaving}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? 'Đang lưu...' : 'Lưu'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Hủy
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Không có ghi chú
                </p>
              )}
            </CardContent>
          </Card>

          {record.imageUri && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Ảnh chấm công
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Image
                    src={record.imageUri}
                    alt="Ảnh chấm công"
                    width={400}
                    height={300}
                    className="w-full max-w-md rounded-lg border"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = record.imageUri!
                      link.download = `attendance-${record.id}.jpg`
                      link.click()
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Tải xuống
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

