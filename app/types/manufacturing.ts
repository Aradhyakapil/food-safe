export interface ManufacturingDetails {
  business_id: number
  production_capacity: string
  manufacturing_license: string
  iso_certification?: string
  haccp_certification?: string
  description: string
}

export interface BatchProduction {
  business_id: number
  batch_number: string
  manufacturing_date: string
  expiry_date: string
  production_facility: string
  supervisor: string
  testing_parameters: string
  storage_conditions: string
}

export interface PackagingCompliance {
  business_id: number
  material_type: string
  fssai_compliant: boolean
  tamper_proof_method: string
  labeling_details: string
  sustainability_info: string
  barcode: string
  shelf_life_info: string
  regulatory_certification: string
} 