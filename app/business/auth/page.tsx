"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'

interface SignInForm {
  phoneNumber: string
  licenseNumber: string
  otp: string
  businessType: "restaurant" | "manufacturer"
}

interface SignUpForm {
  businessName: string
  licenseNumber: string
  phoneNumber: string
  otp: string
  businessType: "restaurant" | "manufacturer"
}

export default function BusinessAuthPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showOTP, setShowOTP] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signInForm, setSignInForm] = useState<SignInForm>({
    phoneNumber: "",
    licenseNumber: "",
    otp: "",
    businessType: "restaurant",
  })
  const [signUpForm, setSignUpForm] = useState<SignUpForm>({
    businessName: "",
    licenseNumber: "",
    phoneNumber: "",
    otp: "",
    businessType: "restaurant",
  })

  const handleSendOTP = (formType: "signin" | "signup") => {
    setIsLoading(true)
    // Here you would implement OTP sending logic
    setTimeout(() => {
      setIsLoading(false)
      setShowOTP(true)
    }, 2000)
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/business/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: signInForm.phoneNumber,
          licenseNumber: signInForm.licenseNumber,
        }),
      })
      const data = await response.json()
      if (data.success) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("businessId", data.business.id)
        localStorage.setItem("businessName", data.business.name)
        localStorage.setItem("licenseNumber", data.business.license_number)
        localStorage.setItem("businessType", signInForm.businessType)
        if (signInForm.businessType === "restaurant") {
          router.push("/business/dashboard")
        } else {
          router.push("/business/manufacturing/dashboard")
        }
      } else {
        throw new Error(data.error || "Invalid credentials")
      }
    } catch (error) {
      console.error("Login failed:", error)
      setError(error instanceof Error ? error.message : "Login failed. Please check your credentials and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      console.log("Sending registration request with data:", signUpForm)
      const response = await fetch("/api/business/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signUpForm),
      })
      const data = await response.json()
      console.log("Received response:", data)
      if (data.success) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("businessId", data.business.id)
        localStorage.setItem("businessName", data.business.name)
        localStorage.setItem("licenseNumber", data.business.license_number)
        localStorage.setItem("businessType", signUpForm.businessType)
        if (signUpForm.businessType === "restaurant") {
          router.push("/business/onboarding")
        } else {
          router.push("/business/manufacturing/onboarding")
        }
      } else {
        throw new Error(data.error || "Registration failed")
      }
    } catch (error) {
      console.error("Registration failed:", error)
      setError(`Registration failed: ${error instanceof Error ? error.message : JSON.stringify(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-phone">Phone Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="signin-phone"
                      type="tel"
                      placeholder="Enter phone number"
                      value={signInForm.phoneNumber}
                      onChange={(e) => setSignInForm({ ...signInForm, phoneNumber: e.target.value })}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSendOTP("signin")}
                      disabled={!signInForm.phoneNumber || isLoading}
                    >
                      {isLoading ? "Sending..." : "Send OTP"}
                    </Button>
                  </div>
                </div>

                {showOTP && (
                  <div className="space-y-2">
                    <Label htmlFor="signin-otp">Enter OTP</Label>
                    <Input
                      id="signin-otp"
                      type="text"
                      placeholder="Enter OTP"
                      value={signInForm.otp}
                      onChange={(e) => setSignInForm({ ...signInForm, otp: e.target.value })}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="signin-license">FSSAI License Number</Label>
                  <Input
                    id="signin-license"
                    type="text"
                    placeholder="Enter license number"
                    value={signInForm.licenseNumber}
                    onChange={(e) => setSignInForm({ ...signInForm, licenseNumber: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Business Type</Label>
                  <RadioGroup
                    value={signInForm.businessType}
                    onValueChange={(value: "restaurant" | "manufacturer") =>
                      setSignInForm({ ...signInForm, businessType: value })
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="restaurant" id="signin-restaurant" />
                      <Label htmlFor="signin-restaurant">Restaurant</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manufacturer" id="signin-manufacturer" />
                      <Label htmlFor="signin-manufacturer">Manufacturing Unit</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#2B47FC]"
                  disabled={
                    !signInForm.phoneNumber || !signInForm.licenseNumber || (showOTP && !signInForm.otp) || isLoading
                  }
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-business">Business Name</Label>
                  <Input
                    id="signup-business"
                    type="text"
                    placeholder="Enter business name"
                    value={signUpForm.businessName}
                    onChange={(e) => setSignUpForm({ ...signUpForm, businessName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-license">FSSAI License Number</Label>
                  <Input
                    id="signup-license"
                    type="text"
                    placeholder="Enter license number"
                    value={signUpForm.licenseNumber}
                    onChange={(e) => setSignUpForm({ ...signUpForm, licenseNumber: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Phone Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="Enter phone number"
                      value={signUpForm.phoneNumber}
                      onChange={(e) => setSignUpForm({ ...signUpForm, phoneNumber: e.target.value })}
                      className="flex-1"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSendOTP("signup")}
                      disabled={!signUpForm.phoneNumber || isLoading}
                    >
                      {isLoading ? "Sending..." : "Send OTP"}
                    </Button>
                  </div>
                </div>

                {showOTP && (
                  <div className="space-y-2">
                    <Label htmlFor="signup-otp">Enter OTP</Label>
                    <Input
                      id="signup-otp"
                      type="text"
                      placeholder="Enter OTP"
                      value={signUpForm.otp}
                      onChange={(e) => setSignUpForm({ ...signUpForm, otp: e.target.value })}
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Business Type</Label>
                  <RadioGroup
                    value={signUpForm.businessType}
                    onValueChange={(value: "restaurant" | "manufacturer") =>
                      setSignUpForm({ ...signUpForm, businessType: value })
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="restaurant" id="signup-restaurant" />
                      <Label htmlFor="signup-restaurant">Restaurant</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manufacturer" id="signup-manufacturer" />
                      <Label htmlFor="signup-manufacturer">Manufacturing Unit</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#2B47FC]"
                  disabled={
                    !signUpForm.businessName ||
                    !signUpForm.licenseNumber ||
                    !signUpForm.phoneNumber ||
                    (showOTP && !signUpForm.otp) ||
                    isLoading
                  }
                >
                  {isLoading ? "Signing Up..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

