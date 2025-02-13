"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/app/lib/supabase"

export default function VerifyBusinessPage() {
  const router = useRouter()
  const [licenseNumber, setLicenseNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!licenseNumber) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, license_number')
        .eq('license_number', licenseNumber.trim())
        .single()

      if (error) throw error
      
      if (data) {
        // Redirect to the consumer business view with the business ID
        router.push(`/consumer/business/${data.id}`)
      } else {
        setError('No business found with this license number')
      }
    } catch (error) {
      console.error('Search error:', error)
      setError('No business found with this license number')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          Verify Food Business License
        </h1>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label 
                htmlFor="licenseNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                License Number
              </label>
              <Input
                id="licenseNumber"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="Enter license number"
                className="w-full"
              />
            </div>

            <Button 
              type="submit"
              className="w-full"
              disabled={isLoading || !licenseNumber}
            >
              {isLoading ? "Searching..." : "Search"}
            </Button>

            {error && (
              <p className="text-sm text-red-600 text-center">
                {error}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  )
} 