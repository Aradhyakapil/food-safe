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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('license_number', licenseNumber)
        .single()

      if (error) throw error

      if (data) {
        router.push(`/consumer/business/${data.id}`)
      } else {
        setError('No business found with this license number')
      }
    } catch (error) {
      console.error('Error searching business:', error)
      setError('Failed to search business')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="perspective-1000">
        <div className="transform-style-3d hover:rotate-y-10 hover:rotate-x-10 transition-transform duration-500">
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                Verify Food Business License
              </h1>
              <p className="text-gray-600 mt-3">
                Enter the license number of any food business to view their safety records, certifications, and compliance status.
              </p>
            </div>

            <form onSubmit={handleSearch} className="space-y-6">
              <div>
                <label htmlFor="license" className="block text-sm font-medium text-gray-700 mb-2">
                  License Number
                </label>
                <Input
                  id="license"
                  type="text"
                  placeholder="Enter business license number"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full shadow-sm hover:shadow-md transition-shadow duration-300"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                disabled={isLoading}
              >
                {isLoading ? "Searching..." : "Search Business"}
              </Button>

              {error && (
                <p className="text-sm text-red-600 text-center animate-fade-in">
                  {error}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 