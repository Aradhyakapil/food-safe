import type { Business, Certification, LabReport, TeamMember, FacilityPhoto, Review } from "@/app/types"
import { supabase } from "@/app/lib/supabase"

const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token")
  }
  return null
}

//const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
const API_URL = "http://localhost:8000"
export const fetchApi = async (
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: any,
  isFormData = false,
) => {
  const url = `${API_URL}${path}`
  const headers: HeadersInit = {}

  if (!isFormData) {
    headers["Content-Type"] = "application/json"
  }

  // Add authentication token to headers
  const token = localStorage.getItem("token")
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const options: RequestInit = {
    method,
    headers,
    body: isFormData ? body : JSON.stringify(body),
  }

  try {
    const response = await fetch(url, options)
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`)
    }
    return data
  } catch (error) {
    console.error("Error fetching data:", error)
    throw error
  }
}

export const login = async (email: string, password: string) => {
  return await fetchApi("/login", "POST", { email, password })
}

export const register = async (name: string, email: string, password: string, userType: string) => {
  return await fetchApi("/register", "POST", { name, email, password, userType })
}

export const loginBusiness = async (phoneNumber: string, licenseNumber: string) => {
  return await fetchApi("/business/login", "POST", { phoneNumber, licenseNumber });
}
export const registerBusiness = async (
  businessName: string,
  phoneNumber: string,
  licenseNumber: string,
  otp: string
) => {
  return await fetchApi("/auth/business/register", "POST", {
    business_name: businessName,
    phone_number: phoneNumber,
    license_number: licenseNumber,
    otp: otp
  });
}
export const sendOTP = async (phoneNumber: string) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    phone: phoneNumber
  });
  
  if (error) throw error;
  
  return { success: true, message: "OTP sent successfully" };
}

export const getBusiness = async (businessId: string): Promise<Business> => {
  return await fetchApi(`/business/${businessId}`, "GET")
}

export const getHygieneRatings = async (businessId: number): Promise<any[]> => {
  return await fetchApi(`/hygiene-ratings/${businessId}`, "GET")
}

export const getCertifications = async (businessId: number): Promise<Certification[]> => {
  return await fetchApi(`/certifications/${businessId}`, "GET")
}

export const createCertification = async (certificationData: Partial<Certification>): Promise<Certification> => {
  return await fetchApi(`/certification`, "POST", certificationData)
}

export const getLabReports = async (businessId: number): Promise<LabReport[]> => {
  return await fetchApi(`/lab-reports/${businessId}`, "GET")
}

export const getTeamMembers = async (businessId: number): Promise<TeamMember[]> => {
  return await fetchApi(`/team-members/${businessId}`, "GET")
}

export const getFacilityPhotos = async (businessId: number): Promise<FacilityPhoto[]> => {
  return await fetchApi(`/facility-photos/${businessId}`, "GET")
}

export const getReviews = async (businessId: number): Promise<Review[]> => {
  return await fetchApi(`/reviews/${businessId}`, "GET")
}

export const updateBusiness = async (businessId: number, updatedData: Partial<Business>): Promise<Business> => {
  return await fetchApi(`/business/${businessId}`, "PUT", updatedData)
}

export const createLabReport = async (businessId: number, reportData: Partial<LabReport>): Promise<LabReport> => {
  return await fetchApi(`/lab-reports/${businessId}`, "POST", reportData)
}

export const createTeamMember = async (
  businessId: number,
  teamMemberData: Partial<TeamMember>,
): Promise<TeamMember> => {
  return await fetchApi(`/team-members/${businessId}`, "POST", teamMemberData)
}

export const createFacilityPhoto = async (
  businessId: number,
  photoData: Partial<FacilityPhoto>,
): Promise<FacilityPhoto> => {
  return await fetchApi(`/facility-photos/${businessId}`, "POST", photoData)
}

export const onboardBusiness = async (formData: FormData) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    // Create a new FormData object with properly formatted data
    const newFormData = new FormData();
    
    // Map frontend field names to backend expected names
    const fieldMapping: Record<string, string> = {
      businessName: "business_name",
      ownerName: "owner_name",
      tradeLicense: "trade_license",
      fireSafetyCert: "fire_safety_cert",
      liquorLicense: "liquor_license",
      musicLicense: "music_license",
      gstNumber: "gst_number",
      licenseNumber: "license_number",
      businessType: "business_type"
    };

    // Add basic business information with correct field names
    for (const [key, value] of formData.entries()) {
      const mappedKey = fieldMapping[key] || key;
      if (!key.includes("team_member") && !key.includes("facility_photo")) {
        newFormData.append(mappedKey, value.toString());
      }
    }

    // Validate required fields
    const requiredFields = [
      "business_name", "address", "phone", "email", 
      "license_number", "business_type", "owner_name",
      "trade_license", "gst_number", "fire_safety_cert"
    ];

    for (const field of requiredFields) {
      const value = newFormData.get(field);
      if (!value || value.toString().trim() === '') {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Add files with correct field names
    const businessLogo = formData.get("business_logo");
    const ownerPhoto = formData.get("owner_photo");
    
    if (!(businessLogo instanceof File)) {
      throw new Error("Business logo is required");
    }
    if (!(ownerPhoto instanceof File)) {
      throw new Error("Owner photo is required");
    }

    newFormData.append("business_logo", businessLogo, businessLogo.name);
    newFormData.append("owner_photo", ownerPhoto, ownerPhoto.name);

    // Handle team members
    const teamMemberNames = formData.get("team_member_names")?.toString() || "";
    const teamMemberRoles = formData.get("team_member_roles")?.toString() || "";
    const teamMemberPhotos = formData.getAll("team_member_photos");

    if (!teamMemberNames || !teamMemberRoles || teamMemberPhotos.length === 0) {
      throw new Error("Team member information is required");
    }

    newFormData.append("team_member_names", teamMemberNames);
    newFormData.append("team_member_roles", teamMemberRoles);
    teamMemberPhotos.forEach((photo) => {
      if (photo instanceof File) {
        newFormData.append("team_member_photos", photo, photo.name);
      }
    });

    // Handle facility photos
    const facilityAreaNames = formData.get("facility_photo_area_names")?.toString() || "";
    const facilityPhotos = formData.getAll("facility_photos");

    if (!facilityAreaNames || facilityPhotos.length === 0) {
      throw new Error("Facility photos and area names are required");
    }

    newFormData.append("facility_photo_area_names", facilityAreaNames);
    facilityPhotos.forEach((photo) => {
      if (photo instanceof File) {
        newFormData.append("facility_photos", photo, photo.name);
      }
    });

    const response = await fetch(`${API_URL}/business/onboard`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: newFormData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Backend error:", errorData);
      if (errorData.detail?.[0]?.msg) {
        throw new Error(errorData.detail[0].msg);
      }
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Onboarding error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Onboarding failed" 
    };
  }
};


