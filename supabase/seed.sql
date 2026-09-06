-- ============================================================
-- AURÈS CÉRAMIQUE — seed the live shop with the Aurès demo catalog
-- Run in Supabase Dashboard > SQL Editor > New query > Run,
-- AFTER supabase/schema.sql. Safe to re-run (upserts by id).
--
-- Seeds: 7 categories, 14 products (Chaoui names FR/AR/EN, prices,
-- stock, décors, photos), store name. Photos point at the live site's
-- own demo images — the owner can re-upload per-piece via admin later.
-- Tables were verified empty before first seeding.
-- ============================================================

-- ---------- CATEGORIES ----------
insert into categories (id, name_fr, name_ar, name_en, image, sort) values
  (1, 'Assiettes',       'أطباق',        'Plates',          'https://aures.dzstor.shop/assets/img/demo/cat-assiettes.jpg', 1),
  (2, 'Tasses & bols',   'أكواب وأواني', 'Cups & bowls',    'https://aures.dzstor.shop/assets/img/demo/cat-tasses.jpg', 2),
  (3, 'Vases',           'مزهريات',      'Vases',           'https://aures.dzstor.shop/assets/img/demo/cat-vases.jpg', 3),
  (4, 'Tajines',         'طواجن',        'Tajines',         'https://aures.dzstor.shop/assets/img/demo/cat-tajines.jpg', 4),
  (5, 'Couscoussiers',   'كسكاس',        'Couscous dishes', 'https://aures.dzstor.shop/assets/img/demo/cat-couscoussiers.jpg', 5),
  (6, 'Pièces déco',     'قطع زخرفية',   'Decorative',      'https://aures.dzstor.shop/assets/img/demo/cat-deco.jpg', 6),
  (7, 'Jarres & qullas', 'قلال وجرار',   'Jars & qullas',   'https://aures.dzstor.shop/assets/img/demo/cat-qullas.jpg', 7)
on conflict (id) do update set
  name_fr = excluded.name_fr, name_ar = excluded.name_ar,
  name_en = excluded.name_en, image = excluded.image, sort = excluded.sort;

-- ---------- PRODUCTS ----------
-- Shared handmade descriptions (same as demo mode).
-- Décors use the Chaoui palette: terracotta, ocre, noir, rouge + blues.

insert into products
  (id, name_fr, name_ar, name_en,
   description_fr, description_ar, description_en,
   photos, colors, dimensions, material,
   category_id, featured, active, price, compare_at_price, stock)
