"use client"

import { useState, useEffect } from "react"
import { Check, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getCertifications, createCertification } from "@/app/api/api"

interface Certification {
  id?: number
  business_id: number
  certification_type: string
  issue_date: string
  expiry_date: string
  certificate_number: string
}

export function RestaurantCertifications({ businessId }: { businessId: number }) {
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [newCertification, setNewCertification] = useState<Certification>({
    business_id: businessId,
    certification_type: "",
    issue_date: "",
    expiry_date: "",
    certificate_number: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        const response = await getCertifications(businessId)
        setCertifications(response.data)
      } catch (error) {
        console.error("Failed to fetch certifications:", error)
      }
    }
    fetchCertifications()
  }, [businessId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewCertification((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await createCertification(newCertification)
      setCertifications((prev) => [...prev, response.data])
      setNewCertification({
        business_id: businessId,
        certification_type: "",
        issue_date: "",
        expiry_date: "",
        certificate_number: "",
      })
      alert("Certification added successfully!")
    } catch (error) {
      console.error("Failed to add certification:", error)
      alert("Failed to add certification. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Certifications</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add New Certification
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Certification</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="certification_type">Certification Type</Label>
                <Input
                  id="certification_type"
                  name="certification_type"
                  value={newCertification.certification_type}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issue_date">Issue Date</Label>
                <Input
                  id="issue_date"
                  name="issue_date"
                  type="date"
                  value={newCertification.issue_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input
                  id="expiry_date"
                  name="expiry_date"
                  type="date"
                  value={newCertification.expiry_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certificate_number">Certificate Number</Label>
                <Input
                  id="certificate_number"
                  name="certificate_number"
                  value={newCertification.certificate_number}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Certification"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {certifications.map((cert) => (
            <div key={cert.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
              <div>
                <h3 className="font-medium">{cert.certification_type}</h3>
                <p className="text-sm text-muted-foreground">Number: {cert.certificate_number}</p>
                <p className="text-sm text-muted-foreground">
                  Valid: {cert.issue_date} to {cert.expiry_date}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center text-sm text-green-600">
                  <Check className="h-4 w-4 mr-1" />
                  Active
                </span>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

