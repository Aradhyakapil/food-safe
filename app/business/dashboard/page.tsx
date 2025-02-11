"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

interface BusinessDetails {
  name: string;
  address: string;
  phone: string;
  email: string;
  license_number: string;
  business_type: string;
  owner_name: string;
  logo_url: string;
  owner_photo_url: string;
  // Add other fields as needed
}

export default function BusinessDashboard() {
  const router = useRouter();
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinessDetails = async () => {
      try {
        // Get the latest business details from Supabase
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;

        setBusinessDetails(data);
      } catch (err) {
        console.error('Error fetching business details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load business details');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessDetails();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!businessDetails) return <div>No business details found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Business Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Logo and Basic Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            {businessDetails.logo_url && (
              <img 
                src={businessDetails.logo_url} 
                alt="Business Logo" 
                className="w-24 h-24 rounded-full object-cover mr-4"
              />
            )}
            <div>
              <h2 className="text-2xl font-semibold">{businessDetails.name}</h2>
              <p className="text-gray-600">{businessDetails.business_type}</p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
            <p><strong>Address:</strong> {businessDetails.address}</p>
            <p><strong>Phone:</strong> {businessDetails.phone}</p>
            <p><strong>Email:</strong> {businessDetails.email}</p>
          </div>
        </div>

        {/* Owner Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Owner Details</h3>
          <div className="flex items-center">
            {businessDetails.owner_photo_url && (
              <img 
                src={businessDetails.owner_photo_url} 
                alt="Owner" 
                className="w-20 h-20 rounded-full object-cover mr-4"
              />
            )}
            <div>
              <p><strong>Name:</strong> {businessDetails.owner_name}</p>
              <p><strong>License Number:</strong> {businessDetails.license_number}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

