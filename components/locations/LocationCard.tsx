'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  MapPin, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Power, 
  PowerOff,
  Navigation
} from 'lucide-react'
import type { Location } from '@/types'
import { 
  formatCoordinates, 
  getLocationStatusColor, 
  getLocationStatusText,
  formatDistance 
} from '@/lib/utils/location'

interface LocationCardProps {
  location: Location
  onEdit: (location: Location) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string, active: boolean) => void
  userRole?: string
  userLocation?: { lat: number; lng: number }
}

export function LocationCard({
  location,
  onEdit,
  onDelete,
  onToggleActive,
  userRole = 'user',
  userLocation
}: LocationCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleActive = async () => {
    setIsLoading(true)
    try {
      await onToggleActive(location.id, !location.isActive)
    } finally {
      setIsLoading(false)
    }
  }

  const canEdit = userRole === 'admin' || userRole === 'manager'
  const distance = userLocation 
    ? formatDistance(
        Math.sqrt(
          Math.pow(location.latitude - userLocation.lat, 2) + 
          Math.pow(location.longitude - userLocation.lng, 2)
        ) * 111000
      )
    : null

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold">
                {location.name}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {location.address}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge 
              variant={location.isActive ? "default" : "secondary"}
              className={getLocationStatusColor(location.isActive)}
            >
              {getLocationStatusText(location.isActive)}
            </Badge>
            
            {canEdit && (
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
                    onClick={handleToggleActive}
                    disabled={isLoading}
                  >
                    {location.isActive ? (
                      <PowerOff className="h-4 w-4 mr-2" />
                    ) : (
                      <Power className="h-4 w-4 mr-2" />
                    )}
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
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Tọa độ:</span>
            <p className="text-gray-600">
              {formatCoordinates(location.latitude, location.longitude)}
            </p>
          </div>
          
          <div>
            <span className="font-medium text-gray-700">Bán kính:</span>
            <p className="text-gray-600">{location.radius}m</p>
          </div>
          
          {distance && (
            <div className="col-span-2">
              <span className="font-medium text-gray-700">Khoảng cách:</span>
              <div className="flex items-center mt-1">
                <Navigation className="h-4 w-4 mr-1 text-gray-500" />
                <p className="text-gray-600">{distance}</p>
              </div>
            </div>
          )}
          
          <div className="col-span-2">
            <span className="font-medium text-gray-700">Ngày tạo:</span>
            <p className="text-gray-600">
              {new Date(location.createdAt).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
