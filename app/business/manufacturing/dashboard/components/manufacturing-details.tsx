"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/app/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getManufacturingDetails, updateManufacturingDetails } from "@/app/api/api"

interface ManufacturingDetailsProps {
  businessId: number
}

export function ManufacturingDetails({ businessId }: ManufacturingDetailsProps) {
  const [details, setDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function fetchDetails() {
      try {
        const { data, error } = await supabase
          .from("manufacturing_details")
          .select("*")
          .eq("business_id", businessId)
          .single()

        if (error) throw error
        setDetails(data)
      } catch (error) {
        console.error("Error fetching manufacturing details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [businessId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setDetails((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await updateManufacturingDetails(businessId, details)
      setIsEditing(false)
      alert("Manufacturing details updated successfully!")
    } catch (error) {
      console.error("Failed to update manufacturing details:", error)
      alert("Failed to update manufacturing details. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!details) return <div>No manufacturing details found</div>

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manufacturing Details</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit Details
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Manufacturing Details</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="production_capacity">Production Capacity</Label>
                <Input
                  id="production_capacity"
                  name="production_capacity"
                  value={details.production_capacity}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manufacturing_license">Manufacturing License</Label>
                <Input
                  id="manufacturing_license"
                  name="manufacturing_license"
                  value={details.manufacturing_license}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="iso_certification">ISO Certification</Label>
                <Input
                  id="iso_certification"
                  name="iso_certification"
                  value={details.iso_certification}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="haccp_certification">HACCP Certification</Label>
                <Input
                  id="haccp_certification"
                  name="haccp_certification"
                  value={details.haccp_certification}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={details.description}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Details"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="font-medium">Production Capacity:</label>
            <p>{details.production_capacity || "Not specified"}</p>
          </div>
          <div>
            <label className="font-medium">Manufacturing License:</label>
            <p>{details.manufacturing_license || "Not specified"}</p>
          </div>
          <div>
            <label className="font-medium">ISO Certification:</label>
            <p>{details.iso_certification || "Not specified"}</p>
          </div>
          <div>
            <label className="font-medium">HACCP Certification:</label>
            <p>{details.haccp_certification || "Not specified"}</p>
          </div>
          <div>
            <label className="font-medium">Description:</label>
            <p>{details.description || "Not specified"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

