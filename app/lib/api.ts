//const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
const API_URL = "http://localhost:8000"
export const fetchApi = async (path: string, method: "GET" | "POST" | "PUT" | "DELETE" = "GET", body?: any) => {
  const url = `${API_URL}${path}`
  const headers = {
    "Content-Type": "application/json",
  }

  const options: RequestInit = {
    method,
    headers,
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching data:", error)
    throw error // Re-throw the error to be handled by the caller
  }
}

export const login = async (phoneNumber: string, licenseNumber: string) => {
  return await fetchApi("/login", "POST", { phoneNumber, licenseNumber })
}

export const register = async (
  businessName: string,
  phoneNumber: string,
  licenseNumber: string,
  businessType: string,
) => {
  return await fetchApi("/register", "POST", { businessName, phoneNumber, licenseNumber, businessType })
}

