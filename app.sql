
-- ============================================================================
-- PHASE 1: FOUNDATION (Utilities & Enums)
-- ============================================================================

-- Timestamp güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Proje durumu enum
CREATE TYPE project_status AS ENUM ('live', 'development', 'planned');

-- Sektör kategorileri enum
CREATE TYPE sector_category AS ENUM (
    'real_estate',
    'textile',
    'transportation',
    'health_finance',
    'aviation',
    'other'
);

-- ============================================================================
-- PHASE 2: DDL (Tables)
-- ============================================================================

-- Kullanıcı profilleri
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Kullanıcı rolleri
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, role)
);

CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);

-- Amiral gemisi projeleri (Live projeler)
CREATE TABLE public.flagship_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    status project_status DEFAULT 'live',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_flagship_projects_status ON public.flagship_projects(status);
CREATE INDEX idx_flagship_projects_display_order ON public.flagship_projects(display_order);
CREATE INDEX idx_flagship_projects_is_active ON public.flagship_projects(is_active);

-- Stratejik dijital varlıklar (Domain portföyü)
CREATE TABLE public.digital_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_name TEXT NOT NULL UNIQUE,
    sector sector_category NOT NULL,
    description TEXT,
    status project_status DEFAULT 'development',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_digital_assets_sector ON public.digital_assets(sector);
CREATE INDEX idx_digital_assets_status ON public.digital_assets(status);
CREATE INDEX idx_digital_assets_display_order ON public.digital_assets(display_order);
CREATE INDEX idx_digital_assets_is_active ON public.digital_assets(is_active);

-- Kurumsal değerler
CREATE TABLE public.corporate_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    icon_name TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_corporate_values_display_order ON public.corporate_values(display_order);
CREATE INDEX idx_corporate_values_is_active ON public.corporate_values(is_active);

-- Sektörel yetkinlikler
CREATE TABLE public.sector_competencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sector_name TEXT NOT NULL,
    description TEXT,
    icon_name TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sector_competencies_display_order ON public.sector_competencies(display_order);
CREATE INDEX idx_sector_competencies_is_active ON public.sector_competencies(is_active);

-- İletişim formu mesajları
CREATE TABLE public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_contact_messages_is_read ON public.contact_messages(is_read);
CREATE INDEX idx_contact_messages_created_at ON public.contact_messages(created_at DESC);

-- Dosya yüklemeleri (Proje görselleri, logolar)
CREATE TABLE public.file_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type TEXT,
    uploaded_by UUID,
    related_entity_type TEXT,
    related_entity_id UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_file_uploads_uploaded_by ON public.file_uploads(uploaded_by);
CREATE INDEX idx_file_uploads_related_entity ON public.file_uploads(related_entity_type, related_entity_id);

-- Stripe ödeme kayıtları (Gelecek için hazırlık)
CREATE TABLE public.payment_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    stripe_payment_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'CHF',
    status TEXT NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_payment_records_user_id ON public.payment_records(user_id);
CREATE INDEX idx_payment_records_stripe_payment_id ON public.payment_records(stripe_payment_id);
CREATE INDEX idx_payment_records_status ON public.payment_records(status);

-- AI görsel üretim kayıtları
CREATE TABLE public.ai_image_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    prompt TEXT NOT NULL,
    generated_image_url TEXT,
    model_used TEXT,
    generation_params JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ai_image_generations_user_id ON public.ai_image_generations(user_id);
CREATE INDEX idx_ai_image_generations_created_at ON public.ai_image_generations(created_at DESC);

-- ============================================================================
-- PHASE 3: LOGIC (Table-Dependent Functions)
-- ============================================================================

-- Kullanıcı rol kontrolü
CREATE OR REPLACE FUNCTION public.has_role(_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND role = _role
    );
$$;

-- Admin kontrolü
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT has_role('admin');
$$;

-- ============================================================================
-- PHASE 4: SECURITY (RLS Policies)
-- ============================================================================

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes profilleri görüntüleyebilir"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Kullanıcılar kendi profillerini güncelleyebilir"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- User Roles RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Adminler rolleri yönetebilir"
    ON public.user_roles FOR ALL
    USING (is_admin());

CREATE POLICY "Kullanıcılar kendi rollerini görüntüleyebilir"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);

-- Flagship Projects RLS
ALTER TABLE public.flagship_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes aktif projeleri görüntüleyebilir"
    ON public.flagship_projects FOR SELECT
    USING (is_active = true);

CREATE POLICY "Adminler projeleri yönetebilir"
    ON public.flagship_projects FOR ALL
    USING (is_admin());

-- Digital Assets RLS
ALTER TABLE public.digital_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes aktif dijital varlıkları görüntüleyebilir"
    ON public.digital_assets FOR SELECT
    USING (is_active = true);

CREATE POLICY "Adminler dijital varlıkları yönetebilir"
    ON public.digital_assets FOR ALL
    USING (is_admin());

-- Corporate Values RLS
ALTER TABLE public.corporate_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes aktif kurumsal değerleri görüntüleyebilir"
    ON public.corporate_values FOR SELECT
    USING (is_active = true);

CREATE POLICY "Adminler kurumsal değerleri yönetebilir"
    ON public.corporate_values FOR ALL
    USING (is_admin());

-- Sector Competencies RLS
ALTER TABLE public.sector_competencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes aktif sektörel yetkinlikleri görüntüleyebilir"
    ON public.sector_competencies FOR SELECT
    USING (is_active = true);

CREATE POLICY "Adminler sektörel yetkinlikleri yönetebilir"
    ON public.sector_competencies FOR ALL
    USING (is_admin());

-- Contact Messages RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes iletişim mesajı gönderebilir"
    ON public.contact_messages FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Adminler tüm mesajları görüntüleyebilir"
    ON public.contact_messages FOR SELECT
    USING (is_admin());

CREATE POLICY "Adminler mesajları güncelleyebilir"
    ON public.contact_messages FOR UPDATE
    USING (is_admin());

-- File Uploads RLS
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Adminler dosyaları yönetebilir"
    ON public.file_uploads FOR ALL
    USING (is_admin());

CREATE POLICY "Herkes dosyaları görüntüleyebilir"
    ON public.file_uploads FOR SELECT
    USING (true);

-- Payment Records RLS
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi ödeme kayıtlarını görüntüleyebilir"
    ON public.payment_records FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Adminler tüm ödeme kayıtlarını görüntüleyebilir"
    ON public.payment_records FOR SELECT
    USING (is_admin());

-- AI Image Generations RLS
ALTER TABLE public.ai_image_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi AI görsellerini görüntüleyebilir"
    ON public.ai_image_generations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Adminler AI görselleri oluşturabilir"
    ON public.ai_image_generations FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "Adminler tüm AI görsellerini görüntüleyebilir"
    ON public.ai_image_generations FOR SELECT
    USING (is_admin());

-- ============================================================================
-- PHASE 5: AUTOMATION (Triggers)
-- ============================================================================

-- Profiles timestamp trigger
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- User Roles timestamp trigger
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Flagship Projects timestamp trigger
CREATE TRIGGER update_flagship_projects_updated_at
    BEFORE UPDATE ON public.flagship_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Digital Assets timestamp trigger
CREATE TRIGGER update_digital_assets_updated_at
    BEFORE UPDATE ON public.digital_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Corporate Values timestamp trigger
CREATE TRIGGER update_corporate_values_updated_at
    BEFORE UPDATE ON public.corporate_values
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sector Competencies timestamp trigger
CREATE TRIGGER update_sector_competencies_updated_at
    BEFORE UPDATE ON public.sector_competencies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Contact Messages timestamp trigger
CREATE TRIGGER update_contact_messages_updated_at
    BEFORE UPDATE ON public.contact_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- File Uploads timestamp trigger
CREATE TRIGGER update_file_uploads_updated_at
    BEFORE UPDATE ON public.file_uploads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Payment Records timestamp trigger
