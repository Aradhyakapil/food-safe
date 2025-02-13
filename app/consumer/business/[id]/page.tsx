"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Star, CheckCircle, AlertTriangle, XCircle, Copy, QrCode } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getBusiness,
  getHygieneRatings,
  getCertifications,
  getLabReports,
  getTeamMembers,
  getFacilityPhotos,
  getReviews,
} from "@/app/api/api"
import { supabase } from "@/app/lib/supabase"
import Image from "next/image"
import { Check } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface BusinessDetails {
  id: number
  name: string
  address: string
  phone: string
  email: string
  license_number: string
  business_type: string
  owner_name: string
  owner_photo_url: string | null
  logo_url: string | null
  trade_license: string
  gst_number: string
  fire_safety_cert: string
  liquor_license?: string
  music_license?: string
}

interface HygieneRating {
  rating: number
  date: string
  last_inspection_date?: string
}

interface Certification {
  certification_type: string
  issue_date: string
  expiry_date: string
  number: string
  valid_from: string
  valid_to: string
}

interface LabReport {
  report_type: string
  date: string
  result: string
}

interface TeamMember {
  name: string
  role: string
  photo_url: string
}

interface FacilityPhoto {
  area_name: string
  photo_url: string
}

interface Review {
  reviewer_id: number
  rating: number
  comment: string
  date: string
}

export default function ConsumerBusinessView() {
  const { id } = useParams()
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails | null>(null)
  const [hygieneRatings, setHygieneRatings] = useState<HygieneRating[]>([])
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [labReports, setLabReports] = useState<LabReport[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [facilityPhotos, setFacilityPhotos] = useState<FacilityPhoto[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const { data: business, error: businessError } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', id)
          .single()

        if (businessError) throw businessError
        setBusinessDetails(business)

        const businessId = business.id

        const [
          hygieneResponse,
          certificationsResponse,
          labReportsResponse,
          teamMembersResponse,
          facilityPhotosResponse,
          reviewsResponse,
        ] = await Promise.all([
          getHygieneRatings(businessId),
          getCertifications(businessId),
          getLabReports(businessId),
          getTeamMembers(businessId),
          getFacilityPhotos(businessId),
          getReviews(businessId),
        ])

        setHygieneRatings(hygieneResponse.data)
        setCertifications(certificationsResponse.data)
        setLabReports(labReportsResponse.data)
        setTeamMembers(teamMembersResponse.data)
        setFacilityPhotos(facilityPhotosResponse.data)
        setReviews(reviewsResponse.data)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllData()
  }, [id])

  const renderHygieneRating = (rating: number) => {
    let color = "text-yellow-500"
    let icon = <AlertTriangle className="h-6 w-6" />

    if (rating >= 4) {
      color = "text-green-500"
      icon = <CheckCircle className="h-6 w-6" />
    } else if (rating <= 2) {
      color = "text-red-500"
      icon = <XCircle className="h-6 w-6" />
    }

    return (
      <div className={`flex items-center gap-2 ${color}`}>
        {icon}
        <span className="font-semibold">Hygiene Rating: {rating}/5</span>
      </div>
    )
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p>{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!businessDetails) {
    return <div className="min-h-screen flex items-center justify-center">Business not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      {/* Business Header */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <Image 
              src={businessDetails.logo_url || "/placeholder.svg"} 
              alt="Business logo" 
              width={48} 
              height={48} 
              className="rounded-full" 
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold">{businessDetails.name}</h1>
                  <Button variant="outline" size="sm">
                    <QrCode className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1 mt-2 text-sm">
                <p className="flex items-center gap-2">
                  <span className="text-muted-foreground">License:</span>
                  <span>{businessDetails.license_number}</span>
                </p>
                <p>Business Type: {businessDetails.business_type}</p>
                <p>FSSAI Care: 1800-112-100</p>
                <p>Email: {businessDetails.email}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hygiene Rating */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Hygiene Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-2xl font-bold">
                  {hygieneRatings.length > 0 ? hygieneRatings[hygieneRatings.length - 1].rating : 0}/5
                </div>
                <div className="flex mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= (hygieneRatings.length > 0 ? hygieneRatings[hygieneRatings.length - 1].rating : 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-2">Latest Inspection</h4>
                <p className="text-sm text-gray-600">
                  {hygieneRatings.length > 0 && hygieneRatings[hygieneRatings.length - 1].last_inspection_date
                    ? new Date(hygieneRatings[hygieneRatings.length - 1].last_inspection_date).toLocaleDateString()
                    : "No inspection date available"}
                </p>
              </div>
            </div>

            {/* Violations Section */}
            <div className="mt-6">
              <h4 className="font-medium mb-2">Recent Violations</h4>
              <div className="space-y-3">
                {/* Assuming violations are stored in a separate state */}
                {/* Replace this with actual violations data */}
                {/* Example: */}
                {/* {violations.map((violation, index) => ( */}
                {/*   <div */}
                {/*     key={index} */}
                {/*     className="bg-red-50 border border-red-100 rounded-md p-3" */}
                {/*   > */}
                {/*     <div className="flex justify-between items-start"> */}
                {/*       <div> */}
                {/*         <p className="text-sm font-medium text-red-800"> */}
                {/*           {violation.description} */}
                {/*         </p> */}
                {/*         <p className="text-xs text-red-600 mt-1"> */}
                {/*           {new Date(violation.date).toLocaleDateString()} */}
                {/*         </p> */}
                {/*       </div> */}
                {/*       <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded"> */}
                {/*         {violation.severity} */}
                {/*       </span> */}
                {/*     </div> */}
                {/*   ))} */}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader>
          <CardTitle>Food Safety Certifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {certifications.map((cert) => (
              <div key={cert.certification_type} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div>
                  <h3 className="font-medium">{cert.certification_type}</h3>
                  <p className="text-sm text-muted-foreground">Number: {cert.number}</p>
                  <p className="text-sm text-muted-foreground">
                    Valid: {cert.valid_from} to {cert.valid_to}
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

      {/* Lab Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Lab Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {labReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div>
                  <h3 className="font-medium">{report.test_type}</h3>
                  <p className="text-sm text-muted-foreground">
                    Date: {new Date(report.test_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Lab: {report.laboratory_name}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`flex items-center text-sm ${
                    report.status === 'Pass' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <Check className="h-4 w-4 mr-1" />
                    {report.status}
                  </span>
                  <Button variant="outline" size="sm">
                    View Report
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-start space-x-4 p-4 rounded-lg border bg-card">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.photo_url || ''} alt={member.name} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {member.certifications?.map((cert, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Facility Photos */}
      <Card>
        <CardHeader>
          <CardTitle>Facility Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {facilityPhotos.map((photo) => (
              <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden">
                <Image
                  src={photo.url}
                  alt={photo.description || 'Facility photo'}
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm">
                  {photo.description}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reviews Section */}
      <Card>
        <CardHeader>
          <CardTitle>Inspection Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Food Safety Inspector</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(review.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-2 text-sm">{review.comment}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

