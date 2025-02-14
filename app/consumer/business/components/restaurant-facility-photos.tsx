'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

interface FacilityPhoto {
  id: number
  business_id: number
  photo_url: string
  area_name: string
  created_at: string
}

export default function RestaurantFacilityPhotos({ businessId }: { businessId: number }) {
  const [photos, setPhotos] = useState<FacilityPhoto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFacilityPhotos = async () => {
    try {
      const response = await fetch(`/api/business/facility-photos/${businessId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch facility photos')
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch facility photos')
      }

      setPhotos(data.data)
    } catch (error) {
      console.error('Failed to fetch facility photos:', error)
      setError('Unable to load facility photos. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFacilityPhotos()
  }, [businessId])

  if (isLoading) {
    return <div className="text-center p-4">Loading facility photos...</div>
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Facility Photos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <div key={photo.id} className="space-y-2">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <Image
                  src={photo.photo_url || "/placeholder.svg"}
                  alt={photo.area_name}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-sm font-medium text-center">{photo.area_name}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 