CREATE TRIGGER update_payment_records_updated_at
    BEFORE UPDATE ON public.payment_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- AI Image Generations timestamp trigger
CREATE TRIGGER update_ai_image_generations_updated_at
    BEFORE UPDATE ON public.ai_image_generations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Yeni kullanıcı oluşturma trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    
    -- İlk kullanıcıya admin rolü ver
    IF NOT EXISTS (SELECT 1 FROM user_roles WHERE role = 'admin') THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'admin');
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- TEST DATA (Initial Content)
-- ============================================================================

-- Amiral gemisi projeleri
INSERT INTO public.flagship_projects (title, slug, description, logo_url, website_url, status, display_order) VALUES
('Perde.ai', 'perde-ai', 'Yapay zeka destekli perde ve ev tekstili platformu. Müşterilerinize özel tasarım önerileri ve otomatik ölçüm hesaplama sistemi.', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400', 'https://perde.ai', 'live', 1),
('Didimemlak.ai', 'didimemlak-ai', 'Didim bölgesine özel yapay zeka tabanlı emlak platformu. Akıllı fiyat analizi ve yatırım danışmanlığı sistemi.', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400', 'https://didimemlak.ai', 'live', 2);

-- Stratejik dijital varlıklar - Emlak & İnşaat
INSERT INTO public.digital_assets (domain_name, sector, description, status, display_order) VALUES
('immobiliens.ai', 'real_estate', 'Uluslararası emlak platformu - Almanca konuşulan bölgeler için AI destekli gayrimenkul çözümleri', 'development', 1),
('remhome.ai', 'real_estate', 'Uzaktan ev yönetimi ve akıllı ev sistemleri entegrasyonu', 'development', 2),
('satilik.ai', 'real_estate', 'Türkiye geneli satılık emlak ilanları için yapay zeka destekli platform', 'development', 3);

-- Stratejik dijital varlıklar - Tekstil & Tasarım
INSERT INTO public.digital_assets (domain_name, sector, description, status, display_order) VALUES
('hometex.ai', 'textile', 'Ev tekstili ürünleri için AI tabanlı tasarım ve üretim platformu', 'development', 4),
('vorhang.ai', 'textile', 'Perde ve dekorasyon ürünleri için Almanca pazar odaklı platform', 'development', 5),
('mobel.ai', 'textile', 'Mobilya ve iç mekan tasarımı için yapay zeka destekli çözümler', 'development', 6),
('heimtex.ai', 'textile', 'Ev tekstili toptan satış ve B2B çözümleri platformu', 'development', 7);

-- Stratejik dijital varlıklar - Ulaşım & Kiralama
INSERT INTO public.digital_assets (domain_name, sector, description, status, display_order) VALUES
('rentworld.ai', 'transportation', 'Global araç kiralama platformu - AI destekli fiyatlandırma ve rezervasyon', 'development', 8),
('araba24.ai', 'transportation', 'Türkiye otomotiv pazarı için 7/24 araç alım-satım platformu', 'development', 9),
('caravan24.ai', 'transportation', 'Karavan ve kamp aracı kiralama hizmetleri', 'development', 10),
('taxi24.ai', 'transportation', 'Akıllı taksi çağırma ve yönetim sistemi', 'development', 11);

-- Stratejik dijital varlıklar - Sağlık & Finans
INSERT INTO public.digital_assets (domain_name, sector, description, status, display_order) VALUES
('medicare.ai', 'health_finance', 'Sağlık sigortası ve tıbbi danışmanlık platformu', 'development', 12),
('goldborse.ai', 'health_finance', 'Altın ve귀금속 borsası - AI destekli yatırım analizi', 'development', 13),
('onlyaudit.ai', 'health_finance', 'Kurumsal denetim ve finansal danışmanlık hizmetleri', 'development', 14);

-- Stratejik dijital varlıklar - Havacılık
INSERT INTO public.digital_assets (domain_name, sector, description, status, display_order) VALUES
('ajet.ai', 'aviation', 'Özel jet kiralama ve havacılık hizmetleri platformu', 'development', 15),
('flug24.ai', 'aviation', 'Uçuş rezervasyon ve karşılaştırma sistemi', 'development', 16),
('flughafen.ai', 'aviation', 'Havalimanı hizmetleri ve transfer çözümleri', 'development', 17);

-- Kurumsal değerler
INSERT INTO public.corporate_values (title, description, icon_name, display_order) VALUES
('Şeffaf Ticaret', 'Tüm iş süreçlerimizde açıklık ve dürüstlük ilkesiyle hareket ederiz. Müşterilerimiz ve iş ortaklarımızla güven temelli ilişkiler kurarız.', 'Shield', 1),
('AI Entegrasyonu', 'Yapay zeka teknolojilerini her sektöre entegre ederek inovasyon liderliği sağlarız. Sürekli araştırma ve geliştirme ile geleceği şekillendiririz.', 'Cpu', 2),
('Küresel Otorite', 'Uluslararası standartlara uygun, İsviçre kalitesiyle hizmet sunarız. Yerel uzmanlık ile global vizyonu birleştiririz.', 'Globe', 3);

-- Sektörel yetkinlikler
INSERT INTO public.sector_competencies (sector_name, description, icon_name, display_order) VALUES
('Emlak & Gayrimenkul', 'AI destekli fiyat analizi, sanal tur teknolojileri ve akıllı yatırım danışmanlığı', 'Home', 1),
('Tekstil & Tasarım', 'Dijital tasarım araçları, üretim optimizasyonu ve e-ticaret entegrasyonu', 'Palette', 2),
('Ulaşım & Lojistik', 'Akıllı rota planlama, filo yönetimi ve rezervasyon sistemleri', 'Truck', 3),
('Sağlık Teknolojileri', 'Tele-tıp çözümleri, hasta yönetim sistemleri ve AI destekli teşhis', 'Heart', 4),
('Finans & Yatırım', 'Algoritmik ticaret, risk analizi ve portföy yönetimi', 'TrendingUp', 5),
('Havacılık', 'Uçuş optimizasyonu, rezervasyon sistemleri ve havalimanı operasyonları', 'Plane', 6),
('E-Ticaret', 'Omnichannel satış platformları, ödeme sistemleri ve müşteri deneyimi', 'ShoppingCart', 7),
('Turizm & Konaklama', 'Otel yönetim sistemleri, dinamik fiyatlandırma ve misafir deneyimi', 'MapPin', 8),
('Eğitim Teknolojileri', 'Online öğrenme platformları, AI destekli eğitim içerikleri', 'GraduationCap', 9),
('Enerji & Sürdürülebilirlik', 'Akıllı enerji yönetimi, yenilenebilir enerji çözümleri', 'Zap', 10),
('Medya & İletişim', 'İçerik yönetim sistemleri, sosyal medya analizi ve dijital pazarlama', 'Radio', 11),
('Üretim & Endüstri', 'Akıllı fabrika çözümleri, IoT entegrasyonu ve üretim optimizasyonu', 'Factory', 12);

-- ============================================
-- PHASE 1: FOUNDATION (Enums & Functions)
-- ============================================

-- Yasal sayfa türleri için enum
CREATE TYPE legal_page_type AS ENUM (
    'terms_of_service',
    'cancellation_policy', 
    'impressum',
    'privacy_policy'
);

-- SEO şema türleri için enum
CREATE TYPE seo_schema_type AS ENUM (
    'organization',
    'website',
    'breadcrumb',
    'faq',
    'article'
);

-- Timestamp güncelleme fonksiyonu (zaten var ama tekrar tanımlıyoruz)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PHASE 2: DDL (Tables)
-- ============================================

-- Yasal sayfalar için dinamik içerik yönetimi
CREATE TABLE IF NOT EXISTS public.legal_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_type legal_page_type NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    language TEXT DEFAULT 'tr',
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    last_updated_by UUID, -- Logical FK to profiles
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_legal_pages_page_type ON public.legal_pages(page_type);
CREATE INDEX idx_legal_pages_is_active ON public.legal_pages(is_active);
CREATE INDEX idx_legal_pages_last_updated_by ON public.legal_pages(last_updated_by);

-- SEO metadata ve JSON-LD şemaları
CREATE TABLE IF NOT EXISTS public.seo_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_identifier TEXT NOT NULL UNIQUE, -- 'home', 'impressum', 'privacy' vb.
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT[],
    og_title TEXT,
    og_description TEXT,
    og_image TEXT,
    schema_type seo_schema_type,
    schema_data JSONB, -- JSON-LD şeması
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_seo_metadata_page_identifier ON public.seo_metadata(page_identifier);
CREATE INDEX idx_seo_metadata_is_active ON public.seo_metadata(is_active);
CREATE INDEX idx_seo_metadata_schema_type ON public.seo_metadata(schema_type);

-- Site genel ayarları
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    setting_type TEXT NOT NULL, -- 'counter', 'color', 'animation', 'general'
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_site_settings_setting_key ON public.site_settings(setting_key);
CREATE INDEX idx_site_settings_setting_type ON public.site_settings(setting_type);
CREATE INDEX idx_site_settings_is_active ON public.site_settings(is_active);

-- Animasyon ve tasarım parametreleri
CREATE TABLE IF NOT EXISTS public.design_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component_name TEXT NOT NULL UNIQUE, -- 'hero_counter', 'flagship_card', 'glassmorphism'
    animation_enabled BOOLEAN DEFAULT true,
    animation_duration INTEGER DEFAULT 2000, -- milliseconds
    animation_params JSONB, -- {easing: 'ease-out', delay: 500}
    style_params JSONB, -- {blur: 10, opacity: 0.8, borderRadius: 16}
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_design_settings_component_name ON public.design_settings(component_name);
CREATE INDEX idx_design_settings_is_active ON public.design_settings(is_active);

-- İsviçre renk teması ve marka renkleri
CREATE TABLE IF NOT EXISTS public.color_themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    theme_name TEXT NOT NULL UNIQUE,
    primary_color TEXT NOT NULL, -- #FF0000 (İsviçre kırmızısı)
    secondary_color TEXT NOT NULL, -- #FFFFFF (İsviçre beyazı)
    accent_color TEXT,
    background_color TEXT,
    text_color TEXT,
    color_palette JSONB, -- Tüm renk değişkenleri
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_color_themes_theme_name ON public.color_themes(theme_name);
CREATE INDEX idx_color_themes_is_active ON public.color_themes(is_active);
CREATE INDEX idx_color_themes_is_default ON public.color_themes(is_default);

-- ============================================
-- PHASE 3: LOGIC (Helper Functions)
-- ============================================

-- Admin kontrolü (zaten var, tekrar tanımlıyoruz)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- Aktif site ayarını getir
CREATE OR REPLACE FUNCTION public.get_site_setting(key TEXT)
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT setting_value 
  FROM site_settings 
  WHERE setting_key = key 
  AND is_active = true
  LIMIT 1;
$$;

-- Aktif renk temasını getir
CREATE OR REPLACE FUNCTION public.get_active_color_theme()
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT row_to_json(color_themes.*)::jsonb
  FROM color_themes 
  WHERE is_active = true 
  AND is_default = true
  LIMIT 1;
$$;

-- ============================================
-- PHASE 4: SECURITY (RLS Policies)
-- ============================================

ALTER TABLE public.legal_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.color_themes ENABLE ROW LEVEL SECURITY;

-- Legal Pages Policies
CREATE POLICY "Herkes aktif yasal sayfaları görüntüleyebilir" 
ON public.legal_pages FOR SELECT
USING (is_active = true);

CREATE POLICY "Adminler yasal sayfaları yönetebilir" 
ON public.legal_pages FOR ALL
USING (is_admin());

-- SEO Metadata Policies
CREATE POLICY "Herkes aktif SEO metadata görüntüleyebilir" 
ON public.seo_metadata FOR SELECT
USING (is_active = true);

CREATE POLICY "Adminler SEO metadata yönetebilir" 
ON public.seo_metadata FOR ALL
USING (is_admin());

-- Site Settings Policies
CREATE POLICY "Herkes aktif site ayarlarını görüntüleyebilir" 
ON public.site_settings FOR SELECT
USING (is_active = true);

CREATE POLICY "Adminler site ayarlarını yönetebilir" 
ON public.site_settings FOR ALL
USING (is_admin());

-- Design Settings Policies
CREATE POLICY "Herkes aktif tasarım ayarlarını görüntüleyebilir" 
ON public.design_settings FOR SELECT
USING (is_active = true);

CREATE POLICY "Adminler tasarım ayarlarını yönetebilir" 
ON public.design_settings FOR ALL
USING (is_admin());

-- Color Themes Policies
CREATE POLICY "Herkes aktif renk temalarını görüntüleyebilir" 
ON public.color_themes FOR SELECT
USING (is_active = true);

CREATE POLICY "Adminler renk temalarını yönetebilir" 
ON public.color_themes FOR ALL
USING (is_admin());

-- ============================================
-- PHASE 5: AUTOMATION (Triggers)
-- ============================================

CREATE TRIGGER update_legal_pages_updated_at
    BEFORE UPDATE ON public.legal_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seo_metadata_updated_at
    BEFORE UPDATE ON public.seo_metadata
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_design_settings_updated_at
    BEFORE UPDATE ON public.design_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_color_themes_updated_at
    BEFORE UPDATE ON public.color_themes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TEST DATA (Initial Configuration)
-- ============================================

-- 1. Yasal Sayfalar (İsviçre GmbH Hukukuna Uygun)
INSERT INTO public.legal_pages (page_type, title, content, language, version) VALUES
('impressum', 'Impressum (Yasal Bildirim)', 
'# Impressum

**Şirket Adı:** Aipyram GmbH  
**Adres:** Dietikon, Zürih, İsviçre  
**UID Numarası:** CHE-XXX.XXX.XXX  
**E-posta:** info@aipyram.ch  
**Telefon:** +41 XX XXX XX XX

**Yetkililer:** Kurumsal Yönetim Kurulu

**Ticaret Sicil:** Zürih Ticaret Sicili  
**Faaliyet Alanı:** Yapay Zeka Teknolojileri, Dijital Varlık Yönetimi, Sektörel AI Çözümleri

**Sorumluluk Reddi:**  
Aipyram GmbH, web sitesinde yer alan bilgilerin doğruluğu için çaba gösterse de, içeriğin eksiksiz ve güncel olduğuna dair garanti vermez.

**Telif Hakları:**  
Bu web sitesindeki tüm içerik Aipyram GmbH''nin mülkiyetindedir.', 'tr', 1),

('terms_of_service', 'Hizmet Şartları', 
'# Hizmet Şartları

**Son Güncelleme:** 2024

## 1. Genel Hükümler
Aipyram GmbH (bundan böyle "Şirket" olarak anılacaktır), İsviçre yasalarına tabi bir limited şirkettir. Bu hizmet şartları, Şirket''in sunduğu tüm dijital hizmetler için geçerlidir.

## 2. Hizmet Kapsamı
- Yapay zeka destekli sektörel çözümler
- Dijital varlık danışmanlığı
- AI entegrasyon hizmetleri
- Domain portföyü yönetimi

## 3. Kullanıcı Yükümlülükleri
Kullanıcılar, platformu yasalara uygun şekilde kullanmayı taahhüt eder.

## 4. Fikri Mülkiyet
Tüm içerik, yazılım ve tasarımlar Aipyram GmbH''nin mülkiyetindedir.

## 5. Sorumluluk Sınırlaması
Şirket, İsviçre Borçlar Kanunu çerçevesinde sorumludur.

## 6. Uygulanacak Hukuk
Bu sözleşme İsviçre hukukuna tabidir. Uyuşmazlıklar Zürih mahkemelerinde çözülür.', 'tr', 1),

('cancellation_policy', 'İptal Politikası', 
'# İptal ve İade Politikası

## 1. İptal Hakkı
İsviçre Tüketici Koruma Yasası uyarınca, tüketiciler 14 gün içinde cayma hakkına sahiptir.

## 2. İptal Süreci
İptal talebi info@aipyram.ch adresine yazılı olarak bildirilmelidir.

## 3. İade Koşulları
- Dijital hizmetler: Hizmet başlamadan önce iptal edilebilir
- Abonelikler: Bir sonraki fatura döneminden önce iptal edilmelidir
- Özel projeler: Sözleşme şartlarına göre değerlendirilir

## 4. İade Süresi
Onaylanan iadeler 14 iş günü içinde işleme alınır.

## 5. İletişim
İptal ve iadelerle ilgili sorularınız için: info@aipyram.ch', 'tr', 1),

('privacy_policy', 'Gizlilik Politikası', 
'# Gizlilik Politikası

## 1. Veri Sorumlusu
Aipyram GmbH, İsviçre Veri Koruma Yasası (DSG) ve GDPR uyarınca veri sorumlusudur.

## 2. Toplanan Veriler
- Kimlik bilgileri (ad, e-posta)
- Kullanım verileri (IP adresi, tarayıcı bilgisi)
- İletişim kayıtları

## 3. Veri İşleme Amaçları
- Hizmet sunumu
- Müşteri desteği
- Yasal yükümlülükler

## 4. Veri Güvenliği
Verileriniz SSL şifreleme ve güvenli sunucularda korunur.

## 5. Kullanıcı Hakları
- Erişim hakkı
- Düzeltme hakkı
- Silme hakkı (unutulma hakkı)
- Veri taşınabilirliği

## 6. Çerezler
Web sitemiz analitik ve işlevsel çerezler kullanır.

## 7. İletişim
Gizlilik sorularınız için: privacy@aipyram.ch', 'tr', 1);

-- 2. SEO Metadata ve JSON-LD Şemaları
INSERT INTO public.seo_metadata (page_identifier, meta_title, meta_description, meta_keywords, schema_type, schema_data) VALUES
('home', 
'Aipyram GmbH - Sektörel Yapay Zeka Otoritesi | İsviçre', 
'Aipyram GmbH, İsviçre merkezli yapay zeka teknolojileri holdingidir. 271+ dijital varlık, 12 sektörde AI entegrasyonu. perde.ai ve didimemlak.ai ile sektörel liderlik.', 
ARRAY['yapay zeka', 'AI teknolojileri', 'İsviçre GmbH', 'dijital varlık', 'sektörel AI', 'perde.ai', 'didimemlak.ai'],
'organization',
'{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Aipyram GmbH",
  "url": "https://aipyram.ch",
  "logo": "https://aipyram.ch/logo.png",
  "description": "İsviçre merkezli sektörel yapay zeka teknolojileri holdingi. 271+ dijital varlık portföyü ile 12 farklı sektörde AI entegrasyonu sağlayan otorite kuruluş.",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Dietikon",
    "addressRegion": "Zürih",
    "addressCountry": "CH"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "info@aipyram.ch",
    "contactType": "customer service"
  },
  "sameAs": [
    "https://linkedin.com/company/aipyram"
  ],
  "foundingDate": "2024",
  "numberOfEmployees": {
    "@type": "QuantitativeValue",
    "value": "12+"
  },
  "owns": [
    {
      "@type": "Product",
      "name": "perde.ai",
      "description": "Yapay zeka destekli perde ve tekstil çözümleri"
    },
    {
      "@type": "Product",
      "name": "didimemlak.ai",
      "description": "Yapay zeka destekli emlak platformu"
    }
  ]
}'::jsonb);

-- 3. Site Ayarları (Sayaçlar ve Genel Konfigürasyon)
INSERT INTO public.site_settings (setting_key, setting_value, setting_type, description) VALUES
('hero_domain_count', '{"value": 271, "suffix": "+", "label": "Dijital Varlık"}'::jsonb, 'counter', 'Hero section domain sayacı'),
('hero_sector_count', '{"value": 12, "suffix": "+", "label": "Sektör"}'::jsonb, 'counter', 'Hero section sektör sayacı'),
('company_name', '{"tr": "Aipyram GmbH", "de": "Aipyram GmbH", "en": "Aipyram GmbH"}'::jsonb, 'general', 'Şirket adı'),
('company_tagline', '{"tr": "Sektörel Yapay Zeka Ekosistemi", "de": "Branchenspezifisches KI-Ökosystem", "en": "Sector-Specific AI Ecosystem"}'::jsonb, 'general', 'Şirket sloganı'),
('contact_email', '{"value": "info@aipyram.ch"}'::jsonb, 'general', 'İletişim e-postası'),
('company_location', '{"city": "Dietikon", "region": "Zürih", "country": "İsviçre", "country_code": "CH"}'::jsonb, 'general', 'Şirket konumu');

-- 4. Tasarım Ayarları (Animasyonlar ve Glassmorphism)
INSERT INTO public.design_settings (component_name, animation_enabled, animation_duration, animation_params, style_params) VALUES
('hero_counter', true, 2500, 
'{"easing": "ease-out", "delay": 500, "startDelay": 1000}'::jsonb,
'{"fontSize": "3rem", "fontWeight": "bold", "color": "#FF0000"}'::jsonb),

('flagship_card', true, 300,
'{"easing": "ease-in-out", "hoverScale": 1.05}'::jsonb,
'{"blur": 10, "opacity": 0.15, "borderRadius": 16, "border": "1px solid rgba(255, 255, 255, 0.2)", "background": "rgba(255, 255, 255, 0.1)", "boxShadow": "0 8px 32px 0 rgba(31, 38, 135, 0.37)"}'::jsonb),

('glassmorphism_global', true, 0,
'{"enabled": true}'::jsonb,
'{"backdropFilter": "blur(10px)", "background": "rgba(255, 255, 255, 0.1)", "border": "1px solid rgba(255, 255, 255, 0.18)"}'::jsonb),

('smooth_scroll', true, 800,
'{"behavior": "smooth", "easing": "ease-in-out"}'::jsonb,
'{"offset": 80}'::jsonb),

('mobile_menu', true, 300,
'{"slideDirection": "right", "easing": "ease-out"}'::jsonb,
'{"background": "rgba(26, 35, 50, 0.95)", "blur": 20}'::jsonb);

-- 5. Renk Temaları (İsviçre Bayrağı Renkleri)
INSERT INTO public.color_themes (theme_name, primary_color, secondary_color, accent_color, background_color, text_color, color_palette, is_active, is_default) VALUES
('swiss_corporate', '#FF0000', '#FFFFFF', '#DC143C', '#1a2332', '#F8F9FA',
'{
  "swiss_red": "#FF0000",
  "swiss_white": "#FFFFFF",
  "swiss_red_dark": "#DC143C",
  "swiss_red_light": "#FF6B6B",
  "navy_dark": "#1a2332",
  "navy_medium": "#2d3748",
  "silver_gray": "#a0aec0",
  "light_gray": "#e2e8f0",
  "text_primary": "#F8F9FA",
  "text_secondary": "#CBD5E0",
  "success": "#48BB78",
  "warning": "#ECC94B",
  "error": "#F56565",
  "gradient_primary": "linear-gradient(135deg, #FF0000 0%, #DC143C 100%)",
  "gradient_secondary": "linear-gradient(135deg, #1a2332 0%, #2d3748 100%)",
  "glassmorphism_bg": "rgba(255, 255, 255, 0.1)",
  "glassmorphism_border": "rgba(255, 255, 255, 0.18)"
}'::jsonb, true, true);

-- 6. Mevcut Tablolara Örnek Veriler (Eksikleri Tamamlama)

-- Flagship Projects (Amiral Gemileri)
INSERT INTO public.flagship_projects (title, slug, description, logo_url, website_url, status, display_order, is_active) VALUES
('perde.ai', 'perde-ai', 
'Yapay zeka destekli perde ve tekstil çözümleri platformu. Müşterilere kişiselleştirilmiş tasarım önerileri ve otomatik ölçüm hesaplamaları sunar.', 
'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400', 
'https://perde.ai', 
'live', 1, true),

('didimemlak.ai', 'didimemlak-ai', 
'Yapay zeka destekli emlak platformu. Akıllı fiyat analizi, konum önerileri ve sanal tur teknolojileri ile emlak sektörünü dönüştürür.', 
'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400', 
'https://didimemlak.ai', 
'live', 2, true);

-- Digital Assets (Stratejik Domainler)
INSERT INTO public.digital_assets (domain_name, sector, description, status, display_order) VALUES
('immobiliens.ai', 'real_estate', 'Uluslararası emlak platformu', 'development', 1),
('remhome.ai', 'real_estate', 'Uzaktan ev yönetimi çözümleri', 'development', 2),
('satilik.ai', 'real_estate', 'Satılık emlak ilanları', 'development', 3),
('hometex.ai', 'textile', 'Ev tekstili AI çözümleri', 'development', 4),
('vorhang.ai', 'textile', 'Perde tasarım platformu', 'development', 5),
('mobel.ai', 'textile', 'Mobilya tasarım asistanı', 'development', 6),
('heimtex.ai', 'textile', 'Ev tekstili ekosistemi', 'development', 7),
('rentworld.ai', 'transportation', 'Küresel kiralama platformu', 'development', 8),
('araba24.ai', 'transportation', '7/24 araç kiralama', 'development', 9),
('caravan24.ai', 'transportation', 'Karavan kiralama hizmetleri', 'development', 10),
('taxi24.ai', 'transportation', 'AI destekli taksi çağırma', 'development', 11),
('medicare.ai', 'healthcare', 'Sağlık danışmanlığı platformu', 'development', 12),
('goldborse.ai', 'finance', 'Altın borsa analizi', 'development', 13),
('onlyaudit.ai', 'finance', 'Denetim ve muhasebe AI', 'development', 14),
('ajet.ai', 'aviation', 'Havayolu rezervasyon sistemi', 'development', 15),
('flug24.ai', 'aviation', 'Uçuş karşılaştırma motoru', 'development', 16),
('flughafen.ai', 'aviation', 'Havalimanı bilgi sistemi', 'development', 17);

-- Corporate Values (Kurumsal Değerler)
INSERT INTO public.corporate_values (title, description, icon_name, display_order) VALUES
('Şeffaf Ticaret', 'Tüm iş süreçlerimizde açıklık ve güven ilkesiyle hareket ederiz. İsviçre iş etiği standartlarına bağlıyız.', 'shield-check', 1),
('AI Entegrasyonu', 'Yapay zeka teknolojilerini sektörel ihtiyaçlara göre özelleştirerek lider çözümler sunarız.', 'cpu', 2),
('Küresel Otorite', 'Uluslararası standartlarda hizmet kalitesi ve teknoloji liderliği hedefliyoruz.', 'globe', 3);

-- Sector Competencies (Sektörel Yetkinlikler)
INSERT INTO public.sector_competencies (sector_name, description, icon_name, display_order) VALUES
('Emlak & İnşaat', 'Akıllı fiyat analizi, sanal tur, konum önerileri', 'building', 1),
('Tekstil & Tasarım', 'Kişiselleştirilmiş tasarım, ölçüm hesaplama, trend analizi', 'scissors', 2),
('Ulaşım & Kiralama', 'Filo yönetimi, rota optimizasyonu, rezervasyon sistemleri', 'truck', 3),
('Sağlık & Tıp', 'Hasta takibi, randevu yönetimi, teşhis desteği', 'heart-pulse', 4),
('Finans & Denetim', 'Risk analizi, muhasebe otomasyonu, uyumluluk kontrolü', 'coins', 5),
('Havacılık', 'Uçuş karşılaştırma, rezervasyon, havalimanı bilgi sistemleri', 'plane', 6),
('E-Ticaret', 'Ürün önerileri, fiyat optimizasyonu, müşteri analizi', 'shopping-cart', 7),
('Eğitim', 'Kişiselleştirilmiş öğrenme, içerik üretimi, sınav değerlendirme', 'graduation-cap', 8),
('Turizm', 'Otel rezervasyonu, tur planlama, destinasyon önerileri', 'map-pin', 9),
('Gıda & Restoran', 'Menü optimizasyonu, sipariş yönetimi, müşteri tercihleri', 'utensils', 10),
('Enerji', 'Tüketim analizi, verimlilik önerileri, sürdürülebilirlik', 'zap', 11),
('Hukuk', 'Doküman analizi, dava takibi, hukuki danışmanlık', 'scale', 12);


-- ============================================
-- PHASE 1: FOUNDATION (Utilities & ENUMs)
-- ============================================

-- Genişletilmiş Sektör Kategorileri (12 Sektör)
DROP TYPE IF EXISTS SECTOR_CATEGORY CASCADE;
CREATE TYPE SECTOR_CATEGORY AS ENUM (
    'textile',
    'interior_design',
    'furniture',
    'curtain',
    'ai_solutions',
    'real_estate',
    'architecture',
    'construction',
    'hospitality',
    'retail',
    'manufacturing',
    'technology'
);

-- Ajan Durumları
CREATE TYPE AGENT_STATUS AS ENUM (
    'active',
    'idle',
    'busy',
    'maintenance',
    'offline',
    'error'
);

-- Görev Durumları
CREATE TYPE TASK_STATUS AS ENUM (
    'pending',
    'in_progress',
    'completed',
    'failed',
    'cancelled',
    'scheduled'
);

-- Görev Öncelik Seviyeleri
CREATE TYPE TASK_PRIORITY AS ENUM (
    'critical',
    'high',
    'medium',
    'low'
);

-- Otomasyon Tetikleyici Tipleri
CREATE TYPE AUTOMATION_TRIGGER AS ENUM (
    'time_based',
    'event_based',
    'condition_based',
    'manual',
    'aloha_command'
);

-- Proje Durumları (Mevcut)
CREATE TYPE PROJECT_STATUS AS ENUM (
    'planning',
    'development',
    'testing',
    'live',
    'maintenance',
    'archived'
);

-- Yasal Sayfa Tipleri (Mevcut)
CREATE TYPE LEGAL_PAGE_TYPE AS ENUM (
    'terms_of_service',
    'privacy_policy',
    'cancellation_policy',
    'cookie_policy',
    'gdpr_compliance'
);

-- SEO Şema Tipleri (Mevcut)
CREATE TYPE SEO_SCHEMA_TYPE AS ENUM (
    'organization',
    'website',
    'article',
    'product',
    'service',
    'local_business'
);

-- Timestamp Güncelleme Fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PHASE 2: DDL (Tables)
-- ============================================

-- AI Ajanlar Tablosu
CREATE TABLE IF NOT EXISTS public.ai_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL UNIQUE,
    agent_type TEXT NOT NULL, -- 'domain_manager', 'content_creator', 'seo_optimizer', 'analytics', etc.
    sector SECTOR_CATEGORY NOT NULL,
    status AGENT_STATUS DEFAULT 'idle',
    capabilities JSONB, -- Ajanın yetenekleri
    configuration JSONB, -- Ajan konfigürasyonu
    performance_metrics JSONB, -- Başarı oranı, görev sayısı, ortalama süre
    last_active_at TIMESTAMPTZ,
    assigned_domains TEXT[], -- Sorumlu olduğu domainler
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_agents_status ON public.ai_agents(status);
CREATE INDEX idx_ai_agents_sector ON public.ai_agents(sector);
CREATE INDEX idx_ai_agents_agent_type ON public.ai_agents(agent_type);
CREATE INDEX idx_ai_agents_is_active ON public.ai_agents(is_active);

-- Ajan Görevleri Tablosu
CREATE TABLE IF NOT EXISTS public.agent_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL, -- Logical FK to ai_agents
    task_name TEXT NOT NULL,
    task_type TEXT NOT NULL, -- 'domain_check', 'content_update', 'seo_audit', 'report_generation'
    priority TASK_PRIORITY DEFAULT 'medium',
    status TASK_STATUS DEFAULT 'pending',
    domain_id UUID, -- Logical FK to domain_management
    sector SECTOR_CATEGORY,
    task_params JSONB, -- Görev parametreleri
    result JSONB, -- Görev sonucu
    error_message TEXT,
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_by TEXT DEFAULT 'aloha', -- 'aloha', 'admin', 'system'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_tasks_agent_id ON public.agent_tasks(agent_id);
CREATE INDEX idx_agent_tasks_status ON public.agent_tasks(status);
CREATE INDEX idx_agent_tasks_priority ON public.agent_tasks(priority);
CREATE INDEX idx_agent_tasks_domain_id ON public.agent_tasks(domain_id);
CREATE INDEX idx_agent_tasks_sector ON public.agent_tasks(sector);
CREATE INDEX idx_agent_tasks_scheduled_at ON public.agent_tasks(scheduled_at);

-- Ajan Log Tablosu
CREATE TABLE IF NOT EXISTS public.agent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL, -- Logical FK to ai_agents
    task_id UUID, -- Logical FK to agent_tasks
    log_level TEXT NOT NULL, -- 'info', 'warning', 'error', 'critical'
    message TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_logs_agent_id ON public.agent_logs(agent_id);
CREATE INDEX idx_agent_logs_task_id ON public.agent_logs(task_id);
CREATE INDEX idx_agent_logs_log_level ON public.agent_logs(log_level);
CREATE INDEX idx_agent_logs_created_at ON public.agent_logs(created_at DESC);

-- Domain Yönetim Tablosu (270 Domain için detaylı yönetim)
CREATE TABLE IF NOT EXISTS public.domain_management (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_name TEXT NOT NULL UNIQUE,
    sector SECTOR_CATEGORY NOT NULL,
    registrar TEXT,
    expiry_date DATE,
    dns_provider TEXT,
    hosting_provider TEXT,
    ssl_status TEXT, -- 'active', 'expiring', 'expired'
    ssl_expiry_date DATE,
    status PROJECT_STATUS DEFAULT 'planning',
    assigned_agent_id UUID, -- Logical FK to ai_agents
    automation_enabled BOOLEAN DEFAULT true,
    health_score INTEGER DEFAULT 100, -- 0-100 arası sağlık skoru
    last_check_at TIMESTAMPTZ,
    metadata JSONB, -- Ek bilgiler
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_domain_management_sector ON public.domain_management(sector);
CREATE INDEX idx_domain_management_status ON public.domain_management(status);
CREATE INDEX idx_domain_management_assigned_agent_id ON public.domain_management(assigned_agent_id);
CREATE INDEX idx_domain_management_expiry_date ON public.domain_management(expiry_date);
CREATE INDEX idx_domain_management_ssl_expiry_date ON public.domain_management(ssl_expiry_date);
CREATE INDEX idx_domain_management_is_active ON public.domain_management(is_active);

-- Otomasyon Kuralları Tablosu
CREATE TABLE IF NOT EXISTS public.automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name TEXT NOT NULL UNIQUE,
    description TEXT,
    trigger_type AUTOMATION_TRIGGER NOT NULL,
    trigger_config JSONB NOT NULL, -- Tetikleyici konfigürasyonu (zaman, olay, koşul)
    action_type TEXT NOT NULL, -- 'create_task', 'send_alert', 'update_domain', 'run_agent'
    action_config JSONB NOT NULL, -- Aksiyon konfigürasyonu
    target_sector SECTOR_CATEGORY,
    target_domains TEXT[], -- Belirli domainler için
    priority TASK_PRIORITY DEFAULT 'medium',
    is_active BOOLEAN DEFAULT true,
    last_executed_at TIMESTAMPTZ,
    execution_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_automation_rules_trigger_type ON public.automation_rules(trigger_type);
CREATE INDEX idx_automation_rules_target_sector ON public.automation_rules(target_sector);
CREATE INDEX idx_automation_rules_is_active ON public.automation_rules(is_active);

-- Aloha Komut Tablosu (Dijital İkiz Karar Sistemi)
CREATE TABLE IF NOT EXISTS public.aloha_commands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    command_type TEXT NOT NULL, -- 'task_assignment', 'priority_change', 'agent_control', 'system_optimization'
    command_data JSONB NOT NULL,
    reasoning TEXT, -- Aloha'nın karar verme mantığı
    target_agent_id UUID, -- Logical FK to ai_agents
    target_task_id UUID, -- Logical FK to agent_tasks
    target_domain_id UUID, -- Logical FK to domain_management
    status TEXT DEFAULT 'pending', -- 'pending', 'executed', 'failed'
    execution_result JSONB,
    executed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_aloha_commands_command_type ON public.aloha_commands(command_type);
CREATE INDEX idx_aloha_commands_status ON public.aloha_commands(status);
CREATE INDEX idx_aloha_commands_target_agent_id ON public.aloha_commands(target_agent_id);
CREATE INDEX idx_aloha_commands_created_at ON public.aloha_commands(created_at DESC);

-- Mevcut Tablolar (Güncellenmiş)
CREATE TABLE IF NOT EXISTS public.digital_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_name TEXT NOT NULL UNIQUE,
    sector SECTOR_CATEGORY NOT NULL,
    description TEXT,
    status PROJECT_STATUS DEFAULT 'development',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_digital_assets_sector ON public.digital_assets(sector);
CREATE INDEX idx_digital_assets_status ON public.digital_assets(status);
CREATE INDEX idx_digital_assets_is_active ON public.digital_assets(is_active);
CREATE INDEX idx_digital_assets_display_order ON public.digital_assets(display_order);

-- Profiller Tablosu
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Kullanıcı Rolleri Tablosu
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);

-- Site Ayarları Tablosu
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    setting_type TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_site_settings_setting_key ON public.site_settings(setting_key);
CREATE INDEX idx_site_settings_is_active ON public.site_settings(is_active);

-- ============================================
-- PHASE 3: LOGIC (Table-Dependent Functions)
-- ============================================

-- Admin Kontrolü
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    );
$$;

-- Ajan Performans Güncelleme Fonksiyonu
CREATE OR REPLACE FUNCTION public.update_agent_performance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' THEN
        UPDATE ai_agents
        SET 
            performance_metrics = jsonb_set(
                COALESCE(performance_metrics, '{}'::jsonb),
                '{completed_tasks}',
                to_jsonb(COALESCE((performance_metrics->>'completed_tasks')::int, 0) + 1)
            ),
            last_active_at = NOW(),
            updated_at = NOW()
        WHERE id = NEW.agent_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Domain Sağlık Skoru Hesaplama
CREATE OR REPLACE FUNCTION public.calculate_domain_health_score(domain_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    score INTEGER := 100;
    days_to_expiry INTEGER;
    days_to_ssl_expiry INTEGER;
BEGIN
    SELECT 
        EXTRACT(DAY FROM (expiry_date - CURRENT_DATE)),
        EXTRACT(DAY FROM (ssl_expiry_date - CURRENT_DATE))
    INTO days_to_expiry, days_to_ssl_expiry
    FROM domain_management
    WHERE id = domain_id;
    
    -- Domain süresi kontrolü
    IF days_to_expiry < 30 THEN score := score - 30;
    ELSIF days_to_expiry < 60 THEN score := score - 15;
    END IF;
    
    -- SSL süresi kontrolü
    IF days_to_ssl_expiry < 15 THEN score := score - 25;
    ELSIF days_to_ssl_expiry < 30 THEN score := score - 10;
    END IF;
    
    RETURN GREATEST(score, 0);
END;
$$;

-- ============================================
-- PHASE 4: SECURITY (RLS)
-- ============================================

ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aloha_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- AI Agents Policies
CREATE POLICY "Adminler ajanları yönetebilir" ON public.ai_agents
    FOR ALL USING (is_admin());

CREATE POLICY "Herkes aktif ajanları görüntüleyebilir" ON public.ai_agents
    FOR SELECT USING (is_active = true);

-- Agent Tasks Policies
CREATE POLICY "Adminler görevleri yönetebilir" ON public.agent_tasks
    FOR ALL USING (is_admin());

CREATE POLICY "Herkes görevleri görüntüleyebilir" ON public.agent_tasks
    FOR SELECT USING (true);

-- Agent Logs Policies
CREATE POLICY "Adminler logları görüntüleyebilir" ON public.agent_logs
    FOR SELECT USING (is_admin());

-- Domain Management Policies
CREATE POLICY "Adminler domainleri yönetebilir" ON public.domain_management
    FOR ALL USING (is_admin());

CREATE POLICY "Herkes aktif domainleri görüntüleyebilir" ON public.domain_management
    FOR SELECT USING (is_active = true);

-- Automation Rules Policies
CREATE POLICY "Adminler otomasyon kurallarını yönetebilir" ON public.automation_rules
    FOR ALL USING (is_admin());

CREATE POLICY "Herkes aktif kuralları görüntüleyebilir" ON public.automation_rules
    FOR SELECT USING (is_active = true);

-- Aloha Commands Policies
CREATE POLICY "Adminler Aloha komutlarını yönetebilir" ON public.aloha_commands
    FOR ALL USING (is_admin());

CREATE POLICY "Herkes Aloha komutlarını görüntüleyebilir" ON public.aloha_commands
    FOR SELECT USING (true);

-- Digital Assets Policies
CREATE POLICY "Adminler dijital varlıkları yönetebilir" ON public.digital_assets
    FOR ALL USING (is_admin());

CREATE POLICY "Herkes aktif varlıkları görüntüleyebilir" ON public.digital_assets
    FOR SELECT USING (is_active = true);

-- Profiles Policies
CREATE POLICY "Herkes profilleri görüntüleyebilir" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Kullanıcılar kendi profillerini güncelleyebilir" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- User Roles Policies
CREATE POLICY "Adminler rolleri yönetebilir" ON public.user_roles
    FOR ALL USING (is_admin());

CREATE POLICY "Kullanıcılar kendi rollerini görüntüleyebilir" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- Site Settings Policies
CREATE POLICY "Adminler ayarları yönetebilir" ON public.site_settings
    FOR ALL USING (is_admin());

CREATE POLICY "Herkes aktif ayarları görüntüleyebilir" ON public.site_settings
    FOR SELECT USING (is_active = true);

-- ============================================
-- PHASE 5: AUTOMATION (Triggers)
-- ============================================

-- Timestamp Triggers
CREATE TRIGGER update_ai_agents_updated_at
    BEFORE UPDATE ON public.ai_agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_tasks_updated_at
    BEFORE UPDATE ON public.agent_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_domain_management_updated_at
    BEFORE UPDATE ON public.domain_management
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_rules_updated_at
    BEFORE UPDATE ON public.automation_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aloha_commands_updated_at
    BEFORE UPDATE ON public.aloha_commands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_digital_assets_updated_at
    BEFORE UPDATE ON public.digital_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Ajan Performans Güncelleme Trigger
CREATE TRIGGER update_agent_performance_on_task_complete
    AFTER UPDATE ON public.agent_tasks
    FOR EACH ROW
    WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
    EXECUTE FUNCTION update_agent_performance();

-- Yeni Kullanıcı Sync Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'viewer');
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TEST DATA (Sample Data for Admin Panel)
-- ============================================

-- 12 Sektör için Örnek AI Ajanlar
-- ALOHA NEURAL SWARM HİYERARŞİSİ (Perde.ai'den Aktarıldı)
INSERT INTO public.ai_agents (agent_name, agent_type, sector, status, capabilities, configuration, performance_metrics, assigned_domains) VALUES
-- Katman 1: Intent Guard (Giriş Kapısı)
('IntentGuard', 'gateway', 'technology', 'active', 
 '{"role": "Triage & Model Escalation", "level": 1, "models": ["gemini-flash", "gemini-pro"], "confidence_threshold": 0.85}'::jsonb, 
 '{"escalation_rules": {"low_confidence": "gemini-pro", "high_load": "queue"}, "rate_limit": 1000}'::jsonb, 
 '{"completed_tasks": 15847, "success_rate": 99.7, "avg_response_ms": 45}'::jsonb, 
 ARRAY['*.aipyram.ch', '*.perde.ai']),
-- Katman 2: Master Core (Aloha Orchestrator)
('AlohaOrchestrator', 'master', 'technology', 'active', 
 '{"role": "Neural Swarm Coordinator", "level": 2, "sub_agents": ["MoodSense", "SeasonalAdapt", "CircadianLight", "WellnessDesign"], "boss_exception": true}'::jsonb, 
 '{"confidence_threshold": 0.90, "parallel_agents": 8, "session_memory": "persistent"}'::jsonb, 
 '{"completed_tasks": 42156, "success_rate": 99.9, "decisions_per_day": 1247}'::jsonb, 
 ARRAY['aipyram.ch', 'perde.ai', 'didimemlak.ai']),
-- Katman 3: Logic & Integrity (Yapısal Koruma)
('LogicGuard', 'integrity', 'technology', 'active', 
 '{"role": "Visual State Guard & DoP Engine", "level": 3, "subject_lock": true, "context_protection": true}'::jsonb, 
 '{"lens_profiles": ["35mm-wide", "50mm-hero", "85mm-focus", "100mm-macro"], "anomaly_detection": true}'::jsonb, 
 '{"completed_tasks": 8932, "success_rate": 99.5, "blocked_anomalies": 127}'::jsonb, 
 ARRAY[]),
-- Katman 4: Environment Engine (Sonsuz Bağlam)
('EnvironmentEngine', 'context', 'technology', 'idle', 
 '{"role": "Infinite Context Generator", "level": 4, "bias_breaker": true, "locales": ["modern", "ancient", "exotic", "outdoor"]}'::jsonb, 
 '{"atmospheric_dna": true, "lighting_profiles": ["chiaroscuro", "diffused", "warm-side"]}'::jsonb, 
 '{"completed_tasks": 3421, "success_rate": 98.2, "unique_contexts": 89}'::jsonb, 
 ARRAY[]),
-- Katman 5: Physics Simulator (Fizik Motoru)
('PhysicsSimulator', 'simulation', 'textile', 'idle', 
 '{"role": "Fabric Physics Engine", "level": 5, "profiles": ["satin-fluidity", "velvet-shadows", "sheer-translucency"]}'::jsonb, 
 '{"draping_physics": true, "light_interaction": true, "denoising_strength": 0.65}'::jsonb, 
 '{"completed_tasks": 2145, "success_rate": 97.8, "renders_optimized": 1578}'::jsonb, 
 ARRAY['perde.ai', 'hometex.ai']),
-- Katman 6: Business Intelligence (Veri & Trend)
('BusinessIntelligence', 'analytics', 'technology', 'active', 
 '{"role": "Bulk Import & Trend Sync", "level": 6, "sku_dna_mapping": true, "dream_weaver": true}'::jsonb, 
 '{"supplier_sync": true, "margin_optimization": true, "model_fingerprinting": true}'::jsonb, 
 '{"completed_tasks": 5678, "success_rate": 99.1, "patterns_analyzed": 1500}'::jsonb, 
 ARRAY[]),

-- SEKTÖREL AJANLAR (Mevcut Yapı)
('TextileBot-001', 'domain_manager', 'textile', 'active', '{"seo": true, "content": true, "analytics": true}'::jsonb, '{"auto_update": true, "check_interval": 3600}'::jsonb, '{"completed_tasks": 0, "success_rate": 100}'::jsonb, ARRAY['trtex.com', 'homtex.ai']),
('InteriorAI-001', 'content_creator', 'interior_design', 'active', '{"design": true, "content": true}'::jsonb, '{"language": "tr", "style": "modern"}'::jsonb, '{"completed_tasks": 0, "success_rate": 100}'::jsonb, ARRAY['icmimar.ai']),
('FurnitureBot-001', 'seo_optimizer', 'furniture', 'active', '{"seo": true, "keywords": true}'::jsonb, '{"target_markets": ["TR", "CH"]}'::jsonb, '{"completed_tasks": 0, "success_rate": 100}'::jsonb, ARRAY['mobel.ai']),
('CurtainAI-001', 'analytics', 'curtain', 'active', '{"analytics": true, "reporting": true}'::jsonb, '{"report_frequency": "daily"}'::jsonb, '{"completed_tasks": 0, "success_rate": 100}'::jsonb, ARRAY['curtaindesign.ai', 'parda.ai', 'shtori.ai']),
('AIBot-001', 'domain_manager', 'ai_solutions', 'active', '{"ml": true, "nlp": true, "vision": true}'::jsonb, '{"model": "gpt-4"}'::jsonb, '{"completed_tasks": 0, "success_rate": 100}'::jsonb, ARRAY['aipyram.com']),
('RealEstateAI-001', 'content_creator', 'real_estate', 'idle', '{"property_analysis": true, "market_research": true}'::jsonb, '{"region": "europe"}'::jsonb, '{"completed_tasks": 0, "success_rate": 100}'::jsonb, ARRAY[]),
('ArchitectBot-001', 'seo_optimizer', 'architecture', 'active', '{"3d_modeling": true, "design": true}'::jsonb, '{"cad_integration": true}'::jsonb, '{"completed_tasks": 0, "success_rate": 100}'::jsonb, ARRAY[]),
('ConstructionAI-001', 'analytics', 'construction', 'idle', '{"project_management": true, "cost_estimation": true}'::jsonb, '{"currency": "CHF"}'::jsonb, '{"completed_tasks": 0, "success_rate": 100}'::jsonb, ARRAY[]),
('HospitalityBot-001', 'domain_manager', 'hospitality', 'active', '{"booking": true, "customer_service": true}'::jsonb, '{"languages": ["tr", "en", "de"]}'::jsonb, '{"completed_tasks": 0, "success_rate": 100}'::jsonb, ARRAY[]),
('RetailAI-001', 'content_creator', 'retail', 'active', '{"inventory": true, "sales": true}'::jsonb, '{"ecommerce": true}'::jsonb, '{"completed_tasks": 0, "success_rate": 100}'::jsonb, ARRAY[]);

-- ALOHA BAŞLANGIÇ KOMUTLARI
INSERT INTO public.aloha_commands (command_type, command_data, reasoning, status) VALUES
('system_initialization', '{"action": "neural_swarm_boot", "layers_activated": 6}'::jsonb, 'Aloha Neural Swarm v7.5 başlatıldı. 6 katman aktif, tüm ajanlar hazır.', 'completed'),
('domain_health_check', '{"scope": "all", "domains_checked": 270}'::jsonb, 'Sabah rutin kontrolü: Tüm domainlerin SSL ve DNS durumu doğrulandı.', 'completed'),
('agent_swarm_sync', '{"synced_agents": 16, "failed": 0}'::jsonb, 'Tüm sektörel ajanlar AlohaOrchestrator ile senkronize edildi.', 'completed');


-- Örnek Domain Yönetim Kayıtları (270 domain'den ilk 10'u)
INSERT INTO public.domain_management (domain_name, sector, registrar, expiry_date, dns_provider, hosting_provider, ssl_status, ssl_expiry_date, status, automation_enabled, health_score) VALUES
('trtex.com', 'textile', 'GoDaddy', '2025-12-31', 'Cloudflare', 'AWS', 'active', '2025-06-30', 'live', true, 100),
('homtex.ai', 'textile', 'Namecheap', '2025-11-15', 'Cloudflare', 'Vercel', 'active', '2025-05-15', 'live', true, 100),
('curtaindesign.ai', 'curtain', 'GoDaddy', '2025-10-20', 'Cloudflare', 'AWS', 'active', '2025-04-20', 'live', true, 100),
('parda.ai', 'curtain', 'Namecheap', '2025-09-10', 'Cloudflare', 'Vercel', 'active', '2025-03-10', 'development', true, 95),
('shtori.ai', 'curtain', 'GoDaddy', '2025-08-05', 'Cloudflare', 'AWS', 'active', '2025-02-05', 'development', true, 95),
('icmimar.ai', 'interior_design', 'Namecheap', '2025-07-25', 'Cloudflare', 'Vercel', 'active', '2025-01-25', 'planning', true, 90),
('mobel.ai', 'furniture', 'GoDaddy', '2025-06-15', 'Cloudflare', 'AWS', 'active', '2024-12-15', 'planning', true, 85),
('heimtex.ai', 'textile', 'Namecheap', '2025-05-10', 'Cloudflare', 'Vercel', 'expiring', '2024-11-10', 'live', true, 75),
('aipyram.com', 'ai_solutions', 'GoDaddy', '2026-01-01', 'Cloudflare', 'AWS', 'active', '2025-07-01', 'live', true, 100),
('aipyram.ch', 'ai_solutions', 'Switch', '2026-02-01', 'Cloudflare', 'Hostpoint', 'active', '2025-08-01', 'live', true, 100);

-- Örnek Otomasyon Kuralları
INSERT INTO public.automation_rules (rule_name, description, trigger_type, trigger_config, action_type, action_config, target_sector, priority) VALUES
('Daily Domain Health Check', 'Her gün tüm domainlerin sağlık kontrolü', 'time_based', '{"schedule": "0 9 * * *", "timezone": "Europe/Zurich"}'::jsonb, 'create_task', '{"task_type": "domain_check", "assign_to": "auto"}'::jsonb, NULL, 'high'),
('SSL Expiry Alert', 'SSL süresi 30 gün içinde dolacak domainler için uyarı', 'condition_based', '{"condition": "ssl_expiry_days < 30"}'::jsonb, 'send_alert', '{"alert_type": "email", "recipients": ["admin@aipyram.com"]}'::jsonb, NULL, 'critical'),
('Content Update Scheduler', 'Haftalık içerik güncelleme', 'time_based', '{"schedule": "0 10 * * 1", "timezone": "Europe/Zurich"}'::jsonb, 'create_task', '{"task_type": "content_update", "target_sectors": ["textile", "curtain"]}'::jsonb, 'textile', 'medium'),
('SEO Audit Monthly', 'Aylık SEO denetimi', 'time_based', '{"schedule": "0 8 1 * *", "timezone": "Europe/Zurich"}'::jsonb, 'create_task', '{"task_type": "seo_audit", "comprehensive": true}'::jsonb, NULL, 'high'),
('Aloha Morning Briefing', 'Aloha için sabah özet raporu', 'time_based', '{"schedule": "0 7 * * *", "timezone": "Europe/Zurich"}'::jsonb, 'run_agent', '{"agent_type": "analytics", "report_type": "daily_summary"}'::jsonb, NULL, 'medium');

-- Örnek Ajan Görevleri
INSERT INTO public.agent_tasks (agent_id, task_name, task_type, priority, status, sector, task_params, scheduled_at) VALUES
((SELECT id FROM ai_agents WHERE agent_name = '