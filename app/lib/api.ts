//const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
const API_URL = "http://localhost:8000"

export async function fetchApi(url: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
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

export async function getHygieneRatings(businessId: number) {
  try {
    const response = await fetchApi(`/api/business/${businessId}/hygiene-ratings`);
    if (!response.ok) {
      throw new Error('Failed to fetch hygiene ratings');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching hygiene ratings:', error);
    throw error;
  }
}

export async function getCertifications(businessId: number) {
  return fetchApi(`/api/business/${businessId}/certifications`)
}

export async function getLabReports(businessId: number) {
  return fetchApi(`/api/business/${businessId}/lab-reports`)
}

export async function getTeamMembers(businessId: number) {
  try {
    const response = await fetchApi(`/api/business/${businessId}/team-members`);
    if (!response.ok) {
      throw new Error('Failed to fetch team members');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching team members:', error);
    throw error;
  }
}

export async function getFacilityPhotos(businessId: number) {
  try {
    const response = await fetchApi(`/api/business/${businessId}/facility-photos`);
    if (!response.ok) {
      throw new Error('Failed to fetch facility photos');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching facility photos:', error);
    throw error;
  }
}

export async function getReviews(businessId: number) {
  try {
    const response = await fetchApi(`/api/business/${businessId}/reviews`);
    if (!response.ok) {
      throw new Error('Failed to fetch reviews');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
}

