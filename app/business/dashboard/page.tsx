"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import { Star, Copy, ImageIcon } from 'lucide-react';
import RestaurantCertifications from "./components/restaurant-certifications"

interface BusinessDetails {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  license_number: string;
  business_type: string;
  owner_name: string;
  owner_photo_url: string | null;
  logo_url: string | null;
  trade_license: string;
  gst_number: string;
  fire_safety_cert: string;
  liquor_license?: string;
  music_license?: string;
}

interface LabReport {
  id: number;
  type: string;
  date: string;
  status: string;
  report_url: string | null;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  photo_url: string | null;
}

interface FacilityPhoto {
  id: number;
  area_name: string;
  photo_url: string | null;
}

interface HygieneRating {
  food_handling: number;
  premises_maintenance: number;
  staff_hygiene: number;
  legal_compliance: number;
  customer_complaints: number;
  inspection_date: string;
}

interface Violation {
  id: number;
  date: string;
  description: string;
  severity: string;
}

interface Certification {
  id: number;
  business_id: number;
  type: string;
  number: string;
  valid_from: string;
  valid_to: string;
  status: 'Active' | 'Expired';
}

export default function BusinessDashboard() {
  const router = useRouter();
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails | null>(null);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [facilityPhotos, setFacilityPhotos] = useState<FacilityPhoto[]>([]);
  const [hygieneRating, setHygieneRating] = useState<HygieneRating | null>(null);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [businessId, setBusinessId] = useState<number>(0)

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Get the latest business details
        const { data: business, error: businessError } = await supabase
          .from('businesses')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (businessError) throw businessError;
        setBusinessDetails(business);

        // Using the business ID, fetch all related data
        const businessId = business.id;

        // Fetch lab reports
        const { data: reports } = await supabase
          .from('lab_reports')
          .select('*')
          .eq('business_id', businessId)
          .order('date', { ascending: false });
        setLabReports(reports || []);

        // Fetch team members
        const { data: members } = await supabase
          .from('team_members')
          .select('*')
          .eq('business_id', businessId);
        setTeamMembers(members || []);

        // Fetch facility photos
        const { data: photos } = await supabase
          .from('facility_photos')
          .select('*')
          .eq('business_id', businessId);
        setFacilityPhotos(photos || []);

        // Fetch hygiene rating - handle empty result
        const { data: hygieneData, error: hygieneError } = await supabase
          .from('hygiene_ratings')
          .select('*')
          .eq('business_id', businessId)
          .order('inspection_date', { ascending: false })
          .limit(1);
        
        if (!hygieneError && hygieneData && hygieneData.length > 0) {
          setHygieneRating(hygieneData[0]);
        } else {
          // Set default hygiene rating or null
          setHygieneRating({
            food_handling: 0,
            premises_maintenance: 0,
            staff_hygiene: 0,
            legal_compliance: 0,
            customer_complaints: 0,
            inspection_date: new Date().toISOString(),
          });
        }

        // Fetch violations
        const { data: violationData } = await supabase
          .from('violations')
          .select('*')
          .eq('business_id', businessId)
          .order('date', { ascending: false });
        setViolations(violationData || []);

        // Fetch certifications - handle empty result
        const { data: certData, error: certError } = await supabase
          .from('certifications')
          .select('*')
          .eq('business_id', businessId)
          .order('certification_type', { ascending: true });
        
        if (!certError) {
          setCertifications(certData || []);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    // Get businessId from localStorage
    const id = localStorage.getItem('businessId')
    if (id) {
      setBusinessId(parseInt(id))
    }
  }, [])

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );

  if (error) return (
    <div className="bg-white border border-red-100 shadow-md rounded-lg p-6 text-center text-red-600">
      {error}
    </div>
  );

  if (!businessDetails) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-yellow-50 text-yellow-600 p-4 rounded-lg">
        No business details found
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      {/* Business Header */}
      <div className="bg-gradient-to-b from-white to-gray-50 border border-gray-200 shadow-[0_2px_4px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.12),0_8px_16px_rgba(0,0,0,0.08)] transition-shadow duration-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gray-100 rounded-full overflow-hidden">
            {businessDetails.logo_url ? (
              <img 
                src={businessDetails.logo_url}
                alt={businessDetails.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
          </div>
          <div className="flex-grow">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">{businessDetails.name}</h1>
              <button className="p-1">
                <Copy className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="text-sm space-y-1 mt-2">
              <p>License: {businessDetails.license_number}</p>
              <p>Address: {businessDetails.address}</p>
              <p>FSSAI Care: 1800-112-100</p>
              <p>Email: {businessDetails.email}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
            Apply for License Renewal
          </button>
          <button className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
            Apply for New License
          </button>
          <button className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
            Apply for Lab Reports
          </button>
        </div>
      </div>

      {/* Hygiene Rating */}
      <div className="bg-gradient-to-b from-white to-gray-50 border border-gray-200 shadow-[0_2px_4px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.12),0_8px_16px_rgba(0,0,0,0.08)] transition-shadow duration-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Hygiene Rating</h2>
        {hygieneRating ? (
          <>
            <div className="flex items-center gap-2 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-6 w-6 ${i < Math.floor((
                    hygieneRating.food_handling +
                    hygieneRating.premises_maintenance +
                    hygieneRating.staff_hygiene +
                    hygieneRating.legal_compliance +
                    hygieneRating.customer_complaints
                  ) / 95 * 5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
              <span className="ml-2 text-sm">Excellent hygiene, no violations</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Food Handling Practices</span>
                <span className="font-medium">{hygieneRating.food_handling}/30</span>
              </div>
              <div className="flex justify-between">
                <span>Maintenance of Premises</span>
                <span className="font-medium">{hygieneRating.premises_maintenance}/20</span>
              </div>
              <div className="flex justify-between">
                <span>Staff Hygiene</span>
                <span className="font-medium">{hygieneRating.staff_hygiene}/20</span>
              </div>
              <div className="flex justify-between">
                <span>Legal Compliance</span>
                <span className="font-medium">{hygieneRating.legal_compliance}/15</span>
              </div>
              <div className="flex justify-between">
                <span>Customer Complaints/History</span>
                <span className="font-medium">{hygieneRating.customer_complaints}/10</span>
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-center">No hygiene rating available</p>
        )}
      </div>

      {/* Violations */}
      <div className="bg-gradient-to-b from-white to-gray-50 border border-gray-200 shadow-[0_2px_4px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.12),0_8px_16px_rgba(0,0,0,0.08)] transition-shadow duration-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Violations</h2>
        <div className="space-y-4">
          {violations.map((violation) => (
            <div key={violation.id} className="flex justify-between items-start border-b pb-3">
              <div>
                <p className="font-medium">
                  {new Date(violation.date).toLocaleDateString()}
                </p>
                <p className="text-gray-600">{violation.description}</p>
              </div>
              <span className={`px-2 py-1 rounded text-sm ${
                violation.severity === 'Minor' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : violation.severity === 'Major'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {violation.severity}
              </span>
            </div>
          ))}
          {violations.length === 0 && (
            <p className="text-gray-500 text-center">No violations recorded</p>
          )}
        </div>
      </div>

      {/* Restaurant Certifications */}
      <RestaurantCertifications businessId={businessId} />

      {/* Owner Information */}
      <div className="bg-gradient-to-b from-white to-gray-50 border border-gray-200 shadow-[0_2px_4px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.12),0_8px_16px_rgba(0,0,0,0.08)] transition-shadow duration-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Owner Information</h2>
          <div className="space-x-2">
            <button className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all duration-200">
              Edit Owner Info
            </button>
            <button className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all duration-200">
              Update Photo
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-100 rounded-full overflow-hidden">
            {businessDetails.owner_photo_url ? (
              <img 
                src={businessDetails.owner_photo_url}
                alt={businessDetails.owner_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-full" />
            )}
          </div>
          <div>
            <h3 className="font-medium">{businessDetails.owner_name}</h3>
            <p className="text-sm text-gray-600">Owner</p>
          </div>
        </div>
      </div>

      {/* Lab Reports */}
      <div className="bg-gradient-to-b from-white to-gray-50 border border-gray-200 shadow-[0_2px_4px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.12),0_8px_16px_rgba(0,0,0,0.08)] transition-shadow duration-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Lab Reports</h2>
          <button className="px-3 py-2 bg-black text-white rounded-lg text-sm flex items-center gap-2 hover:bg-gray-800 hover:shadow-md transition-all duration-200">
            <span>+</span> Add New Report
          </button>
        </div>
        <div className="space-y-4">
          {labReports.map((report) => (
            <div key={report.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
              <div>
                <h3 className="font-medium">{report.type}</h3>
                <p className="text-sm text-gray-500">
                  Date: {new Date(report.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center text-green-600 text-sm">
                  ✓ {report.status}
                </span>
                <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                  View Details
                </button>
              </div>
            </div>
          ))}
          {labReports.length === 0 && (
            <p className="text-gray-500 text-center">No lab reports available</p>
          )}
        </div>
      </div>

      {/* Our Team */}
      <div className="bg-gradient-to-b from-white to-gray-50 border border-gray-200 shadow-[0_2px_4px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.12),0_8px_16px_rgba(0,0,0,0.08)] transition-shadow duration-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Our Team</h2>
          <button className="px-3 py-2 bg-black text-white rounded-lg text-sm flex items-center gap-2 hover:bg-gray-800 hover:shadow-md transition-all duration-200">
            <span>+</span> Add Team Member
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="w-24 h-24 bg-gray-100 rounded-full mb-3">
                  {member.photo_url ? (
                    <img 
                      src={member.photo_url}
                      alt={member.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-full" />
                  )}
                </div>
                <button className="absolute bottom-2 right-0 w-6 h-6 bg-white rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                  <span>+</span>
                </button>
              </div>
              <h3 className="font-medium">{member.name}</h3>
              <p className="text-sm text-gray-600">{member.role}</p>
            </div>
          ))}
          {teamMembers.length === 0 && (
            <p className="text-gray-500 text-center col-span-3">No team members added</p>
          )}
        </div>
      </div>

      {/* Facility Photos */}
      <div className="bg-gradient-to-b from-white to-gray-50 border border-gray-200 shadow-[0_2px_4px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.12),0_8px_16px_rgba(0,0,0,0.08)] transition-shadow duration-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Facility Photos</h2>
          <button className="px-3 py-2 bg-black text-white rounded-lg text-sm flex items-center gap-2 hover:bg-gray-800 hover:shadow-md transition-all duration-200">
            <span>+</span> Add Photo
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {facilityPhotos.map((facility) => (
            <div key={facility.id} className="flex flex-col">
              <div className="relative group">
                <div className="aspect-[4/3] bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                  {facility.photo_url ? (
                    <img 
                      src={facility.photo_url}
                      alt={facility.area_name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-gray-400">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                  <button 
                    className="absolute bottom-2 right-2 px-3 py-1 bg-white text-sm rounded 
                             shadow hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Edit Area Name
                  </button>
                </div>
                <p className="text-center font-medium">{facility.area_name}</p>
              </div>
            </div>
          ))}
          {facilityPhotos.length === 0 && (
            <p className="text-gray-500 text-center col-span-3">No facility photos added</p>
          )}
        </div>
      </div>
    </div>
  );
}