values
  (1, 'Assiette Bleu Chaoui', 'طبق شاوي أزرق', 'Chaoui Blue Plate',
   'Façonnée et peinte à la main dans notre atelier. Chaque pièce est unique : les tons et les motifs peuvent varier légèrement d’une série à l’autre.',
   'مشكَّلة ومزيَّنة يدويًا في ورشتنا. كل قطعة فريدة: قد تختلف الدرجات والزخارف قليلًا من سلسلة إلى أخرى.',
   'Shaped and hand-painted in our workshop. Each piece is unique: tones and patterns may vary slightly from one series to another.',
   '{"https://aures.dzstor.shop/assets/img/demo/piece-01.jpg"}', '{"Bleu","Blanc"}', 'Ø 27 cm', '',
   1, true, true, 2400, 2900, 12),

  (2, 'Assiette Murale des Aurès', 'طبق جداري من الأوراس', 'Aurès Wall Plate',
   'Façonnée et peinte à la main dans notre atelier. Chaque pièce est unique : les tons et les motifs peuvent varier légèrement d’une série à l’autre.',
   'مشكَّلة ومزيَّنة يدويًا في ورشتنا. كل قطعة فريدة: قد تختلف الدرجات والزخارف قليلًا من سلسلة إلى أخرى.',
   'Shaped and hand-painted in our workshop. Each piece is unique: tones and patterns may vary slightly from one series to another.',
   '{"https://aures.dzstor.shop/assets/img/demo/piece-02.jpg"}', '{"Bleu","Ocre"}', 'Ø 32 cm', '',
   1, false, true, 3200, null, 6),

  (3, 'Service Chaoui 6 Assiettes', 'طقم شاوي 6 أطباق', 'Chaoui 6-Plate Set',
   'Façonnée et peinte à la main dans notre atelier. Chaque pièce est unique : les tons et les motifs peuvent varier légèrement d’une série à l’autre.',
   'مشكَّلة ومزيَّنة يدويًا في ورشتنا. كل قطعة فريدة: قد تختلف الدرجات والزخارف قليلًا من سلسلة إلى أخرى.',
   'Shaped and hand-painted in our workshop. Each piece is unique: tones and patterns may vary slightly from one series to another.',
   '{"https://aures.dzstor.shop/assets/img/demo/piece-03.jpg"}', '{"Bleu","Vert","Terre cuite"}', 'Ø 24 cm', '',
   1, true, true, 12500, 14900, 4),

  (4, 'Tasse Chaouie Peinte Main', 'كوب شاوي مرسوم يدويًا', 'Hand-Painted Chaoui Cup',
   'Façonnée et peinte à la main dans notre atelier. Chaque pièce est unique : les tons et les motifs peuvent varier légèrement d’une série à l’autre.',
   'مشكَّلة ومزيَّنة يدويًا في ورشتنا. كل قطعة فريدة: قد تختلف الدرجات والزخارف قليلًا من سلسلة إلى أخرى.',
   'Shaped and hand-painted in our workshop. Each piece is unique: tones and patterns may vary slightly from one series to another.',
   '{"https://aures.dzstor.shop/assets/img/demo/piece-04.jpg"}', '{"Blanc","Crème"}', 'H 9 cm – 220 ml', '',
   2, false, true, 950, null, 30),

  (5, 'Bol à Harira Terre de l’Aurès', 'وعاء حريرة من طين الأوراس', 'Aurès Clay Harira Bowl',
   'Façonnée et peinte à la main dans notre atelier. Chaque pièce est unique : les tons et les motifs peuvent varier légèrement d’une série à l’autre.',
   'مشكَّلة ومزيَّنة يدويًا في ورشتنا. كل قطعة فريدة: قد تختلف الدرجات والزخارف قليلًا من سلسلة إلى أخرى.',
   'Shaped and hand-painted in our workshop. Each piece is unique: tones and patterns may vary slightly from one series to another.',
   '{"https://aures.dzstor.shop/assets/img/demo/piece-05.jpg"}', '{"Sable","Ocre"}', 'Ø 14 cm', '',
   2, true, true, 1400, null, 20),

  (6, 'Grand Bol Chaoui Ocre', 'وعاء شاوي كبير بلون المغرة', 'Large Chaoui Ochre Bowl',
   'Façonnée et peinte à la main dans notre atelier. Chaque pièce est unique : les tons et les motifs peuvent varier légèrement d’une série à l’autre.',
   'مشكَّلة ومزيَّنة يدويًا في ورشتنا. كل قطعة فريدة: قد تختلف الدرجات والزخارف قليلًا من سلسلة إلى أخرى.',
   'Shaped and hand-painted in our workshop. Each piece is unique: tones and patterns may vary slightly from one series to another.',
   '{"https://aures.dzstor.shop/assets/img/demo/piece-06.jpg"}', '{"Ocre","Sable"}', 'Ø 16 cm', '',
   2, false, true, 1800, 2200, 15),

  (7, 'Vase Chaoui Bleu Nuit', 'مزهرية شاوية زرقاء داكنة', 'Chaoui Night-Blue Vase',
   'Façonnée et peinte à la main dans notre atelier. Chaque pièce est unique : les tons et les motifs peuvent varier légèrement d’une série à l’autre.',
   'مشكَّلة ومزيَّنة يدويًا في ورشتنا. كل قطعة فريدة: قد تختلف الدرجات والزخارف قليلًا من سلسلة إلى أخرى.',
   'Shaped and hand-painted in our workshop. Each piece is unique: tones and patterns may vary slightly from one series to another.',
   '{"https://aures.dzstor.shop/assets/img/demo/piece-07.jpg"}', '{"Bleu","Noir"}', 'H 38 cm', '',
   3, true, true, 6800, null, 5),

  (8, 'Vase Blanc des Cimes', 'مزهرية بيضاء من القمم', 'White Highlands Vase',
   'Façonnée et peinte à la main dans notre atelier. Chaque pièce est unique : les tons et les motifs peuvent varier légèrement d’une série à l’autre.',
   'مشكَّلة ومزيَّنة يدويًا في ورشتنا. كل قطعة فريدة: قد تختلف الدرجات والزخارف قليلًا من سلسلة إلى أخرى.',
   'Shaped and hand-painted in our workshop. Each piece is unique: tones and patterns may vary slightly from one series to another.',
   '{"https://aures.dzstor.shop/assets/img/demo/piece-08.jpg"}', '{"Blanc","Crème"}', 'H 28 cm', '',
   3, false, true, 5400, null, 7),

  (9, 'Tajine Chaoui Terre Rouge', 'طاجين شاوي بالطين الأحمر', 'Chaoui Red-Clay Tajine',
   'Façonnée et peinte à la main dans notre atelier. Chaque pièce est unique : les tons et les motifs peuvent varier légèrement d’une série à l’autre.',
   'مشكَّلة ومزيَّنة يدويًا في ورشتنا. كل قطعة فريدة: قد تختلف الدرجات والزخارف قليلًا من سلسلة إلى أخرى.',
   'Shaped and hand-painted in our workshop. Each piece is unique: tones and patterns may vary slightly from one series to another.',
   '{"https://aures.dzstor.shop/assets/img/demo/piece-09.jpg"}', '{"Terre cuite","Rouge"}', 'Ø 30 cm', '',
   4, true, true, 3900, 4500, 10),

  (10, 'Tajine de Service Aurès', 'طاجين تقديم أوراسي', 'Aurès Serving Tajine',
   'Façonnée et peinte à la main dans notre atelier. Chaque pièce est unique : les tons et les motifs peuvent varier légèrement d’une série à l’autre.',
   'مشكَّلة ومزيَّنة يدويًا في ورشتنا. كل قطعة فريدة: قد تختلف الدرجات والزخارف قليلًا من سلسلة إلى أخرى.',
   'Shaped and hand-painted in our workshop. Each piece is unique: tones and patterns may vary slightly from one series to another.',
   '{"https://aures.dzstor.shop/assets/img/demo/piece-10.jpg"}', '{"Terre cuite","Noir"}', 'Ø 26 cm', '',
   4, false, true, 3400, null, 9),

  (11, 'Couscoussier des Aurès', 'كسكاس الأوراس التقليدي', 'Aurès Couscoussier',
   'Façonnée et peinte à la main dans notre atelier. Chaque pièce est unique : les tons et les motifs peuvent varier légèrement d’une série à l’autre.',
   'مشكَّلة ومزيَّنة يدويًا في ورشتنا. كل قطعة فريدة: قد تختلف الدرجات والزخارف قليلًا من سلسلة إلى أخرى.',
   'Shaped and hand-painted in our workshop. Each piece is unique: tones and patterns may vary slightly from one series to another.',
   '{"https://aures.dzstor.shop/assets/img/demo/piece-11.jpg"}', '{"Terre cuite","Ocre"}', 'H 34 cm', '',
   5, true, true, 8900, null, 3),

  (12, 'Oiseau Chaoui en Terre', 'طائر شاوي من الطين', 'Chaoui Clay Bird',
   'Façonnée et peinte à la main dans notre atelier. Chaque pièce est unique : les tons et les motifs peuvent varier légèrement d’une série à l’autre.',
   'مشكَّلة ومزيَّنة يدويًا في ورشتنا. كل قطعة فريدة: قد تختلف الدرجات والزخارف قليلًا من سلسلة إلى أخرى.',
   'Shaped and hand-painted in our workshop. Each piece is unique: tones and patterns may vary slightly from one series to another.',
   '{"https://aures.dzstor.shop/assets/img/demo/piece-12.jpg"}', '{"Terre cuite","Rouge"}', 'H 22 cm', '',
   6, false, true, 2800, null, 5),

  (13, 'Qulla Noire des Aurès', 'قلة سوداء من الأوراس', 'Black Aurès Qulla',
   'Façonnée et peinte à la main dans notre atelier. Chaque pièce est unique : les tons et les motifs peuvent varier légèrement d’une série à l’autre.',
   'مشكَّلة ومزيَّنة يدويًا في ورشتنا. كل قطعة فريدة: قد تختلف الدرجات والزخارف قليلًا من سلسلة إلى أخرى.',
   'Shaped and hand-painted in our workshop. Each piece is unique: tones and patterns may vary slightly from one series to another.',
   '{"https://aures.dzstor.shop/assets/img/demo/piece-13.jpg"}', '{"Noir"}', 'H 32 cm', '',
   7, true, true, 5400, null, 6),

  (14, 'Pichet Chaoui à Motifs', 'إبريق شاوي مزخرف', 'Patterned Chaoui Pitcher',
   'Façonnée et peinte à la main dans notre atelier. Chaque pièce est unique : les tons et les motifs peuvent varier légèrement d’une série à l’autre.',
   'مشكَّلة ومزيَّنة يدويًا في ورشتنا. كل قطعة فريدة: قد تختلف الدرجات والزخارف قليلًا من سلسلة إلى أخرى.',
   'Shaped and hand-painted in our workshop. Each piece is unique: tones and patterns may vary slightly from one series to another.',
   '{"https://aures.dzstor.shop/assets/img/demo/piece-14.jpg"}', '{"Sable","Marron"}', 'H 18 cm', '',
   2, false, true, 3200, null, 8)

