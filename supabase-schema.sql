-- ==============================================================================
-- BREW BEFORE EMPTY — SUPABASE POSTGRESQL SCHEMA
-- Execute this entire script in Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT DEFAULT 'Alchemist Apprentice',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. PRODUCTS TABLE (Reagents & Raw Ingredients)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT NOT NULL,
    unit TEXT NOT NULL DEFAULT 'drams',
    minimum_stock NUMERIC NOT NULL DEFAULT 20,
    cost_per_unit NUMERIC NOT NULL DEFAULT 10.00,
    lead_time_days INTEGER NOT NULL DEFAULT 3,
    supplier TEXT DEFAULT 'Alchemical Guild',
    purity TEXT DEFAULT '98.5%',
    rarity TEXT DEFAULT 'Common',
    daily_consumption NUMERIC DEFAULT 5.0,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. INVENTORY TABLE (Normalized Current Stock Level per Product)
CREATE TABLE IF NOT EXISTS public.inventory (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE UNIQUE,
    quantity NUMERIC NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. STOCK MOVEMENTS TABLE (Audit Trail of Purchases, Sales, Adjustments)
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('purchase', 'sale', 'adjustment', 'initial')),
    quantity NUMERIC NOT NULL,
    previous_quantity NUMERIC NOT NULL DEFAULT 0,
    new_quantity NUMERIC NOT NULL DEFAULT 0,
    reason TEXT,
    reference_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. POTIONS TABLE (Recipe Catalogue)
CREATE TABLE IF NOT EXISTS public.potions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL UNIQUE,
    tier TEXT DEFAULT 'Tier II Adept',
    price NUMERIC NOT NULL DEFAULT 50.00,
    description TEXT,
    recipe JSONB NOT NULL DEFAULT '[]'::jsonb,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. SALES TABLE (Dispensed Potion Orders & Customer Ledger)
