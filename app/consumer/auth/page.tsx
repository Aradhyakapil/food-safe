"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface SignUpForm {
  name: string
  phoneNumber: string
  otp: string
  password: string
}

interface SignInForm {
  name: string
  password: string
}

export default function ConsumerAuthPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showOTP, setShowOTP] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [signInForm, setSignInForm] = useState<SignInForm>({
    name: "",
    password: "",
  })

  const [signUpForm, setSignUpForm] = useState<SignUpForm>({
    name: "",
    phoneNumber: "",
    otp: "",
    password: "",
  })

  const handleSendOTP = () => {
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
      const response = await fetch("/api/consumer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signInForm),
      })
      const data = await response.json()
      if (data.success) {
        localStorage.setItem("token", data.token)
        router.push("/consumer/verify")
      } else {
        throw new Error(data.error || "Login failed")
      }
    } catch (error) {
      console.error("Login failed:", error)
      setError("Login failed. Please check your credentials and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/consumer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signUpForm),
      })
      const data = await response.json()
      if (data.success) {
        localStorage.setItem("token", data.token)
        router.push("/consumer/verify")
      } else {
        throw new Error(data.error || "Registration failed")
      }
    } catch (error) {
      console.error("Registration failed:", error)
      setError(`Registration failed: ${error instanceof Error ? error.message : String(error)}`)
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
                  <Label htmlFor="signin-name">Name</Label>
                  <Input
                    id="signin-name"
                    placeholder="Enter your name"
                    value={signInForm.name}
                    onChange={(e) => setSignInForm({ ...signInForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={signInForm.password}
                    onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value })}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#2B47FC]"
                  disabled={!signInForm.name || !signInForm.password || isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Name</Label>
                  <Input
                    id="signup-name"
                    placeholder="Enter your name"
                    value={signUpForm.name}
                    onChange={(e) => setSignUpForm({ ...signUpForm, name: e.target.value })}
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
                      onClick={handleSendOTP}
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
                      placeholder="Enter OTP"
                      value={signUpForm.otp}
                      onChange={(e) => setSignUpForm({ ...signUpForm, otp: e.target.value })}
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={signUpForm.password}
                    onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#2B47FC]"
                  disabled={
                    !signUpForm.name ||
                    !signUpForm.phoneNumber ||
                    !signUpForm.password ||
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

