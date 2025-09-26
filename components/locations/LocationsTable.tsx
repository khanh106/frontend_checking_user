'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Edit, 
  Trash2, 
  MoreVertical, 
  Search,
  Download,
  Filter
} from 'lucide-react'
import type { Location } from '@/types'
import { 
  formatCoordinates, 
  getLocationStatusColor, 
  getLocationStatusText,
  formatDistance 
} from '@/lib/utils/location'

interface LocationsTableProps {
  locations: Location[]
  onEdit: (location: Location) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string, active: boolean) => void
  userRole?: string
  userLocation?: { lat: number; lng: number }
  isLoading?: boolean
}

export function LocationsTable({
  locations,
  onEdit,
  onDelete,
  onToggleActive,
  userRole = 'user',
  userLocation,
  isLoading = false
}: LocationsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [sortField, setSortField] = useState<keyof Location>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const canEdit = userRole === 'admin' || userRole === 'manager'

  const filteredLocations = locations
    .filter(location => {
      const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           location.address.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && location.isActive) ||
                           (statusFilter === 'inactive' && !location.isActive)
      
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }
      
      return 0
    })

  const handleSort = (field: keyof Location) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleExport = () => {
    const csvContent = [
      ['Tên', 'Địa chỉ', 'Vĩ độ', 'Kinh độ', 'Bán kính', 'Trạng thái', 'Ngày tạo'],
      ...filteredLocations.map(location => [
        location.name,
        location.address,
        location.latitude.toString(),
        location.longitude.toString(),
        location.radius.toString(),
        location.isActive ? 'Hoạt động' : 'Không hoạt động',
        new Date(location.createdAt).toLocaleDateString('vi-VN')
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'locations.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm vị trí..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="h-4 w-4 mr-2" />
                {statusFilter === 'all' ? 'Tất cả' : 
                 statusFilter === 'active' ? 'Hoạt động' : 'Không hoạt động'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                Tất cả
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                Hoạt động
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('inactive')}>
                Không hoạt động
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Xuất CSV
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('name')}
              >
                Tên vị trí
                {sortField === 'name' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead>Địa chỉ</TableHead>
              <TableHead>Tọa độ</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('radius')}
              >
                Bán kính
                {sortField === 'radius' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead>Trạng thái</TableHead>
              {userLocation && <TableHead>Khoảng cách</TableHead>}
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('createdAt')}
              >
                Ngày tạo
                {sortField === 'createdAt' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              {canEdit && <TableHead className="w-12"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLocations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canEdit ? 8 : 7} className="text-center py-8 text-gray-500">
                  Không tìm thấy vị trí nào
                </TableCell>
              </TableRow>
            ) : (
              filteredLocations.map((location) => {
                const distance = userLocation 
                  ? formatDistance(
                      Math.sqrt(
                        Math.pow(location.latitude - userLocation.lat, 2) + 
                        Math.pow(location.longitude - userLocation.lng, 2)
                      ) * 111000
                    )
                  : null

                return (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">{location.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{location.address}</TableCell>
                    <TableCell className="text-sm">
                      {formatCoordinates(location.latitude, location.longitude)}
                    </TableCell>
                    <TableCell>{location.radius}m</TableCell>
                    <TableCell>
                      <Badge 
                        variant={location.isActive ? "default" : "secondary"}
                        className={getLocationStatusColor(location.isActive)}
                      >
                        {getLocationStatusText(location.isActive)}
                      </Badge>
                    </TableCell>
                    {userLocation && (
                      <TableCell className="text-sm">{distance}</TableCell>
                    )}
                    <TableCell className="text-sm">
                      {new Date(location.createdAt).toLocaleDateString('vi-VN')}
                    </TableCell>
                    {canEdit && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(location)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onToggleActive(location.id, !location.isActive)}
                            >
                              {location.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onDelete(location.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
