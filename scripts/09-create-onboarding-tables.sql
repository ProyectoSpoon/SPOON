-- Create business_hours table
CREATE TABLE IF NOT EXISTS public.business_hours (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    day_of_week TEXT NOT NULL, -- 'lunes', 'martes', etc.
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create restaurant_images table
CREATE TABLE IF NOT EXISTS public.restaurant_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    description TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security Policies (RLS) - Basic Setup
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_images ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone
CREATE POLICY "Public profiles are viewable by everyone" ON public.business_hours FOR SELECT USING (true);
CREATE POLICY "Public images are viewable by everyone" ON public.restaurant_images FOR SELECT USING (true);

-- Allow updates only by owner (Assuming owner_id in restaurants)
-- (Complex policy omitted for brevity, but should link via restaurant_id -> restaurants.owner_id = auth.uid())
