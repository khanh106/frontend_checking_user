'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MapPin, Grid, List, Map } from 'lucide-react'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'

import { LocationCard } from '@/components/locations/LocationCard'
import { LocationsTable } from '@/components/locations/LocationsTable'
import { AddLocationDialog } from '@/components/locations/AddLocationDialog'
import { EditLocationDialog } from '@/components/locations/EditLocationDialog'
import { DeleteLocationDialog } from '@/components/locations/DeleteLocationDialog'
import { DataLoading } from '@/components/ui/loading'

import { 
  getLocations, 
  createLocation, 
  updateLocation, 
  deleteLocation, 
  toggleLocationStatus 
} from '@/lib/api/locations'
import type { Location, CreateLocationData, UpdateLocationData } from '@/types'
import type { LocationFormData } from '@/lib/validators'

const MapView = dynamic(
  () => import('@/components/locations/MapView').then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="py-8">
        <DataLoading text="Đang tải bản đồ..." />
      </div>
    ),
  }
)

interface LocationsClientProps {
  searchParams: {
    search?: string
    status?: 'active' | 'inactive' | 'all'
    page?: string
  }
}

export default function LocationsClient({ searchParams }: LocationsClientProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'card' | 'table' | 'map'>('card')
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [deletingLocation, setDeletingLocation] = useState<Location | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userRole, setUserRole] = useState<string>('user')

  const loadLocations = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await getLocations({
        search: searchParams.search,
        status: searchParams.status || 'all',
        page: searchParams.page ? parseInt(searchParams.page) : 1,
        limit: 50
      })
      setLocations(Array.isArray(response) ? response : response.data)
    } catch (error) {
      console.error('Error loading locations:', error)
      toast.error('Không thể tải danh sách vị trí')
    } finally {
      setIsLoading(false)
    }
  }, [searchParams.search, searchParams.status, searchParams.page])

  const loadUserRole = async () => {
    try {
      const response = await fetch('/api/me')
      if (response.ok) {
        const user = await response.json()
        setUserRole(user.role || 'user')
      }
    } catch (error) {
      console.error('Error loading user role:', error)
    }
  }

  useEffect(() => {
    loadLocations()
    loadUserRole()
  }, [loadLocations])

  const handleAddLocation = async (data: LocationFormData) => {
    try {
      setIsSubmitting(true)
      const createData: CreateLocationData = {
        name: data.name,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        radius: data.radius
      }
      
      const newLocation = await createLocation(createData)
      setLocations(prev => [newLocation, ...prev])
      toast.success('Thêm vị trí thành công')
    } catch (error) {
      console.error('Error adding location:', error)
      toast.error('Không thể thêm vị trí mới')
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditLocation = async (data: LocationFormData) => {
    if (!editingLocation) return
    
    try {
      setIsSubmitting(true)
      const updateData: UpdateLocationData = {
        name: data.name,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        radius: data.radius
      }
      
      const updatedLocation = await updateLocation({ id: editingLocation.id, ...updateData })
      setLocations(prev => 
        prev.map(loc => loc.id === editingLocation.id ? updatedLocation : loc)
      )
      setEditingLocation(null)
      toast.success('Cập nhật vị trí thành công')
    } catch (error) {
      console.error('Error updating location:', error)
      toast.error('Không thể cập nhật vị trí')
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteLocation = async (id: string) => {
    try {
      setIsSubmitting(true)
      await deleteLocation(id)
      setLocations(prev => prev.filter(loc => loc.id !== id))
      setDeletingLocation(null)
      toast.success('Xóa vị trí thành công')
    } catch (error) {
      console.error('Error deleting location:', error)
      toast.error('Không thể xóa vị trí')
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const updatedLocation = await toggleLocationStatus(id)
      setLocations(prev => 
        prev.map(loc => loc.id === id ? updatedLocation : loc)
      )
      toast.success(`Vị trí đã được ${active ? 'kích hoạt' : 'vô hiệu hóa'}`)
    } catch (error) {
      console.error('Error toggling location status:', error)
      toast.error('Không thể thay đổi trạng thái vị trí')
    }
  }

  const canEdit = userRole === 'admin' || userRole === 'manager'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý vị trí</h1>
          <p className="text-muted-foreground">
            Quản lý các vị trí chấm công của công ty
          </p>
        </div>
        
        {canEdit && (
          <AddLocationDialog 
            onAdd={handleAddLocation}
            isLoading={isSubmitting}
          />
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Danh sách vị trí</span>
            </CardTitle>
            
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'card' | 'table' | 'map')}>
              <TabsList>
                <TabsTrigger value="card" className="flex items-center space-x-2">
                  <Grid className="h-4 w-4" />
                  <span>Thẻ</span>
                </TabsTrigger>
                <TabsTrigger value="table" className="flex items-center space-x-2">
                  <List className="h-4 w-4" />
                  <span>Bảng</span>
                </TabsTrigger>
                <TabsTrigger value="map" className="flex items-center space-x-2">
                  <Map className="h-4 w-4" />
                  <span>Bản đồ</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={viewMode}>
            <TabsContent value="card" className="space-y-4">
              {isLoading ? (
                <div className="py-8">
                  <DataLoading
                    text="Đang tải danh sách vị trí..."
                  />
                </div>
              ) : locations.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Chưa có vị trí nào
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Bắt đầu bằng cách thêm vị trí chấm công đầu tiên
                  </p>
                  {canEdit && (
                    <AddLocationDialog 
                      onAdd={handleAddLocation}
                      isLoading={isSubmitting}
                    />
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {locations.map((location) => (
                    <LocationCard
                      key={location.id}
                      location={location}
                      onEdit={setEditingLocation}
                      onDelete={(id) => {
                        const loc = locations.find(l => l.id === id)
                        if (loc) setDeletingLocation(loc)
                      }}
                      onToggleActive={handleToggleActive}
                      userRole={userRole}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="table">
              <LocationsTable
                locations={locations}
                onEdit={setEditingLocation}
                onDelete={(id) => {
                  const loc = locations.find(l => l.id === id)
                  if (loc) setDeletingLocation(loc)
                }}
                onToggleActive={handleToggleActive}
                userRole={userRole}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="map">
              <div className="h-[600px] w-full">
                {viewMode === 'map' && (
                  <MapView 
                    locations={locations}
                    showUserLocation={true}
                    className="rounded-lg border"
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {editingLocation && (
        <EditLocationDialog
          location={editingLocation}
          open={!!editingLocation}
          onOpenChange={(open) => !open && setEditingLocation(null)}
          onUpdate={handleEditLocation}
          isLoading={isSubmitting}
        />
      )}

      {deletingLocation && (
        <DeleteLocationDialog
          location={deletingLocation}
          open={!!deletingLocation}
          onOpenChange={(open) => !open && setDeletingLocation(null)}
          onDelete={handleDeleteLocation}
          isLoading={isSubmitting}
        />
      )}
    </div>
  )
}
