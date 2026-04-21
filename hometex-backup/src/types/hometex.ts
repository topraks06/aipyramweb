
export interface Category {
  id: number;
  name_en: string;
  name_ar?: string;
  name_ru?: string;
  name_tr?: string;
  slug: string;
  description_en?: string;
  description_ar?: string;
  description_ru?: string;
  description_tr?: string;
  icon_url?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
}

export interface Subcategory {
  id: number;
  category_id: number;
  name_en: string;
  name_ar?: string;
  name_ru?: string;
  name_tr?: string;
  slug: string;
  description_en?: string;
  description_ar?: string;
  description_ru?: string;
  description_tr?: string;
  display_order: number;
  is_active: boolean;
}

export interface Company {
  id: number;
  user_id: number;
  company_name: string;
  company_type: 'manufacturer' | 'supplier' | 'buyer' | 'distributor';
  registration_number?: string;
  tax_id?: string;
  country: string;
  city?: string;
  address?: string;
  website_url?: string;
  description?: string;
  year_established?: number;
  employee_count?: string;
  annual_turnover?: string;
  is_verified: boolean;
  verification_date?: string;
  verification_documents?: any;
  created_at: string;
  updated_at: string;
}

export interface Showroom {
  id: number;
  user_id: number;
  company_id: number;
  title: string;
  slug?: string;
  description?: string;
  banner_image_url?: string;
  logo_url?: string;
  video_url?: string;
  theme_color: string;
  is_active: boolean;
  is_featured: boolean;
  view_count: number;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  created_at: string;
  updated_at: string;
  company?: Company;
}

export interface Product {
  id: number;
  user_id: number;
  showroom_id: number;
  category_id: number;
  subcategory_id?: number;
  name: string;
  slug?: string;
  description?: string;
  specifications?: any;
  material?: string;
  color?: string;
  pattern?: string;
  dimensions?: string;
  weight?: string;
  price_per_unit?: number;
  currency: string;
  minimum_order_quantity?: number;
  unit_of_measure?: string;
  lead_time_days?: number;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'made_to_order';
  is_featured: boolean;
  view_count: number;
  inquiry_count: number;
  status: 'draft' | 'active' | 'inactive' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: number;
  user_id: number;
  product_id: number;
  image_url: string;
  alt_text?: string;
  display_order: number;
  is_primary: boolean;
}

export interface BuyerRequest {
  id: number;
  user_id: number;
  category_id: number;
  subcategory_id?: number;
  title: string;
  description: string;
  quantity: number;
  unit_of_measure?: string;
  budget_min?: number;
  budget_max?: number;
  currency: string;
  target_country?: string;
  delivery_timeline?: string;
  quality_requirements?: string;
  certifications_required?: any;
  status: 'open' | 'in_progress' | 'closed' | 'cancelled';
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Certification {
  id: number;
  name: string;
  code?: string;
  description?: string;
  issuing_organization?: string;
  icon_url?: string;
  is_active: boolean;
}

export interface CompanyCertification {
  id: number;
  user_id: number;
  company_id: number;
  certification_id: number;
  certificate_number?: string;
  issue_date?: string;
  expiry_date?: string;
  document_url?: string;
  is_verified: boolean;
  certification?: Certification;
}

export interface UserProfile {
  id: number;
  user_id: number;
  full_name: string;
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
  avatar_url?: string;
  language_preference: 'en' | 'ar' | 'ru' | 'tr';
  created_at: string;
  updated_at: string;
}

export interface MatchingScore {
  id: number;
  request_id: number;
  supplier_user_id: number;
  showroom_id: number;
  match_score: number;
  score_breakdown?: any;
  reasoning?: string;
  is_recommended: boolean;
  status: 'pending' | 'contacted' | 'quoted' | 'rejected';
  created_at: string;
  updated_at: string;
  showroom?: Showroom;
}
