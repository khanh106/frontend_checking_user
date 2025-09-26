'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Loader2 } from 'lucide-react'
import { locationSchema, type LocationFormData } from '@/lib/validators'
import type { Location } from '@/types'
import { validateCoordinates } from '@/lib/utils/location'
import { LocationPicker } from './LocationPicker'

interface LocationFormProps {
  location?: Location
  onSubmit: (data: LocationFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function LocationForm({
  location,
  onSubmit,
  onCancel,
  isLoading = false
}: LocationFormProps) {
  const [coordinateError, setCoordinateError] = useState<string>('')
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: location ? {
      name: location.name,
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
      radius: location.radius
    } : {
      name: '',
      address: '',
      latitude: 0,
      longitude: 0,
      radius: 100
    }
  })

  const watchedLat = watch('latitude')
  const watchedLng = watch('longitude')

  const handleCoordinateChange = (field: 'latitude' | 'longitude', value: string) => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      setValue(field, numValue)
      
      if (field === 'latitude' || field === 'longitude') {
        const lat = field === 'latitude' ? numValue : watchedLat
        const lng = field === 'longitude' ? numValue : watchedLng
        
        if (lat !== 0 && lng !== 0) {
          const isValid = validateCoordinates(lat, lng)
          if (!isValid) {
            setCoordinateError('Tọa độ không hợp lệ')
          } else {
            setCoordinateError('')
          }
        }
      }
    }
  }

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setValue('latitude', location.lat)
    setValue('longitude', location.lng)
    setValue('address', location.address)
    setShowLocationPicker(false)
    setCoordinateError('')
  }

  const handleFormSubmit = async (data: LocationFormData) => {
    if (coordinateError) {
      return
    }
    
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5" />
          <span>{location ? 'Chỉnh sửa vị trí' : 'Thêm vị trí mới'}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên vị trí *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Nhập tên vị trí"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="radius">Bán kính (mét) *</Label>
              <Input
                id="radius"
                type="number"
                {...register('radius', { valueAsNumber: true })}
                placeholder="100"
                min="10"
                max="1000"
                className={errors.radius ? 'border-red-500' : ''}
              />
              {errors.radius && (
                <p className="text-sm text-red-500">{errors.radius.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Địa chỉ *</Label>
            <Input
              id="address"
              {...register('address')}
              placeholder="Nhập địa chỉ đầy đủ"
              className={errors.address ? 'border-red-500' : ''}
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Vĩ độ *</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                {...register('latitude', { valueAsNumber: true })}
                onChange={(e) => handleCoordinateChange('latitude', e.target.value)}
                placeholder="21.0285"
                className={errors.latitude || coordinateError ? 'border-red-500' : ''}
              />
              {errors.latitude && (
                <p className="text-sm text-red-500">{errors.latitude.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="longitude">Kinh độ *</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                {...register('longitude', { valueAsNumber: true })}
                onChange={(e) => handleCoordinateChange('longitude', e.target.value)}
                placeholder="105.8542"
                className={errors.longitude || coordinateError ? 'border-red-500' : ''}
              />
              {errors.longitude && (
                <p className="text-sm text-red-500">{errors.longitude.message}</p>
              )}
            </div>
          </div>
          
          {coordinateError && (
            <p className="text-sm text-red-500">{coordinateError}</p>
          )}
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowLocationPicker(true)}
              className="flex items-center space-x-2"
            >
              <MapPin className="h-4 w-4" />
              <span>Chọn từ bản đồ</span>
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !!coordinateError}
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {location ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </form>
      </CardContent>

      {showLocationPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <LocationPicker
              onLocationSelect={handleLocationSelect}
              defaultLocation={{
                lat: watchedLat || 0,
                lng: watchedLng || 0
              }}
              onCancel={() => setShowLocationPicker(false)}
            />
          </div>
        </div>
      )}
    </Card>
  )
}
