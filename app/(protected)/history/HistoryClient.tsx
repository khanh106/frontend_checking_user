'use client'

import { useState, useMemo } from 'react'
import { HistoryResponse, Location, HistoryFilters, AttendanceRecord, AttendanceStatus } from '@/types'
import { HistoryFiltersComponent } from '@/components/history/HistoryFilters'
import { AttendanceTable } from '@/components/history/AttendanceTable'
import { ExportDialog } from '@/components/history/ExportDialog'
import { BulkActions } from '@/components/history/BulkActions'
import { Button } from '@/components/ui/button'
import { Download, Filter } from 'lucide-react'

interface HistoryClientProps {
  initialData: HistoryResponse
  searchParams: Record<string, string | undefined>
}

export function HistoryClient({ 
  initialData, 
  searchParams 
}: HistoryClientProps) {
  const [allRecords] = useState(initialData.data)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState<HistoryFilters>({
    dateFrom: searchParams.dateFrom ? new Date(searchParams.dateFrom) : undefined,
    dateTo: searchParams.dateTo ? new Date(searchParams.dateTo) : undefined,
    status: searchParams.status ? searchParams.status.split(',') as AttendanceStatus[] : undefined,
    locationId: searchParams.location,
    search: searchParams.search
  })

  const [pagination, setPagination] = useState({
    currentPage: parseInt(searchParams.page || '1'),
    itemsPerPage: parseInt(searchParams.limit || '20')
  })

  const [sort, setSort] = useState({
    column: searchParams.sort || 'createdAt',
    order: (searchParams.order as 'asc' | 'desc') || 'desc'
  })

  const locations = useMemo(() => {
    const locationMap = new Map<string, Location>()
    allRecords.forEach(record => {
      if (record.locationId && !locationMap.has(record.locationId.toString())) {
        locationMap.set(record.locationId.toString(), {
          id: record.locationId.toString(),
          name: record.Location.name || `Địa điểm ${record.locationId}`,
          address: '',
          latitude: 0,
          longitude: 0,
          radius: 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: ''
        })
      }
    })
    return Array.from(locationMap.values())
  }, [allRecords])

  const filteredRecords = useMemo(() => {
    return allRecords.filter(record => {
      // Logic lọc ở đây
      const createdAt = new Date(record.createdAt)
      if (filters.dateFrom && createdAt < filters.dateFrom) return false
      if (filters.dateTo && createdAt > filters.dateTo) return false
      if (filters.locationId && record.locationId?.toString() !== filters.locationId) return false
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const addressMatch = record.address.toLowerCase().includes(searchTerm)
        const locationNameMatch = record.Location.name?.toLowerCase().includes(searchTerm)
        if (!addressMatch && !locationNameMatch) return false
      }
      return true
    })
  }, [allRecords, filters])

  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      const aValue = a[sort.column as keyof AttendanceRecord]
      const bValue = b[sort.column as keyof AttendanceRecord]

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1
      
      let comparison = 0
      if (aValue > bValue) {
        comparison = 1
      } else if (aValue < bValue) {
        comparison = -1
      }
      
      return sort.order === 'desc' ? comparison * -1 : comparison
    })
  }, [filteredRecords, sort])

  const paginatedRecords = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage
    return sortedRecords.slice(startIndex, startIndex + pagination.itemsPerPage)
  }, [sortedRecords, pagination])

  const totalPages = Math.ceil(filteredRecords.length / pagination.itemsPerPage)

  const handleFiltersChange = (newFilters: HistoryFilters) => {
    setFilters(newFilters)
    setPagination(p => ({ ...p, currentPage: 1 }))
  }

  const handleSort = (column: string, order: 'asc' | 'desc') => {
    setSort({ column, order })
  }

  const handlePageChange = (page: number) => {
    setPagination(p => ({ ...p, currentPage: page }))
  }

  const handleItemsPerPageChange = (limit: number) => {
    setPagination({ currentPage: 1, itemsPerPage: limit })
  }
  
  const handleRowSelect = (recordIds: string[]) => {
    setSelectedRows(recordIds)
  }

  const handleBulkAction = async (action: string) => {
    if (selectedRows.length === 0) return
    
    switch (action) {
      case 'export':
        setShowExportDialog(true)
        break
      case 'clear':
        setSelectedRows([])
        break
    }
  }

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && 
    (Array.isArray(value) ? value.length > 0 : true)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Bộ lọc
            {hasActiveFilters && (
              <span className="ml-1 h-2 w-2 rounded-full bg-blue-500" />
            )}
          </Button>
          
          {selectedRows.length > 0 && (
            <BulkActions
              selectedCount={selectedRows.length}
              onAction={handleBulkAction}
              onClear={() => setSelectedRows([])}
            />
          )}
        </div>

        <Button
          onClick={() => setShowExportDialog(true)}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Xuất dữ liệu
        </Button>
      </div>

      {showFilters && (
        <HistoryFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          locations={locations}
          isLoading={false}
        />
      )}

      <AttendanceTable
        records={paginatedRecords}
        onSort={handleSort}
        onRowSelect={handleRowSelect}
        selectedRows={selectedRows}
        currentSort={sort}
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: totalPages,
          totalItems: filteredRecords.length,
          itemsPerPage: pagination.itemsPerPage,
          onPageChange: handlePageChange,
          onItemsPerPageChange: handleItemsPerPageChange
        }}
      />

      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        filters={filters}
        totalRecords={filteredRecords.length}
        selectedRecords={selectedRows}
      />
    </div>
  )
}