CREATE TABLE IF NOT EXISTS public.sales (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    potion_id TEXT REFERENCES public.potions(id) ON DELETE SET NULL,
    potion_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    total_gold NUMERIC NOT NULL DEFAULT 0.00,
    customer TEXT DEFAULT 'Anonymous Mage',
    guild TEXT DEFAULT 'Independent',
    ingredients_deducted JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. ANOMALIES TABLE (Strange Happenings & Vault Discrepancies)
CREATE TABLE IF NOT EXISTS public.anomalies (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    anomaly_type TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    z_score NUMERIC,
    observed_value NUMERIC,
    expected_value NUMERIC,
    unit TEXT DEFAULT 'units',
    description TEXT NOT NULL,
    recommended_action TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RESOLVED', 'DISMISSED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 9. CURSE STATE TABLE (Midnight Curse Festival Multipliers)
CREATE TABLE IF NOT EXISTS public.curse_state (
    id TEXT PRIMARY KEY DEFAULT 'active_curse',
    name TEXT NOT NULL DEFAULT 'Blood Moon Festival Rush',
    active BOOLEAN DEFAULT true,
    curse_level TEXT DEFAULT 'Peak Festival Demand',
    multiplier NUMERIC DEFAULT 1.75,
    description TEXT DEFAULT 'Customer demand increases by +75% across popular reagents during full moon festivals.',
    affected_products JSONB DEFAULT '["Dragon Scale Powder", "Ectoplasmic Resin", "Phoenix Feather Ash"]'::jsonb,
    warding_strength TEXT DEFAULT '64%',
    spoilage_rate TEXT DEFAULT '+32%',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 10. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'global_settings',
    shop_name TEXT DEFAULT 'Brew Before Empty Apothecary Sanctum',
    alchemist_in_charge TEXT DEFAULT 'Grand Magister Cynthia',
    currency_symbol TEXT DEFAULT '⟡ ARC',
    low_stock_warning_threshold NUMERIC DEFAULT 25,
    auto_restock_threshold_days INTEGER DEFAULT 3,
    prophecy_horizon_days INTEGER DEFAULT 14,
    sound_effects_enabled BOOLEAN DEFAULT true,
    haptic_runes BOOLEAN DEFAULT true,
    auto_warding_defense BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- INDEXES FOR HIGH-PERFORMANCE ANALYTICS
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON public.inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON public.stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created ON public.stock_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_created ON public.sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_anomalies_status ON public.anomalies(status);

-- ==============================================================================
-- UNIFIED PRODUCT & INVENTORY VIEW
-- ==============================================================================
CREATE OR REPLACE VIEW public.product_inventory_view AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.category,
    p.unit,
    p.minimum_stock,
    p.cost_per_unit,
    p.lead_time_days,
    p.supplier,
    p.purity,
    p.rarity,
    p.daily_consumption,
    p.image_url,
    p.created_at,
    COALESCE(i.quantity, 0) AS current_stock,
    COALESCE(i.quantity, 0) AS quantity,
    i.updated_at AS inventory_updated_at
FROM public.products p
LEFT JOIN public.inventory i ON p.id = i.product_id;

-- ==============================================================================
-- AUTHENTICATION TRIGGER: Auto-create Profile when a User Signs Up
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Grand Alchemist'),
    COALESCE(new.raw_user_meta_data->>'role', 'Master Potion Maker')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.potions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curse_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated and anon read/write during application usage
CREATE POLICY "Allow read for all on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow update for users on own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow public read on products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert on products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on products" ON public.products FOR DELETE USING (true);

CREATE POLICY "Allow public read on inventory" ON public.inventory FOR SELECT USING (true);
CREATE POLICY "Allow public insert on inventory" ON public.inventory FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on inventory" ON public.inventory FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on inventory" ON public.inventory FOR DELETE USING (true);

CREATE POLICY "Allow public read on stock_movements" ON public.stock_movements FOR SELECT USING (true);
CREATE POLICY "Allow public insert on stock_movements" ON public.stock_movements FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on potions" ON public.potions FOR SELECT USING (true);
CREATE POLICY "Allow public insert on potions" ON public.potions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on potions" ON public.potions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on potions" ON public.potions FOR DELETE USING (true);

CREATE POLICY "Allow public read on sales" ON public.sales FOR SELECT USING (true);
CREATE POLICY "Allow public insert on sales" ON public.sales FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on anomalies" ON public.anomalies FOR SELECT USING (true);
CREATE POLICY "Allow public update on anomalies" ON public.anomalies FOR UPDATE USING (true);

CREATE POLICY "Allow public read on curse_state" ON public.curse_state FOR SELECT USING (true);
CREATE POLICY "Allow public update on curse_state" ON public.curse_state FOR UPDATE USING (true);

CREATE POLICY "Allow public read on settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Allow public update on settings" ON public.settings FOR UPDATE USING (true);

-- ==============================================================================
-- PRIMORDIAL SEED DATA
-- ==============================================================================

-- 1. Insert Products
INSERT INTO public.products (id, name, description, category, unit, minimum_stock, cost_per_unit, lead_time_days, supplier, purity, rarity, daily_consumption)
VALUES
('prod-1', 'Dragon Scale Powder', 'Ground scales from ancient red wyrms, essential for heat-resistant draughts.', 'Mineral & Scales', 'drams', 50, 85.00, 5, 'Wyrmfang Smelters', '99.4%', 'Legendary', 6.2),
('prod-2', 'Moonlit Dewdrops', 'Dew gathered under a waxing crescent moon in enchanted silver groves.', 'Celestial Liquids', 'fl. oz', 60, 14.50, 2, 'Silverleaf Grove', '98.1%', 'Uncommon', 12.0),
('prod-3', 'Phoenix Feather Ash', 'Sacred cinders from a resurrected firebird, highly volatile yet restorative.', 'Ethereal Ash', 'pinches', 30, 140.00, 7, 'Solaris Aviary', '100%', 'Mythic', 3.8),
('prod-4', 'Mandragora Root Essence', 'Distilled root extracts harvested during the twilight howling hour.', 'Botanical Extracts', 'vials', 40, 32.00, 3, 'Howling Vale Botanicals', '96.5%', 'Rare', 5.5),
('prod-5', 'Abyssal Pearl Dust', 'Luminescent pearl minerals dredged from undersea trenches.', 'Mineral & Scales', 'drams', 35, 115.00, 6, 'Trench Diver Guild', '97.8%', 'Rare', 4.1),
('prod-6', 'Glow-Spore Mycelium', 'Phosphorescent cavern fungi with rapid bio-catalytic properties.', 'Botanical Extracts', 'grams', 80, 8.50, 2, 'Underdark Foragers', '94.2%', 'Common', 24.0),
('prod-7', 'Ectoplasmic Resin', 'Condensation residue harvested from friendly poltergeist rifts.', 'Ethereal Ash', 'fl. oz', 45, 95.00, 4, 'Ghost-Ward Distillers', '99.0%', 'Rare', 6.8),
('prod-8', 'Starlight Nectar', 'Concentrated astral energy channeled through crystal prisms.', 'Celestial Liquids', 'fl. oz', 50, 48.00, 5, 'Astral Observatories', '99.9%', 'Legendary', 7.5),
('prod-9', 'Obsidian Shards', 'Razor-sharp volcanic glass tempered with elemental fire spells.', 'Mineral & Scales', 'pieces', 75, 12.00, 3, 'Cinder Peaks Quarry', '95.0%', 'Common', 14.2),
('prod-10', 'Banshee Tear Crystals', 'Petrified lamentation tears carrying potent acoustic enchantments.', 'Celestial Liquids', 'carats', 30, 160.00, 8, 'Spectral Caverns', '98.7%', 'Mythic', 2.9),
('prod-11', 'Chimera Venom', 'Triple-distilled venom capable of stabilizing unstable elixirs.', 'Botanical Extracts', 'vials', 40, 75.00, 4, 'Beastmaster Guild', '97.0%', 'Uncommon', 4.8),
('prod-12', 'Aetheric Mercury', 'Quick-silver imbued with raw arcane atmospheric pressure.', 'Celestial Liquids', 'drams', 45, 62.00, 4, 'Alchemical High Court', '99.5%', 'Rare', 5.2)
ON CONFLICT (id) DO UPDATE SET
  minimum_stock = EXCLUDED.minimum_stock,
  cost_per_unit = EXCLUDED.cost_per_unit,
  daily_consumption = EXCLUDED.daily_consumption;

-- 2. Insert Normalized Inventory Quantities
INSERT INTO public.inventory (product_id, quantity)
VALUES
('prod-1', 42),
('prod-2', 180),
('prod-3', 18),
('prod-4', 95),
('prod-5', 25),
('prod-6', 310),
('prod-7', 14),
('prod-8', 140),
('prod-9', 220),
('prod-10', 38),
('prod-11', 52),
('prod-12', 88)
ON CONFLICT (product_id) DO UPDATE SET
  quantity = EXCLUDED.quantity,
  updated_at = NOW();

-- 3. Insert Initial Stock Movements
INSERT INTO public.stock_movements (product_id, movement_type, quantity, previous_quantity, new_quantity, reason)
VALUES
('prod-1', 'initial', 42, 0, 42, 'Vault opening stock initialization'),
('prod-2', 'initial', 180, 0, 180, 'Vault opening stock initialization'),
('prod-3', 'initial', 18, 0, 18, 'Vault opening stock initialization'),
('prod-7', 'initial', 14, 0, 14, 'Vault opening stock initialization')
ON CONFLICT DO NOTHING;

-- 4. Insert Potions
INSERT INTO public.potions (id, name, tier, price, description, recipe)
VALUES
('pot-1', 'Elixir of Astral Clarity', 'Tier III Master', 380.00, 'Grants profound astral foresight and heightened senses to mages for 6 hours.', '[{"productId":"prod-8","ingredientName":"Starlight Nectar","quantity":4,"unit":"fl. oz"},{"productId":"prod-2","ingredientName":"Moonlit Dewdrops","quantity":6,"unit":"fl. oz"},{"productId":"prod-6","ingredientName":"Glow-Spore Mycelium","quantity":10,"unit":"grams"}]'::jsonb),
('pot-2', 'Phoenix Rebirth Draught', 'Tier IV Grandmaster', 850.00, 'Restores near-fatal wounds and grants instant mystical resurrection once.', '[{"productId":"prod-3","ingredientName":"Phoenix Feather Ash","quantity":2,"unit":"pinches"},{"productId":"prod-4","ingredientName":"Mandragora Root Essence","quantity":3,"unit":"vials"},{"productId":"prod-1","ingredientName":"Dragon Scale Powder","quantity":2,"unit":"drams"}]'::jsonb),
('pot-3', 'Spectral Invisibility Draught', 'Tier II Adept', 260.00, 'Renders the drinker completely ethereal and undetectable by mundane eyes.', '[{"productId":"prod-7","ingredientName":"Ectoplasmic Resin","quantity":3,"unit":"fl. oz"},{"productId":"prod-2","ingredientName":"Moonlit Dewdrops","quantity":5,"unit":"fl. oz"},{"productId":"prod-6","ingredientName":"Glow-Spore Mycelium","quantity":8,"unit":"grams"}]'::jsonb),
('pot-4', 'Tidecaller''s Ward Potion', 'Tier II Adept', 260.00, 'Envelops the drinker in deep sea barriers immune to thermal and sonic attacks.', '[{"productId":"prod-5","ingredientName":"Abyssal Pearl Dust","quantity":3,"unit":"drams"},{"productId":"prod-7","ingredientName":"Ectoplasmic Resin","quantity":2,"unit":"fl. oz"}]'::jsonb),
('pot-5', 'Wyrm-Bane Berserker Tonic', 'Tier III Master', 440.00, 'Imbues warriors with the ferocious power and scalemail resistance of dragons.', '[{"productId":"prod-1","ingredientName":"Dragon Scale Powder","quantity":4,"unit":"drams"},{"productId":"prod-11","ingredientName":"Chimera Venom","quantity":2,"unit":"vials"},{"productId":"prod-9","ingredientName":"Obsidian Shards","quantity":5,"unit":"pieces"}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Recent Sales
INSERT INTO public.sales (id, potion_id, potion_name, quantity, total_gold, customer, guild, ingredients_deducted)
VALUES
('TXN-8842', 'pot-1', 'Elixir of Astral Clarity', 2, 760.00, 'Archmage Valerius', 'Oakhaven Arcanum', '[{"productId":"prod-8","ingredientName":"Starlight Nectar","amount":8,"unit":"fl. oz"},{"productId":"prod-2","ingredientName":"Moonlit Dewdrops","amount":12,"unit":"fl. oz"}]'::jsonb),
('TXN-8841', 'pot-3', 'Spectral Invisibility Draught', 3, 780.00, 'Lady Selene', 'Nightshade Syndicate', '[{"productId":"prod-7","ingredientName":"Ectoplasmic Resin","amount":9,"unit":"fl. oz"},{"productId":"prod-2","ingredientName":"Moonlit Dewdrops","amount":15,"unit":"fl. oz"}]'::jsonb),
('TXN-8840', 'pot-2', 'Phoenix Rebirth Draught', 1, 850.00, 'Paladin Gerald', 'Solar Sunforged', '[{"productId":"prod-3","ingredientName":"Phoenix Feather Ash","amount":2,"unit":"pinches"},{"productId":"prod-4","ingredientName":"Mandragora Root Essence","amount":3,"unit":"vials"}]'::jsonb),
('TXN-8839', 'pot-4', 'Tidecaller''s Ward Potion', 2, 520.00, 'Captain Bran', 'Saltmarsh Guild', '[{"productId":"prod-5","ingredientName":"Abyssal Pearl Dust","amount":6,"unit":"drams"},{"productId":"prod-7","ingredientName":"Ectoplasmic Resin","amount":4,"unit":"fl. oz"}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 6. Insert Anomalies
INSERT INTO public.anomalies (id, title, product_id, product_name, anomaly_type, severity, description, recommended_action, status)
VALUES
('anom-1', 'Unusual Drop in Ectoplasmic Resin', 'prod-7', 'Ectoplasmic Resin', 'Unexpected Loss / Leak', 'CRITICAL', 'Storage Room B seal issue suspected. Depletion rate is 3.8x higher than recorded recipe sales.', 'Inspect container seal in Storage Room B and order restock immediately.', 'ACTIVE'),
('anom-2', 'Low Stock Warning: Dragon Scale Powder', 'prod-1', 'Dragon Scale Powder', 'Stockout Risk', 'HIGH', 'Current stock is 42 drams, below the safe minimum threshold of 50 drams. Supplier delivery is slightly delayed.', 'Request expedited delivery from supplier or reserve remaining powder for high-margin orders.', 'ACTIVE'),
('anom-3', 'Storage Temperature Fluctuated: Phoenix Ash', 'prod-3', 'Phoenix Feather Ash', 'Storage Issue', 'MEDIUM', 'Storage canister temperature dropped 4°C below standard. Potential moisture risk if left unchecked.', 'Heating elements inspected and adjusted by store technician.', 'RESOLVED')
ON CONFLICT (id) DO NOTHING;

-- 7. Insert Curse State
INSERT INTO public.curse_state (id, name, active, curse_level, multiplier, description, affected_products, warding_strength, spoilage_rate)
VALUES
('active_curse', 'Blood Moon Festival Rush', true, 'Peak Festival Demand', 1.75, 'Customer demand increases by +75% across popular reagents during full moon festivals.', '["Dragon Scale Powder", "Ectoplasmic Resin", "Phoenix Feather Ash"]'::jsonb, '64%', '+32%')
ON CONFLICT (id) DO UPDATE SET
  active = EXCLUDED.active,
  multiplier = EXCLUDED.multiplier;

-- 8. Insert Global Settings
INSERT INTO public.settings (id, shop_name, alchemist_in_charge, currency_symbol, low_stock_warning_threshold, auto_restock_threshold_days, prophecy_horizon_days, sound_effects_enabled, haptic_runes, auto_warding_defense)
VALUES
('global_settings', 'Brew Before Empty Apothecary Sanctum', 'Grand Magister Cynthia', '⟡ ARC', 25, 3, 14, true, true, false)
ON CONFLICT (id) DO NOTHING;
