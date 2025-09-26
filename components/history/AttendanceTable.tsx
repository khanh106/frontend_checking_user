'use client'

import { useState } from 'react'
import { AttendanceRecord } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DataLoading } from '@/components/ui/loading'
import { Eye, MapPin, ArrowRightLeft, CalendarClock, GripHorizontal } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { RecordDetail } from './RecordDetail'

interface AttendanceTableProps {
  records: AttendanceRecord[]
  loading?: boolean
  onSort: (column: string, order: 'asc' | 'desc') => void
  onRowSelect: (recordIds: string[]) => void
  selectedRows: string[]
  currentSort: {
    column: string
    order: 'asc' | 'desc'
  }
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    onPageChange: (page: number) => void
    onItemsPerPageChange: (limit: number) => void
  }
}

const typeConfig = {
  CHECK_IN: { label: 'Vào', color: 'bg-emerald-500 hover:bg-emerald-600', icon: <ArrowRightLeft className="h-4 w-4 mr-2" /> },
  CHECK_OUT: { label: 'Ra', color: 'bg-sky-500 hover:bg-sky-600', icon: <ArrowRightLeft className="h-4 w-4 mr-2" /> }
}

export function AttendanceTable({
  records,
  loading,
  onSort,
  onRowSelect,
  selectedRows,
  currentSort,
  pagination
}: AttendanceTableProps) {
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onRowSelect(records.map(record => record.id.toString()))
    } else {
      onRowSelect([])
    }
  }

  const handleSelectRow = (recordId: number, checked: boolean) => {
    const recordIdStr = recordId.toString()
    if (checked) {
      onRowSelect([...selectedRows, recordIdStr])
    } else {
      onRowSelect(selectedRows.filter(id => id !== recordIdStr))
    }
  }

  const handleSort = (column: string) => {
    const newOrder = currentSort.column === column && currentSort.order === 'asc' ? 'desc' : 'asc'
    onSort(column, newOrder)
  }

  const handleViewDetail = (record: AttendanceRecord) => {
    setSelectedRecord(record)
    setShowDetail(true)
  }

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: vi })
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi })
  }

  const isAllSelected = records.length > 0 && selectedRows.length === records.length

  const renderPagination = () => {
    // Logic để hiển thị phân trang đẹp hơn
    const pageNumbers = []
    const visiblePages = 5
    const halfVisible = Math.floor(visiblePages / 2)
    
    let startPage = Math.max(1, pagination.currentPage - halfVisible)
    const endPage = Math.min(pagination.totalPages, startPage + visiblePages - 1)

    if (endPage - startPage + 1 < visiblePages) {
      startPage = Math.max(1, endPage - visiblePages + 1)
    }

    if (startPage > 1) {
      pageNumbers.push(1)
      if (startPage > 2) {
        pageNumbers.push('...')
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }

    if (endPage < pagination.totalPages) {
      if (endPage < pagination.totalPages - 1) {
        pageNumbers.push('...')
      }
      pageNumbers.push(pagination.totalPages)
    }

    return pageNumbers
  }


  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử chấm công</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8">
            <DataLoading
              text="Đang tải lịch sử chấm công..."
            />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử chấm công</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Không có dữ liệu chấm công để hiển thị.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Hãy thử thay đổi bộ lọc hoặc kiểm tra lại sau.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Lịch sử chấm công</CardTitle>
            <div className="text-sm text-muted-foreground">
              Tìm thấy {pagination.totalItems} bản ghi
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Chọn tất cả"
                    />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 text-center"
                    onClick={() => handleSort('createdAt')}
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center justify-center gap-1">
                          <CalendarClock className="h-4 w-4" />
                          <span>Ngày giờ</span>
                          {currentSort.column === 'createdAt' && (
                            <span className="ml-1 text-lg">
                              {currentSort.order === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Sắp xếp theo Ngày giờ</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableHead>
                  <TableHead className="text-center">Loại</TableHead>
                  <TableHead>Vị trí & Địa chỉ</TableHead>
                  <TableHead className="text-center">Hình ảnh</TableHead>
                  <TableHead className="w-20 text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id} className="hover:bg-muted/50">
                    <TableCell className="text-center">
                      <Checkbox
                        checked={selectedRows.includes(record.id.toString())}
                        onCheckedChange={(checked) => handleSelectRow(record.id, checked as boolean)}
                        aria-label={`Chọn bản ghi ${record.id}`}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col">
                        <span className="font-medium">{formatDate(record.createdAt)}</span>
                        <span className="text-xs text-muted-foreground">{formatTime(record.createdAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        className={cn(
                          "text-white select-none",
                          typeConfig[record.type].color
                        )}
                      >
                        {typeConfig[record.type].icon}
                        {typeConfig[record.type].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                        <div className="flex flex-col">
                          <span className="font-semibold max-w-xs truncate">{record.Location.name || 'N/A'}</span>
                          <span className="text-xs text-muted-foreground max-w-xs truncate">{record.address}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {record.imageUri ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {/* Handle image view */}}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Xem ảnh chấm công</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleViewDetail(record)}
                            >
                              <GripHorizontal className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Xem chi tiết & Tải ảnh</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Hiển thị</span>
            <Select
              value={pagination.itemsPerPage.toString()}
              onValueChange={(value) => pagination.onItemsPerPageChange(parseInt(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span>bản ghi mỗi trang.</span>
          </div>
          
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if(pagination.currentPage > 1) pagination.onPageChange(pagination.currentPage - 1)
                  }}
                  className={pagination.currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                />
              </PaginationItem>
              {renderPagination().map((page, index) => (
                <PaginationItem key={index}>
                  {typeof page === 'number' ? (
                    <PaginationLink 
                      href="#"
                      isActive={pagination.currentPage === page}
                      onClick={(e) => {
                        e.preventDefault();
                        pagination.onPageChange(page)
                      }}
                    >
                      {page}
                    </PaginationLink>
                  ) : (
                    <PaginationEllipsis />
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if(pagination.currentPage < pagination.totalPages) pagination.onPageChange(pagination.currentPage + 1)
                  }}
                  className={pagination.currentPage === pagination.totalPages ? "pointer-events-none opacity-50" : undefined}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>

      <RecordDetail
        record={selectedRecord}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
      />
    </>
  )
}
