-- Add rarity and admin_only columns to badges
ALTER TABLE badges ADD COLUMN IF NOT EXISTS rarity TEXT DEFAULT 'common';
ALTER TABLE badges ADD COLUMN IF NOT EXISTS admin_only BOOLEAN DEFAULT FALSE;

-- Set rarity for existing core badges (profile / materials / discussions / comments / quizzes / XP / levels)
UPDATE badges SET rarity = 'common' WHERE name IN (
  'Primo Passo',
  'Contributore',
  'Conversatore',
  'Studente',
  'Commentatore',
  'Utente Attivo'
);

UPDATE badges SET rarity = 'uncommon' WHERE name IN (
  'Esperto',
  'Oratore',
  'Studioso',
  'Intermedio',
  'Dedizione'
);

UPDATE badges SET rarity = 'rare' WHERE name IN (
  'Maestro',
  'Chiacchierone',
  'Perfezionista',
  'Livello 5',
  'Veterano',
  'Collaboratore Attivo'
);

UPDATE badges SET rarity = 'epic' WHERE name IN (
  'Esperto XP',
  'Avanzato',
  'Livello 10',
  'Leggenda',
  'Socievole',
  'Influencer',
  'Maratoneta'
);

-- Legendary and Supreme rarities
UPDATE badges SET rarity = 'legendary' WHERE name IN (
  'Leggenda',
  'Esperto XP'
);

-- (facoltativo) alcuni badge davvero unici possono essere marcati come "supreme"
UPDATE badges SET rarity = 'supreme' WHERE name IN (
  'Veterano'
);

-- Fallback: if something is still NULL, keep it as 'common'
UPDATE badges SET rarity = 'common' WHERE rarity IS NULL;

-- Create an admin-only badge (visible solo agli admin)
INSERT INTO badges (name, description, requirement_type, requirement_value, icon_url, rarity, admin_only)
VALUES (
  'Admin della Classe',
  'Badge riservato ai rappresentanti di classe e agli admin del portale.',
  'role_admin',
  1,
  '🛡️',
  'supreme',
  TRUE
)
ON CONFLICT DO NOTHING;

-- Create a special hacker badge for class representatives
INSERT INTO badges (name, description, requirement_type, requirement_value, icon_url, rarity, admin_only)
VALUES (
  'Hacker della Classe',
  'Badge speciale per i rappresentanti hacker della classe 1R.',
  'role_hacker',
  1,
  '💻',
  'hacker',
  FALSE
)
ON CONFLICT DO NOTHING;

-- (Opzionale) assegna il badge admin a tutti gli utenti con role = ''admin''
INSERT INTO user_badges (user_id, badge_id)
SELECT u.id, b.id
FROM users u
JOIN badges b ON b.name = 'Admin della Classe'
WHERE u.role = 'admin'
ON CONFLICT DO NOTHING;

-- Assegna il badge "Hacker della Classe" agli hacker (aggiorna la lista email secondo necessità)
INSERT INTO user_badges (user_id, badge_id)
SELECT u.id, b.id
FROM users u
JOIN badges b ON b.name = 'Hacker della Classe'
WHERE u.email IN (
  '${ADMIN_EMAIL}'
)
ON CONFLICT DO NOTHING;

-- Ensure the hacker badge is never admin_only (visibile solo a chi lo possiede, ma non limitato al ruolo admin)
UPDATE badges SET admin_only = FALSE WHERE name = 'Hacker della Classe';