on conflict (id) do update set
  name_fr = excluded.name_fr, name_ar = excluded.name_ar, name_en = excluded.name_en,
  description_fr = excluded.description_fr, description_ar = excluded.description_ar,
  description_en = excluded.description_en, photos = excluded.photos,
  colors = excluded.colors, dimensions = excluded.dimensions, material = excluded.material,
  category_id = excluded.category_id, featured = excluded.featured, active = excluded.active,
  price = excluded.price, compare_at_price = excluded.compare_at_price, stock = excluded.stock;

-- ---------- STORE NAME ----------
insert into settings (key, value) values
  ('store', '{"name":"Aurès Céramique","phone":"","email":""}')
on conflict (key) do update set
  value = jsonb_build_object(
    'name', 'Aurès Céramique',
    'phone', coalesce(nullif(settings.value->>'phone', ''), ''),
    'email', coalesce(nullif(settings.value->>'email', ''), '')
  ),
  updated_at = now();

-- ---------- KEEP FUTURE ADMIN INSERTS COLLISION-FREE ----------
select setval(pg_get_serial_sequence('public.categories', 'id'),
              (select coalesce(max(id), 1) from public.categories));
select setval(pg_get_serial_sequence('public.products', 'id'),
              (select coalesce(max(id), 1) from public.products));

-- ---------- CHECK ----------
select 'categories' as tbl, count(*) as n from categories
union all select 'products', count(*) from products
union all select 'featured', count(*) from products where featured and active;
