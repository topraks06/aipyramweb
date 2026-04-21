export interface GlobalLead {
  id?: string;
  company_name: string;
  country: string;
  city?: string;
  website?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  instagram?: string;
  
  category: 'manufacturer' | 'architect' | 'wholesaler' | 'retailer' | 'hotel' | 'other';
  description: string;
  size: 'small' | 'medium' | 'large';
  
  intent_score: number; // 0-100
  intent_signals?: string[]; // e.g. ["new project", "looking for supplier"]
  
  last_activity_date: string; // ISO Date String
  source: string; // 'linkedin' | 'google' | 'instagram' | 'trtex_trigger'
  
  status: 'new' | 'contacted' | 'converted' | 'cold' | 'rejected';
  
  createdAt: string;
  updatedAt: string;
}

export interface OutreachLog {
  id?: string;
  lead_id: string;
  message_sent: string;
  channel: 'email' | 'dm' | 'whatsapp';
  date: string;
  response?: 'yes' | 'no' | 'pending';
  response_date?: string;
}
