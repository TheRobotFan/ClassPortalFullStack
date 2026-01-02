-- COMPREHENSIVE BADGE RARITY ASSIGNMENT
-- This script dynamically assigns rarities to ALL existing badges in the database

-- Add the rarity column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'badges' AND column_name = 'rarity') THEN
        ALTER TABLE badges ADD COLUMN rarity VARCHAR(20) DEFAULT 'common';
    END IF;
END $$;

-- FOUNDATION - Welcome and basic onboarding badges
UPDATE badges SET rarity = 'foundation'
WHERE name IN ('Benvenuto', 'Welcome', 'Getting Started', 'First Steps')
   OR description ILIKE '%first%' OR description ILIKE '%welcome%' OR description ILIKE '%getting started%';

-- LEGENDARY - Near-impossible achievements with exact numbers or extreme dedication
UPDATE badges SET rarity = 'legendary'
WHERE name IN (
    'Mago Oscuro', 'Mago', 'Drago', 'Fenice', 'Titan', 'Guardiano delle Stelle', 'Dio',
    'Immortale', 'Eterno', 'Studente Instancabile',
    'Maestro Zen', 'Oracolo Moderno', 'Celebrità', 'Eroe della Comunità',
    'Apprendista Stregone', 'Stregone', 'Mago Supremo', 'Guardiano della Conoscenza',
    'Sommo Sacerdote', 'Re Filosofo', 'Saggio', 'Visionario', 'Cavaliere'
)
OR requirement_value IN (666, 777, 101, 999, 1825, 3650, 365, 1000, 500)
OR name ILIKE '%mago%' OR name ILIKE '%drago%' OR name ILIKE '%dio%' OR name ILIKE '%immortale%'
OR description ILIKE '%esattamente%' OR description ILIKE '%exactly%' OR description ILIKE '%365 giorni%'
OR description ILIKE '%5 anni%' OR description ILIKE '%10 anni%' OR description ILIKE '%1000 commenti%'
OR name ILIKE '%mago%' OR name ILIKE '%drago%' OR name ILIKE '%dio%' OR name ILIKE '%immortale%'
OR name ILIKE '%livello%' OR description ILIKE '%livello%';

-- ADMIN - Exclusive badges for platform administrators
UPDATE badges SET rarity = 'admin'
WHERE name IN (
    'Amministratore Supremo', 'Guardiano del Sistema', 'Architetto della Comunità', 'Giudice Supremo',
    'Moderatore Leggendario', 'Saggio Anziano', 'Custode della Conoscenza', 'Maestro dell''Ordine'
)
OR name ILIKE '%amministrator%' OR name ILIKE '%admin%' OR name ILIKE '%moderator%'
OR name ILIKE '%giudice%' OR name ILIKE '%custode%' OR name ILIKE '%saggio%'
OR description ILIKE '%amministrator%' OR description ILIKE '%admin%' OR description ILIKE '%moderator%'
OR description ILIKE '%giudice%' OR description ILIKE '%custode%' OR description ILIKE '%saggio%';

-- HACKER - Exclusive badges for platform hackers/developers
UPDATE badges SET rarity = 'hacker'
WHERE name IN (
    'Hacker Leggendario', 'Mago del Codice', 'Architetto Digitale', 'Guardiano del Codice',
    'Innovatore Tecnologico', 'Debugger Supremo', 'Ottimizzatore', 'Visionario Tecnologico',
    'Mago della Sicurezza', 'Architetto dei Dati', 'Beta Tester', 'Fondatore', 'Sviluppatore'
)
OR name ILIKE '%hacker%' OR name ILIKE '%developer%' OR name ILIKE '%beta%' OR name ILIKE '%founder%'
OR name ILIKE '%debugger%' OR name ILIKE '%ottimizzatore%' OR name ILIKE '%innovatore%'
OR description ILIKE '%hacker%' OR description ILIKE '%developer%' OR description ILIKE '%beta%' OR description ILIKE '%founder%'
OR description ILIKE '%debugger%' OR description ILIKE '%ottimizzatore%' OR description ILIKE '%innovatore%';

-- Remove the old STAFF category reference
-- UPDATE badges SET rarity = 'staff' ... (removed)

-- MYTHICAL - Divine achievements, special events, and legendary recognitions
UPDATE badges SET rarity = 'mythical'
WHERE name IN (
    'Alchimista Digitale', 'Leggendario', 'Essere Supremo', 'Palindromo',
    '29 Febbraio', 'Venerdì 17', '13 del Mese', 'Fine Anno', 'Mezzo Anno',
    'Community Leader', 'Leggenda Vivente', 'Collezionista Divino', 'Collezionista Leggendario',
    'Bug Hunter', 'Feedback King', 'Designer',
    'Leggenda Urbana', 'Mistico', 'Viaggiatore Temporale', 'Oracolo',
    'Meme Lord', 'Artista Digitale', 'Poeta Moderno', 'Comico', 'Motivatore', 'Psicologo',
    'Eterno', 'Visionario', 'Pioniere', 'Esploratore', 'Campione', 'Perfezionista'
)
OR requirement_value IN (9999, 7777, 99999)
OR name ILIKE '%leggenda%' OR name ILIKE '%legend%' OR name ILIKE '%myth%' OR name ILIKE '%divine%'
OR name ILIKE '%alchemist%' OR name ILIKE '%oracle%' OR name ILIKE '%mystic%' OR name ILIKE '%time traveler%'
OR description ILIKE '%29 febbraio%' OR description ILIKE '%venerdì 17%' OR description ILIKE '%13 del mese%'
OR description ILIKE '%community leader%' OR description ILIKE '%legend%' OR description ILIKE '%divine%'
OR description ILIKE '%9999%' OR description ILIKE '%7777%' OR description ILIKE '%99999%';

