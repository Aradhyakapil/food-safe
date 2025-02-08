"use client"

import { useEffect, useState } from "react"
import { BusinessHeader } from "./components/business-header"
import { HygieneRating } from "./components/hygiene-rating"
import { OwnerInformation } from "./components/owner-information"
import { LabReports } from "./components/lab-reports"
import { RestaurantCertifications } from "./components/restaurant-certifications"
import { TeamSection } from "./components/team-section"
import { FacilityPhotos } from "./components/facility-photos"
import { ReviewsSection } from "./components/reviews-section"

export default function BusinessDashboard() {
  const [businessInfo, setBusinessInfo] = useState({
    id: "",
    name: "",
    licenseNumber: "",
    businessType: "",
  })

  useEffect(() => {
    const id = localStorage.getItem("businessId") || ""
    const name = localStorage.getItem("businessName") || ""
    const licenseNumber = localStorage.getItem("licenseNumber") || ""
    const businessType = localStorage.getItem("businessType") || ""

    setBusinessInfo({ id, name, licenseNumber, businessType })
  }, [])

  if (!businessInfo.id) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6 space-y-6">
        <BusinessHeader businessInfo={businessInfo} />
        <HygieneRating businessId={businessInfo.id} />
        <OwnerInformation businessId={businessInfo.id} />
        <LabReports businessId={businessInfo.id} />
        <RestaurantCertifications businessId={businessInfo.id} />
        <TeamSection businessId={businessInfo.id} />
        <FacilityPhotos businessId={businessInfo.id} />
        <ReviewsSection businessId={businessInfo.id} />
      </div>
    </div>
  )
}

