-- =============================================
-- Lumina AR Menu - Database Setup
-- Run this ONCE in your Supabase SQL Editor
-- =============================================

-- Add image_url column to menu_items (may already exist, IF NOT EXISTS handles it)
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ── Enable Row Level Security ──
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- ── menu_items Policies ──
-- Anyone can read (AR viewers need this)
CREATE POLICY "Anyone can read menu items"
  ON menu_items FOR SELECT USING (true);

-- Authenticated users can manage items
CREATE POLICY "Authenticated users can insert menu items"
  ON menu_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update menu items"
  ON menu_items FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete menu items"
  ON menu_items FOR DELETE USING (auth.role() = 'authenticated');

-- ── analytics_events Policies ──
-- Anyone can insert (AR viewers log events)
CREATE POLICY "Anyone can insert analytics"
  ON analytics_events FOR INSERT WITH CHECK (true);

-- Authenticated users can read analytics
CREATE POLICY "Authenticated users can read analytics"
  ON analytics_events FOR SELECT USING (auth.role() = 'authenticated');

-- ── Storage Bucket for dish images (optional) ──
INSERT INTO storage.buckets (id, name, public)
  VALUES ('dish-images', 'dish-images', true)
  ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view dish images"
  ON storage.objects FOR SELECT USING (bucket_id = 'dish-images');

CREATE POLICY "Authenticated users can upload dish images"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'dish-images' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete dish images"
  ON storage.objects FOR DELETE USING (
    bucket_id = 'dish-images' AND auth.role() = 'authenticated'
  );

-- ── Enable Realtime for menu_items ──
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
