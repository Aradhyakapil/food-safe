"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { onboardBusiness } from "@/app/api/api";
import { toast } from "@/components/ui/use-toast";

interface TeamMember {
  name: string;
  role: string;
  image?: File;
}

interface FacilityPhoto {
  name: string;
  image?: File;
}

export default function BusinessOnboardingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [businessLogo, setBusinessLogo] = useState<File | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [facilityPhotos, setFacilityPhotos] = useState<FacilityPhoto[]>([]);

  const [formData, setFormData] = useState({
    businessName: "",
    address: "",
    phone: "",
    email: "",
    licenseNumber: "",
    businessType: localStorage.getItem("businessType") || "",
    ownerName: "",
    ownerPhoto: null as File | null,
    description: "",
    tradeLicense: "",
    gstNumber: "",
    fireSafetyCert: "",
    liquorLicense: "",
    musicLicense: "",
  });

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type and size
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setError("Only JPEG and PNG files are allowed.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError("File size must not exceed 2MB.");
        return;
      }

      if (field === "businessLogo") {
        setBusinessLogo(file);
      } else if (field === "ownerPhoto") {
        setFormData((prev) => ({ ...prev, ownerPhoto: file }));
      }
    }
  };

  // Handle adding/removing team members
  const handleAddTeamMember = () => {
    setTeamMembers((prev) => [...prev, { name: "", role: "" }]);
  };

  const handleTeamMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    setTeamMembers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleTeamMemberPhoto = (index: number, file: File) => {
    setTeamMembers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], image: file };
      return updated;
    });
  };

  // Handle adding/removing facility photos
  const handleAddFacilityPhoto = () => {
    setFacilityPhotos((prev) => [...prev, { name: "" }]);
  };

  const handleFacilityPhotoChange = (index: number, field: keyof FacilityPhoto, value: any) => {
    setFacilityPhotos((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formDataToSend = new FormData();

      // Append all fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && key !== "ownerPhoto") {
          formDataToSend.append(key, value.toString());
        }
      });

      // Append files
      if (businessLogo) formDataToSend.append("business_logo", businessLogo);
      if (formData.ownerPhoto) formDataToSend.append("owner_photo", formData.ownerPhoto);

      // Append team members
      teamMembers.forEach((member, index) => {
        formDataToSend.append(`team_member_names`, member.name);
        formDataToSend.append(`team_member_roles`, member.role);
        if (member.image) {
          formDataToSend.append(`team_member_photos`, member.image, `team_member_${index}`);
        }
      });

      // Append facility photos
      facilityPhotos.forEach((photo, index) => {
        formDataToSend.append(`facility_photo_area_names`, photo.name);
        if (photo.image) {
          formDataToSend.append(`facility_photos`, photo.image, `facility_photo_${index}`);
        }
      });

      console.log("Submitting form data:", Object.fromEntries(formDataToSend));

      const response = await onboardBusiness(formDataToSend);

      if (response.success) {
        toast({
          title: "Business Onboarded",
          description: "Your business has been successfully onboarded.",
        });
        router.push("/business/dashboard");
      } else {
        throw new Error(response.error || "Onboarding failed");
      }
    } catch (error) {
      console.error("Onboarding failed:", error);
      setError(error instanceof Error ? error.message : "An unexpected error occurred during onboarding.");
      toast({
        title: "Onboarding Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred during onboarding.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect to login if no token is found
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Complete Your Business Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
              <Separator className="mb-4" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    type="email"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Licenses & Certifications */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Licenses & Certifications</h3>
              <Separator className="mb-4" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="licenseNumber">FSSAI License Number</Label>
                  <Input
                    id="licenseNumber"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="tradeLicense">Trade License Number</Label>
                  <Input
                    id="tradeLicense"
                    name="tradeLicense"
                    value={formData.tradeLicense}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="gstNumber">GST Number</Label>
                  <Input
                    id="gstNumber"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="fireSafetyCert">Fire Safety Certificate</Label>
                  <Input
                    id="fireSafetyCert"
                    name="fireSafetyCert"
                    value={formData.fireSafetyCert}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="liquorLicense">Liquor License (if applicable)</Label>
                  <Input
                    id="liquorLicense"
                    name="liquorLicense"
                    value={formData.liquorLicense}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="musicLicense">Music License (if applicable)</Label>
                  <Input
                    id="musicLicense"
                    name="musicLicense"
                    value={formData.musicLicense}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Business Logo */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Business Logo</h3>
              <Separator className="mb-4" />

              <Label htmlFor="businessLogo">
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer">
                  <Upload className="mx-auto mb-2" />
                  {businessLogo ? businessLogo.name : "Upload Business Logo"}
                </div>
              </Label>
              <Input
                id="businessLogo"
                type="file"
                accept="image/jpeg, image/png"
                onChange={(e) => handleFileChange(e, "businessLogo")}
                className="hidden"
              />
            </div>

            {/* Owner Information */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Owner Information</h3>
              <Separator className="mb-4" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ownerName">Owner Name</Label>
                  <Input
                    id="ownerName"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="ownerPhoto">Owner Photo</Label>
                  <Input
                    id="ownerPhoto"
                    type="file"
                    accept="image/jpeg, image/png"
                    onChange={(e) => handleFileChange(e, "ownerPhoto")}
                  />
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Team Members</h3>
              <Separator className="mb-4" />

              <Button onClick={handleAddTeamMember} className="mb-4">
                <Plus className="mr-2" /> Add Team Member
              </Button>

              {teamMembers.map((member, index) => (
                <div key={index} className="border p-4 rounded-md mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={member.name}
                        onChange={(e) => handleTeamMemberChange(index, "name", e.target.value)}
                        placeholder="Team member name"
                        required
                      />
                    </div>

                    <div>
                      <Label>Role</Label>
                      <Input
                        value={member.role}
                        onChange={(e) => handleTeamMemberChange(index, "role", e.target.value)}
                        placeholder="Team member role"
                        required
                      />
                    </div>

                    <div>
                      <Label>Photo</Label>
                      <Input
                        type="file"
                        accept="image/jpeg, image/png"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleTeamMemberPhoto(index, e.target.files[0]);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Facility Photos */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Facility Photos</h3>
              <Separator className="mb-4" />

              <Button onClick={handleAddFacilityPhoto} className="mb-4">
                <Plus className="mr-2" /> Add Photo
              </Button>

              {facilityPhotos.map((photo, index) => (
                <div key={index} className="border p-4 rounded-md mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Area Name</Label>
                      <Input
                        value={photo.name}
                        onChange={(e) => handleFacilityPhotoChange(index, "name", e.target.value)}
                        placeholder="e.g., Kitchen, Dining Area"
                        required
                      />
                    </div>

                    <div>
                      <Label>Photo</Label>
                      <Input
                        type="file"
                        accept="image/jpeg, image/png"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFacilityPhotoChange(index, "image", e.target.files[0]);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Complete Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}