"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { registerBusiness, sendOTP, loginBusiness} from "@/app/api/api";

interface SignInForm {
  phoneNumber: string;
  licenseNumber: string;
  otp: string;
}

interface SignUpForm {
  businessName: string;
  licenseNumber: string;
  phoneNumber: string;
  otp: string;
  businessType: "restaurant" | "manufacturer";
}

export default function BusinessAuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signInForm, setSignInForm] = useState<SignInForm>({
    phoneNumber: "",
    licenseNumber: "",
    otp: "",
  });
  const [signUpForm, setSignUpForm] = useState<SignUpForm>({
    businessName: "",
    licenseNumber: "",
    phoneNumber: "",
    otp: "",
    businessType: "restaurant",
  });
  const [showOTP, setShowOTP] = useState(false);

  const handleSendOTP = async (type: "signin" | "signup") => {
    setIsLoading(true);
    setError(null);

    try {
      const phoneNumber = type === "signin" ? signInForm.phoneNumber : signUpForm.phoneNumber;
      const response = await sendOTP(phoneNumber);

      if (!response.success) {
        throw new Error(response.error || "Failed to send OTP");
      }

      setShowOTP(true);
    } catch (error) {
      setError(`Failed to send OTP: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await loginBusiness(signInForm.phoneNumber, signInForm.otp);

      if (response.success) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("businessType", response.business.business_type);
        router.push("/business/dashboard");
      } else {
        throw new Error(response.error || "Login failed");
      }
    } catch (error) {
      setError(`Login failed: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await registerBusiness(
        signUpForm.businessName,
        signUpForm.licenseNumber,
        signUpForm.phoneNumber,
        signUpForm.otp
      );

      if (response.success) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("businessType", signUpForm.businessType);
        if (signUpForm.businessType === "restaurant") {
          router.push("/business/onboarding");
        } else {
          router.push("/business/manufacturing/onboarding");
        }
      } else {
        throw new Error(response.error || "Registration failed");
      }
    } catch (error) {
      setError(`Registration failed: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={signInForm.phoneNumber}
                    onChange={(e) =>
                      setSignInForm({ ...signInForm, phoneNumber: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="licenseNumber">FSSAI License Number</Label>
                  <Input
                    id="licenseNumber"
                    name="licenseNumber"
                    value={signInForm.licenseNumber}
                    onChange={(e) =>
                      setSignInForm({ ...signInForm, licenseNumber: e.target.value })
                    }
                    required
                  />
                </div>

                <Button
                  onClick={() => handleSendOTP("signin")}
                  disabled={!signInForm.phoneNumber || isLoading}
                >
                  {isLoading ? "Sending..." : "Send OTP"}
                </Button>

                {showOTP && (
                  <div>
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      name="otp"
                      value={signInForm.otp}
                      onChange={(e) =>
                        setSignInForm({ ...signInForm, otp: e.target.value })
                      }
                      required
                    />
                    <Button onClick={handleSignIn} disabled={isLoading}>
                      {isLoading ? "Signing In..." : "Sign In"}
                    </Button>
                  </div>
                )}
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    value={signUpForm.businessName}
                    onChange={(e) =>
                      setSignUpForm({ ...signUpForm, businessName: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="licenseNumber">FSSAI License Number</Label>
                  <Input
                    id="licenseNumber"
                    name="licenseNumber"
                    value={signUpForm.licenseNumber}
                    onChange={(e) =>
                      setSignUpForm({ ...signUpForm, licenseNumber: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={signUpForm.phoneNumber}
                    onChange={(e) =>
                      setSignUpForm({ ...signUpForm, phoneNumber: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label>Business Type</Label>
                  <RadioGroup
                    value={signUpForm.businessType}
                    onValueChange={(value) =>
                      setSignUpForm({ ...signUpForm, businessType: value as "restaurant" | "manufacturer" })
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="restaurant" id="restaurant" />
                      <Label htmlFor="restaurant">Restaurant</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manufacturer" id="manufacturer" />
                      <Label htmlFor="manufacturer">Manufacturer</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button
                  onClick={() => handleSendOTP("signup")}
                  disabled={!signUpForm.phoneNumber || isLoading}
                >
                  {isLoading ? "Sending..." : "Send OTP"}
                </Button>

                {showOTP && (
                  <div>
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      name="otp"
                      value={signUpForm.otp}
                      onChange={(e) =>
                        setSignUpForm({ ...signUpForm, otp: e.target.value })
                      }
                      required
                    />
                    <Button onClick={handleSignUp} disabled={isLoading}>
                      {isLoading ? "Signing Up..." : "Sign Up"}
                    </Button>
                  </div>
                )}
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};