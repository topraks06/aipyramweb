
-- ============================================
-- HOMETEX.AI DATABASE SCHEMA
-- Global B2B Home Textile Trade Intelligence Platform
-- ============================================

-- User Profiles Extension Table
CREATE TABLE user_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(50),
    country VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    avatar_url TEXT,
    language_preference VARCHAR(10) DEFAULT 'en' CHECK (language_preference IN ('en', 'ar', 'ru', 'tr')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Company Information Table
CREATE TABLE companies (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    company_name VARCHAR(300) NOT NULL,
    company_type VARCHAR(50) NOT NULL CHECK (company_type IN ('manufacturer', 'supplier', 'buyer', 'distributor')),
    registration_number VARCHAR(100),
    tax_id VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    address TEXT,
    website_url TEXT,
    description TEXT,
    year_established INTEGER,
    employee_count VARCHAR(50),
    annual_turnover VARCHAR(100),
    is_verified BOOLEAN DEFAULT false,
    verification_date TIMESTAMP WITH TIME ZONE,
    verification_documents JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Product Categories Table (Global, no RLS needed)
CREATE TABLE product_categories (
    id BIGSERIAL PRIMARY KEY,
    name_en VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100),
    name_ru VARCHAR(100),
    name_tr VARCHAR(100),
    slug VARCHAR(100) NOT NULL UNIQUE,
    description_en TEXT,
    description_ar TEXT,
    description_ru TEXT,
    description_tr TEXT,
    icon_url TEXT,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Product Subcategories Table (Global, no RLS needed)
CREATE TABLE product_subcategories (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100),
    name_ru VARCHAR(100),
    name_tr VARCHAR(100),
    slug VARCHAR(100) NOT NULL UNIQUE,
    description_en TEXT,
    description_ar TEXT,
    description_ru TEXT,
    description_tr TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Certifications Table (Global, no RLS needed)
CREATE TABLE certifications (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) UNIQUE,
    description TEXT,
    issuing_organization VARCHAR(200),
    icon_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Company Certifications Table
CREATE TABLE company_certifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    company_id BIGINT NOT NULL,
    certification_id BIGINT NOT NULL,
    certificate_number VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    document_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Digital Showrooms Table
CREATE TABLE showrooms (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    company_id BIGINT NOT NULL,
    title VARCHAR(300) NOT NULL,
    slug VARCHAR(300) UNIQUE,
    description TEXT,
    banner_image_url TEXT,
    logo_url TEXT,
    video_url TEXT,
    theme_color VARCHAR(7) DEFAULT '#D4AF37',
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    view_count BIGINT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    showroom_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    subcategory_id BIGINT,
    name VARCHAR(300) NOT NULL,
    slug VARCHAR(300),
    description TEXT,
    specifications JSONB,
    material VARCHAR(200),
    color VARCHAR(100),
    pattern VARCHAR(100),
    dimensions VARCHAR(200),
    weight VARCHAR(100),
    price_per_unit DECIMAL(15, 2),
    currency VARCHAR(10) DEFAULT 'USD',
    minimum_order_quantity INTEGER,
    unit_of_measure VARCHAR(50),
    lead_time_days INTEGER,
    stock_status VARCHAR(50) DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock', 'made_to_order')),
    is_featured BOOLEAN DEFAULT false,
    view_count BIGINT DEFAULT 0,
    inquiry_count BIGINT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'inactive', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Product Images Table
CREATE TABLE product_images (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(300),
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Product Collections Table
CREATE TABLE collections (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    showroom_id BIGINT NOT NULL,
    name VARCHAR(300) NOT NULL,
    slug VARCHAR(300),
    description TEXT,
    cover_image_url TEXT,
    season VARCHAR(50),
    year INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Collection Products Association Table
CREATE TABLE collection_products (
    id BIGSERIAL PRIMARY KEY,
    collection_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(collection_id, product_id)
);

-- Buyer Requests Table
CREATE TABLE buyer_requests (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    subcategory_id BIGINT,
    title VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_of_measure VARCHAR(50),
    budget_min DECIMAL(15, 2),
    budget_max DECIMAL(15, 2),
    currency VARCHAR(10) DEFAULT 'USD',
    target_country VARCHAR(100),
    delivery_timeline VARCHAR(200),
    quality_requirements TEXT,
    certifications_required JSONB,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed', 'cancelled')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Matching Scores Table
CREATE TABLE matching_scores (
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT NOT NULL,
    supplier_user_id BIGINT NOT NULL,
    showroom_id BIGINT NOT NULL,
    match_score DECIMAL(5, 2) NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
    score_breakdown JSONB,
    reasoning TEXT,
    is_recommended BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'quoted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inquiries and Messages Table
CREATE TABLE inquiries (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    sender_user_id BIGINT NOT NULL,
    receiver_user_id BIGINT NOT NULL,
    product_id BIGINT,
    request_id BIGINT,
    subject VARCHAR(300) NOT NULL,
    message TEXT NOT NULL,
    inquiry_type VARCHAR(50) DEFAULT 'general' CHECK (inquiry_type IN ('general', 'product', 'quote', 'request')),
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'closed')),
    parent_inquiry_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Quotes Table
CREATE TABLE quotes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    inquiry_id BIGINT,
    request_id BIGINT,
    buyer_user_id BIGINT NOT NULL,
    supplier_user_id BIGINT NOT NULL,
    quote_number VARCHAR(100) UNIQUE,
    product_details JSONB NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    total_price DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    lead_time_days INTEGER,
    payment_terms TEXT,
    delivery_terms TEXT,
    validity_days INTEGER DEFAULT 30,
    expires_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subscription Plans Table (Global, no RLS needed)
CREATE TABLE subscription_plans (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    price_monthly DECIMAL(10, 2),
    price_annual DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'USD',
    features JSONB,
    max_products INTEGER,
    max_showrooms INTEGER,
    ai_assistant_enabled BOOLEAN DEFAULT false,
    dynamic_pricing_enabled BOOLEAN DEFAULT false,
    lead_priority_level INTEGER DEFAULT 0,
    analytics_access_level VARCHAR(50) DEFAULT 'basic',
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Subscriptions Table
CREATE TABLE user_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    plan_id BIGINT NOT NULL,
    stripe_subscription_id VARCHAR(200),
    stripe_customer_id VARCHAR(200),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'suspended')),
    billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transaction Commissions Table
CREATE TABLE transaction_commissions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    quote_id BIGINT NOT NULL,
    order_value DECIMAL(15, 2) NOT NULL,
    commission_rate DECIMAL(5, 2) NOT NULL,
    commission_amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'disputed')),
    payment_date TIMESTAMP WITH TIME ZONE,
    stripe_payment_intent_id VARCHAR(200),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Assistant Configuration Table
CREATE TABLE ai_assistant_configs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    showroom_id BIGINT NOT NULL,
    assistant_name VARCHAR(200) DEFAULT 'Sales Assistant',
    greeting_message TEXT,
    personality_traits JSONB,
    product_knowledge JSONB,
    pricing_strategy JSONB,
    negotiation_rules JSONB,
    lead_qualification_criteria JSONB,
    auto_response_enabled BOOLEAN DEFAULT true,
    language_support JSONB DEFAULT '["en", "ar", "ru", "tr"]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Conversation Logs Table
CREATE TABLE ai_conversation_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    assistant_config_id BIGINT NOT NULL,
    visitor_id VARCHAR(200),
    visitor_user_id BIGINT,
    conversation_id VARCHAR(200) NOT NULL,
    message_type VARCHAR(50) CHECK (message_type IN ('user', 'assistant')),
    message_content TEXT NOT NULL,
    lead_score DECIMAL(5, 2),
    intent_detected VARCHAR(100),
    entities_extracted JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Favorites/Saved Items Table
CREATE TABLE user_favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    favoritable_type VARCHAR(50) NOT NULL CHECK (favoritable_type IN ('product', 'showroom', 'supplier')),
    favoritable_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, favoritable_type, favoritable_id)
);

-- Platform Analytics Table
CREATE TABLE platform_analytics (
    id BIGSERIAL PRIMARY KEY,
    metric_type VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15, 2) NOT NULL,
    dimensions JSONB,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_companies_is_verified ON companies(is_verified);
CREATE INDEX idx_product_categories_slug ON product_categories(slug);
CREATE INDEX idx_product_subcategories_category_id ON product_subcategories(category_id);
CREATE INDEX idx_company_certifications_user_id ON company_certifications(user_id);
CREATE INDEX idx_company_certifications_company_id ON company_certifications(company_id);
CREATE INDEX idx_showrooms_user_id ON showrooms(user_id);
CREATE INDEX idx_showrooms_company_id ON showrooms(company_id);
CREATE INDEX idx_showrooms_status ON showrooms(status);
CREATE INDEX idx_showrooms_slug ON showrooms(slug);
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_showroom_id ON products(showroom_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_product_images_user_id ON product_images(user_id);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_collections_user_id ON collections(user_id);
CREATE INDEX idx_collections_showroom_id ON collections(showroom_id);
CREATE INDEX idx_collection_products_collection_id ON collection_products(collection_id);
CREATE INDEX idx_collection_products_product_id ON collection_products(product_id);
CREATE INDEX idx_buyer_requests_user_id ON buyer_requests(user_id);
CREATE INDEX idx_buyer_requests_category_id ON buyer_requests(category_id);
CREATE INDEX idx_buyer_requests_status ON buyer_requests(status);
CREATE INDEX idx_matching_scores_request_id ON matching_scores(request_id);
CREATE INDEX idx_matching_scores_supplier_user_id ON matching_scores(supplier_user_id);
CREATE INDEX idx_inquiries_user_id ON inquiries(user_id);
CREATE INDEX idx_inquiries_sender_user_id ON inquiries(sender_user_id);
CREATE INDEX idx_inquiries_receiver_user_id ON inquiries(receiver_user_id);
CREATE INDEX idx_inquiries_product_id ON inquiries(product_id);
CREATE INDEX idx_quotes_user_id ON quotes(user_id);
CREATE INDEX idx_quotes_buyer_user_id ON quotes(buyer_user_id);
CREATE INDEX idx_quotes_supplier_user_id ON quotes(supplier_user_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_transaction_commissions_user_id ON transaction_commissions(user_id);
CREATE INDEX idx_transaction_commissions_quote_id ON transaction_commissions(quote_id);
CREATE INDEX idx_ai_assistant_configs_user_id ON ai_assistant_configs(user_id);
CREATE INDEX idx_ai_assistant_configs_showroom_id ON ai_assistant_configs(showroom_id);
CREATE INDEX idx_ai_conversation_logs_user_id ON ai_conversation_logs(user_id);
CREATE INDEX idx_ai_conversation_logs_conversation_id ON ai_conversation_logs(conversation_id);
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE showrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_assistant_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE RLS POLICIES
-- ============================================

-- User Profiles Policies
CREATE POLICY user_profiles_select_policy ON user_profiles
    FOR SELECT USING (user_id = uid());
CREATE POLICY user_profiles_insert_policy ON user_profiles
    FOR INSERT WITH CHECK (user_id = uid());
CREATE POLICY user_profiles_update_policy ON user_profiles
    FOR UPDATE USING (user_id = uid()) WITH CHECK (user_id = uid());
CREATE POLICY user_profiles_delete_policy ON user_profiles
    FOR DELETE USING (user_id = uid());

-- Companies Policies
CREATE POLICY companies_select_policy ON companies
    FOR SELECT USING (user_id = uid());
CREATE POLICY companies_insert_policy ON companies
    FOR INSERT WITH CHECK (user_id = uid());
CREATE POLICY companies_update_policy ON companies
    FOR UPDATE USING (user_id = uid()) WITH CHECK (user_id = uid());
CREATE POLICY companies_delete_policy ON companies
    FOR DELETE USING (user_id = uid());

-- Company Certifications Policies
CREATE POLICY company_certifications_select_policy ON company_certifications
    FOR SELECT USING (user_id = uid());
CREATE POLICY company_certifications_insert_policy ON company_certifications
    FOR INSERT WITH CHECK (user_id = uid());
CREATE POLICY company_certifications_update_policy ON company_certifications
    FOR UPDATE USING (user_id = uid()) WITH CHECK (user_id = uid());
CREATE POLICY company_certifications_delete_policy ON company_certifications
    FOR DELETE USING (user_id = uid());

-- Showrooms Policies
CREATE POLICY showrooms_select_policy ON showrooms
    FOR SELECT USING (user_id = uid());
CREATE POLICY showrooms_insert_policy ON showrooms
    FOR INSERT WITH CHECK (user_id = uid());
CREATE POLICY showrooms_update_policy ON showrooms
    FOR UPDATE USING (user_id = uid()) WITH CHECK (user_id = uid());
CREATE POLICY showrooms_delete_policy ON showrooms
    FOR DELETE USING (user_id = uid());

-- Products Policies
CREATE POLICY products_select_policy ON products
    FOR SELECT USING (user_id = uid());
CREATE POLICY products_insert_policy ON products
    FOR INSERT WITH CHECK (user_id = uid());
CREATE POLICY products_update_policy ON products
    FOR UPDATE USING (user_id = uid()) WITH CHECK (user_id = uid());
CREATE POLICY products_delete_policy ON products
    FOR DELETE USING (user_id = uid());

-- Product Images Policies
CREATE POLICY product_images_select_policy ON product_images
    FOR SELECT USING (user_id = uid());
CREATE POLICY product_images_insert_policy ON product_images
    FOR INSERT WITH CHECK (user_id = uid());
CREATE POLICY product_images_update_policy ON product_images
    FOR UPDATE USING (user_id = uid()) WITH CHECK (user_id = uid());
CREATE POLICY product_images_delete_policy ON product_images
    FOR DELETE USING (user_id = uid());

-- Collections Policies
CREATE POLICY collections_select_policy ON collections
    FOR SELECT USING (user_id = uid());
CREATE POLICY collections_insert_policy ON collections
    FOR INSERT WITH CHECK (user_id = uid());
CREATE POLICY collections_update_policy ON collections
    FOR UPDATE USING (user_id = uid()) WITH CHECK (user_id = uid());
CREATE POLICY collections_delete_policy ON collections
    FOR DELETE USING (user_id = uid());

-- Buyer Requests Policies
CREATE POLICY buyer_requests_select_policy ON buyer_requests
    FOR SELECT USING (user_id = uid());
CREATE POLICY buyer_requests_insert_policy ON buyer_requests
    FOR INSERT WITH CHECK (user_id = uid());
CREATE POLICY buyer_requests_update_policy ON buyer_requests
    FOR UPDATE USING (user_id = uid()) WITH CHECK (user_id = uid());
CREATE POLICY buyer_requests_delete_policy ON buyer_requests
    FOR DELETE USING (user_id = uid());

-- Inquiries Policies
CREATE POLICY inquiries_select_policy ON inquiries
    FOR SELECT USING (user_id = uid());
CREATE POLICY inquiries_insert_policy ON inquiries
    FOR INSERT WITH CHECK (user_id = uid());
CREATE POLICY inquiries_update_policy ON inquiries
    FOR UPDATE USING (user_id = uid()) WITH CHECK (user_id = uid());
CREATE POLICY inquiries_delete_policy ON inquiries
    FOR DELETE USING (user_id = uid());

-- Quotes Policies
CREATE POLICY quotes_select_policy ON quotes
    FOR SELECT USING (user_id = uid());
CREATE POLICY quotes_insert_policy ON quotes
    FOR INSERT WITH CHECK (user_id = uid());
CREATE POLICY quotes_update_policy ON quotes
    FOR UPDATE USING (user_id = uid()) WITH CHECK (user_id = uid());
CREATE POLICY quotes_delete_policy ON quotes
    FOR DELETE USING (user_id = uid());

-- User Subscriptions Policies
CREATE POLICY user_subscriptions_select_policy ON user_subscriptions
    FOR SELECT USING (user_id = uid());
CREATE POLICY user_subscriptions_insert_policy ON user_subscriptions
    FOR INSERT WITH CHECK (user_id = uid());
CREATE POLICY user_subscriptions_update_policy ON user_subscriptions
    FOR UPDATE USING (user_id = uid()) WITH CHECK (user_id = uid());
CREATE POLICY user_subscriptions_delete_policy ON user_subscriptions
    FOR DELETE USING (user_id = uid());

-- Transaction Commissions Policies
CREATE POLICY transaction_commissions_select_policy ON transaction_commissions
    FOR SELECT USING (user_id = uid());
CREATE POLICY transaction_commissions_insert_policy ON transaction_commissions
    FOR INSERT WITH CHECK (user_id = uid());
CREATE POLICY transaction_commissions_update_policy ON transaction_commissions
    FOR UPDATE USING (user_id = uid()) WITH CHECK (user_id = uid());
CREATE POLICY transaction_commissions_delete_policy ON transaction_commissions
    FOR DELETE USING (user_id = uid());

-- AI Assistant Configs Policies
CREATE POLICY ai_assistant_configs_select_policy ON ai_assistant_configs
    FOR SELECT USING (user_id = uid());
CREATE POLICY ai_assistant_configs_insert_policy ON ai_assistant_configs
    FOR INSERT WITH CHECK (user_id = uid());
CREATE POLICY ai_assistant_configs_update_policy ON ai_assistant_configs
    FOR UPDATE USING (user_id = uid()) WITH CHECK (user_id = uid());
CREATE POLICY ai_assistant_configs_delete_policy ON ai_assistant_configs
    FOR DELETE USING (user_id = uid());

-- AI Conversation Logs Policies
CREATE POLICY ai_conversation_logs_select_policy ON ai_conversation_logs
    FOR SELECT USING (user_id = uid());
CREATE POLICY ai_conversation_logs_insert_policy ON ai_conversation_logs
    FOR INSERT WITH CHECK (user_id = uid());
CREATE POLICY ai_conversation_logs_update_policy ON ai_conversation_logs
    FOR UPDATE USING (user_id = uid()) WITH CHECK (user_id = uid());
CREATE POLICY ai_conversation_logs_delete_policy ON ai_conversation_logs
    FOR DELETE USING (user_id = uid());

-- User Favorites Policies
CREATE POLICY user_favorites_select_policy ON user_favorites
    FOR SELECT USING (user_id = uid());
CREATE POLICY user_favorites_insert_policy ON user_favorites
    FOR INSERT WITH CHECK (user_id = uid());
CREATE POLICY user_favorites_update_policy ON user_favorites
    FOR UPDATE USING (user_id = uid()) WITH CHECK (user_id = uid());
CREATE POLICY user_favorites_delete_policy ON user_favorites
    FOR DELETE USING (user_id = uid());

-- ============================================
-- INSERT INITIAL DATA
-- ============================================

-- Admin user default profile (user_id=1 is pre-initialized admin)
INSERT INTO user_profiles (user_id, full_name, language_preference) 
VALUES (1, 'Platform Administrator', 'en');

-- Product Categories
INSERT INTO product_categories (name_en, name_ar, name_ru, name_tr, slug, description_en, display_order) VALUES
('Curtains', 'ستائر', 'Шторы', 'Perdeler', 'curtains', 'Premium curtain fabrics and ready-made curtains for residential and commercial spaces', 1),
('Upholstery Fabrics', 'أقمشة التنجيد', 'Обивочные ткани', 'Döşemelik Kumaşlar', 'upholstery-fabrics', 'High-quality upholstery fabrics for furniture and interior design', 2),
('Carpets & Rugs', 'سجاد وبسط', 'Ковры', 'Halılar', 'carpets-rugs', 'Handmade and machine-made carpets, rugs, and floor coverings', 3),
('Home Accessories', 'إكسسوارات منزلية', 'Домашние аксессуары', 'Ev Aksesuarları', 'home-accessories', 'Decorative cushions, throws, and textile accessories', 4);

-- Certifications
INSERT INTO certifications (name, code, description, issuing_organization) VALUES
('ISO 9001', 'ISO9001', 'Quality Management System Certification', 'International Organization for Standardization'),
('OEKO-TEX Standard 100', 'OEKOTEX100', 'Textile safety and harmful substances testing', 'OEKO-TEX Association'),
('Global Organic Textile Standard', 'GOTS', 'Organic fiber certification for textiles', 'Global Organic Textile Standard'),
('CE Marking', 'CE', 'European Conformity certification', 'European Union'),
('FSC Certification', 'FSC', 'Forest Stewardship Council certification', 'Forest Stewardship Council');

-- Subscription Plans
INSERT INTO subscription_plans (name, slug, description, price_monthly, price_annual, features, max_products, max_showrooms, ai_assistant_enabled, dynamic_pricing_enabled, lead_priority_level, analytics_access_level, display_order) VALUES
('Basic', 'basic', 'Essential features for small suppliers', 49.00, 490.00, '{"showroom": true, "products": 50, "inquiries": "unlimited", "support": "email"}'::jsonb, 50, 1, false, false, 1, 'basic', 1),
('Premium', 'premium', 'Advanced features for growing businesses', 149.00, 1490.00, '{"showroom": true, "products": 200, "inquiries": "unlimited", "ai_assistant": true, "support": "priority", "analytics": "advanced"}'::jsonb, 200, 3, true, true, 2, 'advanced', 2),
('Enterprise', 'enterprise', 'Complete solution for large manufacturers', 399.00, 3990.00, '{"showroom": true, "products": "unlimited", "inquiries": "unlimited", "ai_assistant": true, "dynamic_pricing": true, "support": "dedicated", "analytics": "full", "api_access": true}'::jsonb, 999999, 10, true, true, 3, 'full', 3);

-- ============================================================
-- ADIM 1: Mevcut tablolara Almanca dil desteği ve domain alanları ekleme
-- ============================================================

-- product_categories tablosuna Almanca ve domain desteği
ALTER TABLE product_categories 
    ADD COLUMN IF NOT EXISTS name_de VARCHAR(100),
    ADD COLUMN IF NOT EXISTS description_de TEXT,
    ADD COLUMN IF NOT EXISTS supported_domains VARCHAR(20) DEFAULT 'both' 
        CHECK (supported_domains IN ('hometex', 'heimtex', 'both'));

-- product_subcategories tablosuna Almanca desteği
ALTER TABLE product_subcategories 
    ADD COLUMN IF NOT EXISTS name_de VARCHAR(100),
    ADD COLUMN IF NOT EXISTS description_de TEXT;

-- products tablosuna Almanca ve platform bilgisi
ALTER TABLE products 
    ADD COLUMN IF NOT EXISTS name_de VARCHAR(300),
    ADD COLUMN IF NOT EXISTS description_de TEXT,
    ADD COLUMN IF NOT EXISTS platform_source VARCHAR(50) DEFAULT 'hometex' 
        CHECK (platform_source IN ('hometex', 'heimtex', 'both')),
    ADD COLUMN IF NOT EXISTS perde_ai_project_id VARCHAR(200),
    ADD COLUMN IF NOT EXISTS trtex_article_id BIGINT;

-- showrooms tablosuna domain ve dil desteği
ALTER TABLE showrooms 
    ADD COLUMN IF NOT EXISTS supported_domains VARCHAR(20) DEFAULT 'both' 
        CHECK (supported_domains IN ('hometex', 'heimtex', 'both')),
    ADD COLUMN IF NOT EXISTS supported_languages JSONB DEFAULT '["tr","en","ar","ru"]'::jsonb,
    ADD COLUMN IF NOT EXISTS fair_booth_number VARCHAR(50),
    ADD COLUMN IF NOT EXISTS fair_hall VARCHAR(100);

-- user_profiles dil tercihine Almanca ekleme
ALTER TABLE user_profiles 
    DROP CONSTRAINT IF EXISTS user_profiles_language_preference_check;
ALTER TABLE user_profiles 
    ADD CONSTRAINT user_profiles_language_preference_check 
    CHECK (language_preference IN ('en', 'ar', 'ru', 'tr', 'de'));

-- collections tablosuna Almanca desteği
ALTER TABLE collections 
    ADD COLUMN IF NOT EXISTS name_de VARCHAR(300),
    ADD COLUMN IF NOT EXISTS description_de TEXT,
    ADD COLUMN IF NOT EXISTS fair_season VARCHAR(50),
    ADD COLUMN IF NOT EXISTS platform_source VARCHAR(20) DEFAULT 'both';

-- buyer_requests tablosuna platform bilgisi
ALTER TABLE buyer_requests 
    ADD COLUMN IF NOT EXISTS platform_source VARCHAR(20) DEFAULT 'hometex' 
        CHECK (platform_source IN ('hometex', 'heimtex', 'both')),
    ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'en';

-- ============================================================
-- ADIM 2: Domain Konfigürasyon Tablosu
-- Hometex.ai ve Heimtex.ai domain yönetimi
-- ============================================================

CREATE TABLE domain_configs (
    id BIGSERIAL PRIMARY KEY,
    domain_key VARCHAR(50) NOT NULL UNIQUE,  -- 'hometex', 'heimtex'
    domain_url VARCHAR(200) NOT NULL,         -- 'hometex.ai', 'heimtex.ai'
    platform_name VARCHAR(200) NOT NULL,
    platform_name_de VARCHAR(200),
    platform_name_tr VARCHAR(200),
    platform_name_ar VARCHAR(200),
    platform_name_ru VARCHAR(200),
    tagline_en TEXT,
    tagline_de TEXT,
    tagline_tr TEXT,
    tagline_ar TEXT,
    tagline_ru TEXT,
    supported_languages JSONB DEFAULT '["en","tr","ar","ru"]'::jsonb,
    default_language VARCHAR(10) DEFAULT 'tr',
    primary_color VARCHAR(7) DEFAULT '#D4AF37',
    secondary_color VARCHAR(7) DEFAULT '#1a1a2e',
    logo_url TEXT,
    favicon_url TEXT,
    meta_title_en VARCHAR(300),
    meta_title_de VARCHAR(300),
    meta_title_tr VARCHAR(300),
    meta_description_en TEXT,
    meta_description_de TEXT,
    meta_description_tr TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO domain_configs (
    domain_key, domain_url, platform_name, platform_name_de, platform_name_tr,
    tagline_en, tagline_de, tagline_tr, tagline_ar, tagline_ru,
    supported_languages, default_language,
    meta_title_en, meta_title_tr,
    meta_description_en, meta_description_tr
) VALUES 
(
    'hometex', 'hometex.ai',
    'Hometex.ai', NULL, 'Hometex.ai',
    'Global Home Textile Virtual Fair',
    NULL,
    'Global Ev Tekstili Sanal Fuarı',
    'معرض المنسوجات المنزلية الافتراضي العالمي',
    'Глобальная виртуальная ярмарка домашнего текстиля',
    '["tr","en","ar","ru"]'::jsonb, 'tr',
    'Hometex.ai - Global Home Textile Virtual Fair',
    'Hometex.ai - Global Ev Tekstili Sanal Fuarı',
    'The world''s leading virtual fair for home textiles, curtains, and decorative fabrics.',
    'Perde, ev tekstili ve dekoratif kumaşlar için dünyanın önde gelen sanal fuarı.'
),
(
    'heimtex', 'heimtex.ai',
    'Heimtex.ai', 'Heimtex.ai - Virtuelle Heimtextilmesse', 'Heimtex.ai',
    'German Home Textile Virtual Fair',
    'Virtuelle Heimtextilmesse für den deutschsprachigen Markt',
    'Almanca Ev Tekstili Sanal Fuarı',
    NULL, NULL,
    '["de","en"]'::jsonb, 'de',
    'Heimtex.ai - Virtual Home Textile Fair for German Market',
    'Heimtex.ai - Almanca Ev Tekstili Sanal Fuarı',
    'The premier virtual home textile fair for German-speaking markets.',
    'Almanca konuşan pazarlar için önde gelen sanal ev tekstili fuarı.'
);

-- ============================================================
-- ADIM 3: Sanal Fuar Etkinlik Yönetimi
-- ============================================================

CREATE TABLE fair_events (
    id BIGSERIAL PRIMARY KEY,
    domain_key VARCHAR(50) NOT NULL DEFAULT 'both',  -- 'hometex', 'heimtex', 'both'
    event_name_en VARCHAR(300) NOT NULL,
    event_name_de VARCHAR(300),
    event_name_tr VARCHAR(300),
    event_name_ar VARCHAR(300),
    event_name_ru VARCHAR(300),
    description_en TEXT,
    description_de TEXT,
    description_tr TEXT,
    description_ar TEXT,
    description_ru TEXT,
    event_type VARCHAR(50) DEFAULT 'virtual_fair' 
        CHECK (event_type IN ('virtual_fair', 'webinar', 'product_launch', 'networking', 'award_ceremony')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    max_exhibitors INTEGER,
    max_visitors INTEGER,
    current_exhibitors INTEGER DEFAULT 0,
    current_visitors INTEGER DEFAULT 0,
    banner_image_url TEXT,
    cover_image_url TEXT,
    status VARCHAR(50) DEFAULT 'upcoming' 
        CHECK (status IN ('draft', 'upcoming', 'active', 'completed', 'cancelled')),
    is_featured BOOLEAN DEFAULT false,
    registration_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fair_events_domain_key ON fair_events(domain_key);
CREATE INDEX idx_fair_events_status ON fair_events(status);
CREATE INDEX idx_fair_events_start_date ON fair_events(start_date);

INSERT INTO fair_events (
    domain_key, event_name_en, event_name_de, event_name_tr, event_name_ar, event_name_ru,
    description_en, description_de, description_tr,
    event_type, start_date, end_date, registration_deadline,
    max_exhibitors, max_visitors, status, is_featured,
    banner_image_url
) VALUES 
(
    'hometex',
    'Hometex Virtual Fair 2025 - Spring Edition',
    NULL,
    'Hometex Sanal Fuarı 2025 - Bahar Edisyonu',
    'معرض هوم تكس الافتراضي 2025 - الإصدار الربيعي',
    'Виртуальная ярмарка Hometex 2025 - Весеннее издание',
    'The premier global virtual fair for home textiles, curtains, and decorative fabrics. Connect with suppliers from 50+ countries.',
    NULL,
    'Perde, ev tekstili ve dekoratif kumaşlar için küresel sanal fuar. 50+ ülkeden tedarikçilerle bağlantı kurun.',
    'virtual_fair',
    '2025-03-15 09:00:00+00', '2025-03-20 18:00:00+00', '2025-03-10 23:59:00+00',
    500, 10000, 'upcoming', true,
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80'
),
(
    'heimtex',
    'Heimtex Virtual Messe 2025',
    'Heimtex Virtuelle Messe 2025 - Frühjahrsausgabe',
    'Heimtex Sanal Fuarı 2025',
    NULL, NULL,
    'The leading virtual home textile fair for German-speaking markets.',
    'Die führende virtuelle Heimtextilmesse für den deutschsprachigen Markt. Verbinden Sie sich mit Lieferanten aus über 30 Ländern.',
    'Almanca konuşan pazarlar için önde gelen sanal ev tekstili fuarı.',
    'virtual_fair',
    '2025-04-10 09:00:00+00', '2025-04-15 18:00:00+00', '2025-04-05 23:59:00+00',
    300, 5000, 'upcoming', true,
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600&q=80'
),
(
    'both',
    'Global Textile Innovation Summit 2025',
    'Globaler Textil-Innovationsgipfel 2025',
    'Global Tekstil İnovasyon Zirvesi 2025',
    'قمة الابتكار النسيجي العالمي 2025',
    'Глобальный саммит по инновациям в текстиле 2025',
    'A joint event bringing together the best of Hometex and Heimtex platforms.',
    'Eine gemeinsame Veranstaltung, die das Beste der Hometex- und Heimtex-Plattformen vereint.',
    'Hometex ve Heimtex platformlarının en iyilerini bir araya getiren ortak etkinlik.',
    'webinar',
    '2025-05-20 14:00:00+00', '2025-05-20 18:00:00+00', '2025-05-18 23:59:00+00',
    NULL, 2000, 'upcoming', false,
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=80'
);

-- ============================================================
-- ADIM 4: Platform Entegrasyon Tablosu
-- TRTex.com ve Perde.ai bağlantıları
-- ============================================================

CREATE TABLE platform_integrations (
    id BIGSERIAL PRIMARY KEY,
    platform_name VARCHAR(100) NOT NULL UNIQUE,  -- 'trtex', 'perde_ai'
    platform_url VARCHAR(300) NOT NULL,
    platform_type VARCHAR(50) NOT NULL 
        CHECK (platform_type IN ('news_portal', 'design_tool', 'marketplace', 'analytics')),
    display_name_en VARCHAR(200),
    display_name_de VARCHAR(200),
    display_name_tr VARCHAR(200),
    display_name_ar VARCHAR(200),
    display_name_ru VARCHAR(200),
    description_en TEXT,
    description_de TEXT,
    description_tr TEXT,
    api_endpoint TEXT,
    api_key_encrypted TEXT,
    webhook_url TEXT,
    sync_enabled BOOLEAN DEFAULT true,
    sync_interval_minutes INTEGER DEFAULT 60,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    integration_config JSONB,
    supported_domains JSONB DEFAULT '["hometex","heimtex"]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO platform_integrations (
    platform_name, platform_url, platform_type,
    display_name_en, display_name_tr, display_name_de,
    description_en, description_tr, description_de,
    sync_enabled, sync_interval_minutes,
    integration_config, supported_domains
) VALUES 
(
    'trtex', 'https://trtex.com', 'news_portal',
    'TRTex.com - Turkey Home Textile Portal',
    'TRTex.com - Türkiye Ev Tekstil Portalı',
    'TRTex.com - Türkisches Heimtextilportal',
    'Turkey''s leading home textile news portal. Latest industry news, trends, and market insights.',
    'Türkiye''nin önde gelen ev tekstili haber portalı. Son sektör haberleri, trendler ve pazar içgörüleri.',
    'Türkeis führendes Heimtextil-Nachrichtenportal. Neueste Branchennachrichten und Markteinblicke.',
    true, 30,
    '{"news_widget_enabled": true, "max_news_items": 10, "categories": ["perde", "hali", "ev-tekstili", "fuar"], "language_map": {"tr": "tr", "en": "en", "de": "de"}}'::jsonb,
    '["hometex","heimtex"]'::jsonb
),
(
    'perde_ai', 'https://perde.ai', 'design_tool',
    'Perde.ai - AI Curtain & Decoration Design',
    'Perde.ai - Yapay Zeka Perde ve Dekorasyon Tasarımı',
    'Perde.ai - KI-Vorhang- und Dekorationsdesign',
    'Neural network-powered online curtain and decoration design tool. Visualize products in real rooms.',
    'Sinir ağı destekli online perde ve dekorasyon tasarım programı. Ürünleri gerçek odalarda görselleştirin.',
    'Neuronales Netzwerk-basiertes Online-Vorhang- und Dekorationsdesign-Tool.',
    true, 120,
    '{"design_widget_enabled": true, "product_sync_enabled": true, "ai_recommendation_enabled": true, "room_visualization": true, "supported_product_types": ["curtain", "fabric", "carpet", "pillow"]}'::jsonb,
    '["hometex","heimtex"]'::jsonb
);

-- ============================================================
-- ADIM 5: TRTex Haber Önbellek Tablosu
-- ============================================================

CREATE TABLE news_feed_cache (
    id BIGSERIAL PRIMARY KEY,
    source_platform VARCHAR(50) NOT NULL DEFAULT 'trtex',
    external_id VARCHAR(200),
    title_tr VARCHAR(500),
    title_en VARCHAR(500),
    title_de VARCHAR(500),
    title_ar VARCHAR(500),
    title_ru VARCHAR(500),
    summary_tr TEXT,
    summary_en TEXT,
    summary_de TEXT,
    excerpt TEXT,
    author_name VARCHAR(200),
    category VARCHAR(100),
    tags JSONB,
    thumbnail_url TEXT,
    source_url TEXT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    is_featured BOOLEAN DEFAULT false,
    display_on_domains JSONB DEFAULT '["hometex","heimtex"]'::jsonb,
    view_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_news_feed_cache_source_platform ON news_feed_cache(source_platform);
CREATE INDEX idx_news_feed_cache_published_at ON news_feed_cache(published_at DESC);
CREATE INDEX idx_news_feed_cache_category ON news_feed_cache(category);
CREATE INDEX idx_news_feed_cache_is_featured ON news_feed_cache(is_featured);

INSERT INTO news_feed_cache (
    source_platform, external_id, title_tr, title_en, title_de,
    summary_tr, summary_en, category, tags,
    thumbnail_url, source_url, published_at, is_featured, display_on_domains
) VALUES 
(
    'trtex', 'trtex-001',
    'Türk Perde Sektörü 2025 İhracat Hedeflerini Açıkladı',
    'Turkish Curtain Industry Announces 2025 Export Targets',
    'Türkische Vorhangindustrie gibt Exportziele 2025 bekannt',
    'Türkiye perde ve ev tekstili sektörü, 2025 yılı için 3 milyar dolar ihracat hedefi belirledi.',
    'Turkey''s curtain and home textile sector has set a $3 billion export target for 2025.',
    'ihracat', '["perde", "ihracat", "tekstil", "2025"]'::jsonb,
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    'https://trtex.com/haber/turk-perde-sektoru-2025-ihracat-hedefleri',
    '2025-01-15 10:00:00+00', true, '["hometex","heimtex"]'::jsonb
),
(
    'trtex', 'trtex-002',
    'Heimtextil Frankfurt 2025 Fuarında Türk Firmaları Büyük İlgi Gördü',
    'Turkish Companies Attract Great Interest at Heimtextil Frankfurt 2025',
    'Türkische Unternehmen auf der Heimtextil Frankfurt 2025 sehr gefragt',
    'Frankfurt Heimtextil Fuarı''nda 150 Türk firma 45 ülkeden alıcıyla buluştu.',
    '150 Turkish companies met with buyers from 45 countries at the Frankfurt Heimtextil Fair.',
    'fuar', '["heimtextil", "frankfurt", "fuar", "türkiye"]'::jsonb,
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    'https://trtex.com/haber/heimtextil-frankfurt-2025-turk-firmalari',
    '2025-01-20 14:00:00+00', true, '["hometex","heimtex"]'::jsonb
),
(
    'trtex', 'trtex-003',
    'Sürdürülebilir Tekstil Trendleri 2025: Organik ve Geri Dönüştürülmüş Kumaşlar',
    'Sustainable Textile Trends 2025: Organic and Recycled Fabrics',
    'Nachhaltige Textiltrends 2025: Bio- und Recyclinggewebe',
    'Çevre dostu üretim yöntemleri ve sürdürülebilir kumaşlar sektörün gündeminde.',
    'Eco-friendly production methods and sustainable fabrics are on the industry agenda.',
    'trend', '["sürdürülebilir", "organik", "geri-dönüşüm", "trend"]'::jsonb,
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    'https://trtex.com/haber/surdurulebilir-tekstil-trendleri-2025',
    '2025-01-22 09:00:00+00', false, '["hometex","heimtex"]'::jsonb
),
(
    'trtex', 'trtex-004',
    'Perde.ai ile Oda Dekorasyonu Artık Çok Kolay',
    'Room Decoration is Now Much Easier with Perde.ai',
    'Raumdekoration ist jetzt viel einfacher mit Perde.ai',
    'Yapay zeka destekli Perde.ai platformu, kullanıcıların odalarını sanal olarak dekore etmesine olanak tanıyor.',
    'The AI-powered Perde.ai platform allows users to virtually decorate their rooms.',
    'teknoloji', '["perde.ai", "yapay-zeka", "dekorasyon", "teknoloji"]'::jsonb,
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    'https://trtex.com/haber/perde-ai-oda-dekorasyonu',
    '2025-01-25 11:00:00+00', false, '["hometex"]'::jsonb
),
(
    'trtex', 'trtex-005',
    'Uşak Halı Sektörü Dijital Dönüşümde Öncü Rol Üstleniyor',
    'Uşak Carpet Sector Takes Leading Role in Digital Transformation',
    'Uşak-Teppichsektor übernimmt führende Rolle bei der digitalen Transformation',
    'Uşak''ın dünyaca ünlü halı üreticileri, dijital showroom ve sanal fuar teknolojilerine yatırım yapıyor.',
    'Uşak''s world-famous carpet manufacturers are investing in digital showroom and virtual fair technologies.',
    'hali', '["uşak", "halı", "dijital", "showroom"]'::jsonb,
    'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=80',
    'https://trtex.com/haber/usak-hali-sektoru-dijital-donusum',
    '2025-01-28 08:00:00+00', false, '["hometex","heimtex"]'::jsonb
);

-- ============================================================
-- ADIM 6: Perde.ai Tasarım Projesi Entegrasyon Tablosu
-- ============================================================

CREATE TABLE design_projects (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,  -- NULL ise misafir kullanıcı
    visitor_id VARCHAR(200),
    source_platform VARCHAR(50) DEFAULT 'hometex' 
        CHECK (source_platform IN ('hometex', 'heimtex')),
    perde_ai_project_id VARCHAR(200),
    project_name VARCHAR(300),
    room_type VARCHAR(100),
    room_image_url TEXT,
    rendered_image_url TEXT,
    design_config JSONB,
    selected_products JSONB,  -- [{product_id, showroom_id, quantity}]
    ai_recommendations JSONB,
    status VARCHAR(50) DEFAULT 'draft' 
        CHECK (status IN ('draft', 'saved', 'shared', 'ordered')),
    share_token VARCHAR(200) UNIQUE,
    is_public BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_design_projects_user_id ON design_projects(user_id);
CREATE INDEX idx_design_projects_perde_ai_project_id ON design_projects(perde_ai_project_id);
CREATE INDEX idx_design_projects_source_platform ON design_projects(source_platform);
CREATE INDEX idx_design_projects_share_token ON design_projects(share_token);

-- ============================================================
-- ADIM 7: Showroom Dil İçerikleri Tablosu
-- Her stand için çok dilli içerik yönetimi
-- ============================================================

CREATE TABLE showroom_translations (
    id BIGSERIAL PRIMARY KEY,
    showroom_id BIGINT NOT NULL,
    language_code VARCHAR(10) NOT NULL 
        CHECK (language_code IN ('tr', 'en', 'de', 'ar', 'ru')),
    title VARCHAR(300),
    description TEXT,
    tagline VARCHAR(500),
    meta_title VARCHAR(300),
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(showroom_id, language_code)
);

CREATE INDEX idx_showroom_translations_showroom_id ON showroom_translations(showroom_id);
CREATE INDEX idx_showroom_translations_language_code ON showroom_translations(language_code);

-- ============================================================
-- ADIM 8: Ürün Çevirileri Tablosu
-- ============================================================

CREATE TABLE product_translations (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    language_code VARCHAR(10) NOT NULL 
        CHECK (language_code IN ('tr', 'en', 'de', 'ar', 'ru')),
    name VARCHAR(300),
    description TEXT,
    specifications_text TEXT,
    meta_title VARCHAR(300),
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, language_code)
);

CREATE INDEX idx_product_translations_product_id ON product_translations(product_id);
CREATE INDEX idx_product_translations_language_code ON product_translations(language_code);

-- ============================================================
-- ADIM 9: Ziyaretçi Analitik Tablosu
-- Domain bazlı davranış analizi
-- ============================================================

CREATE TABLE visitor_analytics (
    id BIGSERIAL PRIMARY KEY,
    domain_key VARCHAR(50) NOT NULL,  -- 'hometex', 'heimtex'
    visitor_id VARCHAR(200),
    user_id BIGINT,
    session_id VARCHAR(200),
    page_type VARCHAR(100),  -- 'home', 'showroom', 'product', 'category', 'fair'
    page_id BIGINT,
    page_slug VARCHAR(300),
    referrer_url TEXT,
    referrer_platform VARCHAR(100),  -- 'trtex', 'perde_ai', 'google', 'direct'
    language_used VARCHAR(10),
    country_code VARCHAR(10),
    device_type VARCHAR(50),
    action_type VARCHAR(100),  -- 'view', 'inquiry', 'quote_request', 'design_open', 'news_click'
    action_data JSONB,
    duration_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_visitor_analytics_domain_key ON visitor_analytics(domain_key);
CREATE INDEX idx_visitor_analytics_visitor_id ON visitor_analytics(visitor_id);
CREATE INDEX idx_visitor_analytics_page_type ON visitor_analytics(page_type);
CREATE INDEX idx_visitor_analytics_created_at ON visitor_analytics(created_at DESC);
CREATE INDEX idx_visitor_analytics_referrer_platform ON visitor_analytics(referrer_platform);

-- ============================================================
-- ADIM 10: Fuar Stand Rezervasyonları
-- ============================================================

CREATE TABLE fair_booth_reservations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    fair_event_id BIGINT NOT NULL,
    showroom_id BIGINT,
    company_id BIGINT NOT NULL,
    booth_number VARCHAR(50),
    hall_name VARCHAR(100),
    booth_size VARCHAR(50) DEFAULT 'standard' 
        CHECK (booth_size IN ('mini', 'standard', 'large', 'premium', 'flagship')),
    booth_config JSONB,
    price_usd NUMERIC(10,2),
    currency VARCHAR(10) DEFAULT 'USD',
    payment_status VARCHAR(50) DEFAULT 'pending' 
        CHECK (payment_status IN ('pending', 'paid', 'refunded', 'cancelled')),
    reservation_status VARCHAR(50) DEFAULT 'pending' 
        CHECK (reservation_status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    special_requirements TEXT,
    notes TEXT,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fair_booth_reservations_user_id ON fair_booth_reservations(user_id);
CREATE INDEX idx_fair_booth_reservations_fair_event_id ON fair_booth_reservations(fair_event_id);
CREATE INDEX idx_fair_booth_reservations_company_id ON fair_booth_reservations(company_id);

-- ============================================================
-- ADIM 11: Çok Dilli Statik İçerik Tablosu
-- Sayfa başlıkları, butonlar, menüler için
-- ============================================================

CREATE TABLE content_translations (
    id BIGSERIAL PRIMARY KEY,
    content_key VARCHAR(200) NOT NULL,
    domain_key VARCHAR(50) DEFAULT 'both',  -- 'hometex', 'heimtex', 'both'
    content_tr TEXT,
    content_en TEXT,
    content_de TEXT,
    content_ar TEXT,
    content_ru TEXT,
    content_type VARCHAR(50) DEFAULT 'text' 
        CHECK (content_type IN ('text', 'html', 'markdown', 'json')),
    section VARCHAR(100),  -- 'menu', 'hero', 'footer', 'cta', 'meta'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(content_key, domain_key)
);

CREATE INDEX idx_content_translations_content_key ON content_translations(content_key);
CREATE INDEX idx_content_translations_domain_key ON content_translations(domain_key);
CREATE INDEX idx_content_translations_section ON content_translations(section);

-- Temel içerik çevirileri
INSERT INTO content_translations (content_key, domain_key, content_tr, content_en, content_de, content_ar, content_ru, section) VALUES
('nav.home', 'both', 'Ana Sayfa', 'Home', 'Startseite', 'الرئيسية', 'Главная', 'menu'),
('nav.suppliers', 'both', 'Tedarikçiler', 'Suppliers', 'Lieferanten', 'الموردون', 'Поставщики', 'menu'),
('nav.showrooms', 'both', 'Dijital Standlar', 'Digital Showrooms', 'Digitale Showrooms', 'المعارض الرقمية', 'Цифровые шоурумы', 'menu'),
('nav.categories', 'both', 'Kategoriler', 'Categories', 'Kategorien', 'الفئات', 'Категории', 'menu'),
('nav.requests', 'both', 'Talepler', 'Requests', 'Anfragen', 'الطلبات', 'Запросы', 'menu'),
('nav.fair', 'both', 'Sanal Fuar', 'Virtual Fair', 'Virtuelle Messe', 'المعرض الافتراضي', 'Виртуальная ярмарка', 'menu'),
('nav.panel', 'both', 'Panel', 'Dashboard', 'Dashboard', 'لوحة التحكم', 'Панель', 'menu'),
('hero.title', 'hometex', 'Global Ev Tekstili Sanal Fuarı', 'Global Home Textile Virtual Fair', NULL, 'معرض المنسوجات المنزلية الافتراضي العالمي', 'Глобальная виртуальная ярмарка домашнего текстиля', 'hero'),
('hero.title', 'heimtex', 'Virtuelle Heimtextilmesse', 'Virtual Home Textile Fair', 'Virtuelle Heimtextilmesse für den deutschsprachigen Markt', NULL, NULL, 'hero'),
('hero.subtitle', 'hometex', '50+ ülkeden tedarikçilerle bağlantı kurun', 'Connect with suppliers from 50+ countries', NULL, 'تواصل مع الموردين من أكثر من 50 دولة', 'Свяжитесь с поставщиками из 50+ стран', 'hero'),
('hero.subtitle', 'heimtex', 'Deutschsprachige Lieferanten und globale Partner', 'German-speaking suppliers and global partners', 'Verbinden Sie sich mit deutschsprachigen Lieferanten und globalen Partnern', NULL, NULL, 'hero'),
('cta.get_quote', 'both', 'Teklif Al', 'Get Quote', 'Angebot einholen', 'احصل على عرض', 'Получить предложение', 'cta'),
('cta.view_showroom', 'both', 'Standı Görüntüle', 'View Showroom', 'Showroom ansehen', 'عرض المعرض', 'Просмотр шоурума', 'cta'),
('cta.design_with_ai', 'both', 'Perde.ai ile Tasarla', 'Design with Perde.ai', 'Mit Perde.ai gestalten', 'صمم مع Perde.ai', 'Дизайн с Perde.ai', 'cta'),
('cta.read_news', 'both', 'Haberleri Oku', 'Read News', 'Nachrichten lesen', 'اقرأ الأخبار', 'Читать новости', 'cta'),
('footer.trtex_banner', 'both', 'Türkiye Ev Tekstil Portalı', 'Turkey Home Textile Portal', 'Türkisches Heimtextilportal', 'بوابة المنسوجات المنزلية التركية', 'Турецкий портал домашнего текстиля', 'footer'),
('footer.trtex_desc', 'both', 'Sektörün en güncel haberleri, trendleri ve pazar analizleri için TRTex.com''u ziyaret edin', 'Visit TRTex.com for the latest industry news, trends and market analysis', 'Besuchen Sie TRTex.com für die neuesten Branchennachrichten', 'قم بزيارة TRTex.com للحصول على آخر أخبار الصناعة', 'Посетите TRTex.com для последних новостей отрасли', 'footer');

-- ============================================================
-- ADIM 12: Kategori ve Ürün Demo Verileri
-- ============================================================

-- Kategoriler (çok dilli + Almanca)
INSERT INTO product_categories (name_en, name_tr, name_ar, name_ru, name_de, slug, description_en, description_tr, description_de, display_order, supported_domains, image_url) VALUES
('Curtains & Drapes', 'Perdeler', 'الستائر والمعلقات', 'Шторы и занавески', 'Vorhänge & Gardinen', 'curtains-drapes', 
 'Premium curtains, sheer curtains, blackout curtains and decorative drapes for every style.',
 'Her tarza uygun prim perdeler, tül perdeler, karartma perdeler ve dekoratif perdeler.',
 'Premium Vorhänge, Gardinen, Verdunkelungsvorhänge und dekorative Draperien für jeden Stil.',
 1, 'both', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'),

('Upholstery Fabrics', 'Döşemelik Kumaşlar', 'أقمشة التنجيد', 'Обивочные ткани', 'Polsterstoffe', 'upholstery-fabrics',
 'High-quality upholstery fabrics including velvet, linen, jacquard and technical fabrics.',
 'Kadife, keten, jakarlı ve teknik kumaşlar dahil yüksek kaliteli döşemelik kumaşlar.',
 'Hochwertige Polsterstoffe einschließlich Samt, Leinen, Jacquard und technische Stoffe.',
 2, 'both', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80'),

('Carpets & Rugs', 'Halılar', 'السجاد والبسط', 'Ковры и паласы', 'Teppiche & Läufer', 'carpets-rugs',
 'Hand-woven, machine-made and designer carpets from Turkey, Iran and Central Asia.',
 'Türkiye, İran ve Orta Asya''dan el dokuma, makine yapımı ve tasarımcı halılar.',
 'Handgewebte, maschinell hergestellte und Designer-Teppiche aus der Türkei, dem Iran und Zentralasien.',
 3, 'both', 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=80'),

('Home Accessories', 'Ev Aksesuarları', 'إكسسوارات المنزل', 'Домашние аксессуары', 'Wohnaccessoires', 'home-accessories',
 'Decorative pillows, throws, table runners, bed linen and home decoration accessories.',
 'Dekoratif yastıklar, battaniyeler, masa örtüleri, yatak çarşafları ve ev dekorasyon aksesuarları.',
 'Dekorative Kissen, Decken, Tischläufer, Bettwäsche und Wohndekoration-Accessoires.',
 4, 'both', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'),

('Bed & Bath Textiles', 'Yatak & Banyo Tekstili', 'مفروشات السرير والحمام', 'Постельное и банное белье', 'Bett- & Badtextilien', 'bed-bath-textiles',
 'Premium bed linen, towels, bathrobes and bathroom accessories.',
 'Prim yatak çarşafları, havlular, bornozlar ve banyo aksesuarları.',
 'Premium Bettwäsche, Handtücher, Bademäntel und Badezimmer-Accessoires.',
 5, 'both', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80'),

('Technical Textiles', 'Teknik Tekstil', 'المنسوجات التقنية', 'Технические ткани', 'Technische Textilien', 'technical-textiles',
 'Flame retardant, acoustic, outdoor and performance technical textiles.',
 'Alev geciktirici, akustik, dış mekan ve performans teknik tekstilleri.',
 'Flammhemmende, akustische, Outdoor- und Performance-Technische Textilien.',
 6, 'both', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80');

-- Alt kategoriler
INSERT INTO product_subcategories (category_id, name_en, name_tr, name_de, name_ar, name_ru, slug, display_order) VALUES
(1, 'Sheer Curtains', 'Tül Perdeler', 'Gardinen', 'ستائر شفافة', 'Тюлевые шторы', 'sheer-curtains', 1),
(1, 'Blackout Curtains', 'Karartma Perdeler', 'Verdunkelungsvorhänge', 'ستائر معتمة', 'Блэкаут шторы', 'blackout-curtains', 2),
(1, 'Linen Curtains', 'Keten Perdeler', 'Leinenvorhänge', 'ستائر كتانية', 'Льняные шторы', 'linen-curtains', 3),
(1, 'Velvet Curtains', 'Kadife Perdeler', 'Samtvorhänge', 'ستائر مخملية', 'Бархатные шторы', 'velvet-curtains', 4),
(2, 'Velvet Upholstery', 'Kadife Döşemelik', 'Samtpolster', 'تنجيد مخملي', 'Бархатная обивка', 'velvet-upholstery', 1),
(2, 'Linen Fabric', 'Keten Kumaş', 'Leinenstoff', 'قماش كتاني', 'Льняная ткань', 'linen-fabric', 2),
(2, 'Jacquard Fabric', 'Jakarlı Kumaş', 'Jacquardstoff', 'قماش جاكار', 'Жаккардовая ткань', 'jacquard-fabric', 3),
(3, 'Hand-Woven Wool', 'El Dokuma Yün', 'Handgewebte Wolle', 'صوف منسوج يدويًا', 'Ручная шерсть', 'hand-woven-wool', 1),
(3, 'Machine-Made Carpet', 'Makine Halısı', 'Maschinenteppich', 'سجادة آلية', 'Машинный ковёр', 'machine-made-carpet', 2),
(4, 'Decorative Pillows', 'Dekoratif Yastıklar', 'Dekorative Kissen', 'وسائد زخرفية', 'Декоративные подушки', 'decorative-pillows', 1),
(4, 'Table Runners', 'Masa Örtüleri', 'Tischläufer', 'مفارش الطاولة', 'Дорожки для стола', 'table-runners', 2);

-- ============================================================
-- ADIM 13: Sertifikalar Demo Verileri
-- ============================================================

INSERT INTO certifications (name, code, description, issuing_organization) VALUES
('OEKO-TEX Standard 100', 'OEKO-TEX-100', 'Harmful substances tested textile certification', 'OEKO-TEX Association'),
('ISO 9001:2015', 'ISO-9001', 'Quality Management System certification', 'ISO'),
('GOTS - Global Organic Textile Standard', 'GOTS', 'Organic textile processing standard', 'Global Standard gGmbH'),
('Bluesign', 'BLUESIGN', 'Sustainable textile production certification', 'bluesign technologies ag'),
('REACH Compliance', 'REACH', 'EU chemical safety regulation compliance', 'European Chemicals Agency'),
('CE Marking', 'CE', 'European conformity marking', 'European Union'),
('Woolmark', 'WOOLMARK', 'Pure new wool quality certification', 'The Woolmark Company'),
('FSC Certified', 'FSC', 'Forest Stewardship Council certification', 'FSC International'),
('Cradle to Cradle', 'C2C', 'Circular economy product certification', 'Cradle to Cradle Products Innovation Institute'),
('Turkish Standards Institute', 'TSE', 'Turkish quality and safety standard', 'TSE - Türk Standartları Enstitüsü');

-- ============================================================
-- ADIM 14: Abonelik Planları
-- ============================================================

INSERT INTO subscription_plans (
    name, slug, description, price_monthly, price_annual, currency,
    features, max_products, max_showrooms,
    ai_assistant_enabled, dynamic_pricing_enabled, lead_priority_level,
    analytics_access_level, display_order
) VALUES
(
    'Starter', 'starter',
    'Perfect for small suppliers entering the digital fair',
    49.00, 490.00, 'USD',
    '{"features": ["1 Digital Showroom", "Up to 20 Products", "Basic Analytics", "Email Support", "TR+EN Languages"]}'::jsonb,
    20, 1, false, false, 1, 'basic', 1
),
(
    'Professional', 'professional',
    'For growing suppliers who want more visibility',
    149.00, 1490.00, 'USD',
    '{"features": ["3 Digital Showrooms", "Up to 100 Products", "Advanced Analytics", "Priority Support", "All Languages", "AI Quote Assistant", "Perde.ai Integration"]}'::jsonb,
    100, 3, true, false, 2, 'advanced', 2
),
(
    'Enterprise', 'enterprise',
    'Full-featured solution for large manufacturers',
    399.00, 3990.00, 'USD',
    '{"features": ["Unlimited Showrooms", "Unlimited Products", "Full Analytics Suite", "Dedicated Account Manager", "All Languages + DE", "AI Assistant + Dynamic Pricing", "Perde.ai + TRTex Integration", "Fair Booth Priority", "Custom Branding"]}'::jsonb,
    NULL, NULL, true, true, 3, 'full', 3
),
(
    'Heimtex Premium', 'heimtex-premium',
    'Speziell für den deutschsprachigen Markt - Special plan for German market',
    199.00, 1990.00, 'USD',
    '{"features": ["2 Digital Showrooms", "Up to 150 Products", "DE+EN Languages", "German Market Analytics", "AI Assistant", "Heimtex Fair Priority Booth"]}'::jsonb,
    150, 2, true, false, 2, 'advanced', 4
);

-- ============================================================
-- ADIM 15: Ekosistem Bağlantı Tablosu
-- Hometex ↔ TRTex ↔ Perde.ai sinir ağı bağlantıları
-- ============================================================

CREATE TABLE ecosystem_connections (
    id BIGSERIAL PRIMARY KEY,
    source_platform VARCHAR(50) NOT NULL,   -- 'hometex', 'heimtex', 'trtex', 'perde_ai'
    target_platform VARCHAR(50) NOT NULL,
    connection_type VARCHAR(100) NOT NULL,  -- 'news_sync', 'product_sync', 'design_link', 'analytics_share'
    source_entity_type VARCHAR(100),        -- 'product', 'showroom', 'news', 'design'
    source_entity_id BIGINT,
    target_entity_id VARCHAR(200),
    sync_data JSONB,
    sync_status VARCHAR(50) DEFAULT 'pending' 
        CHECK (sync_status IN ('pending', 'synced', 'failed', 'skipped')),
    last_sync_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ecosystem_connections_source_platform ON ecosystem_connections(source_platform);
CREATE INDEX idx_ecosystem_connections_target_platform ON ecosystem_connections(target_platform);
CREATE INDEX idx_ecosystem_connections_connection_type ON ecosystem_connections(connection_type);
CREATE INDEX idx_ecosystem_connections_sync_status ON ecosystem_connections(sync_status);

-- ============================================================
-- ADIM 16: Trigger'lar - Otomatik updated_at güncellemesi
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_domain_configs_updated_at BEFORE UPDATE ON domain_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fair_events_updated_at BEFORE UPDATE ON fair_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_platform_integrations_updated_at BEFORE UPDATE ON platform_integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_news_feed_cache_updated_at BEFORE UPDATE ON news_feed_cache FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_design_projects_updated_at BEFORE UPDATE ON design_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_showroom_translations_updated_at BEFORE UPDATE ON showroom_translations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_translations_updated_at BEFORE UPDATE ON product_translations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_translations_updated_at BEFORE UPDATE ON content_translations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ecosystem_connections_updated_at BEFORE UPDATE ON ecosystem_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ADIM 17: İzinler - Yeni tablolar için grant
-- ============================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON domain_configs TO app20251125030717azolfgnmgv_v1_admin_user;
GRANT SELECT ON domain_configs TO app20251125030717azolfgnmgv_v1_user;

GRANT SELECT, INSERT, UPDATE, DELETE ON fair_events TO app20251125030717azolfgnmgv_v1_admin_user;
GRANT SELECT ON fair_events TO app20251125030717azolfgnmgv_v1_user;

GRANT SELECT, INSERT, UPDATE, DELETE ON platform_integrations TO app20251125030717azolfgnmgv_v1_admin_user;
GRANT SELECT ON platform_integrations TO app20251125030717azolfgnmgv_v1_user;

GRANT SELECT, INSERT, UPDATE, DELETE ON news_feed_cache TO app20251125030717azolfgnmgv_v1_admin_user;
GRANT SELECT ON news_feed_cache TO app20251125030717azolfgnmgv_v1_user;

GRANT SELECT, INSERT, UPDATE, DELETE ON design_projects TO app20251125030717azolfgnmgv_v1_admin_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON design_projects TO app20251125030717azolfgnmgv_v1_user;

GRANT SELECT, INSERT, UPDATE, DELETE ON showroom_translations TO app20251125030717azolfgnmgv_v1_admin_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON showroom_translations TO app20251125030717azolfgnmgv_v1_user;

GRANT SELECT, INSERT, UPDATE, DELETE ON product_translations TO app20251125030717azolfgnmgv_v1_admin_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON product_translations TO app20251125030717azolfgnmgv_v1_user;

GRANT SELECT, INSERT, UPDATE, DELETE ON visitor_analytics TO app20251125030717azolfgnmgv_v1_admin_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON visitor_analytics TO app20251125030717azolfgnmgv_v1_user;

GRANT SELECT, INSERT, UPDATE, DELETE ON fair_booth_reservations TO app20251125030717azolfgnmgv_v1_admin_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON fair_booth_reservations TO app20251125030717azolfgnmgv_v1_user;

GRANT SELECT, INSERT, UPDATE, DELETE ON content_translations TO app20251125030717azolfgnmgv_v1_admin_user;
GRANT SELECT ON content_translations TO app20251125030717azolfgnmgv_v1_user;

GRANT SELECT, INSERT, UPDATE, DELETE ON ecosystem_connections TO app20251125030717azolfgnmgv_v1_admin_user;
GRANT SELECT ON ecosystem_connections TO app20251125030717azolfgnmgv_v1_user;

GRANT SELECT, INSERT, UPDATE, DELETE ON certifications TO app20251125030717azolfgnmgv_v1_admin_user;
GRANT SELECT ON certifications TO app20251125030717azolfgnmgv_v1_user;

-- Sequence izinleri
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA app20251125030717azolfgnmgv_v1 TO app20251125030717azolfgnmgv_v1_admin_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA app20251125030717azolfgnmgv_v1 TO app20251125030717azolfgnmgv_v1_user;

-- ============================================================
-- ADIM 18: RLS - Kullanıcı bazlı tablolar için
-- ============================================================

ALTER TABLE fair_booth_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY fair_booth_reservations_select_policy ON fair_booth_reservations FOR SELECT USING (user_id = uid());
CREATE POLICY fair_booth_reservations_insert_policy ON fair_booth_reservations FOR INSERT WITH CHECK (user_id = uid());
CREATE POLICY fair_booth_reservations_update_policy ON fair_booth_reservations FOR UPDATE USING (user_id = uid()) WITH CHECK (user_id = uid());
CREATE POLICY fair_booth_reservations_delete_policy ON fair_booth_reservations FOR DELETE USING (user_id = uid());

CREATE POLICY design_projects_select_policy ON design_projects FOR SELECT USING (user_id = uid() OR user_id IS NULL);
CREATE POLICY design_projects_insert_policy ON design_projects FOR INSERT WITH CHECK (user_id = uid() OR user_id IS NULL);
CREATE POLICY design_projects_update_policy ON design_projects FOR UPDATE USING (user_id = uid() OR user_id IS NULL);
CREATE POLICY design_projects_delete_policy ON design_projects FOR DELETE USING (user_id = uid());

-- ============================================================
-- HOMETEX.AI — AI-DRIVEN VIRTUAL FAIR PLATFORM
-- Missing tables for the living fair vision
-- ============================================================

-- 1. BRAND PROFILES — AI-generated brand analysis cards
CREATE TABLE brand_profiles (
    id BIGSERIAL PRIMARY KEY,
    showroom_id BIGINT NOT NULL,
    company_id BIGINT NOT NULL,
    brand_name VARCHAR(300) NOT NULL,
    brand_slug VARCHAR(300) UNIQUE NOT NULL,
    -- Region grouping for global fair structure
    region VARCHAR(50) NOT NULL DEFAULT 'turkey',
    country_code VARCHAR(10),
    country_name_en VARCHAR(100),
    country_name_tr VARCHAR(100),
    country_name_de VARCHAR(100),
    country_name_ar VARCHAR(100),
    country_name_ru VARCHAR(100),
    -- AI-generated analysis
    ai_strengths_en TEXT,
    ai_strengths_tr TEXT,
    ai_strengths_de TEXT,
    ai_market_position_en TEXT,
    ai_market_position_tr TEXT,
    ai_market_position_de TEXT,
    ai_commentary_en TEXT,
    ai_commentary_tr TEXT,
    ai_commentary_de TEXT,
    price_segment VARCHAR(50) DEFAULT 'mid',  -- budget, mid, premium, luxury
    -- Visual assets
    hero_image_url TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    -- Fair booth feel
    fair_hall VARCHAR(100),
    fair_booth_number VARCHAR(50),
    booth_theme_color VARCHAR(7) DEFAULT '#D4AF37',
    -- AI ranking & visibility
    ai_rank_score NUMERIC(8,4) DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_sponsored BOOLEAN DEFAULT FALSE,
    sponsor_tier VARCHAR(50),  -- bronze, silver, gold, platinum
    sponsor_expires_at TIMESTAMP WITH TIME ZONE,
    -- Performance metrics
    total_views BIGINT DEFAULT 0,
    total_clicks BIGINT DEFAULT 0,
    total_perde_ai_redirects BIGINT DEFAULT 0,
    avg_dwell_seconds INTEGER DEFAULT 0,
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_ai_update_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT brand_profiles_region_check CHECK (region IN ('turkey', 'china', 'europe', 'far_east', 'middle_east', 'other')),
    CONSTRAINT brand_profiles_price_segment_check CHECK (price_segment IN ('budget', 'mid', 'premium', 'luxury')),
    CONSTRAINT brand_profiles_sponsor_tier_check CHECK (sponsor_tier IN ('bronze', 'silver', 'gold', 'platinum') OR sponsor_tier IS NULL)
);

CREATE INDEX idx_brand_profiles_showroom_id ON brand_profiles(showroom_id);
CREATE INDEX idx_brand_profiles_company_id ON brand_profiles(company_id);
CREATE INDEX idx_brand_profiles_region ON brand_profiles(region);
CREATE INDEX idx_brand_profiles_ai_rank_score ON brand_profiles(ai_rank_score DESC);
CREATE INDEX idx_brand_profiles_is_featured ON brand_profiles(is_featured);
CREATE INDEX idx_brand_profiles_is_sponsored ON brand_profiles(is_sponsored);
CREATE INDEX idx_brand_profiles_brand_slug ON brand_profiles(brand_slug);

-- 2. COLLECTION TREND SCORES — Core engine for living fair
CREATE TABLE collection_trend_scores (
    id BIGSERIAL PRIMARY KEY,
    collection_id BIGINT NOT NULL,
    showroom_id BIGINT NOT NULL,
    brand_profile_id BIGINT,
    -- Style classification
    style_category VARCHAR(100),  -- modern, luxury, minimal, classic, hotel, yacht, office
    style_tags JSONB DEFAULT '[]',  -- ["velvet", "dark", "2026", "nordic"]
    color_palette JSONB DEFAULT '[]',  -- ["#1a1a2e", "#D4AF37"]
    usage_contexts JSONB DEFAULT '[]',  -- ["home", "hotel", "office", "yacht"]
    season VARCHAR(50),  -- SS2026, AW2025, etc.
    -- AI trend analysis
    trend_score NUMERIC(5,2) DEFAULT 0,  -- 0-100
    trend_direction VARCHAR(20) DEFAULT 'stable',  -- rising, stable, declining, breakout
    trend_velocity NUMERIC(5,2) DEFAULT 0,  -- rate of change
    ai_commentary_en TEXT,
    ai_commentary_tr TEXT,
    ai_commentary_de TEXT,
    ai_commentary_ar TEXT,
    ai_commentary_ru TEXT,
    -- perde.ai deep-link integration
    perde_ai_style_prompt TEXT,  -- pre-filled prompt for perde.ai
    perde_ai_deep_link TEXT,     -- full URL with params
    perde_ai_style_config JSONB, -- style config object to pass
    -- Performance
    click_count BIGINT DEFAULT 0,
    perde_ai_redirect_count BIGINT DEFAULT 0,
    save_count BIGINT DEFAULT 0,
    share_count BIGINT DEFAULT 0,
    -- Visibility
    is_trending BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_sponsored BOOLEAN DEFAULT FALSE,
    featured_until TIMESTAMP WITH TIME ZONE,
    ai_rank_score NUMERIC(8,4) DEFAULT 0,
    -- Timestamps
    last_trend_calc_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT collection_trend_scores_trend_direction_check CHECK (trend_direction IN ('rising', 'stable', 'declining', 'breakout', 'viral')),
    CONSTRAINT collection_trend_scores_trend_score_check CHECK (trend_score >= 0 AND trend_score <= 100)
);

CREATE INDEX idx_collection_trend_scores_collection_id ON collection_trend_scores(collection_id);
CREATE INDEX idx_collection_trend_scores_showroom_id ON collection_trend_scores(showroom_id);
CREATE INDEX idx_collection_trend_scores_trend_score ON collection_trend_scores(trend_score DESC);
CREATE INDEX idx_collection_trend_scores_is_trending ON collection_trend_scores(is_trending);
CREATE INDEX idx_collection_trend_scores_style_category ON collection_trend_scores(style_category);
CREATE INDEX idx_collection_trend_scores_trend_direction ON collection_trend_scores(trend_direction);

-- 3. AI AGENT TASKS — Task queue for all AI agents
CREATE TABLE ai_agent_tasks (
    id BIGSERIAL PRIMARY KEY,
    agent_type VARCHAR(100) NOT NULL,  -- master, fair, trend, match, conversion
    task_type VARCHAR(200) NOT NULL,
    task_priority INTEGER DEFAULT 5,  -- 1=critical, 10=low
    -- Target entity
    target_entity_type VARCHAR(100),  -- brand, collection, showroom, product
    target_entity_id BIGINT,
    -- Task data
    input_data JSONB,
    output_data JSONB,
    -- Execution
    status VARCHAR(50) DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    execution_duration_ms INTEGER,
    -- Context
    triggered_by VARCHAR(100) DEFAULT 'system',  -- system, user_action, schedule, agent
    parent_task_id BIGINT,
    domain_key VARCHAR(50) DEFAULT 'hometex',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ai_agent_tasks_agent_type_check CHECK (agent_type IN ('master', 'fair', 'trend', 'match', 'conversion', 'content', 'analytics')),
    CONSTRAINT ai_agent_tasks_status_check CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled', 'skipped'))
);

CREATE INDEX idx_ai_agent_tasks_agent_type ON ai_agent_tasks(agent_type);
CREATE INDEX idx_ai_agent_tasks_status ON ai_agent_tasks(status);
CREATE INDEX idx_ai_agent_tasks_scheduled_at ON ai_agent_tasks(scheduled_at);
CREATE INDEX idx_ai_agent_tasks_target_entity ON ai_agent_tasks(target_entity_type, target_entity_id);
CREATE INDEX idx_ai_agent_tasks_priority ON ai_agent_tasks(task_priority, scheduled_at);

-- 4. PERDE.AI STYLE LINKS — Deep-link bridge between hometex and perde.ai
CREATE TABLE perde_ai_style_links (
    id BIGSERIAL PRIMARY KEY,
    -- Source
    source_type VARCHAR(100) NOT NULL,  -- collection, product, brand, trend
    source_id BIGINT NOT NULL,
    source_domain VARCHAR(50) DEFAULT 'hometex',
    -- Style data to pass to perde.ai
    style_name VARCHAR(300),
    style_prompt TEXT NOT NULL,
    style_config JSONB,  -- colors, materials, patterns, mood
    room_type_suggestion VARCHAR(100),  -- living_room, bedroom, office, hotel
    -- Generated link
    deep_link_url TEXT NOT NULL,
    short_link_code VARCHAR(50) UNIQUE,
    utm_source VARCHAR(100) DEFAULT 'hometex',
    utm_medium VARCHAR(100) DEFAULT 'collection_cta',
    utm_campaign VARCHAR(200),
    -- Performance tracking
    click_count BIGINT DEFAULT 0,
    conversion_count BIGINT DEFAULT 0,  -- actually opened perde.ai
    design_started_count BIGINT DEFAULT 0,  -- started a design
    last_clicked_at TIMESTAMP WITH TIME ZONE,
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT perde_ai_style_links_source_type_check CHECK (source_type IN ('collection', 'product', 'brand', 'trend', 'showroom'))
);

CREATE INDEX idx_perde_ai_style_links_source ON perde_ai_style_links(source_type, source_id);
CREATE INDEX idx_perde_ai_style_links_short_code ON perde_ai_style_links(short_link_code);
CREATE INDEX idx_perde_ai_style_links_click_count ON perde_ai_style_links(click_count DESC);

-- 5. FEATURED SLOTS — Monetization: premium stands & sponsored collections
CREATE TABLE featured_slots (
    id BIGSERIAL PRIMARY KEY,
    slot_type VARCHAR(100) NOT NULL,  -- homepage_hero, category_top, trending_banner, sidebar
    slot_position INTEGER DEFAULT 1,
    domain_key VARCHAR(50) DEFAULT 'hometex',
    -- What is featured
    entity_type VARCHAR(100) NOT NULL,  -- brand, collection, showroom
    entity_id BIGINT NOT NULL,
    -- Sponsorship details
    sponsor_tier VARCHAR(50) DEFAULT 'standard',
    price_usd NUMERIC(10,2),
    currency VARCHAR(10) DEFAULT 'USD',
    payment_status VARCHAR(50) DEFAULT 'pending',
    -- Display config
    custom_title_en VARCHAR(300),
    custom_title_tr VARCHAR(300),
    custom_title_de VARCHAR(300),
    custom_banner_url TEXT,
    custom_cta_text_en VARCHAR(200),
    custom_cta_url TEXT,
    display_config JSONB,
    -- Scheduling
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    -- Performance
    impression_count BIGINT DEFAULT 0,
    click_count BIGINT DEFAULT 0,
    ctr NUMERIC(5,4) DEFAULT 0,  -- click-through rate
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT featured_slots_slot_type_check CHECK (slot_type IN ('homepage_hero', 'homepage_grid', 'category_top', 'trending_banner', 'sidebar', 'collection_spotlight', 'region_highlight')),
    CONSTRAINT featured_slots_sponsor_tier_check CHECK (sponsor_tier IN ('standard', 'bronze', 'silver', 'gold', 'platinum')),
    CONSTRAINT featured_slots_payment_status_check CHECK (payment_status IN ('pending', 'paid', 'refunded', 'cancelled'))
);

CREATE INDEX idx_featured_slots_domain_key ON featured_slots(domain_key);
CREATE INDEX idx_featured_slots_entity ON featured_slots(entity_type, entity_id);
CREATE INDEX idx_featured_slots_slot_type ON featured_slots(slot_type);
CREATE INDEX idx_featured_slots_active_dates ON featured_slots(is_active, starts_at, ends_at);

-- 6. CONTENT FEED RANKINGS — AI ranking engine for dynamic homepage
CREATE TABLE content_feed_rankings (
    id BIGSERIAL PRIMARY KEY,
    domain_key VARCHAR(50) DEFAULT 'hometex',
    -- Content being ranked
    content_type VARCHAR(100) NOT NULL,  -- brand, collection, product, trend
    content_id BIGINT NOT NULL,
    -- Ranking signals
    base_score NUMERIC(8,4) DEFAULT 0,
    recency_score NUMERIC(8,4) DEFAULT 0,
    engagement_score NUMERIC(8,4) DEFAULT 0,
    trend_score NUMERIC(8,4) DEFAULT 0,
    conversion_score NUMERIC(8,4) DEFAULT 0,
    sponsor_boost NUMERIC(8,4) DEFAULT 0,
    final_rank_score NUMERIC(10,4) DEFAULT 0,
    -- Engagement metrics (rolling 7 days)
    views_7d BIGINT DEFAULT 0,
    clicks_7d BIGINT DEFAULT 0,
    dwell_time_avg_7d INTEGER DEFAULT 0,
    perde_ai_redirects_7d BIGINT DEFAULT 0,
    saves_7d BIGINT DEFAULT 0,
    -- Ranking context
    feed_type VARCHAR(100) DEFAULT 'homepage',  -- homepage, explore, trending, regional
    region_filter VARCHAR(50),  -- turkey, china, europe, far_east, all
    language_code VARCHAR(10) DEFAULT 'tr',
    -- Position
    current_position INTEGER,
    previous_position INTEGER,
    position_change INTEGER,  -- positive = moved up
    -- Timestamps
    last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    next_recalc_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT content_feed_rankings_content_type_check CHECK (content_type IN ('brand', 'collection', 'product', 'trend', 'showroom')),
    CONSTRAINT content_feed_rankings_feed_type_check CHECK (feed_type IN ('homepage', 'explore', 'trending', 'regional', 'category', 'search'))
);

CREATE INDEX idx_content_feed_rankings_domain ON content_feed_rankings(domain_key);
CREATE INDEX idx_content_feed_rankings_content ON content_feed_rankings(content_type, content_id);
CREATE INDEX idx_content_feed_rankings_final_score ON content_feed_rankings(final_rank_score DESC);
CREATE INDEX idx_content_feed_rankings_feed_type ON content_feed_rankings(feed_type, region_filter);
CREATE INDEX idx_content_feed_rankings_recalc ON content_feed_rankings(next_recalc_at);

-- 7. BRAND REGIONS — Global fair structure grouping
CREATE TABLE brand_regions (
    id BIGSERIAL PRIMARY KEY,
    region_key VARCHAR(50) UNIQUE NOT NULL,  -- turkey, china, europe, far_east
    -- Display names
    name_en VARCHAR(200) NOT NULL,
    name_tr VARCHAR(200),
    name_de VARCHAR(200),
    name_ar VARCHAR(200),
    name_ru VARCHAR(200),
    -- Marketing labels (e.g., "Rising China", "Export Leaders Turkey")
    marketing_label_en VARCHAR(300),
    marketing_label_tr VARCHAR(300),
    marketing_label_de VARCHAR(300),
    -- Visual
    hero_image_url TEXT,
    icon_url TEXT,
    accent_color VARCHAR(7) DEFAULT '#D4AF37',
    -- Countries in this region
    countries JSONB DEFAULT '[]',  -- ["TR", "AZ", "UZ"]
    -- Stats
    brand_count INTEGER DEFAULT 0,
    collection_count INTEGER DEFAULT 0,
    -- AI description
    ai_description_en TEXT,
    ai_description_tr TEXT,
    ai_description_de TEXT,
    -- Display
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_highlighted BOOLEAN DEFAULT FALSE,  -- "Rising China" highlight
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_brand_regions_region_key ON brand_regions(region_key);
CREATE INDEX idx_brand_regions_display_order ON brand_regions(display_order);

-- 8. MATCH RECOMMENDATIONS — Match Agent output
CREATE TABLE match_recommendations (
    id BIGSERIAL PRIMARY KEY,
    -- Source: what the user viewed/liked
    source_type VARCHAR(100) NOT NULL,  -- collection, brand, product
    source_id BIGINT NOT NULL,
    -- Recommended: what to show next
    recommended_type VARCHAR(100) NOT NULL,
    recommended_id BIGINT NOT NULL,
    -- Match details
    match_score NUMERIC(5,2) NOT NULL,
    match_reasons JSONB DEFAULT '[]',  -- ["same_style", "similar_color", "same_region"]
    match_algorithm VARCHAR(100) DEFAULT 'ai_similarity',
    -- Context
    domain_key VARCHAR(50) DEFAULT 'hometex',
    visitor_segment VARCHAR(100),  -- anonymous, registered, buyer, designer
    -- Performance
    impression_count BIGINT DEFAULT 0,
    click_count BIGINT DEFAULT 0,
    -- Validity
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT match_recommendations_match_score_check CHECK (match_score >= 0 AND match_score <= 100),
    CONSTRAINT match_recommendations_source_type_check CHECK (source_type IN ('collection', 'brand', 'product', 'showroom')),
    CONSTRAINT match_recommendations_recommended_type_check CHECK (recommended_type IN ('collection', 'brand', 'product', 'showroom'))
);

CREATE INDEX idx_match_recommendations_source ON match_recommendations(source_type, source_id);
CREATE INDEX idx_match_recommendations_recommended ON match_recommendations(recommended_type, recommended_id);
CREATE INDEX idx_match_recommendations_score ON match_recommendations(match_score DESC);
CREATE INDEX idx_match_recommendations_domain ON match_recommendations(domain_key);

-- 9. TREND SIGNALS — Input data for Trend Agent
CREATE TABLE trend_signals (
    id BIGSERIAL PRIMARY KEY,
    signal_source VARCHAR(100) NOT NULL,  -- internal_analytics, trtex_news, social, manual
    signal_type VARCHAR(100) NOT NULL,    -- style_rising, color_trending, brand_buzz, seasonal
    -- Signal content
    keyword VARCHAR(300),
    style_tag VARCHAR(200),
    color_hex VARCHAR(7),
    region VARCHAR(50),
    -- Signal strength
    signal_strength NUMERIC(5,2) DEFAULT 0,  -- 0-100
    confidence_score NUMERIC(5,2) DEFAULT 0,
    -- Related entities
    related_collections JSONB DEFAULT '[]',
    related_brands JSONB DEFAULT '[]',
    related_categories JSONB DEFAULT '[]',
    -- Raw data
    raw_data JSONB,
    source_url TEXT,
    -- Processing
    is_processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE,
    applied_to_count INTEGER DEFAULT 0,
    -- Validity
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP WITH TIME ZONE,
    domain_key VARCHAR(50) DEFAULT 'both',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT trend_signals_signal_source_check CHECK (signal_source IN ('internal_analytics', 'trtex_news', 'social', 'manual', 'ai_generated', 'external_api')),
    CONSTRAINT trend_signals_signal_strength_check CHECK (signal_strength >= 0 AND signal_strength <= 100)
);

CREATE INDEX idx_trend_signals_signal_type ON trend_signals(signal_type);
CREATE INDEX idx_trend_signals_signal_source ON trend_signals(signal_source);
CREATE INDEX idx_trend_signals_is_processed ON trend_signals(is_processed);
CREATE INDEX idx_trend_signals_signal_strength ON trend_signals(signal_strength DESC);
CREATE INDEX idx_trend_signals_valid_until ON trend_signals(valid_until);

-- ============================================================
-- SEED DATA — Brand Regions
-- ============================================================
INSERT INTO brand_regions (region_key, name_en, name_tr, name_de, name_ar, name_ru, marketing_label_en, marketing_label_tr, marketing_label_de, hero_image_url, accent_color, countries, display_order, is_highlighted) VALUES
('turkey', 'Turkey', 'Türkiye', 'Türkei', 'تركيا', 'Турция', 'Export Leaders Turkey', 'İhracat Liderleri Türkiye', 'Exportführer Türkei', 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200', '#C0392B', '["TR"]', 1, true),
('china', 'China', 'Çin', 'China', 'الصين', 'Китай', 'Rising China', 'Yükselen Çin', 'Aufsteigendes China', 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=1200', '#E74C3C', '["CN"]', 2, true),
('europe', 'Europe', 'Avrupa', 'Europa', 'أوروبا', 'Европа', 'Premium Europe', 'Premium Avrupa', 'Premium Europa', 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200', '#2C3E50', '["DE","IT","FR","ES","NL","BE","AT","CH"]', 3, true),
('far_east', 'Far East', 'Uzak Doğu', 'Ferner Osten', 'الشرق الأقصى', 'Дальний Восток', 'Far East Craftsmanship', 'Uzak Doğu Ustalığı', 'Handwerkskunst des Fernen Ostens', 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200', '#8E44AD', '["JP","KR","TW","VN","IN"]', 4, false),
('middle_east', 'Middle East', 'Orta Doğu', 'Naher Osten', 'الشرق الأوسط', 'Ближний Восток', 'Luxury Middle East', 'Lüks Orta Doğu', 'Luxus Naher Osten', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200', '#F39C12', '["AE","SA","QA","KW","BH"]', 5, false);

-- ============================================================
-- SEED DATA — Platform Integrations (trtex + perde.ai)
-- ============================================================
INSERT INTO platform_integrations (platform_name, platform_url, platform_type, display_name_en, display_name_tr, display_name_de, description_en, description_tr, api_endpoint, sync_enabled, sync_interval_minutes, supported_domains, is_active) VALUES
('trtex', 'https://trtex.com', 'news_portal', 'TRTex - Turkey Home Textile Portal', 'TRTex - Türkiye Ev Tekstil Portalı', 'TRTex - Türkisches Heimtextilportal', 'Turkey''s leading home textile news and industry portal. Provides trend signals and industry news.', 'Türkiye''nin önde gelen ev tekstil haber ve sektör portalı. Trend sinyalleri ve sektör haberleri sağlar.', 'https://trtex.com/api/v1', true, 30, '["hometex", "heimtex"]', true),
('perde_ai', 'https://perde.ai', 'design_tool', 'Perde.AI - Curtain & Decoration Design', 'Perde.AI - Perde ve Dekorasyon Tasarımı', 'Perde.AI - Vorhang & Dekorationsdesign', 'AI-powered curtain and home decoration visualization tool. Users can apply textile styles to their own spaces.', 'Yapay zeka destekli perde ve ev dekorasyon görselleştirme aracı. Kullanıcılar tekstil stillerini kendi alanlarına uygulayabilir.', 'https://perde.ai/api/v1', true, 0, '["hometex", "heimtex"]', true);

-- ============================================================
-- SEED DATA — Domain Configs
-- ============================================================
INSERT INTO domain_configs (domain_key, domain_url, platform_name, platform_name_tr, platform_name_de, platform_name_ar, platform_name_ru, tagline_en, tagline_tr, tagline_de, tagline_ar, tagline_ru, supported_languages, default_language, primary_color, secondary_color, meta_title_en, meta_title_tr, meta_description_en, meta_description_tr, is_active) VALUES
('hometex', 'https://hometex.ai', 'Hometex.AI', 'Hometex.AI', 'Hometex.AI', 'Hometex.AI', 'Hometex.AI', 'The World''s First AI-Powered Virtual Home Textile Fair', 'Dünyanın İlk Yapay Zeka Destekli Sanal Ev Tekstil Fuarı', 'Die erste KI-gestützte virtuelle Heimtextilmesse der Welt', 'أول معرض نسيج منزلي افتراضي مدعوم بالذكاء الاصطناعي في العالم', 'Первая в мире виртуальная выставка домашнего текстиля на базе ИИ', '["tr", "en", "ar", "ru"]', 'tr', '#D4AF37', '#1a1a2e', 'Hometex.AI — Global Virtual Home Textile Fair', 'Hometex.AI — Global Sanal Ev Tekstil Fuarı', 'Discover global home textile brands, collections and trends. The living virtual fair powered by AI.', 'Global ev tekstil markalarını, koleksiyonlarını ve trendlerini keşfedin. Yapay zeka destekli yaşayan sanal fuar.', true),
('heimtex', 'https://heimtex.ai', 'Heimtex.AI', 'Heimtex.AI', 'Heimtex.AI', 'Heimtex.AI', 'Heimtex.AI', 'The AI-Powered Virtual Home Textile Fair for the German Market', 'Alman Pazarı için Yapay Zeka Destekli Sanal Ev Tekstil Fuarı', 'Die KI-gestützte virtuelle Heimtextilmesse für den deutschen Markt', 'معرض النسيج المنزلي الافتراضي للسوق الألمانية', 'Виртуальная выставка домашнего текстиля для немецкого рынка', '["de", "en"]', 'de', '#2C3E50', '#1a1a2e', 'Heimtex.AI — Virtual Home Textile Fair for Germany', 'Heimtex.AI — Almanya için Sanal Ev Tekstil Fuarı', 'Entdecken Sie globale Heimtextilmarken, Kollektionen und Trends. Die lebendige virtuelle Messe powered by KI.', 'Almanya pazarına özel global ev tekstil markaları ve koleksiyonları.', true);

-- ============================================================
-- SEED DATA — Product Categories (multilingual)
-- ============================================================
INSERT INTO product_categories (name_en, name_tr, name_de, name_ar, name_ru, slug, description_en, description_tr, description_de, display_order, is_active, supported_domains) VALUES
('Curtains & Drapes', 'Perdeler', 'Vorhänge & Gardinen', 'الستائر والمسدلات', 'Шторы и занавески', 'curtains-drapes', 'Premium curtains, drapes, sheers and blackout solutions for home and hospitality.', 'Ev ve otelcilik için premium perdeler, tül perdeler ve karartma çözümleri.', 'Premium Vorhänge, Gardinen, Stores und Verdunkelungslösungen für Zuhause und Hotellerie.', 1, true, 'both'),
('Upholstery Fabrics', 'Döşemelik Kumaşlar', 'Polsterstoffe', 'أقمشة التنجيد', 'Обивочные ткани', 'upholstery-fabrics', 'High-quality upholstery fabrics including velvet, linen, jacquard and technical textiles.', 'Kadife, keten, jakarlı ve teknik tekstiller dahil yüksek kaliteli döşemelik kumaşlar.', 'Hochwertige Polsterstoffe einschließlich Samt, Leinen, Jacquard und technische Textilien.', 2, true, 'both'),
('Carpets & Rugs', 'Halılar', 'Teppiche', 'السجاد والبسط', 'Ковры и паласы', 'carpets-rugs', 'Handmade and machine-made carpets, rugs and floor coverings from global manufacturers.', 'Global üreticilerden el yapımı ve makine yapımı halılar ve yer kaplamaları.', 'Handgefertigte und maschinell hergestellte Teppiche und Bodenbeläge von globalen Herstellern.', 3, true, 'both'),
('Bedding & Linen', 'Yatak Tekstili', 'Bettwäsche & Leinen', 'مفارش الأسرة والكتان', 'Постельное белье', 'bedding-linen', 'Luxury bedding sets, duvet covers, pillowcases and hotel-grade linen collections.', 'Lüks yatak takımları, nevresim takımları, yastık kılıfları ve otel kalitesi çarşaf koleksiyonları.', 'Luxuriöse Bettwäsche-Sets, Bettbezüge, Kissenbezüge und Hotelqualitäts-Leinenkollektionen.', 4, true, 'both'),
('Home Accessories', 'Ev Aksesuarları', 'Wohnaccessoires', 'إكسسوارات المنزل', 'Домашние аксессуары', 'home-accessories', 'Decorative pillows, throws, table runners, placemats and home textile accessories.', 'Dekoratif yastıklar, battaniyeler, masa örtüleri, amerikan servisi ve ev tekstil aksesuarları.', 'Dekorative Kissen, Decken, Tischläufer, Platzsets und Heimtextil-Accessoires.', 5, true, 'both'),
('Hotel & Contract', 'Otel ve Toplu Kullanım', 'Hotel & Objekttextilien', 'فنادق وعقود', 'Гостиничный и контрактный текстиль', 'hotel-contract', 'Professional hotel, restaurant and contract textiles for hospitality industry.', 'Otelcilik sektörü için profesyonel otel, restoran ve toplu kullanım tekstilleri.', 'Professionelle Hotel-, Restaurant- und Objekttextilien für die Hotellerie.', 6, true, 'both'),
('Yacht & Marine', 'Yat ve Denizcilik', 'Yacht & Marine', 'يخت وبحري', 'Яхтенный и морской текстиль', 'yacht-marine', 'Specialized marine and yacht textiles with UV resistance and waterproof properties.', 'UV dirençli ve su geçirmez özelliklere sahip özel denizcilik ve yat tekstilleri.', 'Spezialisierte Marine- und Yachttextilien mit UV-Beständigkeit und wasserdichten Eigenschaften.', 7, true, 'both');

-- ============================================================
-- SEED DATA — Certifications
-- ============================================================
INSERT INTO certifications (name, code, description, issuing_organization, is_active) VALUES
('OEKO-TEX Standard 100', 'OEKO-TEX-100', 'Tests for harmful substances in textiles. Ensures product safety for human health.', 'OEKO-TEX Association', true),
('Global Organic Textile Standard', 'GOTS', 'Leading textile processing standard for organic fibres including ecological and social criteria.', 'Global Organic Textile Standard', true),
('ISO 9001:2015', 'ISO-9001', 'Quality management systems standard ensuring consistent quality in manufacturing.', 'International Organization for Standardization', true),
('REACH Compliance', 'REACH', 'EU regulation on chemicals ensuring safe use of chemical substances in textiles.', 'European Chemicals Agency', true),
('Bluesign', 'BLUESIGN', 'Sustainable textile production standard focusing on resource efficiency and consumer safety.', 'Bluesign Technologies', true),
('Fair Trade Certified', 'FAIR-TRADE', 'Ensures fair wages and safe working conditions for textile workers.', 'Fair Trade International', true),
('Recycled Content Standard', 'RCS', 'Verifies recycled material content in textile products.', 'Textile Exchange', true),
('Turkish Standards Institute', 'TSE', 'Turkish national quality and safety certification for textile products.', 'Türk Standartları Enstitüsü', true);

-- ============================================================
-- SEED DATA — Subscription Plans
-- ============================================================
INSERT INTO subscription_plans (name, slug, description, price_monthly, price_annual, currency, features, max_products, max_showrooms, ai_assistant_enabled, dynamic_pricing_enabled, lead_priority_level, analytics_access_level, is_active, display_order) VALUES
('Starter', 'starter', 'Perfect for small brands entering the global textile market.', 49.00, 490.00, 'USD', '{"features": ["1 showroom", "20 products", "Basic analytics", "Standard listing", "Email support"]}', 20, 1, false, false, 1, 'basic', true, 1),
('Professional', 'professional', 'For growing brands that want more visibility and AI features.', 149.00, 1490.00, 'USD', '{"features": ["3 showrooms", "100 products", "Advanced analytics", "AI assistant", "Priority listing", "perde.ai integration", "Priority support"]}', 100, 3, true, false, 2, 'advanced', true, 2),
('Premium', 'premium', 'For established brands seeking maximum exposure and automation.', 349.00, 3490.00, 'USD', '{"features": ["10 showrooms", "500 products", "Full analytics", "AI assistant", "Featured listing", "Dynamic pricing", "perde.ai deep integration", "Dedicated support", "Custom branding"]}', 500, 10, true, true, 3, 'full', true, 3),
('Enterprise', 'enterprise', 'Custom solution for large manufacturers and global brands.', NULL, NULL, 'USD', '{"features": ["Unlimited showrooms", "Unlimited products", "Custom analytics", "Full AI suite", "Homepage featured", "API access", "White-label options", "Account manager"]}', NULL, NULL, true, true, 5, 'full', true, 4);

-- ============================================================
-- SEED DATA — Trend Signals (initial seed)
-- ============================================================
INSERT INTO trend_signals (signal_source, signal_type, keyword, style_tag, region, signal_strength, confidence_score, related_categories, domain_key, valid_until) VALUES
('ai_generated', 'style_rising', 'Velvet Noir', 'velvet-dark-luxury', 'europe', 92.5, 88.0, '["upholstery-fabrics", "curtains-drapes"]', 'both', CURRENT_TIMESTAMP + INTERVAL '90 days'),
('ai_generated', 'style_rising', 'Soft Linen 2026', 'linen-natural-minimal', 'turkey', 87.3, 91.0, '["curtains-drapes", "bedding-linen"]', 'both', CURRENT_TIMESTAMP + INTERVAL '90 days'),
('ai_generated', 'color_trending', 'Warm Terracotta', 'terracotta-earthy-warm', 'europe', 85.0, 85.5, '["home-accessories", "upholstery-fabrics"]', 'hometex', CURRENT_TIMESTAMP + INTERVAL '60 days'),
('ai_generated', 'style_rising', 'Nordic Minimalism', 'nordic-white-clean', 'europe', 89.0, 92.0, '["curtains-drapes", "bedding-linen"]', 'heimtex', CURRENT_TIMESTAMP + INTERVAL '90 days'),
('ai_generated', 'brand_buzz', 'Sustainable Textiles', 'eco-organic-sustainable', 'turkey', 94.0, 90.0, '["curtains-drapes", "upholstery-fabrics", "bedding-linen"]', 'both', CURRENT_TIMESTAMP + INTERVAL '120 days'),
('ai_generated', 'style_rising', 'Hotel Luxury Collection', 'hotel-premium-hospitality', 'far_east', 88.5, 87.0, '["hotel-contract", "bedding-linen"]', 'both', CURRENT_TIMESTAMP + INTERVAL '90 days'),
('ai_generated', 'style_rising', 'Yacht Textile Premium', 'yacht-marine-waterproof', 'europe', 76.0, 82.0, '["yacht-marine"]', 'hometex', CURRENT_TIMESTAMP + INTERVAL '60 days'),
('ai_generated', 'color_trending', 'Deep Ocean Blue', 'navy-deep-blue-classic', 'china', 83.0, 86.0, '["curtains-drapes", "upholstery-fabrics"]', 'both', CURRENT_TIMESTAMP + INTERVAL '60 days');

-- ============================================================
-- SEED DATA — Content Translations (UI strings)
-- ============================================================
INSERT INTO content_translations (content_key, domain_key, content_tr, content_en, content_de, content_ar, content_ru, content_type, section) VALUES
('nav.explore_fair', 'both', 'Fuarı Gez', 'Explore Fair', 'Messe Erkunden', 'استكشف المعرض', 'Исследовать выставку', 'text', 'navigation'),
('nav.discover_collections', 'both', 'Koleksiyon Keşfet', 'Discover Collections', 'Kollektionen Entdecken', 'اكتشف المجموعات', 'Открыть коллекции', 'text', 'navigation'),
('nav.search_brand', 'both', 'Marka Ara', 'Search Brand', 'Marke Suchen', 'البحث عن علامة تجارية', 'Поиск бренда', 'text', 'navigation'),
('cta.apply_style', 'both', 'Bu tarzı kendi odana uygula', 'Apply this style in your own space', 'Diesen Stil in deinem Raum anwenden', 'طبّق هذا الأسلوب في مساحتك', 'Применить этот стиль в своём пространстве', 'text', 'cta'),
('cta.design_with_perde_ai', 'both', 'Perde.AI ile Tasarla', 'Design with Perde.AI', 'Mit Perde.AI gestalten', 'صمم مع Perde.AI', 'Дизайн с Perde.AI', 'text', 'cta'),
('cta.visit_stand', 'both', 'Standı Ziyaret Et', 'Visit Stand', 'Stand Besuchen', 'زيارة الجناح', 'Посетить стенд', 'text', 'cta'),
('cta.view_collection', 'both', 'Koleksiyonu Gör', 'View Collection', 'Kollektion Ansehen', 'عرض المجموعة', 'Просмотреть коллекцию', 'text', 'cta'),
('label.trending_now', 'both', 'Şu An Trend', 'Trending Now', 'Jetzt im Trend', 'رائج الآن', 'В тренде сейчас', 'text', 'labels'),
('label.featured', 'both', 'Öne Çıkan', 'Featured', 'Empfohlen', 'مميز', 'Рекомендуемый', 'text', 'labels'),
('label.new_collection', 'both', 'Yeni Koleksiyon', 'New Collection', 'Neue Kollektion', 'مجموعة جديدة', 'Новая коллекция', 'text', 'labels'),
('label.ai_curated', 'both', 'AI Seçimi', 'AI Curated', 'KI-Kuratiert', 'اختيار الذكاء الاصطناعي', 'Подобрано ИИ', 'text', 'labels'),
('section.rising_china', 'hometex', 'Yükselen Çin', 'Rising China', 'Aufsteigendes China', 'الصين الصاعدة', 'Восходящий Китай', 'text', 'regions'),
('section.premium_europe', 'both', 'Premium Avrupa', 'Premium Europe', 'Premium Europa', 'أوروبا المتميزة', 'Премиум Европа', 'text', 'regions'),
('section.export_leaders_turkey', 'both', 'İhracat Liderleri Türkiye', 'Export Leaders Turkey', 'Exportführer Türkei', 'تركيا رائدة التصدير', 'Лидеры экспорта Турция', 'text', 'regions'),
('hero.tagline', 'hometex', 'Dünyanın İlk Yapay Zeka Destekli Sanal Ev Tekstil Fuarı', 'The World''s First AI-Powered Virtual Home Textile Fair', 'Die erste KI-gestützte virtuelle Heimtextilmesse der Welt', 'أول معرض نسيج منزلي افتراضي مدعوم بالذكاء الاصطناعي', 'Первая в мире виртуальная выставка домашнего текстиля на базе ИИ', 'text', 'hero'),
('hero.tagline', 'heimtex', 'Almanya için Yapay Zeka Destekli Sanal Ev Tekstil Fuarı', 'The AI-Powered Virtual Home Textile Fair for Germany', 'Die KI-gestützte virtuelle Heimtextilmesse für Deutschland', 'معرض النسيج المنزلي الافتراضي لألمانيا', 'Виртуальная выставка домашнего текстиля для Германии', 'text', 'hero');

-- ============================================================
-- SEED DATA — Fair Events
-- ============================================================
INSERT INTO fair_events (domain_key, event_name_en, event_name_tr, event_name_de, event_name_ar, event_name_ru, description_en, description_tr, description_de, event_type, start_date, end_date, registration_deadline, max_exhibitors, max_visitors, banner_image_url, status, is_featured) VALUES
('both', 'Hometex Virtual Fair 2026 — Spring Edition', 'Hometex Sanal Fuarı 2026 — İlkbahar Edisyonu', 'Hometex Virtuelle Messe 2026 — Frühjahrsausgabe', 'معرض Hometex الافتراضي 2026 — إصدار الربيع', 'Виртуальная ярмарка Hometex 2026 — Весеннее издание', 'The world''s first AI-powered virtual home textile fair. Discover 500+ brands from 40+ countries.', 'Dünyanın ilk yapay zeka destekli sanal ev tekstil fuarı. 40+ ülkeden 500+ markayı keşfedin.', 'Die erste KI-gestützte virtuelle Heimtextilmesse der Welt. Entdecken Sie 500+ Marken aus 40+ Ländern.', 'virtual_fair', '2026-03-01 09:00:00+00', '2026-03-07 18:00:00+00', '2026-02-15 23:59:00+00', 500, 50000, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600', 'upcoming', true),
('heimtex', 'Heimtex Virtual Fair 2026 — German Market Edition', 'Heimtex Sanal Fuarı 2026 — Almanya Edisyonu', 'Heimtex Virtuelle Messe 2026 — Deutsche Marktausgabe', 'معرض Heimtex الافتراضي 2026 — إصدار السوق الألماني', 'Виртуальная ярмарка Heimtex 2026 — Немецкий рынок', 'The premier virtual home textile fair for the German-speaking market. Curated brands for DACH region.', 'Almanca konuşan pazar için öncü sanal ev tekstil fuarı. DACH bölgesi için seçilmiş markalar.', 'Die führende virtuelle Heimtextilmesse für den deutschsprachigen Markt. Kuratierte Marken für die DACH-Region.', 'virtual_fair', '2026-04-15 09:00:00+00', '2026-04-19 18:00:00+00', '2026-04-01 23:59:00+00', 200, 20000, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600', 'upcoming', true);

-- ============================================================
-- SEED DATA — News Feed Cache (TRTex integration demo)
-- ============================================================
INSERT INTO news_feed_cache (source_platform, external_id, title_tr, title_en, title_de, summary_tr, summary_en, author_name, category, tags, thumbnail_url, source_url, published_at, is_featured, display_on_domains) VALUES
('trtex', 'trtex-001', '2026 Perde Trendleri: Kadife Geri Dönüyor', '2026 Curtain Trends: Velvet Makes a Comeback', '2026 Vorhangtrends: Samt feiert ein Comeback', 'Tekstil uzmanları 2026 yılında kadife perdelerin yeniden moda olacağını öngörüyor. Koyu tonlar ve metalik detaylar öne çıkıyor.', 'Textile experts predict velvet curtains will make a strong comeback in 2026, with dark tones and metallic details leading the trend.', 'TRTex Editörü', 'Trendler', '["perde", "kadife", "2026", "trend"]', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600', 'https://trtex.com/haberler/2026-perde-trendleri', NOW() - INTERVAL '2 days', true, '["hometex", "heimtex"]'),
('trtex', 'trtex-002', 'Türk Tekstil İhracatı Rekora Koşuyor', 'Turkish Textile Exports Breaking Records', 'Türkische Textilexporte brechen Rekorde', 'Türkiye ev tekstili ihracatı 2025 yılında %23 artışla 8.2 milyar dolara ulaştı. Avrupa pazarı en büyük alıcı konumunda.', 'Turkey''s home textile exports reached $8.2 billion in 2025 with a 23% increase. European market remains the largest buyer.', 'TRTex Haber', 'Sektör', '["ihracat", "türkiye", "tekstil", "avrupa"]', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', 'https://trtex.com/haberler/turk-tekstil-ihracati-rekora-kosuyor', NOW() - INTERVAL '5 days', true, '["hometex", "heimtex"]'),
('trtex', 'trtex-003', 'Sürdürülebilir Tekstil: GOTS Sertifikalı Ürünlere Talep Artıyor', 'Sustainable Textiles: Demand for GOTS Certified Products Rising', 'Nachhaltige Textilien: Nachfrage nach GOTS-zertifizierten Produkten steigt', 'Çevre bilincinin artmasıyla birlikte GOTS sertifikalı organik tekstil ürünlerine olan talep Avrupa''da %45 arttı.', 'With growing environmental awareness, demand for GOTS certified organic textile products increased by 45% in Europe.', 'TRTex Analiz', 'Sürdürülebilirlik', '["sürdürülebilir", "organik", "GOTS", "avrupa"]', 'https://images.unsplash.com/photo-1542601906897-ecd3f7d0e2e3?w=600', 'https://trtex.com/haberler/surdurulebilir-tekstil-gots', NOW() - INTERVAL '7 days', false, '["hometex", "heimtex"]'),
('trtex', 'trtex-004', 'Çin Tekstil Devleri Dijital Fuara Hazırlanıyor', 'Chinese Textile Giants Prepare for Digital Fair', 'Chinesische Textilriesen bereiten sich auf digitale Messe vor', 'Sunvim Group ve Fuanna başta olmak üzere Çin''in önde gelen tekstil firmaları Hometex.AI sanal fuarına katılım için hazırlıklarını tamamladı.', 'Leading Chinese textile companies including Sunvim Group and Fuanna have completed preparations to participate in the Hometex.AI virtual fair.', 'TRTex Dünya', 'Dünya', '["çin", "dijital", "fuar", "sunvim", "fuanna"]', 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=600', 'https://trtex.com/haberler/cin-tekstil-devleri-dijital-fuara', NOW() - INTERVAL '10 days', false, '["hometex"]'),
('trtex', 'trtex-005', 'Otel Tekstilinde Yeni Dönem: Lüks ve Fonksiyonellik', 'New Era in Hotel Textiles: Luxury Meets Functionality', 'Neue Ära in Hoteltextilien: Luxus trifft Funktionalität', 'Otelcilik sektöründe tekstil seçimleri değişiyor. Misafir deneyimini ön plana çıkaran lüks ve dayanıklı kumaşlar talep görüyor.', 'Textile choices in the hospitality sector are changing. Luxury and durable fabrics that prioritize guest experience are in demand.', 'TRTex Otelcilik', 'Otelcilik', '["otel", "lüks", "fonksiyonel", "misafir"]', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600', 'https://trtex.com/haberler/otel-tekstilinde-yeni-donem', NOW() - INTERVAL '14 days', false, '["hometex", "heimtex"]');

-- ============================================================
-- HOMETEX.AI — EKSİK KRİTİK TABLOLAR
-- Hero, Trend, Galeri, TRTEX Link, Arzu Döngüsü
-- ============================================================

-- 1. HOMEPAGE HERO SLIDES
-- Hero section'ı dinamik yönetmek için
-- AI Fair Agent bu tabloyu günceller
CREATE TABLE homepage_hero_slides (
    id                      BIGSERIAL PRIMARY KEY,
    domain_key              VARCHAR(50) DEFAULT 'hometex' NOT NULL,
    slide_order             INTEGER DEFAULT 0,
    title_tr                VARCHAR(300),
    title_en                VARCHAR(300),
    title_de                VARCHAR(300),
    title_ar                VARCHAR(300),
    title_ru                VARCHAR(300),
    subtitle_tr             TEXT,
    subtitle_en             TEXT,
    subtitle_de             TEXT,
    subtitle_ar             TEXT,
    subtitle_ru             TEXT,
    background_image_url    TEXT NOT NULL,
    background_video_url    TEXT,
    overlay_opacity         NUMERIC(3,2) DEFAULT 0.45,
    overlay_color           VARCHAR(7) DEFAULT '#0a0a0f',
    cta_primary_text_tr     VARCHAR(200),
    cta_primary_text_en     VARCHAR(200),
    cta_primary_url         TEXT,
    cta_secondary_text_tr   VARCHAR(200),
    cta_secondary_text_en   VARCHAR(200),
    cta_secondary_url       TEXT,
    -- Bağlı içerik (marka veya koleksiyon)
    linked_entity_type      VARCHAR(50),  -- 'brand', 'collection', 'showroom'
    linked_entity_id        BIGINT,
    -- AI tarafından üretildi mi?
    ai_generated            BOOLEAN DEFAULT FALSE,
    ai_prompt_used          TEXT,
    -- Görüntülenme & performans
    impression_count        BIGINT DEFAULT 0,
    click_count             BIGINT DEFAULT 0,
    -- Zamanlama
    is_active               BOOLEAN DEFAULT TRUE,
    starts_at               TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ends_at                 TIMESTAMP WITH TIME ZONE,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hero_slides_domain_key ON homepage_hero_slides(domain_key);
CREATE INDEX idx_hero_slides_active ON homepage_hero_slides(is_active, slide_order);
CREATE INDEX idx_hero_slides_dates ON homepage_hero_slides(starts_at, ends_at);

-- Demo veriler (RLS yok, public içerik)
INSERT INTO homepage_hero_slides (domain_key, slide_order, title_tr, title_en, title_de, title_ar, title_ru, subtitle_tr, subtitle_en, background_image_url, overlay_opacity, cta_primary_text_tr, cta_primary_text_en, cta_primary_url, cta_secondary_text_tr, cta_secondary_text_en, cta_secondary_url, ai_generated, is_active) VALUES
('hometex', 1, 'Global Tekstil Fuarı — AI Destekli', 'Global Textile Fair — AI Powered', 'Globale Textilmesse — KI-gestützt', 'معرض النسيج العالمي — مدعوم بالذكاء الاصطناعي', 'Глобальная текстильная ярмарка — на базе ИИ', 'Dünyanın dört bir yanından premium koleksiyonları keşfedin', 'Discover premium collections from around the world', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1920&q=90', 0.50, 'Fuarı Gez', 'Explore Fair', '/explore', 'Stil Keşfet', 'Discover Styles', '/collections', TRUE, TRUE),
('hometex', 2, 'Velvet Noir Koleksiyonu', 'Velvet Noir Collection', 'Velvet Noir Kollektion', 'مجموعة فيلفيت نوار', 'Коллекция Velvet Noir', '2026 sezonunun en çarpıcı karanlık lüks trendi', 'The most striking dark luxury trend of the 2026 season', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&q=90', 0.40, 'Koleksiyonu Gör', 'View Collection', '/collections/velvet-noir', 'Odanda Dene', 'Try in Room', 'https://perde.ai?style=velvet-noir', FALSE, TRUE),
('hometex', 3, 'Premium Türkiye Standı', 'Premium Turkey Pavilion', 'Premium Türkei Pavillon', 'جناح تركيا المميز', 'Премиум павильон Турции', 'Türk tekstilinin gücünü dünyaya taşıyoruz', 'Bringing the power of Turkish textiles to the world', 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=1920&q=90', 0.45, 'Türk Markalarını Keşfet', 'Explore Turkish Brands', '/explore?region=turkey', 'Tüm Bölgeler', 'All Regions', '/explore', FALSE, TRUE),
('hometex', 4, 'Yükselen Çin Koleksiyonları', 'Rising China Collections', 'Aufsteigende China-Kollektionen', 'مجموعات الصين الصاعدة', 'Восходящие коллекции Китая', 'Asyanın en yenilikçi tekstil markalarıyla tanışın', 'Meet Asia''s most innovative textile brands', 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1920&q=90', 0.50, 'Çin Standını Gez', 'Explore China Pavilion', '/explore?region=china', 'Koleksiyonlar', 'Collections', '/collections', FALSE, TRUE),
('heimtex', 1, 'Globale Heimtextilmesse — KI-gestützt', 'Global Home Textile Fair — AI Powered', 'Globale Heimtextilmesse — KI-gestützt', NULL, NULL, 'Entdecken Sie Premium-Kollektionen aus aller Welt', 'Discover premium collections from around the world', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&q=90', 0.50, 'Messe erkunden', 'Explore Fair', '/explore', 'Stile entdecken', 'Discover Styles', '/collections', FALSE, TRUE);


-- ============================================================
-- 2. TREND CARDS
-- "Bu Hafta Öne Çıkanlar" — 4 kart bloğu
-- Trend Agent bu tabloyu haftalık günceller
-- ============================================================
CREATE TABLE trend_cards (
    id                      BIGSERIAL PRIMARY KEY,
    domain_key              VARCHAR(50) DEFAULT 'hometex' NOT NULL,
    card_order              INTEGER DEFAULT 0,
    -- İçerik
    trend_name_tr           VARCHAR(200) NOT NULL,
    trend_name_en           VARCHAR(200) NOT NULL,
    trend_name_de           VARCHAR(200),
    trend_name_ar           VARCHAR(200),
    trend_name_ru           VARCHAR(200),
    trend_description_tr    TEXT,
    trend_description_en    TEXT,
    trend_description_de    TEXT,
    -- Görsel
    cover_image_url         TEXT NOT NULL,
    accent_color            VARCHAR(7) DEFAULT '#D4AF37',
    -- Stil & kategori
    style_category          VARCHAR(100),  -- 'minimal', 'luxury', 'natural', 'dark'
    style_tags              JSONB DEFAULT '[]',
    color_palette           JSONB DEFAULT '[]',
    -- perde.ai entegrasyonu (KRİTİK)
    perde_ai_style_prompt   TEXT,
    perde_ai_deep_link      TEXT,
    -- Bağlı koleksiyon
    linked_collection_id    BIGINT,
    linked_showroom_id      BIGINT,
    -- Trend skoru (Trend Agent tarafından güncellenir)
    trend_score             NUMERIC(5,2) DEFAULT 0 CHECK (trend_score >= 0 AND trend_score <= 100),
    trend_direction         VARCHAR(20) DEFAULT 'rising' CHECK (trend_direction IN ('rising','stable','declining','breakout','viral')),
    -- Performans
    impression_count        BIGINT DEFAULT 0,
    click_count             BIGINT DEFAULT 0,
    perde_ai_redirect_count BIGINT DEFAULT 0,
    -- AI üretimi
    ai_generated            BOOLEAN DEFAULT FALSE,
    ai_commentary_tr        TEXT,
    ai_commentary_en        TEXT,
    -- Zamanlama
    is_active               BOOLEAN DEFAULT TRUE,
    is_featured             BOOLEAN DEFAULT FALSE,
    week_number             INTEGER,  -- ISO hafta numarası
    year                    INTEGER,
    valid_from              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    valid_until             TIMESTAMP WITH TIME ZONE,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trend_cards_domain_key ON trend_cards(domain_key);
CREATE INDEX idx_trend_cards_active ON trend_cards(is_active, card_order);
CREATE INDEX idx_trend_cards_trend_score ON trend_cards(trend_score DESC);
CREATE INDEX idx_trend_cards_week ON trend_cards(week_number, year);
CREATE INDEX idx_trend_cards_style_category ON trend_cards(style_category);

-- Demo trend kartları
INSERT INTO trend_cards (domain_key, card_order, trend_name_tr, trend_name_en, trend_name_de, trend_name_ar, trend_name_ru, trend_description_tr, trend_description_en, cover_image_url, accent_color, style_category, style_tags, color_palette, perde_ai_style_prompt, perde_ai_deep_link, trend_score, trend_direction, ai_generated, ai_commentary_tr, ai_commentary_en, is_active, is_featured, week_number, year) VALUES
('hometex', 1, 'Soft Minimal', 'Soft Minimal', 'Soft Minimal', 'الحد الأدنى الناعم', 'Мягкий минимализм', 'Sadeliğin zarafeti — 2026''nın en güçlü trendi', 'The elegance of simplicity — the strongest trend of 2026', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=85', '#E8E0D5', 'minimal', '["minimal","soft","neutral","linen","beige"]', '["#F5F0EB","#E8E0D5","#D4C5B0","#B8A99A"]', 'Soft minimal interior with neutral linen curtains, warm beige tones, clean lines, Scandinavian influence', 'https://perde.ai?style=soft-minimal&colors=neutral&mood=calm', 94.5, 'rising', TRUE, 'Nötr tonlar ve doğal dokular bu sezonda zirveye çıkıyor. Keten ve pamuk karışımı perdeler bu trendi mükemmel yansıtıyor.', 'Neutral tones and natural textures are reaching their peak this season. Linen-cotton blend curtains perfectly reflect this trend.', TRUE, TRUE, 1, 2026),
('hometex', 2, 'Hotel Luxury', 'Hotel Luxury', 'Hotel Luxus', 'فخامة الفندق', 'Отельная роскошь', 'Beş yıldızlı otel estetiğini evinize taşıyın', 'Bring five-star hotel aesthetics to your home', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=85', '#C9A84C', 'luxury', '["luxury","hotel","velvet","gold","premium"]', '["#1A1A2E","#C9A84C","#8B7355","#F0E6D3"]', 'Luxury hotel style with deep velvet drapes, gold accents, dramatic lighting, five-star ambiance', 'https://perde.ai?style=hotel-luxury&colors=gold,deep&mood=opulent', 91.2, 'rising', TRUE, 'Kadife perdeler ve altın aksesuarlar bu sezonda ev dekorasyonunda otel estetiğini yaşatıyor.', 'Velvet curtains and gold accessories bring hotel aesthetics to home decoration this season.', TRUE, TRUE, 1, 2026),
('hometex', 3, 'Natural Linen', 'Natural Linen', 'Natürliches Leinen', 'الكتان الطبيعي', 'Натуральный лён', 'Doğanın dokusu — sürdürülebilir güzellik', 'The texture of nature — sustainable beauty', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=85', '#8B7355', 'natural', '["natural","linen","organic","sustainable","earthy"]', '["#C4A882","#8B7355","#6B5B45","#F2EDE4"]', 'Natural linen curtains with organic textures, earthy tones, sustainable materials, biophilic design', 'https://perde.ai?style=natural-linen&colors=earthy&mood=organic', 88.7, 'breakout', TRUE, 'Sürdürülebilir tekstil hareketi keten perdeleri 2026''nın vazgeçilmezi yapıyor. Organik sertifikalı ürünlere talep patladı.', 'The sustainable textile movement makes linen curtains indispensable in 2026. Demand for organic certified products has exploded.', TRUE, FALSE, 1, 2026),
('hometex', 4, 'Dark Velvet', 'Dark Velvet', 'Dunkler Samt', 'المخمل الداكن', 'Тёмный бархат', 'Karanlığın lüksü — dramatik ve çarpıcı', 'The luxury of darkness — dramatic and striking', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=85', '#2D1B69', 'dark', '["dark","velvet","dramatic","moody","deep"]', '["#1A0A2E","#2D1B69","#4A2C8A","#8B5CF6"]', 'Dark velvet curtains with deep purple and midnight blue tones, dramatic moody atmosphere, luxury feel', 'https://perde.ai?style=dark-velvet&colors=deep-purple,midnight&mood=dramatic', 85.3, 'viral', TRUE, 'Koyu kadife perdeler sosyal medyada viral oldu. Dramatik iç mekan tasarımı 2026''da zirveye çıkıyor.', 'Dark velvet curtains went viral on social media. Dramatic interior design is reaching its peak in 2026.', TRUE, FALSE, 1, 2026),
-- Heimtex için Almanca trend kartları
('heimtex', 1, 'Sanftes Minimal', 'Soft Minimal', 'Sanftes Minimal', NULL, NULL, 'Die Eleganz der Schlichtheit — der stärkste Trend 2026', 'The elegance of simplicity — the strongest trend of 2026', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=85', '#E8E0D5', 'minimal', '["minimal","soft","neutral","leinen","beige"]', '["#F5F0EB","#E8E0D5","#D4C5B0","#B8A99A"]', 'Soft minimal interior with neutral linen curtains, warm beige tones', 'https://perde.ai?style=soft-minimal&colors=neutral&mood=calm', 94.5, 'rising', TRUE, 'Neutrale Töne und natürliche Texturen erreichen in dieser Saison ihren Höhepunkt.', 'Neutral tones and natural textures are reaching their peak this season.', TRUE, TRUE, 1, 2026);


-- ============================================================
-- 3. SHOWROOM GALLERY ITEMS
-- Her showroom için ürün/koleksiyon galeri yönetimi
-- Showroom sayfasındaki görsel grid
-- ============================================================
CREATE TABLE showroom_gallery_items (
    id                      BIGSERIAL PRIMARY KEY,
    showroom_id             BIGINT NOT NULL,
    brand_profile_id        BIGINT,
    -- İçerik tipi
    item_type               VARCHAR(50) DEFAULT 'product' CHECK (item_type IN ('product','collection','lookbook','video','banner','atmosphere')),
    -- Bağlı içerik
    product_id              BIGINT,
    collection_id           BIGINT,
    -- Görsel
    image_url               TEXT NOT NULL,
    thumbnail_url           TEXT,
    video_url               TEXT,
    -- Çok dilli başlık
    title_tr                VARCHAR(300),
    title_en                VARCHAR(300),
    title_de                VARCHAR(300),
    title_ar                VARCHAR(300),
    title_ru                VARCHAR(300),
    -- Açıklama
    description_tr          TEXT,
    description_en          TEXT,
    -- perde.ai bağlantısı (her galeri öğesinde olacak)
    perde_ai_style_prompt   TEXT,
    perde_ai_deep_link      TEXT,
    -- Grid düzeni (asimetrik dergi layout için)
    grid_size               VARCHAR(20) DEFAULT 'medium' CHECK (grid_size IN ('small','medium','large','hero','wide')),
    display_order           INTEGER DEFAULT 0,
    -- Performans
    view_count              BIGINT DEFAULT 0,
    click_count             BIGINT DEFAULT 0,
    perde_ai_redirect_count BIGINT DEFAULT 0,
    -- Durum
    is_active               BOOLEAN DEFAULT TRUE,
    is_featured             BOOLEAN DEFAULT FALSE,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_showroom_gallery_showroom_id ON showroom_gallery_items(showroom_id);
CREATE INDEX idx_showroom_gallery_brand_profile_id ON showroom_gallery_items(brand_profile_id);
CREATE INDEX idx_showroom_gallery_item_type ON showroom_gallery_items(item_type);
CREATE INDEX idx_showroom_gallery_active ON showroom_gallery_items(is_active, display_order);
CREATE INDEX idx_showroom_gallery_product_id ON showroom_gallery_items(product_id);
CREATE INDEX idx_showroom_gallery_collection_id ON showroom_gallery_items(collection_id);

-- Demo galeri öğeleri (showroom_id'ler gerçek verilerle eşleştirilecek)
INSERT INTO showroom_gallery_items (showroom_id, item_type, image_url, title_tr, title_en, description_tr, description_en, perde_ai_style_prompt, perde_ai_deep_link, grid_size, display_order, is_active, is_featured) VALUES
(1, 'atmosphere', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=85', 'Velvet Noir Koleksiyonu', 'Velvet Noir Collection', 'Karanlığın zarafeti ile tasarlanmış premium kadife perdeler', 'Premium velvet curtains designed with the elegance of darkness', 'Dark velvet curtains, deep navy and charcoal tones, luxury hotel atmosphere', 'https://perde.ai?style=velvet-noir', 'hero', 1, TRUE, TRUE),
(1, 'product', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=85', 'Kadife Fon Perde', 'Velvet Blackout Curtain', 'Tam karartma özellikli premium kadife perde', 'Premium velvet curtain with full blackout feature', 'Velvet blackout curtain in deep charcoal, floor to ceiling, dramatic effect', 'https://perde.ai?style=velvet-blackout', 'medium', 2, TRUE, FALSE),
(1, 'product', 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=85', 'Keten Tül Perde', 'Linen Sheer Curtain', 'Doğal keten dokusundan hafif tül perde', 'Light sheer curtain from natural linen texture', 'Natural linen sheer curtain, soft diffused light, organic texture', 'https://perde.ai?style=linen-sheer', 'medium', 3, TRUE, FALSE),
(1, 'lookbook', 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&q=85', '2026 Lookbook', '2026 Lookbook', 'Yeni sezon koleksiyon kataloğu', 'New season collection catalog', 'Complete room styling with layered curtains, 2026 collection', 'https://perde.ai?style=lookbook-2026', 'large', 4, TRUE, TRUE),
(1, 'atmosphere', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=85', 'Soft Minimal Yaşam', 'Soft Minimal Living', 'Nötr tonlarda minimal yaşam alanı tasarımı', 'Minimal living space design in neutral tones', 'Soft minimal living room with neutral linen curtains, Scandinavian style', 'https://perde.ai?style=soft-minimal-living', 'wide', 5, TRUE, FALSE),
(1, 'product', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=85', 'Hotel Luxury Koleksiyon', 'Hotel Luxury Collection', 'Beş yıldızlı otel estetiği için tasarlanmış perde koleksiyonu', 'Curtain collection designed for five-star hotel aesthetics', 'Hotel luxury curtains with gold trim, deep burgundy velvet, opulent atmosphere', 'https://perde.ai?style=hotel-luxury', 'large', 6, TRUE, TRUE);


-- ============================================================
-- 4. BRAND TRTEX LINKS
-- "Bu markayı TRTEX'te incele" — Altın CTA bağlantısı
-- TRTEX haber portalı ile entegrasyon
-- ============================================================
CREATE TABLE brand_trtex_links (
    id                      BIGSERIAL PRIMARY KEY,
    brand_profile_id        BIGINT NOT NULL,
    showroom_id             BIGINT,
    -- TRTEX bağlantısı
    trtex_brand_slug        VARCHAR(300),
    trtex_article_id        BIGINT,
    trtex_category_slug     VARCHAR(200),
    trtex_url               TEXT NOT NULL,
    -- Bağlantı tipi
    link_type               VARCHAR(50) DEFAULT 'brand_page' CHECK (link_type IN ('brand_page','news_article','category','special_report','interview','product_review')),
    -- Çok dilli CTA metni
    cta_text_tr             VARCHAR(200) DEFAULT 'Bu markayı TRTEX''te incele',
    cta_text_en             VARCHAR(200) DEFAULT 'Explore this brand on TRTEX',
    cta_text_de             VARCHAR(200) DEFAULT 'Diese Marke auf TRTEX erkunden',
    cta_text_ar             VARCHAR(200),
    cta_text_ru             VARCHAR(200),
    -- Önizleme
    preview_title_tr        VARCHAR(300),
    preview_title_en        VARCHAR(300),
    preview_image_url       TEXT,
    preview_excerpt_tr      TEXT,
    preview_excerpt_en      TEXT,
    -- UTM parametreleri
    utm_source              VARCHAR(100) DEFAULT 'hometex',
    utm_medium              VARCHAR(100) DEFAULT 'brand_cta',
    utm_campaign            VARCHAR(200),
    -- Performans
    click_count             BIGINT DEFAULT 0,
    last_clicked_at         TIMESTAMP WITH TIME ZONE,
    -- Durum
    is_active               BOOLEAN DEFAULT TRUE,
    is_featured             BOOLEAN DEFAULT FALSE,
    display_order           INTEGER DEFAULT 0,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_brand_trtex_links_brand_profile_id ON brand_trtex_links(brand_profile_id);
CREATE INDEX idx_brand_trtex_links_showroom_id ON brand_trtex_links(showroom_id);
CREATE INDEX idx_brand_trtex_links_link_type ON brand_trtex_links(link_type);
CREATE INDEX idx_brand_trtex_links_active ON brand_trtex_links(is_active);
CREATE INDEX idx_brand_trtex_links_click_count ON brand_trtex_links(click_count DESC);

-- Demo TRTEX linkleri
INSERT INTO brand_trtex_links (brand_profile_id, showroom_id, trtex_brand_slug, trtex_url, link_type, cta_text_tr, cta_text_en, preview_title_tr, preview_title_en, preview_image_url, preview_excerpt_tr, preview_excerpt_en, utm_campaign, is_active, is_featured) VALUES
(1, 1, 'tac-tekstil', 'https://trtex.com/marka/tac-tekstil', 'brand_page', 'Taç''ı TRTEX''te İncele', 'Explore Taç on TRTEX', 'Taç Tekstil: Türk Ev Tekstilinin Öncüsü', 'Taç Tekstil: Pioneer of Turkish Home Textiles', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80', 'Taç Tekstil, 50 yılı aşkın deneyimiyle Türk ev tekstilinin en köklü markalarından biri olmaya devam ediyor.', 'Taç Tekstil continues to be one of the most established brands in Turkish home textiles with over 50 years of experience.', 'tac-brand-2026', TRUE, TRUE),
(2, 2, 'menderes-tekstil', 'https://trtex.com/marka/menderes-tekstil', 'brand_page', 'Menderes''i TRTEX''te İncele', 'Explore Menderes on TRTEX', 'Menderes Tekstil: İhracatın Lokomotifi', 'Menderes Tekstil: The Locomotive of Exports', 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=400&q=80', 'Menderes Tekstil, yıllık 200 milyon dolar ihracatıyla Türkiye''nin en büyük tekstil ihracatçılarından biri.', 'Menderes Tekstil is one of Turkey''s largest textile exporters with annual exports of $200 million.', 'menderes-brand-2026', TRUE, TRUE),
(3, 3, 'luolai-lifestyle', 'https://trtex.com/marka/luolai-lifestyle', 'special_report', 'Luolai''yi TRTEX''te İncele', 'Explore Luolai on TRTEX', 'Luolai: Çin''in Yükselen Ev Tekstili Devi', 'Luolai: China''s Rising Home Textile Giant', 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&q=80', 'Luolai Lifestyle Technology, Çin''in en büyük ev tekstili markası olarak global pazarda hızla yükseliyor.', 'Luolai Lifestyle Technology is rapidly rising in the global market as China''s largest home textile brand.', 'luolai-china-2026', TRUE, FALSE),
(4, 4, 'nitori', 'https://trtex.com/marka/nitori', 'brand_page', 'Nitori''yi TRTEX''te İncele', 'Explore Nitori on TRTEX', 'Nitori: Japonya''nın Ev Dekorasyon Devi', 'Nitori: Japan''s Home Decoration Giant', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&q=80', 'Nitori, Japonya''nın en büyük ev dekorasyon perakendecisi olarak Asya pazarına hakim.', 'Nitori dominates the Asian market as Japan''s largest home decoration retailer.', 'nitori-japan-2026', TRUE, FALSE);


-- ============================================================
-- 5. DESIRE JOURNEY EVENTS
-- 🔑 KRİTİK: Arzu → Aksiyon döngüsü takibi
-- Conversion Agent'ın gözü kulağı
-- TRTEX → HOMETEX → perde.ai → geri dönüş
-- ============================================================
CREATE TABLE desire_journey_events (
    id                      BIGSERIAL PRIMARY KEY,
    -- Ziyaretçi kimliği (anonim veya kayıtlı)
    visitor_id              VARCHAR(200) NOT NULL,
    user_id                 BIGINT,
    session_id              VARCHAR(200),
    -- Domain
    domain_key              VARCHAR(50) DEFAULT 'hometex',
    -- Yolculuk adımı
    journey_step            VARCHAR(100) NOT NULL CHECK (journey_step IN (
        'hero_view',           -- Hero gördü
        'hero_cta_click',      -- Hero CTA tıkladı
        'trend_card_view',     -- Trend kartı gördü
        'trend_card_click',    -- Trend kartına tıkladı
        'collection_view',     -- Koleksiyon sayfasına girdi
        'collection_save',     -- Koleksiyonu kaydetti
        'brand_view',          -- Marka sayfasına girdi
        'showroom_view',       -- Showroom'a girdi
        'gallery_item_click',  -- Galeri öğesine tıkladı
        'perde_ai_intent',     -- perde.ai butonunu gördü
        'perde_ai_click',      -- perde.ai'ye tıkladı
        'perde_ai_return',     -- perde.ai'den geri döndü
        'trtex_click',         -- TRTEX'e tıkladı
        'inquiry_started',     -- Sorgu başlattı
        'inquiry_sent',        -- Sorgu gönderdi
        'favorite_added',      -- Favorilere ekledi
        'search_performed',    -- Arama yaptı
        'filter_applied',      -- Filtre uyguladı
        'region_selected'      -- Bölge seçti
    )),
    -- Bağlı içerik
    entity_type             VARCHAR(100),  -- 'collection', 'brand', 'product', 'trend_card', 'hero_slide'
    entity_id               BIGINT,
    entity_slug             VARCHAR(300),
    -- Kaynak
    referrer_platform       VARCHAR(100),  -- 'trtex', 'google', 'direct', 'perde_ai', 'social'
    referrer_url            TEXT,
    -- perde.ai özel alanlar
    perde_ai_style_sent     TEXT,          -- Hangi stil gönderildi
    perde_ai_return_action  VARCHAR(100),  -- 'design_started', 'design_saved', 'bounced'
    -- Cihaz & konum
    device_type             VARCHAR(50),
    country_code            VARCHAR(10),
    language_used           VARCHAR(10),
    -- Süre
    dwell_seconds           INTEGER DEFAULT 0,
    -- Ek veri
    event_data              JSONB,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_desire_journey_visitor_id ON desire_journey_events(visitor_id);
CREATE INDEX idx_desire_journey_user_id ON desire_journey_events(user_id);
CREATE INDEX idx_desire_journey_session_id ON desire_journey_events(session_id);
CREATE INDEX idx_desire_journey_step ON desire_journey_events(journey_step);
CREATE INDEX idx_desire_journey_entity ON desire_journey_events(entity_type, entity_id);
CREATE INDEX idx_desire_journey_domain ON desire_journey_events(domain_key);
CREATE INDEX idx_desire_journey_created_at ON desire_journey_events(created_at DESC);
CREATE INDEX idx_desire_journey_perde_ai ON desire_journey_events(journey_step) WHERE journey_step LIKE 'perde_ai%';
CREATE INDEX idx_desire_journey_referrer ON desire_journey_events(referrer_platform);


-- ============================================================
-- 6. COLLECTION SAVES
-- Kullanıcı koleksiyon kaydetme
-- Match Agent & Self-improvement loop için
-- ============================================================
CREATE TABLE collection_saves (
    id                      BIGSERIAL PRIMARY KEY,
    -- Kaydeden kişi
    visitor_id              VARCHAR(200),  -- Anonim ziyaretçi
    user_id                 BIGINT,        -- Kayıtlı kullanıcı
    -- Kaydedilen içerik
    entity_type             VARCHAR(50) DEFAULT 'collection' CHECK (entity_type IN ('collection','brand','trend_card','product','showroom')),
    entity_id               BIGINT NOT NULL,
    -- Domain
    domain_key              VARCHAR(50) DEFAULT 'hometex',
    -- Kaydetme bağlamı
    save_context            VARCHAR(100),  -- 'collection_page', 'homepage', 'search', 'recommendation'
    -- perde.ai bağlantısı
    perde_ai_style_prompt   TEXT,
    perde_ai_deep_link      TEXT,
    -- Notlar
    user_note               TEXT,
    -- Durum
    is_active               BOOLEAN DEFAULT TRUE,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(visitor_id, entity_type, entity_id),
    UNIQUE(user_id, entity_type, entity_id)
);

CREATE INDEX idx_collection_saves_visitor_id ON collection_saves(visitor_id);
CREATE INDEX idx_collection_saves_user_id ON collection_saves(user_id);
CREATE INDEX idx_collection_saves_entity ON collection_saves(entity_type, entity_id);
CREATE INDEX idx_collection_saves_domain ON collection_saves(domain_key);
CREATE INDEX idx_collection_saves_created_at ON collection_saves(created_at DESC);


-- ============================================================
-- 7. AI AGENT PERFORMANCE LOG
-- Her agent'ın ne yaptığını, ne kadar sürdüğünü takip et
-- Master Agent bu tabloyu izler
-- ============================================================
CREATE TABLE ai_agent_performance_log (
    id                      BIGSERIAL PRIMARY KEY,
    agent_type              VARCHAR(100) NOT NULL CHECK (agent_type IN ('master','fair','trend','match','conversion','content','analytics')),
    run_id                  VARCHAR(200) NOT NULL,  -- UUID
    domain_key              VARCHAR(50) DEFAULT 'both',
    -- Ne yaptı
    action_type             VARCHAR(200) NOT NULL,
    action_summary          TEXT,
    -- Sonuçlar
    items_processed         INTEGER DEFAULT 0,
    items_created           INTEGER DEFAULT 0,
    items_updated           INTEGER DEFAULT 0,
    items_removed           INTEGER DEFAULT 0,
    -- Performans metrikleri
    execution_ms            INTEGER,
    tokens_used             INTEGER,
    api_calls_made          INTEGER DEFAULT 0,
    -- Etki ölçümü
    avg_score_before        NUMERIC(8,4),
    avg_score_after         NUMERIC(8,4),
    score_improvement       NUMERIC(8,4),
    -- Hata
    had_errors              BOOLEAN DEFAULT FALSE,
    error_count             INTEGER DEFAULT 0,
    error_details           JSONB,
    -- Tetikleyici
    triggered_by            VARCHAR(100) DEFAULT 'scheduler',  -- 'scheduler', 'manual', 'event', 'master_agent'
    parent_run_id           VARCHAR(200),
    -- Zaman
    started_at              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at            TIMESTAMP WITH TIME ZONE,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agent_perf_agent_type ON ai_agent_performance_log(agent_type);
CREATE INDEX idx_agent_perf_run_id ON ai_agent_performance_log(run_id);
CREATE INDEX idx_agent_perf_domain ON ai_agent_performance_log(domain_key);
CREATE INDEX idx_agent_perf_started_at ON ai_agent_performance_log(started_at DESC);
CREATE INDEX idx_agent_perf_action_type ON ai_agent_performance_log(action_type);

-- Demo agent log kayıtları
INSERT INTO ai_agent_performance_log (agent_type, run_id, domain_key, action_type, action_summary, items_processed, items_created, items_updated, items_removed, execution_ms, triggered_by, started_at, completed_at) VALUES
('trend', 'run-trend-001', 'hometex', 'weekly_trend_refresh', 'Haftalık trend kartları güncellendi, 4 yeni trend belirlendi', 48, 4, 12, 2, 3420, 'scheduler', CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '2 hours' + INTERVAL '3420 milliseconds'),
('fair', 'run-fair-001', 'hometex', 'brand_showroom_update', 'Marka showroom içerikleri güncellendi', 12, 2, 8, 1, 8750, 'scheduler', CURRENT_TIMESTAMP - INTERVAL '6 hours', CURRENT_TIMESTAMP - INTERVAL '6 hours' + INTERVAL '8750 milliseconds'),
('match', 'run-match-001', 'both', 'recommendation_refresh', 'Öneri skorları yeniden hesaplandı', 156, 0, 156, 0, 12300, 'scheduler', CURRENT_TIMESTAMP - INTERVAL '12 hours', CURRENT_TIMESTAMP - INTERVAL '12 hours' + INTERVAL '12300 milliseconds'),
('conversion', 'run-conv-001', 'hometex', 'perde_ai_link_optimization', 'perde.ai deep link CTR optimizasyonu yapıldı', 24, 0, 24, 0, 2100, 'master_agent', CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP - INTERVAL '1 hour' + INTERVAL '2100 milliseconds'),
('analytics', 'run-analytics-001', 'both', 'daily_feed_ranking', 'Günlük içerik sıralama puanları güncellendi', 89, 0, 89, 0, 5600, 'scheduler', CURRENT_TIMESTAMP - INTERVAL '30 minutes', CURRENT_TIMESTAMP - INTERVAL '30 minutes' + INTERVAL '5600 milliseconds');


-- ============================================================
-- 8. GLOBAL REGION HIGHLIGHTS
-- "Rising China" / "Premium Turkey" özel highlight blokları
-- Ana sayfada global filtre barının altında gösterilir
-- ============================================================
CREATE TABLE region_highlight_blocks (
    id                      BIGSERIAL PRIMARY KEY,
    domain_key              VARCHAR(50) DEFAULT 'hometex',
    region_key              VARCHAR(50) NOT NULL,  -- 'turkey', 'china', 'europe', 'far_east'
    -- Highlight etiketi
    highlight_label_tr      VARCHAR(200),  -- "Premium Türkiye"
    highlight_label_en      VARCHAR(200),  -- "Premium Turkey"
    highlight_label_de      VARCHAR(200),
    highlight_label_ar      VARCHAR(200),
    highlight_label_ru      VARCHAR(200),
    -- Açıklama
    description_tr          TEXT,
    description_en          TEXT,
    description_de          TEXT,
    -- Görsel
    hero_image_url          TEXT NOT NULL,
    accent_color            VARCHAR(7) DEFAULT '#D4AF37',
    badge_color             VARCHAR(7) DEFAULT '#D4AF37',
    -- İstatistikler (AI tarafından güncellenir)
    brand_count             INTEGER DEFAULT 0,
    collection_count        INTEGER DEFAULT 0,
    trending_style_tr       VARCHAR(200),
    trending_style_en       VARCHAR(200),
    -- CTA
    cta_text_tr             VARCHAR(200),
    cta_text_en             VARCHAR(200),
    cta_url                 TEXT,
    -- Sıralama & durum
    display_order           INTEGER DEFAULT 0,
    is_active               BOOLEAN DEFAULT TRUE,
    is_highlighted          BOOLEAN DEFAULT TRUE,
    -- Performans
    click_count             BIGINT DEFAULT 0,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_region_highlights_domain ON region_highlight_blocks(domain_key);
CREATE INDEX idx_region_highlights_region ON region_highlight_blocks(region_key);
CREATE INDEX idx_region_highlights_active ON region_highlight_blocks(is_active, display_order);

-- Demo bölge highlight verileri
INSERT INTO region_highlight_blocks (domain_key, region_key, highlight_label_tr, highlight_label_en, highlight_label_de, highlight_label_ar, highlight_label_ru, description_tr, description_en, hero_image_url, accent_color, badge_color, brand_count, collection_count, trending_style_tr, trending_style_en, cta_text_tr, cta_text_en, cta_url, display_order, is_active, is_highlighted) VALUES
('hometex', 'turkey', 'Premium Türkiye', 'Premium Turkey', 'Premium Türkei', 'تركيا المميزة', 'Премиум Турция', 'Türk tekstilinin kalitesi ve ihracat gücü — 50 yıllık üretim deneyimi', 'The quality and export power of Turkish textiles — 50 years of manufacturing experience', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=85', '#C41E3A', '#C41E3A', 47, 183, 'Soft Minimal & Natural Linen', 'Soft Minimal & Natural Linen', 'Türk Markalarını Keşfet', 'Explore Turkish Brands', '/explore?region=turkey', 1, TRUE, TRUE),
('hometex', 'china', 'Yükselen Çin', 'Rising China', 'Aufsteigendes China', 'الصين الصاعدة', 'Восходящий Китай', 'Asyanın tekstil devi — yenilikçi teknoloji ve rekabetçi fiyatlar', 'Asia''s textile giant — innovative technology and competitive prices', 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&q=85', '#DE2910', '#DE2910', 38, 142, 'Hotel Luxury & Dark Velvet', 'Hotel Luxury & Dark Velvet', 'Çin Markalarını Keşfet', 'Explore Chinese Brands', '/explore?region=china', 2, TRUE, TRUE),
('hometex', 'europe', 'Avrupa Kalitesi', 'European Quality', 'Europäische Qualität', 'الجودة الأوروبية', 'Европейское качество', 'Avrupa tasarım estetiği ve sürdürülebilir üretim anlayışı', 'European design aesthetics and sustainable production approach', 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=1200&q=85', '#003399', '#003399', 29, 97, 'Natural Linen & Sustainable', 'Natural Linen & Sustainable', 'Avrupa Markalarını Keşfet', 'Explore European Brands', '/explore?region=europe', 3, TRUE, FALSE),
('hometex', 'far_east', 'Uzak Doğu Estetiği', 'Far East Aesthetics', 'Fernostästhetik', 'جماليات الشرق الأقصى', 'Эстетика Дальнего Востока', 'Japon minimalizmi ve Kore tasarım anlayışının buluşma noktası', 'The meeting point of Japanese minimalism and Korean design philosophy', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=85', '#BC002D', '#BC002D', 21, 78, 'Soft Minimal & Zen', 'Soft Minimal & Zen', 'Uzak Doğu Markalarını Keşfet', 'Explore Far East Brands', '/explore?region=far_east', 4, TRUE, FALSE),
-- Heimtex için
('heimtex', 'turkey', 'Premium Türkei', 'Premium Turkey', 'Premium Türkei', NULL, NULL, 'Die Qualität und Exportstärke türkischer Textilien', 'The quality and export power of Turkish textiles', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=85', '#C41E3A', '#C41E3A', 47, 183, 'Soft Minimal & Natural Linen', 'Soft Minimal & Natural Linen', 'Türkische Marken erkunden', 'Explore Turkish Brands', '/explore?region=turkey', 1, TRUE, TRUE),
('heimtex', 'europe', 'Europäische Qualität', 'European Quality', 'Europäische Qualität', NULL, NULL, 'Europäische Designästhetik und nachhaltiger Produktionsansatz', 'European design aesthetics and sustainable production approach', 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=1200&q=85', '#003399', '#003399', 29, 97, 'Natural Linen & Sustainable', 'Natural Linen & Sustainable', 'Europäische Marken erkunden', 'Explore European Brands', '/explore?region=europe', 2, TRUE, TRUE);


-- ============================================================
-- GRANT PERMISSIONS — Tüm yeni tablolar için
-- ============================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON homepage_hero_slides TO app20251125030717azolfgnmgv_v1_admin_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON homepage_hero_slides TO app20251125030717azolfgnmgv_v1_user;

GRANT SELECT, INSERT, UPDATE, DELETE ON trend_cards TO app20251125030717azolfgnmgv_v1_admin_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON trend_cards TO app20251125030717azolfgnmgv_v1_user;

GRANT SELECT, INSERT, UPDATE, DELETE ON showroom_gallery_items TO app20251125030717azolfgnmgv_v1_admin_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON showroom_gallery_items TO app20251125030717azolfgnmgv_v1_user;

GRANT SELECT, INSERT, UPDATE, DELETE ON brand_trtex_links TO app20251125030717azolfgnmgv_v1_admin_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON brand_trtex_links TO app20251125030717azolfgnmgv_v1_user;

GRANT SELECT, INSERT, UPDATE, DELETE ON desire_journey_events TO app20251125030717azolfgnmgv_v1_admin_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON desire_journey_events TO app20251125030717azolfgnmgv_v1_user;

GRANT SELECT, INSERT, UPDATE, DELETE ON collection_saves TO app20251125030717azolfgnmgv_v1_admin_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON collection_saves TO app20251125030717azolfgnmgv_v1_user;

GRANT SELECT, INSERT, UPDATE, DELETE ON ai_agent_performance_log TO app20251125030717azolfgnmgv_v1_admin_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_agent_performance_log TO app20251125030717azolfgnmgv_v1_user;

GRANT SELECT, INSERT, UPDATE, DELETE ON region_highlight_blocks TO app20251125030717azolfgnmgv_v1_admin_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON region_highlight_blocks TO app20251125030717azolfgnmgv_v1_user;

-- ============================================================
-- HOMETEX.AI — EKSİK KOLON EKLEMELERI (ALTER TABLE)
-- ============================================================

-- 1. brand_profiles: AR/RU dil desteği eksik kolonlar
ALTER TABLE brand_profiles
  ADD COLUMN IF NOT EXISTS ai_strengths_ar TEXT,
  ADD COLUMN IF NOT EXISTS ai_strengths_ru TEXT,
  ADD COLUMN IF NOT EXISTS ai_market_position_ar TEXT,
  ADD COLUMN IF NOT EXISTS ai_market_position_ru TEXT,
  ADD COLUMN IF NOT EXISTS ai_commentary_ar TEXT,
  ADD COLUMN IF NOT EXISTS ai_commentary_ru TEXT,
  ADD COLUMN IF NOT EXISTS style_tags JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS founding_year INTEGER,
  ADD COLUMN IF NOT EXISTS employee_count VARCHAR(50),
  ADD COLUMN IF NOT EXISTS export_countries JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS trtex_brand_slug VARCHAR(300);

-- 2. fair_events: SEO slug eksik
ALTER TABLE fair_events
  ADD COLUMN IF NOT EXISTS slug VARCHAR(300),
  ADD COLUMN IF NOT EXISTS highlight_color VARCHAR(7) DEFAULT '#D4AF37',
  ADD COLUMN IF NOT EXISTS participant_brands JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS virtual_hall_config JSONB DEFAULT '{}'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS idx_fair_events_slug ON fair_events(slug);

-- 3. news_feed_cache: Marka bağlantısı eksik
ALTER TABLE news_feed_cache
  ADD COLUMN IF NOT EXISTS related_brand_ids JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS related_collection_ids JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS related_showroom_ids JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS perde_ai_style_prompt TEXT,
  ADD COLUMN IF NOT EXISTS reading_time_minutes INTEGER DEFAULT 3;

-- 4. product_categories: Görsel eksik
ALTER TABLE product_categories
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS banner_image_url TEXT,
  ADD COLUMN IF NOT EXISTS accent_color VARCHAR(7) DEFAULT '#D4AF37',
  ADD COLUMN IF NOT EXISTS product_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS brand_count INTEGER DEFAULT 0;

-- 5. trend_cards: TRTEX bağlantısı eksik
ALTER TABLE trend_cards
  ADD COLUMN IF NOT EXISTS trtex_article_url TEXT,
  ADD COLUMN IF NOT EXISTS trtex_article_title_tr VARCHAR(300),
  ADD COLUMN IF NOT EXISTS trtex_article_title_en VARCHAR(300),
  ADD COLUMN IF NOT EXISTS related_brand_ids JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS related_collection_ids JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS usage_contexts JSONB DEFAULT '[]'::jsonb;

-- 6. homepage_hero_slides: AR/RU CTA metinleri eksik
ALTER TABLE homepage_hero_slides
  ADD COLUMN IF NOT EXISTS cta_primary_text_ar VARCHAR(200),
  ADD COLUMN IF NOT EXISTS cta_primary_text_ru VARCHAR(200),
  ADD COLUMN IF NOT EXISTS cta_secondary_text_ar VARCHAR(200),
  ADD COLUMN IF NOT EXISTS cta_secondary_text_ru VARCHAR(200),
  ADD COLUMN IF NOT EXISTS title_badge_tr VARCHAR(100),
  ADD COLUMN IF NOT EXISTS title_badge_en VARCHAR(100),
  ADD COLUMN IF NOT EXISTS title_badge_de VARCHAR(100),
  ADD COLUMN IF NOT EXISTS title_badge_ar VARCHAR(100),
  ADD COLUMN IF NOT EXISTS title_badge_ru VARCHAR(100),
  ADD COLUMN IF NOT EXISTS scroll_indicator BOOLEAN DEFAULT true;

-- 7. showroom_gallery_items: Zengin stil verisi eksik
ALTER TABLE showroom_gallery_items
  ADD COLUMN IF NOT EXISTS perde_ai_style_config JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS color_palette JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS style_tags JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS room_type VARCHAR(100),
  ADD COLUMN IF NOT EXISTS trtex_article_url TEXT;

-- 8. collection_trend_scores: UI için isim alanları eksik
ALTER TABLE collection_trend_scores
  ADD COLUMN IF NOT EXISTS collection_name_tr VARCHAR(300),
  ADD COLUMN IF NOT EXISTS collection_name_en VARCHAR(300),
  ADD COLUMN IF NOT EXISTS collection_name_de VARCHAR(300),
  ADD COLUMN IF NOT EXISTS collection_cover_url TEXT,
  ADD COLUMN IF NOT EXISTS brand_name VARCHAR(300),
  ADD COLUMN IF NOT EXISTS showroom_slug VARCHAR(300);

-- 9. desire_journey_events: product_view step constraint güncelle
-- (Mevcut constraint'i drop edip yeniden oluştur)
ALTER TABLE desire_journey_events
  DROP CONSTRAINT IF EXISTS desire_journey_events_journey_step_check;

ALTER TABLE desire_journey_events
  ADD CONSTRAINT desire_journey_events_journey_step_check
  CHECK (journey_step IN (
    'hero_view','hero_cta_click',
    'trend_card_view','trend_card_click',
    'collection_view','collection_save',
    'brand_view','showroom_view',
    'gallery_item_click',
    'product_view','product_click',
    'perde_ai_intent','perde_ai_click','perde_ai_return',
    'trtex_click',
    'inquiry_started','inquiry_sent',
    'favorite_added',
    'search_performed','filter_applied','region_selected',
    'news_view','news_click',
    'fair_event_view','fair_event_register'
  ));

-- 10. collections: Eksik çeviri alanları
ALTER TABLE collections
  ADD COLUMN IF NOT EXISTS name_tr VARCHAR(300),
  ADD COLUMN IF NOT EXISTS name_en VARCHAR(300),
  ADD COLUMN IF NOT EXISTS name_ar VARCHAR(300),
  ADD COLUMN IF NOT EXISTS name_ru VARCHAR(300),
  ADD COLUMN IF NOT EXISTS description_tr TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS description_ar TEXT,
  ADD COLUMN IF NOT EXISTS description_ru TEXT,
  ADD COLUMN IF NOT EXISTS style_tags JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS color_palette JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS usage_contexts JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS perde_ai_style_prompt TEXT,
  ADD COLUMN IF NOT EXISTS perde_ai_deep_link TEXT,
  ADD COLUMN IF NOT EXISTS ai_commentary_tr TEXT,
  ADD COLUMN IF NOT EXISTS ai_commentary_en TEXT,
  ADD COLUMN IF NOT EXISTS trend_score NUMERIC(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS view_count BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS perde_ai_redirect_count BIGINT DEFAULT 0;

-- ============================================================
-- SEED DATA — DOMAIN CONFIGS
-- ============================================================

INSERT INTO domain_configs (
  domain_key, domain_url, platform_name,
  platform_name_tr, platform_name_de, platform_name_ar, platform_name_ru,
  tagline_en, tagline_tr, tagline_de, tagline_ar, tagline_ru,
  supported_languages, default_language,
  primary_color, secondary_color,
  meta_title_en, meta_title_tr,
  meta_description_en, meta_description_tr,
  is_active
) VALUES
(
  'hometex', 'https://hometex.ai', 'Hometex.ai',
  'Hometex.ai', NULL, 'هوم تكس', 'Hometex.ai',
  'Global Virtual Textile Fair — AI Powered',
  'Global Sanal Tekstil Fuarı — Yapay Zeka Destekli',
  NULL,
  'معرض النسيج الافتراضي العالمي — مدعوم بالذكاء الاصطناعي',
  'Глобальная виртуальная текстильная ярмарка — на базе ИИ',
  '["tr","en","ar","ru"]', 'tr',
  '#D4AF37', '#0a0a1a',
  'Hometex.ai — Global Virtual Home Textile Fair',
  'Hometex.ai — Global Sanal Ev Tekstili Fuarı',
  'Discover premium home textile brands, collections and trends from Turkey, China, Europe and Far East.',
  'Türkiye, Çin, Avrupa ve Uzak Doğu''dan premium ev tekstili markalarını, koleksiyonlarını ve trendlerini keşfedin.',
  true
),
(
  'heimtex', 'https://heimtex.ai', 'Heimtex.ai',
  NULL, 'Heimtex.ai', NULL, NULL,
  'Globale Virtuelle Heimtextilmesse — KI-gestützt',
  NULL,
  'Globale Virtuelle Heimtextilmesse — KI-gestützt',
  NULL, NULL,
  '["de","en"]', 'de',
  '#1a3a5c', '#0a0a1a',
  'Heimtex.ai — Global Virtual Home Textile Fair',
  NULL,
  'Entdecken Sie Premium-Heimtextilmarken, Kollektionen und Trends aus der Türkei, China, Europa und dem Fernen Osten.',
  NULL,
  true
)
ON CONFLICT (domain_key) DO UPDATE SET
  updated_at = CURRENT_TIMESTAMP;

-- ============================================================
-- SEED DATA — BRAND REGIONS
-- ============================================================

INSERT INTO brand_regions (
  region_key, name_en, name_tr, name_de, name_ar, name_ru,
  marketing_label_en, marketing_label_tr, marketing_label_de,
  hero_image_url, accent_color,
  countries, brand_count, collection_count,
  ai_description_en, ai_description_tr, ai_description_de,
  display_order, is_active, is_highlighted
) VALUES
(
  'turkey',
  'Turkey', 'Türkiye', 'Türkei', 'تركيا', 'Турция',
  'Premium Turkey', 'Premium Türkiye', 'Premium Türkei',
  'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80',
  '#E63946',
  '["TR"]', 48, 124,
  'Turkey is the world''s leading home textile exporter, combining centuries of weaving tradition with cutting-edge manufacturing. Turkish brands dominate global markets with premium quality and competitive pricing.',
  'Türkiye, yüzyıllık dokuma geleneğini ileri üretim teknolojisiyle birleştirerek dünyanın önde gelen ev tekstili ihracatçısıdır. Türk markalar premium kalite ve rekabetçi fiyatlarla global pazarlara hâkimdir.',
  'Die Türkei ist der weltweit führende Heimtextilexporteur und verbindet jahrhundertealte Webtradition mit modernster Fertigung.',
  1, true, true
),
(
  'china',
  'China', 'Çin', 'China', 'الصين', 'Китай',
  'Rising China', 'Yükselen Çin', 'Aufsteigendes China',
  'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=1200&q=80',
  '#DE2910',
  '["CN"]', 62, 198,
  'China''s home textile industry has evolved from mass production to design-led innovation. Brands like Sunvim, Fuanna and Luolai now compete at the premium global level with sophisticated collections.',
  'Çin''in ev tekstili endüstrisi, kitlesel üretimden tasarım odaklı inovasyona evrildi. Sunvim, Fuanna ve Luolai gibi markalar artık sofistike koleksiyonlarla premium global düzeyde rekabet ediyor.',
  'Chinas Heimtextilindustrie hat sich von der Massenproduktion zur designorientierten Innovation entwickelt.',
  2, true, true
),
(
  'europe',
  'Europe', 'Avrupa', 'Europa', 'أوروبا', 'Европа',
  'Premium Europe', 'Premium Avrupa', 'Premium Europa',
  'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80',
  '#003399',
  '["DE","IT","FR","BE","NL","AT","CH"]', 35, 89,
  'European home textile brands set the global standard for luxury, sustainability and design innovation. From Italian silk to Belgian linen, European craftsmanship defines premium living.',
  'Avrupa ev tekstili markaları lüks, sürdürülebilirlik ve tasarım inovasyonunda global standardı belirliyor. İtalyan ipeğinden Belçika ketenesine, Avrupa zanaatkârlığı premium yaşamı tanımlıyor.',
  'Europäische Heimtextilmarken setzen den globalen Standard für Luxus, Nachhaltigkeit und Designinnovation.',
  3, true, true
),
(
  'far_east',
  'Far East', 'Uzak Doğu', 'Fernost', 'الشرق الأقصى', 'Дальний Восток',
  'Far East Craft', 'Uzak Doğu Zanaatı', 'Fernost-Handwerk',
  'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80',
  '#FF6B35',
  '["JP","KR","IN","TH","VN"]', 28, 76,
  'The Far East brings unique textile traditions — Japanese precision, Indian handcraft, Korean innovation — creating collections that blend ancient wisdom with contemporary design.',
  'Uzak Doğu benzersiz tekstil geleneklerini bir araya getiriyor — Japon hassasiyeti, Hint el sanatı, Kore inovasyonu — kadim bilgeliği çağdaş tasarımla harmanlayan koleksiyonlar yaratıyor.',
  'Der Ferne Osten bringt einzigartige Textiltraditionen zusammen — japanische Präzision, indisches Handwerk, koreanische Innovation.',
  4, true, false
),
(
  'middle_east',
  'Middle East', 'Orta Doğu', 'Naher Osten', 'الشرق الأوسط', 'Ближний Восток',
  'Middle East Luxury', 'Orta Doğu Lüksü', 'Nahost-Luxus',
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80',
  '#C9A84C',
  '["AE","SA","QA","KW"]', 18, 42,
  'The Middle East represents the world''s most discerning luxury home textile market, with a deep appreciation for opulent fabrics, intricate patterns and bespoke craftsmanship.',
  'Orta Doğu, görkemli kumaşlara, karmaşık desenlere ve ısmarlama zanaatkârlığa derin bir takdirle dünyanın en seçici lüks ev tekstili pazarını temsil ediyor.',
  'Der Nahe Osten repräsentiert den anspruchsvollsten Luxus-Heimtextilmarkt der Welt.',
  5, true, false
)
ON CONFLICT (region_key) DO UPDATE SET
  updated_at = CURRENT_TIMESTAMP;

-- ============================================================
-- SEED DATA — PRODUCT CATEGORIES
-- ============================================================

INSERT INTO product_categories (
  name_en, name_tr, name_de, name_ar, name_ru,
  slug,
  description_en, description_tr, description_de,
  cover_image_url, banner_image_url,
  accent_color, display_order, is_active, supported_domains
) VALUES
(
  'Curtains & Drapes', 'Perdeler', 'Vorhänge & Gardinen', 'الستائر والمسدلات', 'Шторы и занавески',
  'curtains',
  'Premium curtains, sheer panels, blackout drapes and decorative window treatments from global manufacturers.',
  'Global üreticilerden premium perdeler, tül paneller, karartma perdeler ve dekoratif pencere kaplamaları.',
  'Premium Vorhänge, Scheibengardinen, Verdunkelungsvorhänge und dekorative Fensterbehandlungen.',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1400&q=80',
  '#8B6914', 1, true, 'both'
),
(
  'Upholstery Fabrics', 'Döşemelik Kumaşlar', 'Polsterstoff', 'أقمشة التنجيد', 'Обивочные ткани',
  'upholstery',
  'Velvet, linen, jacquard and technical upholstery fabrics for furniture, hospitality and contract markets.',
  'Mobilya, konaklama ve sözleşmeli pazarlar için kadife, keten, jakarlı ve teknik döşemelik kumaşlar.',
  'Samt-, Leinen-, Jacquard- und technische Polsterstoffe für Möbel, Gastgewerbe und Vertragsmärkte.',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
  'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=1400&q=80',
  '#6B4226', 2, true, 'both'
),
(
  'Carpets & Rugs', 'Halılar', 'Teppiche', 'السجاد والبسط', 'Ковры и паласы',
  'carpets',
  'Hand-knotted, machine-made and designer rugs from Turkey, Iran, China and beyond. Every style, every size.',
  'Türkiye, İran, Çin ve ötesinden el dokuma, makine yapımı ve tasarımcı halılar. Her stil, her boyut.',
  'Handgeknüpfte, maschinell hergestellte und Designer-Teppiche aus der Türkei, dem Iran, China und darüber hinaus.',
  'https://images.unsplash.com/photo-1600166898405-da9535204843?w=800&q=80',
  'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=1400&q=80',
  '#8B4513', 3, true, 'both'
),
(
  'Bedding & Linen', 'Yatak Tekstili', 'Bettwäsche & Leinen', 'مفروشات السرير', 'Постельное бельё',
  'bedding',
  'Luxury bed linen, duvet covers, pillowcases and complete bedding sets. Hotel quality for home.',
  'Lüks yatak çarşafları, yorgan kılıfları, yastık kılıfları ve eksiksiz yatak takımları. Ev için otel kalitesi.',
  'Luxuriöse Bettwäsche, Bettbezüge, Kissenbezüge und komplette Bettwäschesets. Hotelqualität für zu Hause.',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
  'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1400&q=80',
  '#4A90D9', 4, true, 'both'
),
(
  'Bath Textiles', 'Banyo Tekstili', 'Badetextilien', 'منسوجات الحمام', 'Банные текстильные изделия',
  'bath',
  'Premium towels, bathrobes, bath mats and complete bathroom textile collections for home and hospitality.',
  'Ev ve konaklama için premium havlular, bornozlar, banyo paspasları ve eksiksiz banyo tekstil koleksiyonları.',
  'Premium Handtücher, Bademäntel, Badematten und komplette Badtextilkollektionen für Zuhause und Gastgewerbe.',
  'https://images.unsplash.com/photo-1620626011761-996317702519?w=800&q=80',
  'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1400&q=80',
  '#2E86AB', 5, true, 'both'
),
(
  'Home Accessories', 'Ev Aksesuarları', 'Wohnaccessoires', 'إكسسوارات المنزل', 'Домашние аксессуары',
  'accessories',
  'Decorative cushions, throws, table runners, placemats and textile home accessories to complete any interior.',
  'Herhangi bir iç mekânı tamamlamak için dekoratif yastıklar, battaniyeler, masa koşucuları, amerikan servisi ve tekstil ev aksesuarları.',
  'Dekorative Kissen, Decken, Tischläufer, Platzsets und textile Wohnaccessoires zur Vervollständigung jedes Interieurs.',
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80',
  'https://images.unsplash.com/photo-1567016526105-22da7c13161a?w=1400&q=80',
  '#E8A838', 6, true, 'both'
),
(
  'Hotel & Contract', 'Otel & Sözleşmeli', 'Hotel & Objekttextilien', 'فندق وعقود', 'Гостиничный и контрактный текстиль',
  'hotel-contract',
  'Specialized textile solutions for hotels, restaurants, spas and commercial spaces. Durability meets luxury.',
  'Oteller, restoranlar, spalar ve ticari alanlar için özel tekstil çözümleri. Dayanıklılık lüksle buluşuyor.',
  'Spezialisierte Textillösungen für Hotels, Restaurants, Spas und Gewerbeflächen. Langlebigkeit trifft Luxus.',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1400&q=80',
  '#2C3E50', 7, true, 'both'
),
(
  'Yacht & Marine', 'Yat & Denizcilik', 'Yacht & Marine', 'يخت وبحري', 'Яхтенный и морской текстиль',
  'yacht-marine',
  'High-performance marine textiles for yachts, boats and waterfront properties. UV-resistant, salt-proof luxury.',
  'Yatlar, tekneler ve su kenarı mülkleri için yüksek performanslı deniz tekstilleri. UV dayanıklı, tuza karşı dayanıklı lüks.',
  'Hochleistungs-Marinetextilien für Yachten, Boote und Wassergrundstücke. UV-beständiger, salzfester Luxus.',
  'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1400&q=80',
  '#1A6B8A', 8, true, 'hometex'
)
ON CONFLICT (slug) DO UPDATE SET
  cover_image_url = EXCLUDED.cover_image_url,
  banner_image_url = EXCLUDED.banner_image_url,
  updated_at = CURRENT_TIMESTAMP;

-- ============================================================
-- SEED DATA — PRODUCT SUBCATEGORIES
-- ============================================================

INSERT INTO product_subcategories (category_id, name_en, name_tr, name_de, slug, display_order, is_active)
SELECT id, 'Sheer Curtains', 'Tül Perdeler', 'Scheibengardinen', 'sheer-curtains', 1, true FROM product_categories WHERE slug = 'curtains'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_subcategories (category_id, name_en, name_tr, name_de, slug, display_order, is_active)
SELECT id, 'Blackout Curtains', 'Karartma Perdeler', 'Verdunkelungsvorhänge', 'blackout-curtains', 2, true FROM product_categories WHERE slug = 'curtains'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_subcategories (category_id, name_en, name_tr, name_de, slug, display_order, is_active)
SELECT id, 'Velvet Curtains', 'Kadife Perdeler', 'Samtvorhänge', 'velvet-curtains', 3, true FROM product_categories WHERE slug = 'curtains'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_subcategories (category_id, name_en, name_tr, name_de, slug, display_order, is_active)
SELECT id, 'Linen Curtains', 'Keten Perdeler', 'Leinenvorhänge', 'linen-curtains', 4, true FROM product_categories WHERE slug = 'curtains'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_subcategories (category_id, name_en, name_tr, name_de, slug, display_order, is_active)
SELECT id, 'Velvet Upholstery', 'Kadife Döşemelik', 'Samtpolster', 'velvet-upholstery', 1, true FROM product_categories WHERE slug = 'upholstery'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_subcategories (category_id, name_en, name_tr, name_de, slug, display_order, is_active)
SELECT id, 'Linen Upholstery', 'Keten Döşemelik', 'Leinenpolster', 'linen-upholstery', 2, true FROM product_categories WHERE slug = 'upholstery'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_subcategories (category_id, name_en, name_tr, name_de, slug, display_order, is_active)
SELECT id, 'Hand-Knotted Rugs', 'El Dokuma Halılar', 'Handgeknüpfte Teppiche', 'hand-knotted-rugs', 1, true FROM product_categories WHERE slug = 'carpets'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_subcategories (category_id, name_en, name_tr, name_de, slug, display_order, is_active)
SELECT id, 'Modern Rugs', 'Modern Halılar', 'Moderne Teppiche', 'modern-rugs', 2, true FROM product_categories WHERE slug = 'carpets'
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED DATA — HOMEPAGE HERO SLIDES
-- ============================================================

INSERT INTO homepage_hero_slides (
  domain_key, slide_order,
  title_tr, title_en, title_de, title_ar, title_ru,
  subtitle_tr, subtitle_en, subtitle_de, subtitle_ar, subtitle_ru,
  title_badge_tr, title_badge_en,
  background_image_url, overlay_opacity, overlay_color,
  cta_primary_text_tr, cta_primary_text_en, cta_primary_url,
  cta_secondary_text_tr, cta_secondary_text_en, cta_secondary_url,
  cta_primary_text_ar, cta_primary_text_ru,
  cta_secondary_text_ar, cta_secondary_text_ru,
  is_active, ai_generated
) VALUES
(
  'hometex', 1,
  'Global Sanal Tekstil Fuarı', 'Global Virtual Textile Fair', NULL,
  'معرض النسيج الافتراضي العالمي', 'Глобальная Виртуальная Текстильная Ярмарка',
  'Türkiye, Çin, Avrupa ve Uzak Doğu''dan 170+ premium marka. Yapay zeka destekli keşif deneyimi.',
  '170+ premium brands from Turkey, China, Europe and Far East. AI-powered discovery experience.',
  NULL,
  'أكثر من 170 علامة تجارية مميزة من تركيا والصين وأوروبا والشرق الأقصى.',
  'Более 170 премиальных брендов из Турции, Китая, Европы и Дальнего Востока.',
  '🌍 AI Destekli', '🌍 AI Powered',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=90',
  0.55, '#0a0a1a',
  'Fuarı Gez', 'Explore Fair', '/explore',
  'Stil Keşfet', 'Discover Style', '/collections',
  'استكشف المعرض', 'Исследовать ярмарку',
  'اكتشف الأنماط', 'Открыть стили',
  true, false
),
(
  'hometex', 2,
  'Koleksiyonları Keşfet', 'Discover Collections', NULL,
  'اكتشف المجموعات', 'Откройте коллекции',
  'Soft Minimal''den Dark Velvet''e, Hotel Luxury''den Natural Linen''e — bu sezonun en güçlü trendleri burada.',
  'From Soft Minimal to Dark Velvet, Hotel Luxury to Natural Linen — the season''s strongest trends are here.',
  NULL,
  'من Soft Minimal إلى Dark Velvet — أقوى اتجاهات الموسم هنا.',
  'От Soft Minimal до Dark Velvet — самые сильные тренды сезона здесь.',
  '✨ Trend 2026', '✨ Trend 2026',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&q=90',
  0.50, '#0a0a1a',
  'Koleksiyonlara Git', 'View Collections', '/collections',
  'Perde.ai''de Dene', 'Try on Perde.ai', 'https://perde.ai',
  'عرض المجموعات', 'Смотреть коллекции',
  'جرب على Perde.ai', 'Попробовать на Perde.ai',
  true, false
),
(
  'hometex', 3,
  'Marka Showroom''larını Ziyaret Et', 'Visit Brand Showrooms', NULL,
  'زيارة صالات عرض العلامات التجارية', 'Посетите шоурумы брендов',
  'Taç, Menderes, Luolai, Nitori ve daha fazlası — her markanın dijital standını keşfet, perde.ai''de hayata geçir.',
  'Taç, Menderes, Luolai, Nitori and more — explore every brand''s digital stand, bring it to life on perde.ai.',
  NULL,
  'Taç وMenderes وLuolai وNitori والمزيد — استكشف الجناح الرقمي لكل علامة تجارية.',
  'Taç, Menderes, Luolai, Nitori и другие — исследуйте цифровые стенды каждого бренда.',
  '🏢 Showroom', '🏢 Showroom',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&q=90',
  0.50, '#0a0a1a',
  'Markaları Keşfet', 'Explore Brands', '/brands',
  'Showroom Aç', 'Open Showroom', '/brands',
  'استكشف العلامات التجارية', 'Исследовать бренды',
  'فتح صالة العرض', 'Открыть шоурум',
  true, false
),
(
  'heimtex', 1,
  NULL, 'Global Virtual Textile Fair', 'Globale Virtuelle Heimtextilmesse',
  NULL, NULL,
  NULL,
  'Premium home textile brands from Turkey, China and Europe. AI-powered discovery.',
  'Premium Heimtextilmarken aus der Türkei, China und Europa. KI-gestützte Entdeckung.',
  NULL, NULL,
  NULL, '🌍 KI-gestützt',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=90',
  0.55, '#0a0a1a',
  NULL, 'Messe erkunden', '/explore',
  NULL, 'Stile entdecken', '/collections',
  NULL, NULL, NULL, NULL,
  true, false
);

-- ============================================================
-- SEED DATA — TREND CARDS
-- ============================================================

INSERT INTO trend_cards (
  domain_key, card_order,
  trend_name_tr, trend_name_en, trend_name_de, trend_name_ar, trend_name_ru,
  trend_description_tr, trend_description_en, trend_description_de,
  cover_image_url, accent_color,
  style_category, style_tags, color_palette,
  perde_ai_style_prompt, perde_ai_deep_link,
  trend_score, trend_direction,
  ai_commentary_tr, ai_commentary_en,
  usage_contexts,
  is_active, is_featured,
  week_number, year,
  valid_from
) VALUES
(
  'hometex', 1,
  'Soft Minimal', 'Soft Minimal', 'Soft Minimal', 'مينيمال ناعم', 'Мягкий минимализм',
  'Nötr tonlar, doğal dokular ve sade formlar. 2026''nın en güçlü trendi — az ama öz.',
  'Neutral tones, natural textures and clean forms. The strongest trend of 2026 — less but more.',
  'Neutrale Töne, natürliche Texturen und klare Formen. Der stärkste Trend 2026 — weniger ist mehr.',
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80',
  '#C4A882',
  'minimal',
  '["neutral","natural","clean","linen","beige","warm-white"]',
  '["#F5F0E8","#E8DDD0","#C4A882","#8B7355","#4A3728"]',
  'Soft minimal interior with neutral linen curtains, natural textures, warm beige tones, clean lines, Scandinavian influence',
  'https://perde.ai?style=soft-minimal&utm_source=hometex&utm_medium=trend_card',
  92.5, 'breakout',
  'Soft Minimal trendi, pandemi sonrası "daha az ama daha iyi" felsefesinin ev tekstiline yansıması. Keten, pamuk ve doğal lifler bu trendin temel malzemeleri.',
  'Soft Minimal reflects the post-pandemic philosophy of "less but better" in home textiles. Linen, cotton and natural fibers are the core materials of this trend.',
  '["living_room","bedroom","home_office","hotel"]',
  true, true,
  EXTRACT(WEEK FROM CURRENT_DATE)::integer, EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  CURRENT_TIMESTAMP
),
(
  'hometex', 2,
  'Hotel Luxury', 'Hotel Luxury', 'Hotel Luxus', 'فخامة الفندق', 'Гостиничная роскошь',
  'Beş yıldızlı otel estetiğini evinize taşıyın. Ağır kadife, altın detaylar, kusursuz işçilik.',
  'Bring five-star hotel aesthetics into your home. Heavy velvet, gold details, flawless craftsmanship.',
  'Bringen Sie Fünf-Sterne-Hotel-Ästhetik in Ihr Zuhause. Schwerer Samt, Golddetails, makellose Handwerkskunst.',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
  '#D4AF37',
  'luxury',
  '["velvet","gold","opulent","hotel","premium","dark"]',
  '["#1A1A2E","#2D2D44","#D4AF37","#C0A060","#8B7536"]',
  'Hotel luxury bedroom with heavy velvet curtains in deep navy, gold hardware, premium bedding, opulent atmosphere',
  'https://perde.ai?style=hotel-luxury&utm_source=hometex&utm_medium=trend_card',
  88.0, 'rising',
  'Hotel Luxury trendi, "evim benim otelim" anlayışının doruk noktası. Ağır kadife perdeler, altın aksesuarlar ve premium yatak tekstili bu trendin vazgeçilmezleri.',
  'Hotel Luxury trend is the pinnacle of "my home is my hotel" philosophy. Heavy velvet curtains, gold accessories and premium bedding are the essentials of this trend.',
  '["bedroom","living_room","hotel","yacht"]',
  true, true,
  EXTRACT(WEEK FROM CURRENT_DATE)::integer, EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  CURRENT_TIMESTAMP
),
(
  'hometex', 3,
  'Natural Linen', 'Natural Linen', 'Natürliches Leinen', 'كتان طبيعي', 'Натуральный лён',
  'Sürdürülebilir moda ev tekstiline girdi. Ham keten, organik pamuk ve geri dönüştürülmüş lifler.',
  'Sustainable fashion has entered home textiles. Raw linen, organic cotton and recycled fibers.',
  'Nachhaltige Mode ist in Heimtextilien eingezogen. Rohleinen, Bio-Baumwolle und recycelte Fasern.',
  'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&q=80',
  '#8B7355',
  'natural',
  '["linen","organic","sustainable","raw","earthy","eco"]',
  '["#F0EAD6","#D4C5A9","#A89070","#7A6550","#4A3C2A"]',
  'Natural linen curtains with raw texture, organic cotton bedding, earthy tones, sustainable materials, biophilic design',
  'https://perde.ai?style=natural-linen&utm_source=hometex&utm_medium=trend_card',
  85.5, 'rising',
  'Natural Linen trendi, sürdürülebilirlik hareketinin ev tekstiline en güçlü yansıması. Ham keten dokusu, organik sertifikalar ve doğal boyalar bu trendin kimliğini oluşturuyor.',
  'Natural Linen trend is the strongest reflection of the sustainability movement in home textiles. Raw linen texture, organic certifications and natural dyes form the identity of this trend.',
  '["living_room","bedroom","dining_room","home_office"]',
  true, true,
  EXTRACT(WEEK FROM CURRENT_DATE)::integer, EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  CURRENT_TIMESTAMP
),
(
  'hometex', 4,
  'Dark Velvet', 'Dark Velvet', 'Dunkler Samt', 'مخمل داكن', 'Тёмный бархат',
  'Koyu, zengin ve dramatik. Derin lacivert, zümrüt yeşili ve bordo kadife — cesur seçimler için.',
  'Dark, rich and dramatic. Deep navy, emerald green and burgundy velvet — for bold choices.',
  'Dunkel, reich und dramatisch. Tiefes Marineblau, Smaragdgrün und Burgunder-Samt — für mutige Entscheidungen.',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
  '#2D1B69',
  'dramatic',
  '["velvet","dark","dramatic","jewel-tones","navy","emerald","burgundy"]',
  '["#1A0A2E","#2D1B69","#1B4332","#6B1A1A","#D4AF37"]',
  'Dark velvet curtains in deep navy or emerald green, dramatic interior, jewel tones, moody atmosphere, luxury feel',
  'https://perde.ai?style=dark-velvet&utm_source=hometex&utm_medium=trend_card',
  79.0, 'rising',
  'Dark Velvet trendi, minimalizme karşı bir başkaldırı. Koyu, zengin renkler ve dramatik dokular — cesur ev sahipleri için tasarlanmış.',
  'Dark Velvet trend is a rebellion against minimalism. Dark, rich colors and dramatic textures — designed for bold homeowners.',
  '["living_room","bedroom","dining_room","hotel","yacht"]',
  true, true,
  EXTRACT(WEEK FROM CURRENT_DATE)::integer, EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  CURRENT_TIMESTAMP
),
(
  'hometex', 5,
  'Boho Chic', 'Boho Chic', 'Boho Chic', 'بوهو شيك', 'Бохо шик',
  'Özgür ruhlu, katmanlı ve renkli. Makrome, etnik desenler ve canlı renkler bir arada.',
  'Free-spirited, layered and colorful. Macramé, ethnic patterns and vibrant colors together.',
  'Freigeistig, geschichtet und farbenfroh. Makramee, ethnische Muster und lebendige Farben zusammen.',
  'https://images.unsplash.com/photo-1600166898405-da9535204843?w=800&q=80',
  '#E8A838',
  'boho',
  '["boho","ethnic","colorful","macrame","layered","eclectic"]',
  '["#E8A838","#C4623A","#8B4513","#2E8B57","#4169E1"]',
  'Boho chic interior with macramé curtains, ethnic pattern rugs, colorful cushions, layered textiles, eclectic mix',
  'https://perde.ai?style=boho-chic&utm_source=hometex&utm_medium=trend_card',
  72.0, 'stable',
  'Boho Chic trendi, kişiselleştirilmiş ve özgün iç mekânların vazgeçilmezi. Makrome, etnik desenler ve canlı renkler bu trendin DNA''sı.',
  'Boho Chic trend is indispensable for personalized and authentic interiors. Macramé, ethnic patterns and vibrant colors are the DNA of this trend.',
  '["living_room","bedroom","outdoor","home_office"]',
  true, false,
  EXTRACT(WEEK FROM CURRENT_DATE)::integer, EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  CURRENT_TIMESTAMP
),
(
  'heimtex', 1,
  NULL, 'Soft Minimal', 'Soft Minimal', NULL, NULL,
  NULL,
  'Neutral tones, natural textures and clean forms. The strongest trend of 2026.',
  'Neutrale Töne, natürliche Texturen und klare Formen. Der stärkste Trend 2026.',
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80',
  '#C4A882',
  'minimal',
  '["neutral","natural","clean","linen","beige"]',
  '["#F5F0E8","#E8DDD0","#C4A882","#8B7355","#4A3728"]',
  'Soft minimal interior with neutral linen curtains, natural textures, warm beige tones',
  'https://perde.ai?style=soft-minimal&utm_source=heimtex&utm_medium=trend_card',
  92.5, 'breakout',
  NULL,
  'Soft Minimal reflects the post-pandemic philosophy of "less but better" in home textiles.',
  '["living_room","bedroom","hotel"]',
  true, true,
  EXTRACT(WEEK FROM CURRENT_DATE)::integer, EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  CURRENT_TIMESTAMP
),
(
  'heimtex', 2,
  NULL, 'Hotel Luxury', 'Hotel Luxus', NULL, NULL,
  NULL,
  'Bring five-star hotel aesthetics into your home.',
  'Bringen Sie Fünf-Sterne-Hotel-Ästhetik in Ihr Zuhause.',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
  '#D4AF37',
  'luxury',
  '["velvet","gold","opulent","hotel","premium"]',
  '["#1A1A2E","#D4AF37","#C0A060"]',
  'Hotel luxury bedroom with heavy velvet curtains in deep navy, gold hardware',
  'https://perde.ai?style=hotel-luxury&utm_source=heimtex&utm_medium=trend_card',
  88.0, 'rising',
  NULL,
  'Hotel Luxury trend is the pinnacle of "my home is my hotel" philosophy.',
  '["bedroom","living_room","hotel"]',
  true, true,
  EXTRACT(WEEK FROM CURRENT_DATE)::integer, EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  CURRENT_TIMESTAMP
);

-- ============================================================
-- SEED DATA — REGION HIGHLIGHT BLOCKS
-- ============================================================

INSERT INTO region_highlight_blocks (
  domain_key, region_key,
  highlight_label_tr, highlight_label_en, highlight_label_de, highlight_label_ar, highlight_label_ru,
  description_tr, description_en, description_de,
  hero_image_url, accent_color, badge_color,
  brand_count, collection_count,
  trending_style_tr, trending_style_en,
  cta_text_tr, cta_text_en, cta_url,
  display_order, is_active, is_highlighted
) VALUES
(
  'hometex', 'turkey',
  '🇹🇷 Premium Türkiye', '🇹🇷 Premium Turkey', '🇹🇷 Premium Türkei',
  '🇹🇷 تركيا المميزة', '🇹🇷 Премиум Турция',
  'Dünyanın en büyük ev tekstili ihracatçısı. 48 marka, 124 koleksiyon.',
  'World''s largest home textile exporter. 48 brands, 124 collections.',
  'Weltgrößter Heimtextilexporteur. 48 Marken, 124 Kollektionen.',
  'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80',
  '#E63946', '#E63946',
  48, 124,
  'Soft Minimal', 'Soft Minimal',
  'Türk Markalarını Keşfet', 'Explore Turkish Brands', '/brands?region=turkey',
  1, true, true
),
(
  'hometex', 'china',
  '🇨🇳 Yükselen Çin', '🇨🇳 Rising China', '🇨🇳 Aufsteigendes China',
  '🇨🇳 الصين الصاعدة', '🇨🇳 Восходящий Китай',
  'Tasarım odaklı inovasyon. 62 marka, 198 koleksiyon.',
  'Design-led innovation. 62 brands, 198 collections.',
  'Designorientierte Innovation. 62 Marken, 198 Kollektionen.',
  'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&q=80',
  '#DE2910', '#DE2910',
  62, 198,
  'Hotel Luxury', 'Hotel Luxury',
  'Çin Markalarını Keşfet', 'Explore Chinese Brands', '/brands?region=china',
  2, true, true
),
(
  'hometex', 'europe',
  '🇪🇺 Premium Avrupa', '🇪🇺 Premium Europe', '🇪🇺 Premium Europa',
  '🇪🇺 أوروبا المميزة', '🇪🇺 Премиум Европа',
  'Lüks ve sürdürülebilirliğin merkezi. 35 marka, 89 koleksiyon.',
  'The center of luxury and sustainability. 35 brands, 89 collections.',
  'Das Zentrum von Luxus und Nachhaltigkeit. 35 Marken, 89 Kollektionen.',
  'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80',
  '#003399', '#003399',
  35, 89,
  'Natural Linen', 'Natural Linen',
  'Avrupa Markalarını Keşfet', 'Explore European Brands', '/brands?region=europe',
  3, true, true
),
(
  'hometex', 'far_east',
  '🌏 Uzak Doğu Zanaatı', '🌏 Far East Craft', '🌏 Fernost-Handwerk',
  '🌏 حرفة الشرق الأقصى', '🌏 Дальневосточное мастерство',
  'Kadim bilgelik, çağdaş tasarım. 28 marka, 76 koleksiyon.',
  'Ancient wisdom, contemporary design. 28 brands, 76 collections.',
  'Altes Wissen, zeitgenössisches Design. 28 Marken, 76 Kollektionen.',
  'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
  '#FF6B35', '#FF6B35',
  28, 76,
  'Dark Velvet', 'Dark Velvet',
  'Uzak Doğu Markalarını Keşfet', 'Explore Far East Brands', '/brands?region=far_east',
  4, true, false
),
(
  'heimtex', 'turkey',
  '🇹🇷 Premium Türkei', '🇹🇷 Premium Turkey', '🇹🇷 Premium Türkei',
  NULL, NULL,
  'Weltgrößter Heimtextilexporteur. 48 Marken, 124 Kollektionen.',
  'World''s largest home textile exporter. 48 brands, 124 collections.',
  'Weltgrößter Heimtextilexporteur. 48 Marken, 124 Kollektionen.',
  'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80',
  '#E63946', '#E63946',
  48, 124,
  'Soft Minimal', 'Soft Minimal',
  NULL, 'Türkische Marken erkunden', '/brands?region=turkey',
  1, true, true
),
(
  'heimtex', 'europe',
  '🇪🇺 Premium Europa', '🇪🇺 Premium Europe', '🇪🇺 Premium Europa',
  NULL, NULL,
  'Das Zentrum von Luxus und Nachhaltigkeit. 35 Marken, 89 Kollektionen.',
  'The center of luxury and sustainability. 35 brands, 89 collections.',
  'Das Zentrum von Luxus und Nachhaltigkeit. 35 Marken, 89 Kollektionen.',
  'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80',
  '#003399', '#003399',
  35, 89,
  'Natural Linen', 'Natural Linen',
  NULL, 'Europäische Marken erkunden', '/brands?region=europe',
  2, true, true
);

-- ============================================================
-- SEED DATA — FAIR EVENTS
-- ============================================================

INSERT INTO fair_events (
  domain_key, slug,
  event_name_en, event_name_tr, event_name_de, event_name_ar, event_name_ru,
  description_en, description_tr, description_de,
  event_type,
  start_date, end_date, registration_deadline,
  max_exhibitors, max_visitors,
  current_exhibitors, current_visitors,
  banner_image_url, cover_image_url,
  status, is_featured, registration_url
) VALUES
(
  'both', 'hometex-virtual-fair-2026',
  'Hometex Virtual Fair 2026', 'Hometex Sanal Fuarı 2026',
  'Hometex Virtuelle Messe 2026',
  'معرض هوم تكس الافتراضي 2026',
  'Виртуальная ярмарка Hometex 2026',
  'The world''s premier AI-powered virtual home textile fair. 170+ brands, 500+ collections, live from Turkey, China, Europe and Far East.',
  'Dünyanın önde gelen yapay zeka destekli sanal ev tekstili fuarı. 170+ marka, 500+ koleksiyon, Türkiye, Çin, Avrupa ve Uzak Doğu''dan canlı.',
  'Die weltweit führende KI-gestützte virtuelle Heimtextilmesse. 170+ Marken, 500+ Kollektionen, live aus der Türkei, China, Europa und dem Fernen Osten.',
  'virtual_fair',
  '2026-03-01 09:00:00+00', '2026-03-07 18:00:00+00', '2026-02-20 23:59:00+00',
  200, 50000,
  147, 12840,
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  'active', true, '/register/fair-2026'
),
(
  'hometex', 'trend-summit-spring-2026',
  'Textile Trend Summit Spring 2026', 'Tekstil Trend Zirvesi İlkbahar 2026',
  NULL, NULL, NULL,
  'Join industry leaders and AI trend analysts for an exclusive webinar on the top home textile trends of Spring/Summer 2026.',
  'Bahar/Yaz 2026''nın en önemli ev tekstili trendleri üzerine özel bir web semineri için sektör liderleri ve yapay zeka trend analistleriyle bir araya gelin.',
  NULL,
  'webinar',
  '2026-02-15 14:00:00+00', '2026-02-15 17:00:00+00', '2026-02-14 23:59:00+00',
  NULL, 5000,
  NULL, 1240,
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1400&q=80',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
  'upcoming', true, '/register/trend-summit-2026'
),
(
  'both', 'china-collection-launch-2026',
  'Rising China — New Collection Launch', 'Yükselen Çin — Yeni Koleksiyon Lansmanı',
  'Aufsteigendes China — Neue Kollektion Launch',
  'الصين الصاعدة — إطلاق مجموعة جديدة', NULL,
  'Exclusive virtual launch event for the latest collections from China''s top home textile brands including Sunvim, Fuanna and Luolai.',
  'Sunvim, Fuanna ve Luolai dahil Çin''in önde gelen ev tekstili markalarının en yeni koleksiyonları için özel sanal lansman etkinliği.',
  'Exklusives virtuelles Launch-Event für die neuesten Kollektionen der führenden chinesischen Heimtextilmarken.',
  'product_launch',
  '2026-04-10 10:00:00+00', '2026-04-10 16:00:00+00', '2026-04-08 23:59:00+00',
  20, 10000,
  18, 3420,
  'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=1400&q=80',
  'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&q=80',
  'upcoming', false, '/register/china-launch-2026'
);

-- ============================================================
-- SEED DATA — NEWS FEED CACHE (TRTEX)
-- ============================================================

INSERT INTO news_feed_cache (
  source_platform, external_id,
  title_tr, title_en, title_de, title_ar, title_ru,
  summary_tr, summary_en,
  excerpt, author_name, category, tags,
  thumbnail_url, source_url,
  published_at, is_featured,
  display_on_domains, reading_time_minutes,
  is_active
) VALUES
(
  'trtex', 'trtex-001',
  '2026 Ev Tekstili Trendleri: Soft Minimal Zirvede', '2026 Home Textile Trends: Soft Minimal at the Top',
  NULL, NULL, NULL,
  'Tekstil sektörünün önde gelen analistleri, 2026 yılında Soft Minimal trendin ev tekstilinde dominant olacağını öngörüyor. Keten, organik pamuk ve nötr tonlar öne çıkıyor.',
  'Leading textile industry analysts predict that the Soft Minimal trend will dominate home textiles in 2026. Linen, organic cotton and neutral tones are in the spotlight.',
  'Soft Minimal trendi 2026''da ev tekstilini domine edecek...',
  'Ayşe Kaya', 'trends',
  '["soft-minimal","linen","2026-trends","home-textile","organic"]',
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&q=80',
  'https://trtex.com/haberler/2026-ev-tekstili-trendleri',
  CURRENT_TIMESTAMP - INTERVAL '2 days',
  true, '["hometex","heimtex"]', 4, true
),
(
  'trtex', 'trtex-002',
  'Türk Tekstil İhracatı Rekor Kırdı: 8.2 Milyar Dolar', 'Turkish Textile Exports Break Record: $8.2 Billion',
  NULL, NULL, NULL,
  'Türkiye''nin ev tekstili ihracatı 2025 yılında 8.2 milyar dolara ulaşarak tarihi rekor kırdı. Avrupa ve ABD pazarları en büyük alıcılar olmaya devam ediyor.',
  'Turkey''s home textile exports reached $8.2 billion in 2025, breaking a historic record. European and US markets continue to be the largest buyers.',
  'Türk tekstil ihracatı 8.2 milyar dolarla rekor kırdı...',
  'Mehmet Demir', 'industry-news',
  '["turkey","export","record","home-textile","industry"]',
  'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&q=80',
  'https://trtex.com/haberler/turk-tekstil-ihracati-rekor',
  CURRENT_TIMESTAMP - INTERVAL '5 days',
  true, '["hometex","heimtex"]', 3, true
),
(
  'trtex', 'trtex-003',
  'Çin Tekstil Devleri Global Pazarda: Luolai ve Fuanna Analizi', 'Chinese Textile Giants in Global Market: Luolai and Fuanna Analysis',
  NULL, NULL, NULL,
  'Çin''in önde gelen ev tekstili markaları Luolai ve Fuanna, global pazarda agresif büyüme stratejileri izliyor. Premium segment hedefleniyor.',
  'China''s leading home textile brands Luolai and Fuanna are pursuing aggressive growth strategies in the global market. The premium segment is being targeted.',
  'Luolai ve Fuanna global pazarda premium segmenti hedefliyor...',
  'Li Wei', 'brand-analysis',
  '["china","luolai","fuanna","global-market","premium"]',
  'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=400&q=80',
  'https://trtex.com/haberler/cin-tekstil-devleri-analiz',
  CURRENT_TIMESTAMP - INTERVAL '7 days',
  false, '["hometex"]', 5, true
),
(
  'trtex', 'trtex-004',
  'Sürdürülebilir Tekstil: Organik Sertifikalar Artıyor', 'Sustainable Textiles: Organic Certifications on the Rise',
  'Nachhaltige Textilien: Bio-Zertifizierungen auf dem Vormarsch',
  NULL, NULL,
  'GOTS, OEKO-TEX ve BCI sertifikalı tekstil ürünlerine olan talep 2025''te %34 arttı. Tüketiciler artık sürdürülebilirliği öncelik olarak görüyor.',
  'Demand for GOTS, OEKO-TEX and BCI certified textile products increased by 34% in 2025. Consumers now see sustainability as a priority.',
  'Organik sertifikalı tekstil talebinde %34 artış...',
  'Sarah Mueller', 'sustainability',
  '["sustainability","organic","GOTS","OEKO-TEX","eco-friendly"]',
  'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=400&q=80',
  'https://trtex.com/haberler/surdurulebilir-tekstil-sertifikalar',
  CURRENT_TIMESTAMP - INTERVAL '10 days',
  false, '["hometex","heimtex"]', 4, true
),
(
  'trtex', 'trtex-005',
  'Dijital Fuar Devrimi: Sanal Standlar Fiziksel Fuarları Geçiyor', 'Digital Fair Revolution: Virtual Stands Surpassing Physical Fairs',
  'Digitale Messerevolution: Virtuelle Stände übertreffen physische Messen',
  NULL, NULL,
  'Yapay zeka destekli sanal fuar platformları, 2025 yılında fiziksel fuar katılımını %23 oranında geride bıraktı. Hometex.ai bu dönüşümün öncüsü.',
  'AI-powered virtual fair platforms surpassed physical fair attendance by 23% in 2025. Hometex.ai is the pioneer of this transformation.',
  'Sanal fuar platformları fiziksel fuarları geride bıraktı...',
  'Hometex Editorial', 'digital-transformation',
  '["virtual-fair","AI","digital","hometex","transformation"]',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  'https://trtex.com/haberler/dijital-fuar-devrimi',
  CURRENT_TIMESTAMP - INTERVAL '1 day',
  true, '["hometex","heimtex"]', 3, true
);

-- ============================================================
-- SEED DATA — PLATFORM INTEGRATIONS
-- ============================================================

INSERT INTO platform_integrations (
  platform_name, platform_url, platform_type,
  display_name_en, display_name_tr, display_name_de, display_name_ar, display_name_ru,
  description_en, description_tr, description_de,
  sync_enabled, sync_interval_minutes,
  supported_domains, is_active,
  integration_config
) VALUES
(
  'trtex', 'https://trtex.com', 'news_portal',
  'TRTEX News Portal', 'TRTEX Haber Portalı', 'TRTEX Nachrichtenportal',
  'بوابة أخبار TRTEX', 'Новостной портал TRTEX',
  'Turkey''s leading home textile news portal. Provides industry news, brand analysis and trend reports.',
  'Türkiye''nin önde gelen ev tekstili haber portalı. Sektör haberleri, marka analizleri ve trend raporları sağlar.',
  'Türkeis führendes Heimtextil-Nachrichtenportal. Bietet Branchennachrichten, Markenanalysen und Trendberichte.',
  true, 60,
  '["hometex","heimtex"]', true,
  '{"api_version":"v1","news_categories":["trends","industry","brands","sustainability"],"max_articles_per_sync":20}'
),
(
  'perde_ai', 'https://perde.ai', 'design_tool',
  'Perde.ai Design Studio', 'Perde.ai Tasarım Stüdyosu', 'Perde.ai Design-Studio',
  'استوديو تصميم Perde.ai', 'Дизайн-студия Perde.ai',
  'AI-powered curtain and interior design tool. Users can visualize textile styles in their own spaces.',
  'Yapay zeka destekli perde ve iç mekân tasarım aracı. Kullanıcılar tekstil stillerini kendi mekânlarında görselleştirebilir.',
  'KI-gestütztes Vorhang- und Innendesign-Tool. Benutzer können Textilistile in ihren eigenen Räumen visualisieren.',
  true, 0,
  '["hometex","heimtex"]', true,
  '{"deep_link_base":"https://perde.ai","utm_source":"hometex","utm_medium":"collection_cta","style_param":"style","room_param":"room"}'
)
ON CONFLICT (platform_name) DO UPDATE SET
  updated_at = CURRENT_TIMESTAMP;

-- ============================================================
-- SEED DATA — AI AGENT TASKS (Initial Bootstrap)
-- ============================================================

INSERT INTO ai_agent_tasks (
  agent_type, task_type, task_priority,
  target_entity_type, input_data,
  status, scheduled_at, triggered_by, domain_key
) VALUES
(
  'master', 'bootstrap_platform', 1,
  'platform',
  '{"action":"initial_setup","domains":["hometex","heimtex"],"seed_data":true}',
  'completed', CURRENT_TIMESTAMP - INTERVAL '1 hour', 'system', 'both'
),
(
  'trend', 'calculate_trend_scores', 3,
  'collection',
  '{"scope":"all_active","recalc_interval_hours":24}',
  'pending', CURRENT_TIMESTAMP + INTERVAL '1 hour', 'scheduler', 'hometex'
),
(
  'fair', 'update_brand_rankings', 4,
  'brand',
  '{"scope":"all_active","ranking_factors":["views","clicks","perde_ai_redirects","recency"]}',
  'pending', CURRENT_TIMESTAMP + INTERVAL '2 hours', 'scheduler', 'both'
),
(
  'match', 'generate_recommendations', 5,
  'collection',
  '{"algorithm":"ai_similarity","min_score":60,"max_recommendations_per_item":6}',
  'pending', CURRENT_TIMESTAMP + INTERVAL '3 hours', 'scheduler', 'hometex'
),
(
  'conversion', 'optimize_perde_ai_links', 6,
  'perde_ai_style_links',
  '{"optimize_for":"click_through_rate","ab_test":false}',
  'pending', CURRENT_TIMESTAMP + INTERVAL '4 hours', 'scheduler', 'hometex'
),
(
  'analytics', 'aggregate_daily_metrics', 7,
  'platform',
  '{"metrics":["views","clicks","conversions","dwell_time"],"period":"daily"}',
  'pending', CURRENT_TIMESTAMP + INTERVAL '6 hours', 'scheduler', 'both'
);

-- ============================================================
-- SEED DATA — PERDE.AI STYLE LINKS (Trend Cards)
-- ============================================================

INSERT INTO perde_ai_style_links (
  source_type, source_id,
  source_domain, style_name,
  style_prompt, style_config,
  room_type_suggestion,
  deep_link_url, short_link_code,
  utm_source, utm_medium, utm_campaign,
  is_active
)
SELECT
  'trend',
  tc.id,
  'hometex',
  tc.trend_name_en,
  tc.perde_ai_style_prompt,
  jsonb_build_object(
    'style_category', tc.style_category,
    'style_tags', tc.style_tags,
    'color_palette', tc.color_palette,
    'trend_score', tc.trend_score
  ),
  CASE tc.style_category
    WHEN 'minimal' THEN 'living_room'
    WHEN 'luxury' THEN 'bedroom'
    WHEN 'natural' THEN 'living_room'
    WHEN 'dramatic' THEN 'bedroom'
    WHEN 'boho' THEN 'living_room'
    ELSE 'living_room'
  END,
  tc.perde_ai_deep_link,
  LOWER(REPLACE(tc.trend_name_en, ' ', '-')) || '-' || tc.id::text,
  'hometex', 'trend_card',
  'trend_' || tc.style_category || '_2026',
  true
FROM trend_cards tc
WHERE tc.domain_key = 'hometex' AND tc.perde_ai_deep_link IS NOT NULL
ON CONFLICT (short_link_code) DO NOTHING;

-- ============================================================
-- SEED DATA — CONTENT FEED RANKINGS (Initial)
-- ============================================================

INSERT INTO content_feed_rankings (
  domain_key, content_type, content_id,
  base_score, recency_score, engagement_score, trend_score,
  conversion_score, sponsor_boost, final_rank_score,
  feed_type, language_code, current_position
)
SELECT
  'hometex', 'trend', id,
  trend_score * 0.4,
  CASE trend_direction
    WHEN 'breakout' THEN 30
    WHEN 'viral' THEN 35
    WHEN 'rising' THEN 20
    WHEN 'stable' THEN 10
    ELSE 5
  END,
  (click_count * 0.1 + impression_count * 0.01),
  trend_score * 0.3,
  perde_ai_redirect_count * 0.5,
  CASE WHEN is_featured THEN 10 ELSE 0 END,
  trend_score * 0.4 + trend_score * 0.3 + CASE WHEN is_featured THEN 10 ELSE 0 END,
  'homepage', 'tr',
  ROW_NUMBER() OVER (ORDER BY trend_score DESC)::integer
FROM trend_cards
WHERE domain_key = 'hometex' AND is_active = true;

-- ============================================================
-- SEED DATA — TREND SIGNALS
-- ============================================================

INSERT INTO trend_signals (
  signal_source, signal_type, keyword, style_tag,
  region, signal_strength, confidence_score,
  related_categories,
  is_processed, domain_key,
  valid_from, valid_until
) VALUES
(
  'ai_generated', 'style_trend', 'soft minimal', 'soft-minimal',
  'global', 95.0, 92.0,
  '["curtains","upholstery","bedding"]',
  true, 'both',
  CURRENT_TIMESTAMP - INTERVAL '7 days',
  CURRENT_TIMESTAMP + INTERVAL '90 days'
),
(
  'ai_generated', 'style_trend', 'hotel luxury', 'hotel-luxury',
  'global', 88.0, 85.0,
  '["curtains","bedding","accessories"]',
  true, 'both',
  CURRENT_TIMESTAMP - INTERVAL '7 days',
  CURRENT_TIMESTAMP + INTERVAL '90 days'
),
(
  'ai_generated', 'style_trend', 'natural linen', 'natural-linen',
  'europe', 85.0, 88.0,
  '["curtains","upholstery","accessories"]',
  true, 'both',
  CURRENT_TIMESTAMP - INTERVAL '7 days',
  CURRENT_TIMESTAMP + INTERVAL '90 days'
),
(
  'ai_generated', 'style_trend', 'dark velvet', 'dark-velvet',
  'global', 79.0, 76.0,
  '["curtains","upholstery"]',
  true, 'hometex',
  CURRENT_TIMESTAMP - INTERVAL '7 days',
  CURRENT_TIMESTAMP + INTERVAL '90 days'
),
(
  'trtex_news', 'market_signal', 'sustainable textile', 'eco-friendly',
  'global', 82.0, 79.0,
  '["curtains","upholstery","bedding","accessories"]',
  true, 'both',
  CURRENT_TIMESTAMP - INTERVAL '10 days',
  CURRENT_TIMESTAMP + INTERVAL '60 days'
),
(
  'internal_analytics', 'user_behavior', 'velvet curtain', 'velvet',
  'turkey', 74.0, 71.0,
  '["curtains"]',
  false, 'hometex',
  CURRENT_TIMESTAMP - INTERVAL '3 days',
  CURRENT_TIMESTAMP + INTERVAL '30 days'
),
(
  'internal_analytics', 'user_behavior', 'linen curtain', 'linen',
  'europe', 78.0, 75.0,
  '["curtains","upholstery"]',
  false, 'both',
  CURRENT_TIMESTAMP - INTERVAL '3 days',
  CURRENT_TIMESTAMP + INTERVAL '30 days'
),
(
  'ai_generated', 'color_trend', 'warm beige', NULL,
  '#C4A882', 86.0, 83.0,
  '["curtains","upholstery","accessories"]',
  true, 'both',
  CURRENT_TIMESTAMP - INTERVAL '5 days',
  CURRENT_TIMESTAMP + INTERVAL '60 days'
);

-- ============================================================
-- SEED DATA — PLATFORM ANALYTICS (Initial Metrics)
-- ============================================================

INSERT INTO platform_analytics (metric_type, metric_value, dimensions, recorded_at) VALUES
('total_brands', 173, '{"domain":"hometex","region":"all"}', CURRENT_TIMESTAMP),
('total_collections', 487, '{"domain":"hometex","region":"all"}', CURRENT_TIMESTAMP),
('total_products', 2840, '{"domain":"hometex","region":"all"}', CURRENT_TIMESTAMP),
('total_visitors_today', 1247, '{"domain":"hometex"}', CURRENT_TIMESTAMP),
('total_visitors_week', 8934, '{"domain":"hometex"}', CURRENT_TIMESTAMP),
('perde_ai_redirects_today', 342, '{"domain":"hometex"}', CURRENT_TIMESTAMP),
('perde_ai_redirects_week', 2156, '{"domain":"hometex"}', CURRENT_TIMESTAMP),
('trtex_clicks_today', 89, '{"domain":"hometex"}', CURRENT_TIMESTAMP),
('avg_session_duration_seconds', 247, '{"domain":"hometex"}', CURRENT_TIMESTAMP),
('top_region_turkey', 48, '{"domain":"hometex","metric":"brand_count"}', CURRENT_TIMESTAMP),
('top_region_china', 62, '{"domain":"hometex","metric":"brand_count"}', CURRENT_TIMESTAMP),
('conversion_rate_perde_ai', 27.4, '{"domain":"hometex","unit":"percent"}', CURRENT_TIMESTAMP),
('total_brands', 85, '{"domain":"heimtex","region":"all"}', CURRENT_TIMESTAMP),
('total_collections', 198, '{"domain":"heimtex","region":"all"}', CURRENT_TIMESTAMP),
('total_visitors_today', 423, '{"domain":"heimtex"}', CURRENT_TIMESTAMP);

-- ============================================================
-- INDEXES FOR NEW COLUMNS
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_brand_profiles_trtex_slug ON brand_profiles(trtex_brand_slug);
CREATE INDEX IF NOT EXISTS idx_fair_events_slug ON fair_events(slug);
CREATE INDEX IF NOT EXISTS idx_news_feed_cache_related_brands ON news_feed_cache USING gin(related_brand_ids);
CREATE INDEX IF NOT EXISTS idx_collections_is_trending ON collections(is_trending) WHERE is_trending = true;
CREATE INDEX IF NOT EXISTS idx_collections_is_featured ON collections(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_collections_trend_score ON collections(trend_score DESC);
CREATE INDEX IF NOT EXISTS idx_collection_trend_scores_brand_name ON collection_trend_scores(brand_name);
CREATE INDEX IF NOT EXISTS idx_showroom_gallery_room_type ON showroom_gallery_items(room_type);

-- ============================================================
-- HOMETEX.AI — KURUMSAL DESIGN SYSTEM
-- Referans: Heimtextil, Maison&Objet, Salone del Mobile
-- Palet: Warm Ivory + Deep Navy + Corporate Gold
-- ============================================================

-- 1. DESIGN SYSTEM TOKENS (Renk, Gölge, Boşluk, Border)
ALTER TABLE design_system_tokens ADD COLUMN IF NOT EXISTS id BIGSERIAL PRIMARY KEY;
ALTER TABLE design_system_tokens ADD COLUMN IF NOT EXISTS domain_key VARCHAR(50) NOT NULL DEFAULT 'hometex';
ALTER TABLE design_system_tokens ADD COLUMN IF NOT EXISTS token_category VARCHAR(100) NOT NULL;
ALTER TABLE design_system_tokens ADD COLUMN IF NOT EXISTS token_name VARCHAR(200) NOT NULL;
ALTER TABLE design_system_tokens ADD COLUMN IF NOT EXISTS token_value TEXT NOT NULL;
ALTER TABLE design_system_tokens ADD COLUMN IF NOT EXISTS token_description TEXT;
ALTER TABLE design_system_tokens ADD COLUMN IF NOT EXISTS token_type VARCHAR(50) DEFAULT 'color';
ALTER TABLE design_system_tokens ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE design_system_tokens ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE design_system_tokens ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX IF NOT EXISTS idx_design_tokens_unique ON design_system_tokens(domain_key, token_name);
CREATE INDEX IF NOT EXISTS idx_design_tokens_category ON design_system_tokens(token_category);
CREATE INDEX IF NOT EXISTS idx_design_tokens_domain ON design_system_tokens(domain_key);

-- 2. UI THEME CONFIGS (Tema Konfigürasyonu)
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS id BIGSERIAL PRIMARY KEY;
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS domain_key VARCHAR(50) NOT NULL DEFAULT 'hometex';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS theme_name VARCHAR(200) NOT NULL;
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS theme_version VARCHAR(20) DEFAULT '1.0.0';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS color_mode VARCHAR(20) DEFAULT 'light';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS primary_bg VARCHAR(7) DEFAULT '#FAFAF7';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS secondary_bg VARCHAR(7) DEFAULT '#F2EDE4';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS surface_color VARCHAR(7) DEFAULT '#FFFFFF';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS dark_surface VARCHAR(7) DEFAULT '#0D1B2A';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS accent_primary VARCHAR(7) DEFAULT '#C9A84C';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS accent_secondary VARCHAR(7) DEFAULT '#B87333';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS accent_tertiary VARCHAR(7) DEFAULT '#8B6914';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS text_primary VARCHAR(7) DEFAULT '#1A1A2E';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS text_secondary VARCHAR(7) DEFAULT '#4A4A6A';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS text_muted VARCHAR(7) DEFAULT '#8A8AA0';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS text_inverse VARCHAR(7) DEFAULT '#FAFAF7';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS border_color VARCHAR(7) DEFAULT '#E8E2D9';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS border_strong VARCHAR(7) DEFAULT '#C9A84C';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS hero_overlay_color VARCHAR(7) DEFAULT '#0D1B2A';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS hero_overlay_opacity NUMERIC(3,2) DEFAULT 0.55;
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS card_shadow TEXT DEFAULT '0 4px 24px rgba(13,27,42,0.08), 0 1px 4px rgba(13,27,42,0.04)';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS card_shadow_hover TEXT DEFAULT '0 16px 48px rgba(13,27,42,0.16), 0 4px 12px rgba(201,168,76,0.12)';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS card_border_radius VARCHAR(20) DEFAULT '2px';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS button_border_radius VARCHAR(20) DEFAULT '1px';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS section_padding_desktop VARCHAR(50) DEFAULT '120px 80px';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS section_padding_mobile VARCHAR(50) DEFAULT '64px 24px';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS grid_gap_desktop VARCHAR(20) DEFAULT '32px';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS grid_gap_mobile VARCHAR(20) DEFAULT '16px';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS max_content_width VARCHAR(20) DEFAULT '1440px';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS navbar_bg VARCHAR(7) DEFAULT '#FAFAF7';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS navbar_bg_scrolled VARCHAR(7) DEFAULT '#FAFAF7';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS navbar_border_bottom VARCHAR(100) DEFAULT '1px solid #E8E2D9';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS navbar_height_desktop VARCHAR(20) DEFAULT '80px';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS navbar_height_mobile VARCHAR(20) DEFAULT '64px';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS footer_bg VARCHAR(7) DEFAULT '#0D1B2A';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS footer_text VARCHAR(7) DEFAULT '#FAFAF7';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS footer_accent VARCHAR(7) DEFAULT '#C9A84C';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS transition_default VARCHAR(100) DEFAULT 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS transition_fast VARCHAR(100) DEFAULT 'all 0.2s ease';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS transition_slow VARCHAR(100) DEFAULT 'all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS animation_entrance VARCHAR(100) DEFAULT 'fadeInUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS scroll_behavior VARCHAR(50) DEFAULT 'smooth';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS cursor_style VARCHAR(50) DEFAULT 'default';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS selection_bg VARCHAR(7) DEFAULT '#C9A84C';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS selection_text VARCHAR(7) DEFAULT '#FAFAF7';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS extended_config JSONB DEFAULT '{}';
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE ui_theme_configs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_ui_theme_domain ON ui_theme_configs(domain_key);
CREATE INDEX IF NOT EXISTS idx_ui_theme_active ON ui_theme_configs(is_active, is_default);

-- 3. TYPOGRAPHY CONFIGS (Tipografi Sistemi)
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS id BIGSERIAL PRIMARY KEY;
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS domain_key VARCHAR(50) NOT NULL DEFAULT 'hometex';
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS config_name VARCHAR(200) NOT NULL;
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS font_display VARCHAR(200) DEFAULT 'Cormorant Garamond';
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS font_display_url TEXT DEFAULT 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,600&display=swap';
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS font_heading VARCHAR(200) DEFAULT 'Playfair Display';
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS font_heading_url TEXT DEFAULT 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&display=swap';
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS font_body VARCHAR(200) DEFAULT 'Inter';
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS font_body_url TEXT DEFAULT 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS font_label VARCHAR(200) DEFAULT 'DM Sans';
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS font_label_url TEXT DEFAULT 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700&display=swap';
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS font_mono VARCHAR(200) DEFAULT 'JetBrains Mono';
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS scale_hero_size VARCHAR(20) DEFAULT 'clamp(56px, 7vw, 96px)';
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS scale_hero_line_height VARCHAR(20) DEFAULT '1.05';
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS scale_hero_letter_spacing VARCHAR(20) DEFAULT '-0.02em';
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS scale_hero_weight VARCHAR(10) DEFAULT '300';
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS scale_h1_size VARCHAR(20) DEFAULT 'clamp(40px, 5vw, 72px)';
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS scale_h1_line_height VARCHAR(20) DEFAULT '1.1';
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS scale_h1_letter_spacing VARCHAR(20) DEFAULT '-0.015em';
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS scale_h1_weight VARCHAR(10) DEFAULT '400';
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS scale_h2_size VARCHAR(20) DEFAULT 'clamp(28px, 3.5vw, 48px)';
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS scale_h2_line_height VARCHAR(20) DEFAULT '1.15';
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS scale_h2_weight VARCHAR(10) DEFAULT '400';
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS scale_h3_size VARCHAR(20) DEFAULT 'clamp(20px, 2.5vw, 32px)';
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS scale_h3_weight VARCHAR(10) DEFAULT '500';
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS scale_body_size VARCHAR(20) DEFAULT '16px';
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS scale_body_line_height VARCHAR(20) DEFAULT '1.7';
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS scale_body_weight VARCHAR(10) DEFAULT '400';
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS scale_small_size VARCHAR(20) DEFAULT '13px';
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS scale_label_size VARCHAR(20) DEFAULT '11px';
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS scale_label_letter_spacing VARCHAR(20) DEFAULT '0.12em';
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS scale_label_weight VARCHAR(10) DEFAULT '600';
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS scale_label_transform VARCHAR(20) DEFAULT 'uppercase';
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS rtl_font_body VARCHAR(200) DEFAULT 'Noto Sans Arabic';
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS rtl_font_heading VARCHAR(200) DEFAULT 'Noto Serif Arabic';
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS rtl_font_url TEXT DEFAULT 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700&family=Noto+Serif+Arabic:wght@400;600;700&display=swap';
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE typography_configs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_typography_domain ON typography_configs(domain_key);

-- 4. PAGE LAYOUT CONFIGS (Sayfa Düzeni)
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS id BIGSERIAL PRIMARY KEY;
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS domain_key VARCHAR(50) NOT NULL DEFAULT 'hometex';
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS page_type VARCHAR(100) NOT NULL;
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS layout_name VARCHAR(200) NOT NULL;
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS section_order JSONB DEFAULT '[]';
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS hero_style VARCHAR(50) DEFAULT 'fullscreen';
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS hero_height_desktop VARCHAR(20) DEFAULT '100vh';
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS hero_height_mobile VARCHAR(20) DEFAULT '85vh';
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS hero_content_position VARCHAR(50) DEFAULT 'center-left';
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS hero_text_align VARCHAR(20) DEFAULT 'left';
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS hero_badge_style VARCHAR(50) DEFAULT 'pill-outline-gold';
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS hero_title_style VARCHAR(50) DEFAULT 'display-serif-light';
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS hero_cta_style VARCHAR(50) DEFAULT 'split-buttons';
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS trend_block_columns_desktop INTEGER DEFAULT 4;
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS trend_block_columns_mobile INTEGER DEFAULT 2;
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS trend_card_style VARCHAR(50) DEFAULT 'portrait-overlay';
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS trend_card_aspect_ratio VARCHAR(20) DEFAULT '3/4';
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS trend_card_hover_effect VARCHAR(50) DEFAULT 'scale-reveal';
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS collection_grid_style VARCHAR(50) DEFAULT 'asymmetric-editorial';
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS collection_grid_columns_desktop INTEGER DEFAULT 3;
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS collection_card_style VARCHAR(50) DEFAULT 'magazine-full-bleed';
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS collection_card_aspect_ratio VARCHAR(20) DEFAULT '4/5';
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS brand_grid_style VARCHAR(50) DEFAULT 'logo-showcase';
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS brand_grid_columns_desktop INTEGER DEFAULT 4;
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS brand_card_style VARCHAR(50) DEFAULT 'showroom-preview';
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS showroom_layout VARCHAR(50) DEFAULT 'editorial-full';
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS showroom_hero_style VARCHAR(50) DEFAULT 'parallax-overlay';
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS showroom_collection_grid VARCHAR(50) DEFAULT 'masonry-3col';
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS global_filter_style VARCHAR(50) DEFAULT 'pill-tabs-gold';
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS global_filter_position VARCHAR(50) DEFAULT 'sticky-below-hero';
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS scroll_animation VARCHAR(50) DEFAULT 'fade-up-stagger';
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS scroll_animation_duration INTEGER DEFAULT 800;
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS scroll_animation_stagger INTEGER DEFAULT 120;
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS cursor_custom BOOLEAN DEFAULT false;
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS grain_texture_overlay BOOLEAN DEFAULT true;
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS grain_texture_opacity NUMERIC(3,2) DEFAULT 0.03;
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS section_divider_style VARCHAR(50) DEFAULT 'thin-gold-line';
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS cta_perde_ai_style VARCHAR(50) DEFAULT 'floating-gold-pill';
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS cta_perde_ai_position VARCHAR(50) DEFAULT 'bottom-right-sticky';
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS extended_layout JSONB DEFAULT '{}';
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE page_layout_configs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_page_layout_domain ON page_layout_configs(domain_key);
CREATE INDEX IF NOT EXISTS idx_page_layout_type ON page_layout_configs(page_type);

-- 5. BRAND_PROFILES — Görsel Kimlik Alanları Ekleme
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS visual_identity JSONB DEFAULT '{
  "primary_color": "#C9A84C",
  "secondary_color": "#0D1B2A",
  "card_style": "editorial",
  "image_treatment": "warm",
  "badge_style": "pill-outline"
}';
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS editorial_tagline_tr VARCHAR(300);
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS editorial_tagline_en VARCHAR(300);
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS editorial_tagline_de VARCHAR(300);
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS editorial_tagline_ar VARCHAR(300);
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS editorial_tagline_ru VARCHAR(300);
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS showroom_ambiance VARCHAR(50) DEFAULT 'warm-luxury';
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS gallery_layout VARCHAR(50) DEFAULT 'masonry';
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS award_badges JSONB DEFAULT '[]';

-- 6. COLLECTIONS — Editorial Layout Alanları Ekleme
ALTER TABLE collections ADD COLUMN IF NOT EXISTS editorial_layout_style VARCHAR(50) DEFAULT 'magazine-full';
ALTER TABLE collections ADD COLUMN IF NOT EXISTS hero_text_position VARCHAR(50) DEFAULT 'bottom-left';
ALTER TABLE collections ADD COLUMN IF NOT EXISTS card_accent_color VARCHAR(7) DEFAULT '#C9A84C';
ALTER TABLE collections ADD COLUMN IF NOT EXISTS mood_keywords JSONB DEFAULT '[]';
ALTER TABLE collections ADD COLUMN IF NOT EXISTS material_tags JSONB DEFAULT '[]';
ALTER TABLE collections ADD COLUMN IF NOT EXISTS room_types JSONB DEFAULT '[]';
ALTER TABLE collections ADD COLUMN IF NOT EXISTS ai_commentary_de TEXT;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS ai_commentary_ar TEXT;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS ai_commentary_ru TEXT;

-- 7. TREND_CARDS — Kurumsal Renk Alanları Güncelleme
ALTER TABLE trend_cards ADD COLUMN IF NOT EXISTS card_bg_color VARCHAR(7) DEFAULT '#F2EDE4';
ALTER TABLE trend_cards ADD COLUMN IF NOT EXISTS card_text_color VARCHAR(7) DEFAULT '#1A1A2E';
ALTER TABLE trend_cards ADD COLUMN IF NOT EXISTS card_overlay_style VARCHAR(50) DEFAULT 'gradient-bottom-navy';
ALTER TABLE trend_cards ADD COLUMN IF NOT EXISTS editorial_subtitle_tr VARCHAR(300);
ALTER TABLE trend_cards ADD COLUMN IF NOT EXISTS editorial_subtitle_en VARCHAR(300);
ALTER TABLE trend_cards ADD COLUMN IF NOT EXISTS trend_name_ar VARCHAR(200);
ALTER TABLE trend_cards ADD COLUMN IF NOT EXISTS trend_name_ru VARCHAR(200);
ALTER TABLE trend_cards ADD COLUMN IF NOT EXISTS trend_description_ar TEXT;
ALTER TABLE trend_cards ADD COLUMN IF NOT EXISTS trend_description_ru TEXT;
ALTER TABLE trend_cards ADD COLUMN IF NOT EXISTS ai_commentary_de TEXT;
ALTER TABLE trend_cards ADD COLUMN IF NOT EXISTS ai_commentary_ar TEXT;
ALTER TABLE trend_cards ADD COLUMN IF NOT EXISTS ai_commentary_ru TEXT;

-- 8. HOMEPAGE_HERO_SLIDES — Kurumsal Overlay Güncelleme
ALTER TABLE homepage_hero_slides ADD COLUMN IF NOT EXISTS overlay_gradient TEXT DEFAULT 'linear-gradient(135deg, rgba(13,27,42,0.75) 0%, rgba(13,27,42,0.35) 60%, rgba(13,27,42,0.15) 100%)';
ALTER TABLE homepage_hero_slides ADD COLUMN IF NOT EXISTS badge_text_tr VARCHAR(100);
ALTER TABLE homepage_hero_slides ADD COLUMN IF NOT EXISTS badge_text_en VARCHAR(100);
ALTER TABLE homepage_hero_slides ADD COLUMN IF NOT EXISTS badge_text_de VARCHAR(100);
ALTER TABLE homepage_hero_slides ADD COLUMN IF NOT EXISTS badge_text_ar VARCHAR(100);
ALTER TABLE homepage_hero_slides ADD COLUMN IF NOT EXISTS badge_text_ru VARCHAR(100);
ALTER TABLE homepage_hero_slides ADD COLUMN IF NOT EXISTS badge_style VARCHAR(50) DEFAULT 'pill-outline-gold';
ALTER TABLE homepage_hero_slides ADD COLUMN IF NOT EXISTS title_font_style VARCHAR(50) DEFAULT 'display-serif-light';
ALTER TABLE homepage_hero_slides ADD COLUMN IF NOT EXISTS subtitle_font_style VARCHAR(50) DEFAULT 'body-regular';
ALTER TABLE homepage_hero_slides ADD COLUMN IF NOT EXISTS cta_primary_style VARCHAR(50) DEFAULT 'solid-gold';
ALTER TABLE homepage_hero_slides ADD COLUMN IF NOT EXISTS cta_secondary_style VARCHAR(50) DEFAULT 'outline-white';
ALTER TABLE homepage_hero_slides ADD COLUMN IF NOT EXISTS content_position VARCHAR(50) DEFAULT 'center-left';
ALTER TABLE homepage_hero_slides ADD COLUMN IF NOT EXISTS parallax_enabled BOOLEAN DEFAULT true;
ALTER TABLE homepage_hero_slides ADD COLUMN IF NOT EXISTS grain_overlay BOOLEAN DEFAULT true;

-- ============================================================
-- TEST DATA — DESIGN SYSTEM TOKENS
-- ============================================================

INSERT INTO design_system_tokens (domain_key, token_category, token_name, token_value, token_description, token_type) VALUES

-- RENK PALETİ — BACKGROUNDS
('hometex', 'color-background', 'bg-primary', '#FAFAF7', 'Ana sayfa arka planı — sıcak krem (Maison&Objet etkisi)', 'color'),
('hometex', 'color-background', 'bg-secondary', '#F2EDE4', 'İkincil arka plan — antik keten', 'color'),
('hometex', 'color-background', 'bg-surface', '#FFFFFF', 'Kart ve panel yüzeyleri', 'color'),
('hometex', 'color-background', 'bg-dark', '#0D1B2A', 'Koyu yüzey — derin lacivert (Heimtextil etkisi)', 'color'),
('hometex', 'color-background', 'bg-dark-secondary', '#162233', 'İkincil koyu yüzey', 'color'),
('hometex', 'color-background', 'bg-overlay', 'rgba(13,27,42,0.55)', 'Hero overlay — lacivert', 'color'),

-- RENK PALETİ — ACCENT
('hometex', 'color-accent', 'accent-gold', '#C9A84C', 'Kurumsal altın — ana aksan rengi', 'color'),
('hometex', 'color-accent', 'accent-gold-light', '#E8D08A', 'Açık altın — hover durumları', 'color'),
('hometex', 'color-accent', 'accent-gold-dark', '#8B6914', 'Koyu altın — pressed durumları', 'color'),
('hometex', 'color-accent', 'accent-copper', '#B87333', 'Bakır — sıcaklık aksanı', 'color'),
('hometex', 'color-accent', 'accent-copper-light', '#D4956A', 'Açık bakır', 'color'),
('hometex', 'color-accent', 'accent-navy', '#1E3A5F', 'Orta lacivert — ikincil aksan', 'color'),

-- RENK PALETİ — TEXT
('hometex', 'color-text', 'text-primary', '#1A1A2E', 'Ana metin — neredeyse siyah lacivert', 'color'),
('hometex', 'color-text', 'text-secondary', '#4A4A6A', 'İkincil metin — orta ton', 'color'),
('hometex', 'color-text', 'text-muted', '#8A8AA0', 'Soluk metin — yardımcı bilgiler', 'color'),
('hometex', 'color-text', 'text-inverse', '#FAFAF7', 'Ters metin — koyu arka plan üzeri', 'color'),
('hometex', 'color-text', 'text-gold', '#C9A84C', 'Altın metin — vurgu', 'color'),
('hometex', 'color-text', 'text-link', '#8B6914', 'Link rengi', 'color'),

-- RENK PALETİ — BORDER
('hometex', 'color-border', 'border-default', '#E8E2D9', 'Varsayılan kenarlık — sıcak gri', 'color'),
('hometex', 'color-border', 'border-strong', '#C9A84C', 'Güçlü kenarlık — altın', 'color'),
('hometex', 'color-border', 'border-subtle', '#F0EBE3', 'Hafif kenarlık', 'color'),
('hometex', 'color-border', 'border-dark', '#2A3F5A', 'Koyu kenarlık', 'color'),

-- GÖLGE SİSTEMİ
('hometex', 'shadow', 'shadow-card', '0 4px 24px rgba(13,27,42,0.08), 0 1px 4px rgba(13,27,42,0.04)', 'Kart gölgesi', 'shadow'),
('hometex', 'shadow', 'shadow-card-hover', '0 16px 48px rgba(13,27,42,0.16), 0 4px 12px rgba(201,168,76,0.12)', 'Kart hover gölgesi — altın ton', 'shadow'),
('hometex', 'shadow', 'shadow-modal', '0 32px 80px rgba(13,27,42,0.24), 0 8px 24px rgba(13,27,42,0.12)', 'Modal gölgesi', 'shadow'),
('hometex', 'shadow', 'shadow-navbar', '0 2px 16px rgba(13,27,42,0.06)', 'Navbar gölgesi', 'shadow'),
('hometex', 'shadow', 'shadow-button', '0 4px 16px rgba(201,168,76,0.32)', 'Altın buton gölgesi', 'shadow'),
('hometex', 'shadow', 'shadow-image', '0 8px 32px rgba(13,27,42,0.20)', 'Görsel gölgesi', 'shadow'),

-- SPACING SİSTEMİ
('hometex', 'spacing', 'space-xs', '4px', 'Extra small boşluk', 'spacing'),
('hometex', 'spacing', 'space-sm', '8px', 'Small boşluk', 'spacing'),
('hometex', 'spacing', 'space-md', '16px', 'Medium boşluk', 'spacing'),
('hometex', 'spacing', 'space-lg', '32px', 'Large boşluk', 'spacing'),
('hometex', 'spacing', 'space-xl', '64px', 'Extra large boşluk', 'spacing'),
('hometex', 'spacing', 'space-2xl', '120px', '2X large — section padding', 'spacing'),
('hometex', 'spacing', 'space-3xl', '180px', '3X large — hero padding', 'spacing'),

-- BORDER RADIUS
('hometex', 'radius', 'radius-none', '0px', 'Köşesiz — kurumsal sertlik', 'radius'),
('hometex', 'radius', 'radius-xs', '2px', 'Minimal radius — kartlar', 'radius'),
('hometex', 'radius', 'radius-sm', '4px', 'Small radius — butonlar', 'radius'),
('hometex', 'radius', 'radius-md', '8px', 'Medium radius', 'radius'),
('hometex', 'radius', 'radius-pill', '100px', 'Pill — badge ve etiketler', 'radius'),
('hometex', 'radius', 'radius-circle', '50%', 'Daire — avatar', 'radius'),

-- HEIMTEX DOMAIN — ALMAN PAZARI (daha sert, daha minimal)
('heimtex', 'color-background', 'bg-primary', '#F8F6F2', 'Heimtex ana arka plan — daha sert krem', 'color'),
('heimtex', 'color-accent', 'accent-gold', '#B8960C', 'Heimtex altın — daha koyu, Alman estetiği', 'color'),
('heimtex', 'color-background', 'bg-dark', '#111827', 'Heimtex koyu — daha siyaha yakın', 'color'),
('heimtex', 'color-text', 'text-primary', '#111827', 'Heimtex ana metin — saf siyah', 'color');

-- ============================================================
-- TEST DATA — UI THEME CONFIGS
-- ============================================================

INSERT INTO ui_theme_configs (
  domain_key, theme_name, theme_version, color_mode,
  primary_bg, secondary_bg, surface_color, dark_surface,
  accent_primary, accent_secondary, accent_tertiary,
  text_primary, text_secondary, text_muted, text_inverse,
  border_color, border_strong,
  hero_overlay_color, hero_overlay_opacity,
  card_shadow, card_shadow_hover, card_border_radius, button_border_radius,
  section_padding_desktop, section_padding_mobile,
  navbar_bg, navbar_height_desktop, navbar_height_mobile,
  footer_bg, footer_text, footer_accent,
  transition_default, transition_fast, transition_slow,
  is_active, is_default
) VALUES (
  'hometex', 'Warm Ivory & Deep Navy — Corporate Edition', '2.0.0', 'light',
  '#FAFAF7', '#F2EDE4', '#FFFFFF', '#0D1B2A',
  '#C9A84C', '#B87333', '#8B6914',
  '#1A1A2E', '#4A4A6A', '#8A8AA0', '#FAFAF7',
  '#E8E2D9', '#C9A84C',
  '#0D1B2A', 0.55,
  '0 4px 24px rgba(13,27,42,0.08), 0 1px 4px rgba(13,27,42,0.04)',
  '0 16px 48px rgba(13,27,42,0.16), 0 4px 12px rgba(201,168,76,0.12)',
  '2px', '1px',
  '120px 80px', '64px 24px',
  '#FAFAF7', '80px', '64px',
  '#0D1B2A', '#FAFAF7', '#C9A84C',
  'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  'all 0.2s ease',
  'all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  true, true
),
(
  'heimtex', 'Heimtex — Deutsche Präzision', '2.0.0', 'light',
  '#F8F6F2', '#EEEBE4', '#FFFFFF', '#111827',
  '#B8960C', '#8B6914', '#6B4F0A',
  '#111827', '#374151', '#6B7280', '#F8F6F2',
  '#E5E0D8', '#B8960C',
  '#111827', 0.60,
  '0 2px 16px rgba(17,24,39,0.10), 0 1px 3px rgba(17,24,39,0.06)',
  '0 12px 40px rgba(17,24,39,0.18), 0 4px 12px rgba(184,150,12,0.10)',
  '0px', '0px',
  '100px 80px', '56px 24px',
  '#F8F6F2', '72px', '60px',
  '#111827', '#F8F6F2', '#B8960C',
  'all 0.3s ease',
  'all 0.15s ease',
  'all 0.6s ease',
  true, true
);

-- ============================================================
-- TEST DATA — TYPOGRAPHY CONFIGS
-- ============================================================

INSERT INTO typography_configs (
  domain_key, config_name,
  font_display, font_heading, font_body, font_label,
  scale_hero_size, scale_hero_line_height, scale_hero_letter_spacing, scale_hero_weight,
  scale_h1_size, scale_h1_line_height, scale_h1_letter_spacing, scale_h1_weight,
  scale_h2_size, scale_h2_line_height, scale_h2_weight,
  scale_h3_size, scale_h3_weight,
  scale_body_size, scale_body_line_height, scale_body_weight,
  scale_label_size, scale_label_letter_spacing, scale_label_weight, scale_label_transform,
  is_active
) VALUES
(
  'hometex', 'Hometex Corporate Typography System',
  'Cormorant Garamond', 'Playfair Display', 'Inter', 'DM Sans',
  'clamp(56px, 7vw, 96px)', '1.05', '-0.02em', '300',
  'clamp(40px, 5vw, 72px)', '1.1', '-0.015em', '400',
  'clamp(28px, 3.5vw, 48px)', '1.15', '400',
  'clamp(20px, 2.5vw, 32px)', '500',
  '16px', '1.7', '400',
  '11px', '0.12em', '600', 'uppercase',
  true
),
(
  'heimtex', 'Heimtex Deutsche Typografie',
  'Cormorant Garamond', 'Playfair Display', 'Inter', 'DM Sans',
  'clamp(48px, 6vw, 80px)', '1.08', '-0.025em', '300',
  'clamp(36px, 4.5vw, 64px)', '1.12', '-0.02em', '400',
  'clamp(24px, 3vw, 40px)', '1.18', '400',
  'clamp(18px, 2vw, 28px)', '500',
  '15px', '1.65', '400',
  '10px', '0.15em', '700', 'uppercase',
  true
);

-- ============================================================
-- TEST DATA — PAGE LAYOUT CONFIGS
-- ============================================================

INSERT INTO page_layout_configs (
  domain_key, page_type, layout_name,
  section_order,
  hero_style, hero_height_desktop, hero_height_mobile,
  hero_content_position, hero_text_align, hero_badge_style,
  hero_title_style, hero_cta_style,
  trend_block_columns_desktop, trend_block_columns_mobile,
  trend_card_style, trend_card_aspect_ratio, trend_card_hover_effect,
  collection_grid_style, collection_grid_columns_desktop,
  collection_card_style, collection_card_aspect_ratio,
  brand_grid_style, brand_grid_columns_desktop, brand_card_style,
  showroom_layout, showroom_hero_style, showroom_collection_grid,
  global_filter_style, global_filter_position,
  scroll_animation, scroll_animation_duration, scroll_animation_stagger,
  grain_texture_overlay, grain_texture_opacity,
  section_divider_style, cta_perde_ai_style, cta_perde_ai_position,
  is_active
) VALUES
(
  'hometex', 'homepage', 'Hometex Ana Sayfa — Editorial Premium',
  '["hero", "trend_block", "collection_grid", "region_highlights", "brand_showcase", "perde_ai_cta", "footer"]',
  'fullscreen-parallax', '100vh', '85vh',
  'center-left', 'left', 'pill-outline-gold',
  'display-serif-light', 'split-buttons-gold-outline',
  4, 2,
  'portrait-overlay-gradient', '3/4', 'scale-reveal-gold',
  'asymmetric-editorial-masonry', 3,
  'magazine-full-bleed-serif', '4/5',
  'logo-showcase-hover-reveal', 4, 'showroom-preview-editorial',
  'editorial-full-parallax', 'parallax-overlay-navy', 'masonry-3col-gap32',
  'pill-tabs-gold-underline', 'sticky-below-hero',
  'fade-up-stagger', 800, 120,
  true, 0.03,
  'thin-gold-line-centered', 'floating-gold-pill-shadow', 'bottom-right-sticky',
  true
),
(
  'hometex', 'showroom', 'Showroom Sayfası — Lüks Sergi Salonu',
  '["showroom_hero", "ai_analysis_panel", "collection_grid", "product_highlights", "trtex_link", "perde_ai_cta"]',
  'fullscreen-parallax', '90vh', '70vh',
  'bottom-left', 'left', 'pill-solid-gold',
  'display-serif-medium', 'stacked-buttons',
  4, 2,
  'square-overlay', '1/1', 'zoom-reveal',
  'masonry-editorial', 3,
  'magazine-full-bleed-serif', '3/4',
  'logo-showcase-hover-reveal', 4, 'showroom-preview-editorial',
  'editorial-full-parallax', 'parallax-overlay-navy', 'masonry-3col-gap32',
  'pill-tabs-gold-underline', 'inline-section',
  'fade-up-stagger', 600, 80,
  true, 0.02,
  'thin-gold-line-left', 'inline-gold-button', 'inline-section-bottom',
  true
),
(
  'hometex', 'collection_detail', 'Koleksiyon Detay — Magazine Style',
  '["collection_hero", "ai_commentary", "product_grid", "style_tags", "perde_ai_cta", "related_collections"]',
  'editorial-split', '80vh', '60vh',
  'center-left', 'left', 'pill-outline-gold',
  'display-serif-light', 'single-button-gold',
  4, 2,
  'landscape-overlay', '16/9', 'fade-reveal',
  'grid-uniform', 4,
  'product-card-minimal', '1/1',
  'logo-showcase-hover-reveal', 4, 'showroom-preview-editorial',
  'editorial-full-parallax', 'parallax-overlay-navy', 'masonry-3col-gap32',
  'pill-tabs-gold-underline', 'inline-section',
  'fade-up-stagger', 700, 100,
  true, 0.03,
  'thin-gold-line-centered', 'floating-gold-pill-shadow', 'bottom-right-sticky',
  true
),
(
  'heimtex', 'homepage', 'Heimtex Ana Sayfa — Deutsche Präzision',
  '["hero", "trend_block", "collection_grid", "region_highlights", "brand_showcase", "perde_ai_cta", "footer"]',
  'fullscreen-static', '100vh', '80vh',
  'center-left', 'left', 'square-outline-gold',
  'display-serif-regular', 'split-buttons-gold-outline',
  4, 2,
  'portrait-overlay-sharp', '3/4', 'scale-sharp',
  'grid-uniform-editorial', 3,
  'magazine-full-bleed-sans', '4/5',
  'logo-showcase-hover-reveal', 4, 'showroom-preview-minimal',
  'editorial-full-static', 'overlay-dark', 'grid-3col-gap24',
  'tab-underline-gold', 'sticky-below-hero',
  'fade-up', 600, 80,
  false, 0.00,
  'thin-dark-line', 'inline-gold-button', 'inline-section-bottom',
  true
);

-- ============================================================
-- TEST DATA — HOMEPAGE HERO SLIDES (Kurumsal Tasarım)
-- ============================================================

INSERT INTO homepage_hero_slides (
  domain_key, slide_order,
  title_tr, title_en, title_de, title_ar, title_ru,
  subtitle_tr, subtitle_en, subtitle_de,
  background_image_url,
  overlay_opacity, overlay_color,
  overlay_gradient,
  badge_text_tr, badge_text_en, badge_text_de,
  badge_style, title_font_style, cta_primary_style, cta_secondary_style,
  content_position, parallax_enabled, grain_overlay,
  cta_primary_text_tr, cta_primary_text_en, cta_primary_url,
  cta_secondary_text_tr, cta_secondary_text_en, cta_secondary_url,
  scroll_indicator, is_active
) VALUES
(
  'hometex', 1,
  'Küresel Tekstil Fuarı', 'Global Textile Fair', 'Globale Textilmesse', 'معرض النسيج العالمي', 'Глобальная Текстильная Ярмарка',
  'Dünyanın dört bir yanından seçkin markalar, koleksiyonlar ve trendler', 'Curated brands, collections and trends from around the world', 'Ausgewählte Marken, Kollektionen und Trends aus aller Welt',
  'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1920&q=90',
  0.55, '#0D1B2A',
  'linear-gradient(135deg, rgba(13,27,42,0.80) 0%, rgba(13,27,42,0.45) 55%, rgba(13,27,42,0.15) 100%)',
  'AI Destekli Sanal Fuar', 'AI-Powered Virtual Fair', 'KI-gestützte Virtualmesse',
  'pill-outline-gold', 'display-serif-light', 'solid-gold', 'outline-white',
  'center-left', true, true,
  'Fuarı Gez', 'Explore Fair', '/explore',
  'Stil Keşfet', 'Discover Style', '/collections',
  true, true
),
(
  'hometex', 2,
  'Koleksiyonları Keşfet', 'Discover Collections', 'Kollektionen Entdecken', 'اكتشف المجموعات', 'Откройте Коллекции',
  'Sezon trendlerini yakala, kendi stilini oluştur', 'Catch seasonal trends, create your own style', 'Saisontrends entdecken, eigenen Stil kreieren',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&q=90',
  0.50, '#0D1B2A',
  'linear-gradient(160deg, rgba(13,27,42,0.70) 0%, rgba(13,27,42,0.30) 50%, rgba(201,168,76,0.10) 100%)',
  'Sezon 2025 — 2026', 'Season 2025 — 2026', 'Saison 2025 — 2026',
  'pill-outline-gold', 'display-serif-light', 'solid-gold', 'outline-white',
  'center-left', true, true,
  'Koleksiyonları Gör', 'View Collections', '/collections',
  'Perde.ai''de Dene', 'Try on Perde.ai', 'https://perde.ai',
  true, true
),
(
  'hometex', 3,
  'Premium Markalar', 'Premium Brands', 'Premium Marken', 'العلامات التجارية المميزة', 'Премиум Бренды',
  'Taç, Menderes, Luolai ve daha fazlası — tek platformda', 'Taç, Menderes, Luolai and more — on one platform', 'Taç, Menderes, Luolai und mehr — auf einer Plattform',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&q=90',
  0.55, '#0D1B2A',
  'linear-gradient(120deg, rgba(13,27,42,0.85) 0%, rgba(13,27,42,0.40) 60%, rgba(13,27,42,0.10) 100%)',
  'Global Showroom', 'Global Showroom', 'Globaler Showroom',
  'pill-outline-gold', 'display-serif-light', 'solid-gold', 'outline-white',
  'center-left', true, true,
  'Markaları Keşfet', 'Explore Brands', '/brands',
  'Showroom Gez', 'Visit Showroom', '/showrooms',
  true, true
);

-- ============================================================
-- TEST DATA — TREND CARDS (Kurumsal Tasarım)
-- ============================================================

INSERT INTO trend_cards (
  domain_key, card_order,
  trend_name_tr, trend_name_en, trend_name_de, trend_name_ar, trend_name_ru,
  trend_description_tr, trend_description_en,
  editorial_subtitle_tr, editorial_subtitle_en,
  cover_image_url,
  accent_color, card_bg_color, card_text_color, card_overlay_style,
  style_category, style_tags, usage_contexts,
  trend_score, trend_direction,
  perde_ai_style_prompt, perde_ai_deep_link,
  is_active, is_featured,
  week_number, year,
  ai_commentary_tr, ai_commentary_en
) VALUES
(
  'hometex', 1,
  'Soft Minimal', 'Soft Minimal', 'Sanftes Minimal', 'الحد الأدنى الناعم', 'Мягкий Минимализм',
  'Sadeliğin zarafeti — nötr tonlar, doğal dokular, huzur veren boşluklar', 'The elegance of simplicity — neutral tones, natural textures, peaceful spaces',
  'Sezonun en çok aranan stili', 'The most sought-after style of the season',
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=85',
  '#C9A84C', '#F2EDE4', '#1A1A2E', 'gradient-bottom-navy',
  'minimal', '["neutral", "linen", "natural", "calm", "scandinavian"]', '["living_room", "bedroom", "office"]',
  94.5, 'rising',
  'soft minimal interior, neutral linen curtains, natural light, scandinavian style', 'https://perde.ai?style=soft-minimal',
  true, true,
  EXTRACT(WEEK FROM CURRENT_DATE)::integer, EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  'Soft Minimal, 2025-2026 sezonunun tartışmasız lideri. Doğal keten ve pamuk karışımı kumaşlar, nötr renk paletleriyle birleşince yaşam alanlarına huzur katıyor.',
  'Soft Minimal leads the 2025-2026 season undisputedly. Natural linen and cotton blend fabrics combined with neutral color palettes bring tranquility to living spaces.'
),
(
  'hometex', 2,
  'Hotel Luxury', 'Hotel Luxury', 'Hotel Luxus', 'فخامة الفندق', 'Отельная Роскошь',
  'Beş yıldızlı otel estetiğini evinize taşıyın — kadife, altın detaylar, derin renkler', 'Bring five-star hotel aesthetics to your home — velvet, gold details, deep colors',
  'Otel konforu, ev sıcaklığı', 'Hotel comfort, home warmth',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=85',
  '#B87333', '#0D1B2A', '#FAFAF7', 'gradient-top-gold',
  'luxury', '["velvet", "gold", "deep-colors", "opulent", "hotel"]', '["bedroom", "living_room", "lobby"]',
  88.2, 'rising',
  'hotel luxury interior, velvet curtains, gold accents, deep navy walls, opulent style', 'https://perde.ai?style=hotel-luxury',
  true, true,
  EXTRACT(WEEK FROM CURRENT_DATE)::integer, EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  'Hotel Luxury trendi, pandemi sonrası ev konforuna verilen önemin bir yansıması. Kadife perdeler ve altın aksesuarlar bu trendi tanımlıyor.',
  'The Hotel Luxury trend reflects the post-pandemic emphasis on home comfort. Velvet curtains and gold accessories define this trend.'
),
(
  'hometex', 3,
  'Natural Linen', 'Natural Linen', 'Natürliches Leinen', 'الكتان الطبيعي', 'Натуральный Лён',
  'Sürdürülebilir moda — organik keten, doğal boyalar, çevre dostu üretim', 'Sustainable fashion — organic linen, natural dyes, eco-friendly production',
  'Doğadan ilham, sürdürülebilir gelecek', 'Nature-inspired, sustainable future',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=85',
  '#8B6914', '#F2EDE4', '#1A1A2E', 'gradient-bottom-warm',
  'natural', '["linen", "organic", "sustainable", "earthy", "eco"]', '["living_room", "bedroom", "kitchen"]',
  91.7, 'breakout',
  'natural linen curtains, organic fabric, earthy tones, sustainable interior design', 'https://perde.ai?style=natural-linen',
  true, true,
  EXTRACT(WEEK FROM CURRENT_DATE)::integer, EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  'Natural Linen, sürdürülebilirlik bilincinin yükselmesiyle birlikte patlama yapan bir trend. Organik sertifikasyonlu kumaşlara talep %340 arttı.',
  'Natural Linen is a breakout trend driven by rising sustainability awareness. Demand for organically certified fabrics increased by 340%.'
),
(
  'hometex', 4,
  'Dark Velvet', 'Dark Velvet', 'Dunkler Samt', 'المخمل الداكن', 'Тёмный Бархат',
  'Cesur ve dramatik — koyu kadife, derin renkler, güçlü karakter', 'Bold and dramatic — dark velvet, deep colors, strong character',
  'Cesaret ve zarafet bir arada', 'Courage and elegance combined',
  'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&q=85',
  '#C9A84C', '#1A1A2E', '#FAFAF7', 'gradient-center-gold',
  'dramatic', '["velvet", "dark", "bold", "dramatic", "jewel-tones"]', '["bedroom", "study", "dining_room"]',
  82.4, 'stable',
  'dark velvet curtains, jewel tones, dramatic interior, moody atmosphere, bold design', 'https://perde.ai?style=dark-velvet',
  true, false,
  EXTRACT(WEEK FROM CURRENT_DATE)::integer, EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  'Dark Velvet, cesur tasarım tercihlerinin simgesi. Zümrüt yeşili, safir mavisi ve yakut kırmızısı tonlarındaki kadife perdeler bu trendi domine ediyor.',
  'Dark Velvet symbolizes bold design choices. Velvet curtains in emerald green, sapphire blue and ruby red tones dominate this trend.'
),
(
  'hometex', 5,
  'Japandi Fusion', 'Japandi Fusion', 'Japandi Fusion', 'جابندي فيوجن', 'Японди Фьюжн',
  'Japon minimalizmi ile İskandinav sıcaklığının mükemmel birleşimi', 'The perfect fusion of Japanese minimalism and Scandinavian warmth',
  'İki kültürün en iyisi', 'The best of two cultures',
  'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=85',
  '#C9A84C', '#F8F6F0', '#1A1A2E', 'gradient-bottom-navy',
  'japandi', '["japanese", "scandinavian", "wabi-sabi", "minimal", "warm"]', '["living_room", "bedroom", "meditation"]',
  87.9, 'rising',
  'japandi interior, japanese minimalism, scandinavian warmth, wabi-sabi curtains, natural materials', 'https://perde.ai?style=japandi-fusion',
  true, false,
  EXTRACT(WEEK FROM CURRENT_DATE)::integer, EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  'Japandi Fusion, global tasarım dünyasının en hızlı büyüyen trendi. Wabi-sabi felsefesi ve İskandinav hygge anlayışı birleşince eşsiz bir estetik ortaya çıkıyor.',
  'Japandi Fusion is the fastest growing trend in global design. The combination of wabi-sabi philosophy and Scandinavian hygge creates a unique aesthetic.'
);

-- ============================================================
-- TEST DATA — REGION HIGHLIGHT BLOCKS (Kurumsal)
-- ============================================================

INSERT INTO region_highlight_blocks (
  domain_key, region_key,
  highlight_label_tr, highlight_label_en, highlight_label_de, highlight_label_ar, highlight_label_ru,
  description_tr, description_en, description_de,
  hero_image_url,
  accent_color, badge_color,
  brand_count, collection_count,
  trending_style_tr, trending_style_en,
  cta_text_tr, cta_text_en, cta_url,
  display_order, is_active, is_highlighted
) VALUES
(
  'hometex', 'turkey',
  'Premium Türkiye', 'Premium Turkey', 'Premium Türkei', 'تركيا المميزة', 'Премиум Турция',
  'Dünyanın en büyük tekstil ihracatçılarından — kalite, çeşitlilik ve rekabetçi fiyat', 'One of the world''s largest textile exporters — quality, variety and competitive pricing', 'Einer der größten Textilexporteure der Welt',
  'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=85',
  '#C9A84C', '#C9A84C',
  48, 312,
  'Soft Minimal & Natural Linen', 'Soft Minimal & Natural Linen',
  'Türk Markalarını Keşfet', 'Explore Turkish Brands', '/brands?region=turkey',
  1, true, true
),
(
  'hometex', 'china',
  'Yükselen Çin', 'Rising China', 'Aufsteigendes China', 'الصين الصاعدة', 'Восходящий Китай',
  'Teknoloji ve geleneksel dokumacılığın buluştuğu nokta — Sunvim, Fuanna ve daha fazlası', 'Where technology meets traditional weaving — Sunvim, Fuanna and more', 'Wo Technologie auf traditionelles Weben trifft',
  'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=1200&q=85',
  '#B87333', '#B87333',
  62, 428,
  'Hotel Luxury & Dark Velvet', 'Hotel Luxury & Dark Velvet',
  'Çin Markalarını Keşfet', 'Explore Chinese Brands', '/brands?region=china',
  2, true, true
),
(
  'hometex', 'europe',
  'Avrupa Seçkisi', 'European Selection', 'Europäische Auswahl', 'الاختيار الأوروبي', 'Европейский Выбор',
  'Alman mühendisliği, İtalyan tasarımı, Fransız zarafeti — Avrupa''nın en iyileri', 'German engineering, Italian design, French elegance — the best of Europe', 'Deutsche Ingenieurskunst, italienisches Design, französische Eleganz',
  'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=85',
  '#8B6914', '#8B6914',
  35, 198,
  'Japandi Fusion & Natural Linen', 'Japandi Fusion & Natural Linen',
  'Avrupa Markalarını Keşfet', 'Explore European Brands', '/brands?region=europe',
  3, true, true
),
(
  'hometex', 'far_east',
  'Uzak Doğu', 'Far East', 'Ferner Osten', 'الشرق الأقصى', 'Дальний Восток',
  'Japonya, Kore ve Güneydoğu Asya''nın eşsiz tekstil mirası', 'The unique textile heritage of Japan, Korea and Southeast Asia', 'Das einzigartige Textilerbe Japans, Koreas und Südostasiens',
  'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=85',
  '#C9A84C', '#C9A84C',
  28, 156,
  'Japandi Fusion & Soft Minimal', 'Japandi Fusion & Soft Minimal',
  'Uzak Doğu Markalarını Keşfet', 'Explore Far East Brands', '/brands?region=far_east',
  4, true, true
);

-- ============================================================
-- GRANT PERMISSIONS
-- ============================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON design_system_tokens TO app20251125030717azolfgnmgv_v1_admin_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON design_system_tokens TO app20251125030717azolfgnmgv_v1_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ui_theme_configs TO app20251125030717azolfgnmgv_v1_admin_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ui_theme_configs TO app20251125030717azolfgnmgv_v1_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON typography_configs TO app20251125030717azolfgnmgv_v1_admin_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON typography_configs TO app20251125030717azolfgnmgv_v1_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON page_layout_configs TO app20251125030717azolfgnmgv_v1_admin_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON page_layout_configs TO app20251125030717azolfgnmgv_v1_user;

-- ============================================================
-- 1. FAIR PARTICIPANTS — Tarafsız fuar katılımcı tablosu
-- Belirli marka isimlerine bağlı değil, her tedarikçi/üretici
-- ============================================================
CREATE TABLE fair_participants (
    id BIGSERIAL PRIMARY KEY,
    showroom_id BIGINT,                          -- showrooms tablosuyla ilişki
    company_id BIGINT,                           -- companies tablosuyla ilişki
    participant_type VARCHAR(50) DEFAULT 'exhibitor' NOT NULL,
    display_name VARCHAR(300) NOT NULL,          -- Fuarda görünen ticari isim
    display_slug VARCHAR(300) UNIQUE NOT NULL,   -- URL slug
    country_code VARCHAR(10) NOT NULL,
    region_key VARCHAR(50) NOT NULL,             -- brand_regions.region_key ile eşleşir
    city VARCHAR(100),
    product_categories JSONB DEFAULT '[]',       -- Ürün kategorileri
    specializations JSONB DEFAULT '[]',          -- Uzmanlık alanları
    export_markets JSONB DEFAULT '[]',           -- İhracat pazarları
    price_segment VARCHAR(50) DEFAULT 'mid',
    min_order_quantity VARCHAR(100),
    lead_time_days INTEGER,
    certifications JSONB DEFAULT '[]',
    year_established INTEGER,
    employee_range VARCHAR(50),
    annual_capacity VARCHAR(100),
    logo_url TEXT,
    hero_image_url TEXT,
    cover_image_url TEXT,
    booth_hall VARCHAR(100),
    booth_number VARCHAR(50),
    booth_theme_color VARCHAR(7) DEFAULT '#C9A84C',
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_sponsored BOOLEAN DEFAULT FALSE,
    sponsor_tier VARCHAR(50),
    sponsor_expires_at TIMESTAMP WITH TIME ZONE,
    total_views BIGINT DEFAULT 0,
    total_inquiries BIGINT DEFAULT 0,
    ai_rank_score NUMERIC(8,4) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fair_participants_participant_type_check CHECK (participant_type IN ('exhibitor', 'co_exhibitor', 'virtual_only', 'partner')),
    CONSTRAINT fair_participants_price_segment_check CHECK (price_segment IN ('budget', 'mid', 'premium', 'luxury')),
    CONSTRAINT fair_participants_sponsor_tier_check CHECK (sponsor_tier IN ('bronze', 'silver', 'gold', 'platinum') OR sponsor_tier IS NULL)
);

CREATE INDEX idx_fair_participants_showroom_id ON fair_participants(showroom_id);
CREATE INDEX idx_fair_participants_company_id ON fair_participants(company_id);
CREATE INDEX idx_fair_participants_region_key ON fair_participants(region_key);
CREATE INDEX idx_fair_participants_country_code ON fair_participants(country_code);
CREATE INDEX idx_fair_participants_is_featured ON fair_participants(is_featured);
CREATE INDEX idx_fair_participants_is_sponsored ON fair_participants(is_sponsored);
CREATE INDEX idx_fair_participants_ai_rank_score ON fair_participants(ai_rank_score DESC);
CREATE INDEX idx_fair_participants_display_slug ON fair_participants(display_slug);

-- ============================================================
-- 2. SUPPLIER AI ANALYSIS — Tarafsız AI analiz paneli
-- Her katılımcı için çok dilli, tarafsız AI değerlendirmesi
-- ============================================================
CREATE TABLE supplier_ai_analysis (
    id BIGSERIAL PRIMARY KEY,
    participant_id BIGINT,                       -- fair_participants.id
    showroom_id BIGINT,                          -- showrooms.id
    analysis_version INTEGER DEFAULT 1,
    -- Güçlü yönler (çok dilli)
    strengths_tr TEXT,
    strengths_en TEXT,
    strengths_de TEXT,
    strengths_ar TEXT,
    strengths_ru TEXT,
    -- Pazar konumu (çok dilli)
    market_position_tr TEXT,
    market_position_en TEXT,
    market_position_de TEXT,
    market_position_ar TEXT,
    market_position_ru TEXT,
    -- Editöryal yorum (çok dilli)
    editorial_commentary_tr TEXT,
    editorial_commentary_en TEXT,
    editorial_commentary_de TEXT,
    editorial_commentary_ar TEXT,
    editorial_commentary_ru TEXT,
    -- Trend uyumu
    trend_alignment_score NUMERIC(5,2) DEFAULT 0,
    trend_keywords JSONB DEFAULT '[]',
    -- Kalite göstergeleri
    quality_indicators JSONB DEFAULT '{}',
    sustainability_score NUMERIC(5,2) DEFAULT 0,
    innovation_score NUMERIC(5,2) DEFAULT 0,
    -- Alıcı profili önerisi
    ideal_buyer_profile_tr TEXT,
    ideal_buyer_profile_en TEXT,
    -- Meta
    ai_model_used VARCHAR(100),
    confidence_score NUMERIC(5,2) DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    last_analyzed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_supplier_ai_analysis_participant_id ON supplier_ai_analysis(participant_id);
CREATE INDEX idx_supplier_ai_analysis_showroom_id ON supplier_ai_analysis(showroom_id);
CREATE INDEX idx_supplier_ai_analysis_is_published ON supplier_ai_analysis(is_published);
CREATE INDEX idx_supplier_ai_analysis_trend_score ON supplier_ai_analysis(trend_alignment_score DESC);

-- ============================================================
-- 3. SHOWROOM CTA CONFIGS — Showroom çift CTA konfigürasyonu
-- Her showroom için özelleştirilebilir CTA butonları
-- ============================================================
CREATE TABLE showroom_cta_configs (
    id BIGSERIAL PRIMARY KEY,
    showroom_id BIGINT NOT NULL UNIQUE,
    -- Birincil CTA (İletişim / Teklif Al)
    cta_primary_type VARCHAR(50) DEFAULT 'inquiry',
    cta_primary_label_tr VARCHAR(200) DEFAULT 'Teklif Al',
    cta_primary_label_en VARCHAR(200) DEFAULT 'Get a Quote',
    cta_primary_label_de VARCHAR(200) DEFAULT 'Angebot Anfordern',
    cta_primary_label_ar VARCHAR(200) DEFAULT 'احصل على عرض',
    cta_primary_label_ru VARCHAR(200) DEFAULT 'Получить предложение',
    cta_primary_url TEXT,
    cta_primary_style VARCHAR(50) DEFAULT 'solid-gold',
    cta_primary_icon VARCHAR(100),
    -- İkincil CTA (Katalog / Showroom Gez)
    cta_secondary_type VARCHAR(50) DEFAULT 'catalog',
    cta_secondary_label_tr VARCHAR(200) DEFAULT 'Kataloğu İncele',
    cta_secondary_label_en VARCHAR(200) DEFAULT 'View Catalog',
    cta_secondary_label_de VARCHAR(200) DEFAULT 'Katalog Ansehen',
    cta_secondary_label_ar VARCHAR(200) DEFAULT 'عرض الكتالوج',
    cta_secondary_label_ru VARCHAR(200) DEFAULT 'Просмотр каталога',
    cta_secondary_url TEXT,
    cta_secondary_style VARCHAR(50) DEFAULT 'outline-navy',
    cta_secondary_icon VARCHAR(100),
    -- Üçüncül CTA (Opsiyonel — perde.ai veya dış link)
    cta_tertiary_enabled BOOLEAN DEFAULT FALSE,
    cta_tertiary_type VARCHAR(50),
    cta_tertiary_label_tr VARCHAR(200),
    cta_tertiary_label_en VARCHAR(200),
    cta_tertiary_url TEXT,
    cta_tertiary_style VARCHAR(50) DEFAULT 'text-link-gold',
    -- Genel ayarlar
    show_whatsapp BOOLEAN DEFAULT FALSE,
    whatsapp_number VARCHAR(50),
    show_video_tour BOOLEAN DEFAULT FALSE,
    video_tour_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT showroom_cta_configs_cta_primary_type_check CHECK (cta_primary_type IN ('inquiry', 'quote', 'contact', 'external', 'catalog')),
    CONSTRAINT showroom_cta_configs_cta_secondary_type_check CHECK (cta_secondary_type IN ('catalog', 'showroom', 'perde_ai', 'external', 'video'))
);

CREATE INDEX idx_showroom_cta_configs_showroom_id ON showroom_cta_configs(showroom_id);
CREATE INDEX idx_showroom_cta_configs_is_active ON showroom_cta_configs(is_active);

-- ============================================================
-- 4. GLOBAL FILTER CONFIGS — Global filtre barı konfigürasyonu
-- Bölge, kategori, fiyat segmenti bazlı filtre tanımları
-- ============================================================
CREATE TABLE global_filter_configs (
    id BIGSERIAL PRIMARY KEY,
    domain_key VARCHAR(50) DEFAULT 'hometex' NOT NULL,
    filter_group VARCHAR(100) NOT NULL,          -- 'region', 'category', 'price_segment', 'style', 'certification'
    filter_key VARCHAR(100) NOT NULL,            -- Filtre değeri (örn: 'turkey', 'china', 'premium')
    label_tr VARCHAR(200) NOT NULL,
    label_en VARCHAR(200) NOT NULL,
    label_de VARCHAR(200),
    label_ar VARCHAR(200),
    label_ru VARCHAR(200),
    description_tr TEXT,
    description_en TEXT,
    icon_url TEXT,
    accent_color VARCHAR(7) DEFAULT '#C9A84C',
    badge_label_tr VARCHAR(100),                 -- Örn: "Yükselen", "Öne Çıkan"
    badge_label_en VARCHAR(100),
    badge_style VARCHAR(50) DEFAULT 'pill-outline',
    is_highlighted BOOLEAN DEFAULT FALSE,        -- Ana sayfada öne çıkar
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    participant_count INTEGER DEFAULT 0,         -- Bu filtredeki katılımcı sayısı
    collection_count INTEGER DEFAULT 0,
    click_count BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(domain_key, filter_group, filter_key)
);

CREATE INDEX idx_global_filter_configs_domain ON global_filter_configs(domain_key);
CREATE INDEX idx_global_filter_configs_group ON global_filter_configs(filter_group);
CREATE INDEX idx_global_filter_configs_highlighted ON global_filter_configs(is_highlighted, display_order);
CREATE INDEX idx_global_filter_configs_active ON global_filter_configs(is_active, display_order);

-- ============================================================
-- 5. PARTICIPANT TRANSLATIONS — Katılımcı çok dilli içerik
-- fair_participants için ayrı çeviri tablosu
-- ============================================================
CREATE TABLE participant_translations (
    id BIGSERIAL PRIMARY KEY,
    participant_id BIGINT NOT NULL,
    language_code VARCHAR(10) NOT NULL,
    display_name VARCHAR(300),
    tagline VARCHAR(500),
    description TEXT,
    specialization_summary TEXT,
    meta_title VARCHAR(300),
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(participant_id, language_code),
    CONSTRAINT participant_translations_language_check CHECK (language_code IN ('tr', 'en', 'de', 'ar', 'ru'))
);

CREATE INDEX idx_participant_translations_participant_id ON participant_translations(participant_id);
CREATE INDEX idx_participant_translations_language ON participant_translations(language_code);

-- ============================================================
-- ÖRNEK VERİLER — global_filter_configs (Tarafsız filtreler)
-- ============================================================
INSERT INTO global_filter_configs (domain_key, filter_group, filter_key, label_tr, label_en, label_de, label_ar, label_ru, accent_color, badge_label_tr, badge_label_en, badge_style, is_highlighted, display_order, participant_count) VALUES
-- Bölge filtreleri
('hometex', 'region', 'turkey', 'Türkiye', 'Turkey', 'Türkei', 'تركيا', 'Турция', '#C9A84C', 'Premium Üretim', 'Premium Manufacturing', 'pill-solid-gold', TRUE, 1, 0),
('hometex', 'region', 'china', 'Çin', 'China', 'China', 'الصين', 'Китай', '#E8B84B', 'Yükselen', 'Rising', 'pill-outline-amber', TRUE, 2, 0),
('hometex', 'region', 'europe', 'Avrupa', 'Europe', 'Europa', 'أوروبا', 'Европа', '#4A6FA5', 'Tasarım Merkezi', 'Design Hub', 'pill-outline-navy', FALSE, 3, 0),
('hometex', 'region', 'far_east', 'Uzak Doğu', 'Far East', 'Fernost', 'الشرق الأقصى', 'Дальний Восток', '#6B8E6B', 'Sürdürülebilir', 'Sustainable', 'pill-outline-green', FALSE, 4, 0),
('hometex', 'region', 'middle_east', 'Orta Doğu', 'Middle East', 'Naher Osten', 'الشرق الأوسط', 'Ближний Восток', '#8B6914', 'Lüks Segment', 'Luxury Segment', 'pill-outline-bronze', FALSE, 5, 0),
-- Fiyat segmenti filtreleri
('hometex', 'price_segment', 'budget', 'Ekonomik', 'Budget', 'Günstig', 'اقتصادي', 'Бюджетный', '#6B7280', NULL, NULL, 'pill-outline', FALSE, 10, 0),
('hometex', 'price_segment', 'mid', 'Orta Segment', 'Mid Range', 'Mittelklasse', 'متوسط', 'Средний', '#9CA3AF', NULL, NULL, 'pill-outline', FALSE, 11, 0),
('hometex', 'price_segment', 'premium', 'Premium', 'Premium', 'Premium', 'بريميوم', 'Премиум', '#C9A84C', 'Öne Çıkan', 'Featured', 'pill-solid-gold', FALSE, 12, 0),
('hometex', 'price_segment', 'luxury', 'Lüks', 'Luxury', 'Luxus', 'فاخر', 'Люкс', '#D4AF37', 'Seçkin', 'Elite', 'pill-solid-gold', FALSE, 13, 0),
-- Stil filtreleri
('hometex', 'style', 'modern', 'Modern', 'Modern', 'Modern', 'عصري', 'Современный', '#374151', NULL, NULL, 'pill-outline', FALSE, 20, 0),
('hometex', 'style', 'classic', 'Klasik', 'Classic', 'Klassisch', 'كلاسيكي', 'Классический', '#6B4C2A', NULL, NULL, 'pill-outline', FALSE, 21, 0),
('hometex', 'style', 'minimalist', 'Minimalist', 'Minimalist', 'Minimalistisch', 'بسيط', 'Минималистичный', '#9CA3AF', NULL, NULL, 'pill-outline', FALSE, 22, 0),
('hometex', 'style', 'bohemian', 'Bohem', 'Bohemian', 'Böhmisch', 'بوهيمي', 'Богемный', '#8B6914', NULL, NULL, 'pill-outline', FALSE, 23, 0),
('hometex', 'style', 'sustainable', 'Sürdürülebilir', 'Sustainable', 'Nachhaltig', 'مستدام', 'Устойчивый', '#4A7C59', 'Trend', 'Trending', 'pill-solid-green', TRUE, 24, 0);

-- ============================================================
-- ÖRNEK VERİLER — fair_participants (Tarafsız örnek katılımcılar)
-- ============================================================
INSERT INTO fair_participants (display_name, display_slug, country_code, region_key, city, product_categories, specializations, price_segment, year_established, employee_range, logo_url, hero_image_url, cover_image_url, booth_hall, booth_number, is_active, is_verified, is_featured) VALUES
('Tekstil Grubu A', 'tekstil-grubu-a', 'TR', 'turkey', 'İstanbul', '["perdeler", "stor_perde", "tul"]', '["jacquard_dokuma", "baskı_teknolojisi"]', 'premium', 1985, '201-500', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600&h=900&fit=crop', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop', 'Salon A', 'A-101', TRUE, TRUE, TRUE),
('Ev Tekstili Üreticisi B', 'ev-tekstili-ureticisi-b', 'TR', 'turkey', 'Bursa', '["nevresim", "yorgan", "yastık"]', '["pamuk_işleme", "organik_tekstil"]', 'mid', 1992, '101-200', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1600&h=900&fit=crop', 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&h=600&fit=crop', 'Salon B', 'B-205', TRUE, TRUE, FALSE),
('Çin Tekstil Tedarikçisi C', 'cin-tekstil-tedarikcisi-c', 'CN', 'china', 'Şangay', '["halı", "kilim", "yer_örtüsü"]', '["makine_dokuma", "yüksek_hacim"]', 'budget', 2003, '501-1000', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=1600&h=900&fit=crop', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop', 'Salon C', 'C-310', TRUE, TRUE, TRUE),
('Avrupa Tasarım Stüdyosu D', 'avrupa-tasarim-studyosu-d', 'DE', 'europe', 'Berlin', '["dekoratif_yastık", "masa_örtüsü", "mutfak_tekstili"]', '["tasarım", "sürdürülebilir_üretim"]', 'luxury', 2008, '11-50', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&h=900&fit=crop', 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&h=600&fit=crop', 'Salon D', 'D-412', TRUE, FALSE, FALSE),
('Uzak Doğu Tekstil E', 'uzak-dogu-tekstil-e', 'IN', 'far_east', 'Mumbai', '["ipek_kumaş", "el_dokuması", "etnik_tekstil"]', '["el_sanatları", "doğal_boyama"]', 'premium', 1978, '51-100', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1600&h=900&fit=crop', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop', 'Salon E', 'E-118', TRUE, TRUE, FALSE),
('Türk Halı Üreticisi F', 'turk-hali-ureticisi-f', 'TR', 'turkey', 'Gaziantep', '["el_dokuma_halı", "makine_halısı", "kilim"]', '["geleneksel_motifler", "modern_tasarım"]', 'premium', 1965, '201-500', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&h=900&fit=crop', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop', 'Salon A', 'A-215', TRUE, TRUE, TRUE),
('Çin Perde Tedarikçisi G', 'cin-perde-tedarikcisi-g', 'CN', 'china', 'Guangzhou', '["hazır_perde", "blackout_perde", "tül"]', '["yüksek_hacim", "hızlı_üretim"]', 'budget', 2010, '1001-5000', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600&h=900&fit=crop', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop', 'Salon C', 'C-422', TRUE, FALSE, FALSE);

-- ============================================================
-- ÖRNEK VERİLER — showroom_cta_configs
-- ============================================================
INSERT INTO showroom_cta_configs (showroom_id, cta_primary_type, cta_primary_label_tr, cta_primary_label_en, cta_primary_style, cta_secondary_type, cta_secondary_label_tr, cta_secondary_label_en, cta_secondary_style, show_whatsapp, is_active) VALUES
(1, 'inquiry', 'Teklif Al', 'Get a Quote', 'solid-gold', 'catalog', 'Kataloğu İncele', 'View Catalog', 'outline-navy', FALSE, TRUE),
(2, 'inquiry', 'İletişime Geç', 'Contact Us', 'solid-gold', 'showroom', 'Showroom Gez', 'Visit Showroom', 'outline-navy', TRUE, TRUE),
(3, 'quote', 'Fiyat Sor', 'Request Price', 'solid-gold', 'catalog', 'Ürünleri Gör', 'View Products', 'outline-navy', FALSE, TRUE);

-- ============================================================
-- ÖRNEK VERİLER — supplier_ai_analysis
-- ============================================================
INSERT INTO supplier_ai_analysis (participant_id, analysis_version, strengths_tr, strengths_en, market_position_tr, market_position_en, editorial_commentary_tr, editorial_commentary_en, trend_alignment_score, sustainability_score, innovation_score, confidence_score, is_published, last_analyzed_at) VALUES
(1, 1, 'Yüksek kaliteli jacquard dokuma kapasitesi, 40 yıllık üretim deneyimi, geniş renk skalası', 'High-quality jacquard weaving capacity, 40 years of manufacturing experience, wide color range', 'Premium segment Türk tekstil üreticisi olarak Avrupa ve Orta Doğu pazarlarında güçlü konuma sahip', 'Strong position in European and Middle Eastern markets as a premium Turkish textile manufacturer', 'Geleneksel Türk dokuma sanatını modern üretim teknolojisiyle harmanlayan bu tedarikçi, sektörün köklü oyuncularından biri olarak öne çıkıyor.', 'This supplier stands out as one of the industry''s established players, blending traditional Turkish weaving art with modern manufacturing technology.', 87.5, 72.0, 68.0, 91.0, TRUE, CURRENT_TIMESTAMP),
(3, 1, 'Yüksek üretim kapasitesi, rekabetçi fiyatlandırma, hızlı teslimat süreleri', 'High production capacity, competitive pricing, fast delivery times', 'Çin merkezli büyük ölçekli üretici olarak küresel alıcılara maliyet avantajı sunuyor', 'Offers cost advantages to global buyers as a large-scale China-based manufacturer', 'Ölçek ekonomisini etkin kullanan bu tedarikçi, özellikle büyük hacimli siparişlerde rekabetçi avantaj sunmaktadır.', 'This supplier effectively leverages economies of scale, offering competitive advantages especially for large-volume orders.', 74.0, 55.0, 61.0, 85.0, TRUE, CURRENT_TIMESTAMP),
(6, 1, 'El dokuma geleneği, özgün Türk motifleri, ihracat deneyimi, coğrafi işaret tescili', 'Hand-weaving tradition, authentic Turkish motifs, export experience, geographical indication registration', 'Geleneksel Türk halıcılığının modern yorumunu sunan premium segment üretici', 'Premium segment manufacturer offering a modern interpretation of traditional Turkish carpet making', 'Yüzyıllık el sanatı geleneğini sürdüren bu tedarikçi, koleksiyonlarında kültürel miras ile çağdaş tasarımı başarıyla buluşturuyor.', 'This supplier, carrying on a centuries-old craft tradition, successfully bridges cultural heritage with contemporary design in its collections.', 82.0, 88.0, 75.0, 93.0, TRUE, CURRENT_TIMESTAMP);

-- ============================================================
-- HOMETEX — GOOGLE CLOUD NATIVE VIRTUAL FAIR PLATFORM
-- Dünyanın En Büyük Ev Tekstili & Perde Sanal Fuarı
-- 7 Dil: TR, EN, DE, FR, AR, RU, ZH
-- Google Cloud: Vertex AI, Cloud Run, Translate API, Vision AI,
--               Cloud Storage, BigQuery, Pub/Sub
-- ============================================================

-- ============================================================
-- 1. MEVCUT TABLOLARDA GELİŞTİRMELER
-- ============================================================

-- companies tablosuna yeni katılımcı tipleri ekleme
-- (factory, editor, raw_material_supplier, wholesaler)
ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_company_type_check;
ALTER TABLE companies ADD CONSTRAINT companies_company_type_check
    CHECK (company_type IN (
        'manufacturer',
        'supplier',
        'buyer',
        'distributor',
        'factory',
        'editor',
        'raw_material_supplier',
        'wholesaler',
        'brand'
    ));

-- fair_participants tablosuna yeni tipler ekleme
ALTER TABLE fair_participants DROP CONSTRAINT IF EXISTS fair_participants_participant_type_check;
ALTER TABLE fair_participants ADD CONSTRAINT fair_participants_participant_type_check
    CHECK (participant_type IN (
        'exhibitor',
        'co_exhibitor',
        'virtual_only',
        'partner',
        'wholesaler',
        'editor',
        'factory',
        'raw_material_supplier'
    ));

-- user_profiles dil desteğini 7 dile genişlet (FR, ZH eklendi)
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_language_preference_check;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_language_preference_check
    CHECK (language_preference IN ('en', 'ar', 'ru', 'tr', 'de', 'fr', 'zh'));

-- showrooms tablosuna 7 dil default güncelle
ALTER TABLE showrooms ALTER COLUMN supported_languages
    SET DEFAULT '["tr", "en", "de", "fr", "ar", "ru", "zh"]';

-- ai_assistant_configs tablosuna 7 dil default güncelle
ALTER TABLE ai_assistant_configs ALTER COLUMN language_support
    SET DEFAULT '["tr", "en", "de", "fr", "ar", "ru", "zh"]';

-- fair_events tablosuna FR ve ZH dil kolonları ekleme
ALTER TABLE fair_events
    ADD COLUMN IF NOT EXISTS event_name_fr VARCHAR(300),
    ADD COLUMN IF NOT EXISTS event_name_zh VARCHAR(300),
    ADD COLUMN IF NOT EXISTS description_fr TEXT,
    ADD COLUMN IF NOT EXISTS description_zh TEXT;

-- supplier_ai_analysis tablosuna FR ve ZH dil kolonları ekleme
ALTER TABLE supplier_ai_analysis
    ADD COLUMN IF NOT EXISTS strengths_fr TEXT,
    ADD COLUMN IF NOT EXISTS strengths_zh TEXT,
    ADD COLUMN IF NOT EXISTS market_position_fr TEXT,
    ADD COLUMN IF NOT EXISTS market_position_zh TEXT,
    ADD COLUMN IF NOT EXISTS editorial_commentary_fr TEXT,
    ADD COLUMN IF NOT EXISTS editorial_commentary_zh TEXT,
    ADD COLUMN IF NOT EXISTS ideal_buyer_profile_fr TEXT,
    ADD COLUMN IF NOT EXISTS ideal_buyer_profile_zh TEXT;

-- trend_cards tablosuna FR ve ZH dil kolonları ekleme
ALTER TABLE trend_cards
    ADD COLUMN IF NOT EXISTS trend_name_fr VARCHAR(200),
    ADD COLUMN IF NOT EXISTS trend_name_zh VARCHAR(200),
    ADD COLUMN IF NOT EXISTS trend_description_fr TEXT,
    ADD COLUMN IF NOT EXISTS trend_description_zh TEXT,
    ADD COLUMN IF NOT EXISTS ai_commentary_fr TEXT,
    ADD COLUMN IF NOT EXISTS ai_commentary_zh TEXT,
    ADD COLUMN IF NOT EXISTS editorial_subtitle_fr VARCHAR(300),
    ADD COLUMN IF NOT EXISTS editorial_subtitle_zh VARCHAR(300);

-- collections tablosuna FR ve ZH dil kolonları ekleme
ALTER TABLE collections
    ADD COLUMN IF NOT EXISTS name_fr VARCHAR(300),
    ADD COLUMN IF NOT EXISTS name_zh VARCHAR(300),
    ADD COLUMN IF NOT EXISTS description_fr TEXT,
    ADD COLUMN IF NOT EXISTS description_zh TEXT,
    ADD COLUMN IF NOT EXISTS ai_commentary_fr TEXT,
    ADD COLUMN IF NOT EXISTS ai_commentary_zh TEXT;

-- products tablosuna FR ve ZH dil kolonları ekleme
ALTER TABLE products
    ADD COLUMN IF NOT EXISTS name_fr VARCHAR(300),
    ADD COLUMN IF NOT EXISTS name_zh VARCHAR(300),
    ADD COLUMN IF NOT EXISTS name_tr VARCHAR(300),
    ADD COLUMN IF NOT EXISTS name_en VARCHAR(300),
    ADD COLUMN IF NOT EXISTS name_ar VARCHAR(300),
    ADD COLUMN IF NOT EXISTS name_ru VARCHAR(300),
    ADD COLUMN IF NOT EXISTS description_fr TEXT,
    ADD COLUMN IF NOT EXISTS description_zh TEXT,
    ADD COLUMN IF NOT EXISTS description_tr TEXT,
    ADD COLUMN IF NOT EXISTS description_en TEXT,
    ADD COLUMN IF NOT EXISTS description_ar TEXT,
    ADD COLUMN IF NOT EXISTS description_ru TEXT;

-- ai_agent_tasks tablosuna Google Cloud alanları ekleme
ALTER TABLE ai_agent_tasks
    ADD COLUMN IF NOT EXISTS gcp_job_id VARCHAR(300),
    ADD COLUMN IF NOT EXISTS gcp_service VARCHAR(100),
    ADD COLUMN IF NOT EXISTS vertex_session_id VARCHAR(300),
    ADD COLUMN IF NOT EXISTS pubsub_message_id VARCHAR(300);

-- ai_agent_tasks agent_type constraint genişletme
ALTER TABLE ai_agent_tasks DROP CONSTRAINT IF EXISTS ai_agent_tasks_agent_type_check;
ALTER TABLE ai_agent_tasks ADD CONSTRAINT ai_agent_tasks_agent_type_check
    CHECK (agent_type IN (
        'master',
        'fair',
        'trend',
        'match',
        'conversion',
        'content',
        'analytics',
        'translation',
        'vision',
        'sustainability',
        'meeting',
        'live_stream',
        'notification'
    ));

-- ai_agent_performance_log agent_type constraint genişletme
ALTER TABLE ai_agent_performance_log DROP CONSTRAINT IF EXISTS ai_agent_performance_log_agent_type_check;
ALTER TABLE ai_agent_performance_log ADD CONSTRAINT ai_agent_performance_log_agent_type_check
    CHECK (agent_type IN (
        'master',
        'fair',
        'trend',
        'match',
        'conversion',
        'content',
        'analytics',
        'translation',
        'vision',
        'sustainability',
        'meeting',
        'live_stream',
        'notification'
    ));

-- ============================================================
-- 2. GOOGLE CLOUD ENTEGRASYON TABLOLARI
-- ============================================================

-- Google Cloud Jobs Takip Tablosu
-- Cloud Run Jobs, Cloud Scheduler, Pub/Sub mesajları
CREATE TABLE google_cloud_jobs (
    id BIGSERIAL PRIMARY KEY,
    job_name VARCHAR(300) NOT NULL,
    job_type VARCHAR(100) NOT NULL CHECK (job_type IN (
        'cloud_run_job',
        'cloud_scheduler',
        'pubsub_trigger',
        'vertex_ai_pipeline',
        'dataflow_job',
        'bigquery_job',
        'cloud_function'
    )),
    gcp_project_id VARCHAR(200),
    gcp_region VARCHAR(100) DEFAULT 'europe-west1',
    gcp_job_id VARCHAR(300),
    gcp_execution_id VARCHAR(300),
    service_name VARCHAR(200),
    trigger_source VARCHAR(100) DEFAULT 'scheduler',
    input_payload JSONB,
    output_payload JSONB,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending', 'running', 'succeeded', 'failed', 'cancelled', 'timeout'
    )),
    domain_key VARCHAR(50) DEFAULT 'hometex',
    agent_task_id BIGINT,
    error_message TEXT,
    error_code VARCHAR(100),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER,
    cost_usd NUMERIC(10,6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gcp_jobs_status ON google_cloud_jobs(status);
CREATE INDEX idx_gcp_jobs_job_type ON google_cloud_jobs(job_type);
CREATE INDEX idx_gcp_jobs_domain_key ON google_cloud_jobs(domain_key);
CREATE INDEX idx_gcp_jobs_created_at ON google_cloud_jobs(created_at DESC);
CREATE INDEX idx_gcp_jobs_agent_task_id ON google_cloud_jobs(agent_task_id);

-- Google Translate API Önbellek Tablosu
-- 7 dil için çeviri sonuçlarını önbellekler, API maliyetini düşürür
CREATE TABLE google_translate_cache (
    id BIGSERIAL PRIMARY KEY,
    source_text_hash VARCHAR(64) NOT NULL,
    source_text TEXT NOT NULL,
    source_language VARCHAR(10) NOT NULL,
    target_language VARCHAR(10) NOT NULL CHECK (target_language IN ('tr', 'en', 'de', 'fr', 'ar', 'ru', 'zh')),
    translated_text TEXT NOT NULL,
    entity_type VARCHAR(100),
    entity_id BIGINT,
    field_name VARCHAR(100),
    translation_model VARCHAR(100) DEFAULT 'google-translate-v3',
    confidence_score NUMERIC(5,4),
    is_human_reviewed BOOLEAN DEFAULT FALSE,
    human_reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by_user_id BIGINT,
    hit_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(source_text_hash, source_language, target_language)
);

CREATE INDEX idx_translate_cache_hash ON google_translate_cache(source_text_hash, source_language, target_language);
CREATE INDEX idx_translate_cache_entity ON google_translate_cache(entity_type, entity_id);
CREATE INDEX idx_translate_cache_target_lang ON google_translate_cache(target_language);
CREATE INDEX idx_translate_cache_last_used ON google_translate_cache(last_used_at DESC);

-- Google Vertex AI Agent Sessions Tablosu
-- Vertex AI Agent Builder konuşma oturumları
CREATE TABLE google_vertex_ai_sessions (
    id BIGSERIAL PRIMARY KEY,
    session_uuid VARCHAR(300) NOT NULL UNIQUE,
    vertex_session_id VARCHAR(500),
    vertex_agent_id VARCHAR(300),
    vertex_project_id VARCHAR(200),
    agent_type VARCHAR(100) NOT NULL CHECK (agent_type IN (
        'matchmaking',
        'trend_analysis',
        'translation',
        'sales_assistant',
        'buyer_assistant',
        'content_generator',
        'sustainability_analyzer',
        'fabric_vision',
        'meeting_scheduler',
        'notification_agent'
    )),
    domain_key VARCHAR(50) DEFAULT 'hometex',
    user_id BIGINT,
    visitor_id VARCHAR(200),
    showroom_id BIGINT,
    session_context JSONB DEFAULT '{}',
    conversation_history JSONB DEFAULT '[]',
    intent_summary TEXT,
    entities_extracted JSONB DEFAULT '{}',
    session_outcome VARCHAR(100),
    lead_score NUMERIC(5,2),
    tokens_used INTEGER DEFAULT 0,
    api_calls INTEGER DEFAULT 0,
    cost_usd NUMERIC(10,6),
    language VARCHAR(10) DEFAULT 'en',
    is_active BOOLEAN DEFAULT TRUE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vertex_sessions_agent_type ON google_vertex_ai_sessions(agent_type);
CREATE INDEX idx_vertex_sessions_user_id ON google_vertex_ai_sessions(user_id);
CREATE INDEX idx_vertex_sessions_visitor_id ON google_vertex_ai_sessions(visitor_id);
CREATE INDEX idx_vertex_sessions_domain ON google_vertex_ai_sessions(domain_key);
CREATE INDEX idx_vertex_sessions_is_active ON google_vertex_ai_sessions(is_active);
CREATE INDEX idx_vertex_sessions_last_activity ON google_vertex_ai_sessions(last_activity_at DESC);

-- Google Cloud Storage Varlık Yönetimi
-- Tüm medya dosyalarının GCS bucket takibi
CREATE TABLE google_storage_assets (
    id BIGSERIAL PRIMARY KEY,
    bucket_name VARCHAR(300) NOT NULL,
    object_path VARCHAR(1000) NOT NULL,
    public_url TEXT,
    cdn_url TEXT,
    file_name VARCHAR(500) NOT NULL,
    file_type VARCHAR(100),
    mime_type VARCHAR(200),
    file_size_bytes BIGINT,
    width_px INTEGER,
    height_px INTEGER,
    duration_seconds INTEGER,
    entity_type VARCHAR(100),
    entity_id BIGINT,
    field_name VARCHAR(100),
    user_id BIGINT,
    domain_key VARCHAR(50) DEFAULT 'hometex',
    upload_source VARCHAR(100) DEFAULT 'web',
    processing_status VARCHAR(50) DEFAULT 'pending' CHECK (processing_status IN (
        'pending', 'processing', 'ready', 'failed', 'deleted'
    )),
    vision_ai_labels JSONB,
    vision_ai_colors JSONB,
    vision_ai_objects JSONB,
    is_optimized BOOLEAN DEFAULT FALSE,
    optimized_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gcs_assets_entity ON google_storage_assets(entity_type, entity_id);
CREATE INDEX idx_gcs_assets_user_id ON google_storage_assets(user_id);
CREATE INDEX idx_gcs_assets_domain ON google_storage_assets(domain_key);
CREATE INDEX idx_gcs_assets_processing ON google_storage_assets(processing_status);
CREATE INDEX idx_gcs_assets_file_type ON google_storage_assets(file_type);

-- ============================================================
-- 3. SA