"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getBusiness, updateBusiness } from "@/app/api/api"

interface OwnerInformation {
  owner_name: string
  owner_photo: string
  business_type: string
}

export function OwnerInformation({ businessId }: { businessId: number }) {
  const [ownerInfo, setOwnerInfo] = useState<OwnerInformation>({
    owner_name: "",
    owner_photo: "/placeholder.svg",
    business_type: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchOwnerInfo = async () => {
      try {
        const response = await getBusiness(businessId)
        setOwnerInfo({
          owner_name: response.data.owner_name,
          owner_photo: response.data.owner_photo || "/placeholder.svg",
          business_type: response.data.business_type,
        })
      } catch (error) {
        console.error("Failed to fetch owner information:", error)
      }
    }
    fetchOwnerInfo()
  }, [businessId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setOwnerInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await updateBusiness(businessId, ownerInfo)
      setIsEditing(false)
      alert("Owner information updated successfully!")
    } catch (error) {
      console.error("Failed to update owner information:", error)
      alert("Failed to update owner information. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Owner Information</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit Owner Info
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Owner Information</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="owner_name">Owner Name</Label>
                <Input
                  id="owner_name"
                  name="owner_name"
                  value={ownerInfo.owner_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner_photo">Owner Photo URL</Label>
                <Input id="owner_photo" name="owner_photo" value={ownerInfo.owner_photo} onChange={handleInputChange} />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Image
            src={ownerInfo.owner_photo || "/placeholder.svg"}
            alt="Owner photo"
            width={48}
            height={48}
            className="rounded-full"
          />
          <div>
            <h3 className="font-semibold">{ownerInfo.owner_name}</h3>
            <p className="text-sm text-muted-foreground">{ownerInfo.business_type} Owner</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

