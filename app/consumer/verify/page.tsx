"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getBusiness, getHygieneRatings, getCertifications } from "@/app/api/api"

interface BusinessDetails {
  id: number
  name: string
  address: string
  license_number: string
  business_type: string
}

interface HygieneRating {
  rating: number
  date: string
}

interface Certification {
  certification_type: string
  issue_date: string
  expiry_date: string
}

export default function VerifyBusinessPage() {
  const router = useRouter()
  const [licenseNumber, setLicenseNumber] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails | null>(null)
  const [hygieneRating, setHygieneRating] = useState<HygieneRating | null>(null)
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
    setError(null)
    setBusinessDetails(null)
    setHygieneRating(null)
    setCertifications([])

    try {
      const businessResponse = await getBusiness(licenseNumber)
      setBusinessDetails(businessResponse.data)

      const hygieneResponse = await getHygieneRatings(businessResponse.data.id)
      if (hygieneResponse.data.length > 0) {
        setHygieneRating(hygieneResponse.data[hygieneResponse.data.length - 1])
      }

      const certificationsResponse = await getCertifications(businessResponse.data.id)
      setCertifications(certificationsResponse.data)
    } catch (error) {
      console.error("Error fetching business details:", error)
      setError("Unable to find business with the provided license number. Please check and try again.")
    } finally {
      setIsSearching(false)
    }
  }

  const renderHygieneRating = () => {
    if (!hygieneRating) return null

    let color = "text-yellow-500"
    let icon = <AlertTriangle className="h-6 w-6" />

    if (hygieneRating.rating >= 4) {
      color = "text-green-500"
      icon = <CheckCircle className="h-6 w-6" />
    } else if (hygieneRating.rating <= 2) {
      color = "text-red-500"
      icon = <XCircle className="h-6 w-6" />
    }

    return (
      <div className={`flex items-center gap-2 ${color}`}>
        {icon}
        <span className="font-semibold">Hygiene Rating: {hygieneRating.rating}/5</span>
        <span className="text-sm text-muted-foreground">(Last updated: {hygieneRating.date})</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Verify Food Business License</CardTitle>
          <CardDescription>
            Enter the license number of any food business to view their safety records, certifications, and compliance
            status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="license">License Number</Label>
              <div className="relative">
                <Input
                  id="license"
                  placeholder="Enter business license number"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="pr-10"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <Button type="submit" className="w-full bg-[#2B47FC]" disabled={!licenseNumber || isSearching}>
              {isSearching ? "Searching..." : "Search Business"}
            </Button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <p>{error}</p>
            </div>
          )}

          {businessDetails && (
            <div className="mt-6 space-y-4">
              <h2 className="text-xl font-semibold">{businessDetails.name}</h2>
              <p>
                <span className="font-medium">Address:</span> {businessDetails.address}
              </p>
              <p>
                <span className="font-medium">License Number:</span> {businessDetails.license_number}
              </p>
              <p>
                <span className="font-medium">Business Type:</span> {businessDetails.business_type}
              </p>

              {renderHygieneRating()}

              {certifications.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Certifications:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {certifications.map((cert, index) => (
                      <li key={index}>
                        {cert.certification_type} (Valid from {cert.issue_date} to {cert.expiry_date})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button onClick={() => router.push(`/consumer/business/${businessDetails.id}`)} className="mt-4">
                View Full Business Profile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

