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
export const fetchApi = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Clone the response before reading
    const clonedResponse = response.clone();
    
    try {
      return await clonedResponse.json();
    } catch (error) {
      // If JSON parsing fails, try reading the original response as text
      const textResponse = await response.text();
      throw new Error(textResponse || 'Failed to parse response');
    }
  } catch (error) {
    throw error;
  }
};

export const login = async (email: string, password: string) => {
  return await fetchApi("/login", "POST", { email, password })
}

export const register = async (name: string, email: string, password: string, userType: string) => {
  return await fetchApi("/register", "POST", { name, email, password, userType })
}

export const loginBusiness = async (phoneNumber: string, licenseNumber: string, businessType: string) => {
  try {
    if (!phoneNumber || !licenseNumber || !businessType) {
      throw new Error('Phone number, license number, and business type are required');
    }

    const response = await fetch('/api/business/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber, licenseNumber, businessType }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    if (data.businessId) {
      localStorage.setItem('businessId', data.businessId.toString());
      localStorage.setItem('businessName', data.name);
      localStorage.setItem('businessType', businessType);
      localStorage.setItem('token', data.token);
    }
    
    return data;
  } catch (error) {
    throw error;
  }
};

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
  return await fetchApi(`/api/business/${businessId}/hygiene-ratings`, "GET")
}

export const getCertifications = async (businessId: number) => {
  try {
    const response = await fetch(`/api/business/certifications/${businessId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch certifications');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch certifications:', error);
    throw error;
  }
};

export const createCertification = async (certificationData: Partial<Certification>): Promise<Certification> => {
  return await fetchApi(`/certification`, "POST", certificationData)
}

export const getLabReports = async (businessId: number) => {
  try {
    const response = await fetch(`/api/business/lab-reports/${businessId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch lab reports');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch lab reports:', error);
    throw error;
  }
};

export const getTeamMembers = async (businessId: number): Promise<any[]> => {
  return await fetchApi(`/api/business/${businessId}/team-members`, "GET")
}

export const getFacilityPhotos = async (businessId: number) => {
  try {
    const response = await fetch(`/api/business/facility-photos/${businessId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch facility photos');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch facility photos:', error);
    throw error;
  }
};

export const getReviews = async (businessId: number): Promise<any[]> => {
  return await fetchApi(`/api/business/${businessId}/reviews`, "GET")
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
      businessType: "business_type",
      phone: "phone",
      email: "email",
      address: "address"
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

    // Handle files
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
    const teamMemberNames = formData.get("team_member_names");
    const teamMemberRoles = formData.get("team_member_roles");
    const teamMemberPhotos = formData.getAll("team_member_photos");

    if (teamMemberNames && teamMemberRoles && teamMemberPhotos.length > 0) {
      newFormData.append("team_member_names", teamMemberNames.toString());
      newFormData.append("team_member_roles", teamMemberRoles.toString());
      teamMemberPhotos.forEach((photo) => {
        if (photo instanceof File) {
          newFormData.append("team_member_photos", photo, photo.name);
        }
      });
    }

    // Handle facility photos
    const facilityAreaNames = formData.get("facility_photo_area_names");
    const facilityPhotos = formData.getAll("facility_photos");

    if (facilityAreaNames && facilityPhotos.length > 0) {
      newFormData.append("facility_photo_area_names", facilityAreaNames.toString());
      facilityPhotos.forEach((photo) => {
        if (photo instanceof File) {
          newFormData.append("facility_photos", photo, photo.name);
        }
      });
    }

    const response = await fetch("/api/business/onboard", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: newFormData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || "Failed to onboard business");
    }

    if (!data.businessId) {
      throw new Error("No business ID returned from server");
    }

    return {
      success: true,
      businessId: data.businessId,
      message: data.message
    };

  } catch (error) {
    console.error("Onboarding error:", error);
    throw error;
  }
};


