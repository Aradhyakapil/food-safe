import type { Business, Certification, LabReport, TeamMember, FacilityPhoto, Review } from "@/app/types"

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
  businessType: string
) => {
  return await fetchApi("/business/register", "POST", { businessName, phoneNumber, licenseNumber, businessType });
}
export const sendOTP = async (phoneNumber: string) => {
  return await fetchApi("/business/send-otp", "GET", { phone_number: phoneNumber });
};

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
    const token = getAuthToken()
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_URL}/business/onboard`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.detail || `HTTP error! status: ${response.status}`)
    }

    return { success: true, data }
  } catch (error) {
    console.error("Onboarding error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Onboarding failed" }
  }
}

