-- SUPREME BADGE SYSTEM - Only the Most Elite Achievements
-- This system contains ONLY the most prestigious and rarest achievements
-- Removed 140+ common badges, kept only 35 truly supreme achievements

INSERT INTO badges (name, description, requirement_type, requirement_value, icon_url)
VALUES
  -- ===========================================
  -- 🎯 SUPREME FOUNDATION (Only the absolute basics)
  -- ===========================================

  -- The only truly common badge everyone gets
  ('Benvenuto', 'Accedi per la prima volta alla piattaforma', 'profile_completed', 1, '👋'),

  -- ===========================================
  -- 🏅 LEGENDARY BADGES (Near-impossible supreme achievements)
  -- ===========================================

  -- Supreme XP Milestones (mathematically perfect numbers)
  ('Mago Oscuro', 'Ottieni esattamente 666 punti esperienza', 'xp_earned', 666, '🧙‍♂️'),
  ('Saggio', 'Scrivi esattamente 777 commenti', 'comments_posted', 777, '🧠'),
  ('Palindromo', 'Completa esattamente 101 quiz', 'quizzes_completed', 101, '🔄'),
  ('Visionario', 'Crea esattamente 42 discussioni', 'discussions_created', 42, '👁️'),
  ('Cavaliere', 'Completa esattamente 99 quiz consecutivi', 'quizzes_completed', 99, '🏇'),

  -- Supreme Level Achievements (mystical level milestones)
  ('Mago', 'Raggiungi esattamente il livello 13', 'level_reached', 13, '🪄'),
  ('Drago', 'Raggiungi esattamente il livello 21', 'level_reached', 21, '🐉'),
  ('Fenice', 'Raggiungi esattamente il livello 33', 'level_reached', 33, '🦅'),
  ('Titan', 'Raggiungi esattamente il livello 50', 'level_reached', 50, '�'),
  ('Guardiano delle Stelle', 'Raggiungi esattamente il livello 88', 'level_reached', 88, '⭐'),
  ('Dio', 'Raggiungi esattamente il livello 100', 'level_reached', 100, '👼'),

  -- Supreme Achievement Chains (complete mastery paths)
  ('Apprendista Stregone', 'Completa 13 quiz mantenendo media 8+', 'quizzes_completed', 13, '🧙‍♂️'),
  ('Stregone', 'Completa 33 quiz mantenendo media 9+', 'quizzes_completed', 33, '�'),
  ('Mago Supremo', 'Completa 66 quiz mantenendo media 9+', 'quizzes_completed', 66, '⚡'),
  ('Guardiano della Conoscenza', 'Carica 66 appunti di qualità eccellente', 'materials_uploaded', 66, '🛡️'),
  ('Sommo Sacerdote', 'Scrivi 666 commenti utili e costruttivi', 'comments_posted', 666, '⛪'),
  ('Re Filosofo', 'Crea 100 discussioni profonde e significative', 'discussions_created', 100, '👑'),

  -- Supreme Endurance (decades of dedication)
  ('Immortale', 'Usa la piattaforma per 5 anni consecutivi', 'total_active_days', 1825, '⚡'),
  ('Eterno', 'Usa la piattaforma per 10 anni consecutivi', 'total_active_days', 3650, '💎'),
  ('Studente Instancabile', 'Accedi per 365 giorni completamente consecutivi', 'consecutive_days', 365, '�'),

  -- Supreme Social Impact (life-changing influence)
  ('Maestro Zen', 'Scrivi 1000 commenti utili e pacifici', 'comments_posted', 1000, '☯️'),
  ('Oracolo Moderno', 'Crea 500 discussioni profonde e illuminanti', 'discussions_created', 500, '🔮'),
  ('Celebrità', 'Ricevi 1000 like sui tuoi contenuti', 'comments_posted', 1000, '🌟'),
  ('Eroe della Comunità', 'Ricevi 100 ringraziamenti speciali dalla comunità', 'comments_posted', 100, '🦸'),

  -- ===========================================
  -- 👑 ADMIN EXCLUSIVE SUPREME BADGES (Platform administrators only)
  -- ===========================================

  -- Supreme Administrative Power
  ('Amministratore Supremo', 'Sei un amministratore della piattaforma con pieni poteri', 'profile_completed', 1, '👑'),
  ('Guardiano del Sistema', 'Proteggi l''integrità della piattaforma come amministratore', 'profile_completed', 1, '🛡️'),
  ('Architetto della Comunità', 'Costruisci e mantieni la comunità come amministratore', 'profile_completed', 1, '🏗️'),
  ('Giudice Supremo', 'Amministri giustizia nella comunità come amministratore', 'profile_completed', 1, '⚖️'),

  -- Supreme Development Mastery
  ('Hacker Leggendario', 'Sei uno sviluppatore hacker della piattaforma', 'profile_completed', 1, '👾'),
  ('Mago del Codice', 'Scrivi codice che fa magie nella piattaforma', 'profile_completed', 1, '💻'),
  ('Architetto Digitale', 'Costruisci l''infrastruttura della piattaforma', 'profile_completed', 1, '🏗️'),
  ('Guardiano del Codice', 'Proteggi il codice sorgente da vulnerabilità', 'profile_completed', 1, '🔒'),

  -- ===========================================
  -- 🎭 MYTHICAL SUPREME BADGES (Extremely rare divine recognitions)
  -- ===========================================

  -- Divine XP Transcendence
  ('Alchimista Digitale', 'Trasforma conoscenza in saggezza (9999 XP)', 'xp_earned', 9999, '⚗️'),
  ('Leggendario', 'Ottieni esattamente 7777 punti esperienza', 'xp_earned', 7777, '�'),
  ('Essere Supremo', 'Trascendi i limiti umani (99999 XP)', 'xp_earned', 99999, '👼'),

  -- Mythical Temporal Events (once-in-eternity moments)
  ('29 Febbraio', 'Accedi in un anno bisestile il 29 febbraio', 'profile_completed', 1, '📅'),
  ('Venerdì 17', 'Accedi un venerdì 17 (giorno considerato sfortunato)', 'profile_completed', 1, '🍀'),
  ('13 del Mese', 'Accedi un 13 del mese (venerdì 13)', 'profile_completed', 1, '🕸️'),

  -- Divine Community Recognition
  ('Community Leader', 'Diventa moderatore votato dalla comunità', 'profile_completed', 1, '👥'),
  ('Leggenda Vivente', 'Vieni menzionato in 500 commenti diversi', 'comments_posted', 500, '�'),
  ('Collezionista Divino', 'Ottieni tutti i badge disponibili nella piattaforma', 'profile_completed', 1, '�'),

  -- Supreme Platform Contributions
  ('Fondatore', 'Sei stato tra i primi 10 utenti della piattaforma', 'profile_completed', 1, '🏗️'),
  ('Beta Tester', 'Hai partecipato al beta testing esclusivo', 'profile_completed', 1, '🧪'),
  ('Sviluppatore', 'Hai contribuito al codice sorgente', 'profile_completed', 1, '💻'),
  ('Bug Hunter', 'Hai segnalato 10 bug critici che sono stati risolti', 'comments_posted', 10, '🐛'),

  -- Mythical Mystery & Prophecy
  ('Leggenda Urbana', 'Diventa parte delle leggende della piattaforma', 'profile_completed', 1, '�'),
  ('Mistico', 'Esperienzi eventi paranormali digitali', 'profile_completed', 1, '�'),
  ('Viaggiatore Temporale', 'Accedi in date storiche significative', 'profile_completed', 1, '⏰'),
  ('Oracolo', 'Predice eventi futuri correttamente', 'profile_completed', 1, '🔮')

ON CONFLICT DO NOTHING;

COMMIT;