-- RARE - Moderate difficulty achievements
UPDATE badges SET rarity = 'rare'
WHERE name IN (
    'Mezzanotte Esatta', 'Anno Nuovo', 'Halloween', 'San Valentino', 'Pesce d''Aprile',
    'Festa della Repubblica', 'Natale', 'Festa del Lavoro', 'Ferragosto', 'Ognissanti',
    'Studente Programmato', 'Weekend Warrior', 'Studente del Mattino', 'Studente della Sera', 'Costante',
    'Guardiano dei Segreti', 'Cacciatore di Tesori', 'Mastro Cacciatore', 'Esploratore Digitale', 'Detective'
)
OR description ILIKE '%mezzanotte%' OR description ILIKE '%halloween%' OR description ILIKE '%natale%'
OR description ILIKE '%30 giorni%' OR description ILIKE '%14 giorni%' OR description ILIKE '%50 giorni%'
OR description ILIKE '%easter egg%' OR description ILIKE '%hidden%' OR description ILIKE '%secret%'
OR description ILIKE '%midnight%' OR description ILIKE '%halloween%' OR description ILIKE '%christmas%';

-- EPIC - High difficulty achievements
UPDATE badges SET rarity = 'epic'
WHERE name IN (
    'Perfezionista Assoluto', 'Alchimista', 'Campione dei Quiz', 'Maestro dei Test',
    'Social Butterfly', 'Poliedrico', 'Mentore', 'Influencer', 'Community Helper',
    'Maratoneta', 'Studente Notturno', 'Studente Mattiniero', 'Dedito allo Studio', 'Studente Serio',
    'Scrittore', 'Pubblicista', 'Educatore', 'Facilitatore',
    'Collezionista', 'Collezionista Avanzato', 'Maestro Collezionista', 'Badge Hunter',
    'Equinozio', 'Solstizio', 'Notte Bianca', 'Alba Dorata', 'Luna Piena'
)
OR description ILIKE '%10 volte%' OR description ILIKE '%100% quiz%' OR description ILIKE '%media 9+%'
OR description ILIKE '%50 discussioni%' OR description ILIKE '%100 commenti%' OR description ILIKE '%25 quiz%'
OR description ILIKE '%10 quiz%' OR description ILIKE '%30 giorni%' OR description ILIKE '%100 giorni%'
OR description ILIKE '%25 appunti%' OR description ILIKE '%50 appunti%' OR description ILIKE '%25 discussioni%'
OR description ILIKE '%25 badge%' OR description ILIKE '%50 badge%' OR description ILIKE '%75 badge%'
OR description ILIKE '%equinozio%' OR description ILIKE '%solstizio%' OR description ILIKE '%luna piena%'
OR description ILIKE '%10 perfect%' OR description ILIKE '%9.5+ average%' OR description ILIKE '%8+ average%';

-- SEASONAL - Time-limited special events
UPDATE badges SET rarity = 'seasonal'
WHERE name IN (
    'Babbo Natale', 'Befana', 'Carnevale', 'Pasqua', 'Liberazione', 'Patrono',
    'Studente Estivo', 'Studente Invernale', 'Studente Autunnale', 'Studente Primaverile',
    'Marathon Quiz', 'Challenge Settimanale', 'Torneo di Matematica', 'Competizione Letteraria',
    'Hackathon Studentesco', 'Gara di Conoscenza',
    'Velocista', 'Poliglotta', 'Collaborativo', 'Innovativo', 'Motivazionale', 'Creativo'
)
OR description ILIKE '%estate%' OR description ILIKE '%inverno%' OR description ILIKE '%autunno%' OR description ILIKE '%primavera%'
OR description ILIKE '%marathon%' OR description ILIKE '%challenge%' OR description ILIKE '%torneo%' OR description ILIKE '%competizione%'
OR description ILIKE '%hackathon%' OR description ILIKE '%velocista%' OR description ILIKE '%2 minuti%'
OR description ILIKE '%summer%' OR description ILIKE '%winter%' OR description ILIKE '%autumn%' OR description ILIKE '%spring%';

-- COMMON - Basic achievements (catch-all for remaining badges)
UPDATE badges SET rarity = 'common'
WHERE rarity = 'foundation'  -- Reset foundation badges that weren't caught above
   OR (rarity IS NULL OR rarity = 'common')
   AND name NOT IN (
       SELECT name FROM badges WHERE rarity IN ('foundation', 'legendary', 'staff', 'mythical', 'rare', 'epic', 'seasonal')
   );

-- Verify the assignment worked - show all badges with their rarities
SELECT
    rarity,
    COUNT(*) as badge_count,
    STRING_AGG(name, ', ' ORDER BY name) as badge_names
FROM badges
GROUP BY rarity
ORDER BY
    CASE rarity
        WHEN 'foundation' THEN 1
        WHEN 'common' THEN 2
        WHEN 'rare' THEN 3
        WHEN 'epic' THEN 4
        WHEN 'seasonal' THEN 5
        WHEN 'legendary' THEN 6
        WHEN 'mythical' THEN 7
        WHEN 'admin' THEN 8
        WHEN 'hacker' THEN 9
        ELSE 10
    END;

COMMIT;
