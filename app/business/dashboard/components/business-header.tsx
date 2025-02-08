"use client"
import { QrCode } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface BusinessInfo {
  id: string
  name: string
  licenseNumber: string
  businessType: string
}

export function BusinessHeader({ businessInfo }: { businessInfo: BusinessInfo }) {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start gap-4">
          <Image src="/placeholder.svg" alt="Business logo" width={48} height={48} className="rounded-full" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">{businessInfo.name}</h1>
                <Button variant="outline" size="sm">
                  <QrCode className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-1 mt-2 text-sm">
              <p className="flex items-center gap-2">
                <span className="text-muted-foreground">License:</span>
                <span>{businessInfo.licenseNumber}</span>
              </p>
              <p>Business Type: {businessInfo.businessType}</p>
              <p>FSSAI Care: 1800-112-100</p>
              <p>Email: contact@{businessInfo.name.toLowerCase().replace(/\s+/g, "")}.com</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            Apply for License Renewal
          </Button>
          <Button variant="outline" size="sm">
            Apply for New License
          </Button>
          <Button variant="outline" size="sm">
            Apply for Lab Reports
          </Button>
          {businessInfo.businessType === "restaurant" && (
            <Link href="/business/manufacturing/dashboard">
              <Button variant="outline" size="sm">
                Manufacturing Dashboard
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

