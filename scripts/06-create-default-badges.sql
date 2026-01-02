-- BADGE RARITY SYSTEM
-- Organized by difficulty tiers from Common to Mythical

INSERT INTO badges (name, description, requirement_type, requirement_value, icon_url)
VALUES
  -- ===========================================
  -- COMMON BADGES (Easy to obtain, basic achievements)
  -- ===========================================

  -- Basic Profile & Onboarding
  ('Benvenuto', 'Accedi per la prima volta', 'profile_completed', 1, '👋'),

  -- ===========================================
  -- RARE BADGES (Moderate difficulty, special behaviors)
  -- ===========================================

  -- Special Date/Time Events (Rare timing)
  ('Mezzanotte Esatta', 'Accedi esattamente a mezzanotte', 'profile_completed', 1, '🕛'),
  ('Anno Nuovo', 'Accedi il primo giorno del nuovo anno', 'profile_completed', 1, '🎊'),
  ('Halloween', 'Accedi esattamente il 31 ottobre', 'profile_completed', 1, '🎃'),
  ('San Valentino', 'Accedi esattamente il 14 febbraio', 'profile_completed', 1, '💕'),
  ('Pesce d''Aprile', 'Accedi esattamente il 1° aprile', 'profile_completed', 1, '🐟'),
  ('Festa della Repubblica', 'Accedi esattamente il 2 giugno', 'profile_completed', 1, '🇮🇹'),

  -- Unique Study Patterns (Rare dedication)
  ('Studente Programmato', 'Accedi alla stessa ora per 30 giorni', 'consecutive_days', 30, '⏱️'),
  ('Weekend Warrior', 'Accedi ogni sabato per un mese', 'consecutive_days', 4, '⚔️'),

  -- Easter Eggs & Discovery (Rare exploration)
  ('Guardiano dei Segreti', 'Scopri un easter egg nascosto', 'profile_completed', 1, '🔐'),
  ('Cacciatore di Tesori', 'Trova 5 easter egg', 'profile_completed', 1, '💰'),
  ('Mastro Cacciatore', 'Trova 10 easter egg', 'profile_completed', 1, '🏹'),

  -- ===========================================
  -- EPIC BADGES (High difficulty, exceptional achievements)
  -- ===========================================

  -- Perfect Scores & Excellence (Epic performance)
  ('Perfezionista Assoluto', 'Ottieni 10 volte 100% nei quiz', 'quizzes_completed', 10, '💎'),
  ('Alchimista', 'Ottieni media 9.5+ per un trimestre', 'profile_completed', 1, '⚗️'),

  -- Social & Community Impact (Epic influence)
  ('Social Butterfly', 'Commenta su 50 discussioni diverse', 'comments_posted', 50, '🦋'),
  ('Poliedrico', 'Ottieni badge in 10 categorie diverse', 'profile_completed', 1, '🎭'),

  -- Study Marathons (Epic endurance)
  ('Maratoneta', 'Completa 10 quiz in un giorno', 'quizzes_completed', 10, '🏃'),
  ('Studente Notturno', 'Accedi dopo le 22:00 per 30 giorni consecutivi', 'consecutive_days', 30, '🌙'),
  ('Studente Mattiniero', 'Accedi prima delle 6:00 per 30 giorni consecutivi', 'consecutive_days', 30, '🌅'),

  -- Meta Achievements (Epic collecting)
  ('Collezionista', 'Ottieni 25 badge diversi', 'profile_completed', 1, '🗂️'),
  ('Collezionista Avanzato', 'Ottieni 50 badge diversi', 'profile_completed', 1, '🏆'),
  ('Maestro Collezionista', 'Ottieni 75 badge diversi', 'profile_completed', 1, '💎'),

  -- Seasonal & Astronomical Events (Epic timing)
  ('Equinozio', 'Accedi durante un equinozio', 'profile_completed', 1, '☯️'),
  ('Solstizio', 'Accedi durante un solstizio', 'profile_completed', 1, '☀️'),
  ('Notte Bianca', 'Studia fino alle 4 del mattino', 'profile_completed', 1, '🌙'),
  ('Alba Dorata', 'Accedi alle 5 del mattino', 'profile_completed', 1, '🌅'),

  -- ===========================================
  -- LEGENDARY BADGES (Very rare, near-impossible achievements)
  -- ===========================================

  -- Perfect Number Achievements (Legendary precision)
  ('Mago Oscuro', 'Ottieni esattamente 666 XP', 'xp_earned', 666, '🧙‍♂️'),
  ('Saggio', 'Scrivi esattamente 777 commenti', 'comments_posted', 777, '🧠'),
  ('Palindromo', 'Completa esattamente 101 quiz', 'quizzes_completed', 101, '🔄'),
  ('Visionario', 'Crea esattamente 42 discussioni', 'discussions_created', 42, '👁️'),
  ('Cavaliere', 'Completa 99 quiz consecutivi', 'quizzes_completed', 99, '🏇'),

  -- Special Level Milestones (Legendary progression)
  ('Mago', 'Raggiungi esattamente livello 13', 'level_reached', 13, '🪄'),
  ('Drago', 'Raggiungi esattamente livello 21', 'level_reached', 21, '🐉'),
  ('Fenice', 'Raggiungi esattamente livello 33', 'level_reached', 33, '🦅'),
  ('Titan', 'Raggiungi esattamente livello 50', 'level_reached', 50, '👹'),
  ('Guardiano delle Stelle', 'Raggiungi esattamente livello 88', 'level_reached', 88, '⭐'),
  ('Dio', 'Raggiungi esattamente livello 100', 'level_reached', 100, '👼'),

  -- Extreme Achievement Chains (Legendary progression)
  ('Apprendista Stregone', 'Completa 13 quiz con media 8+', 'quizzes_completed', 13, '🧙‍♂️'),
  ('Stregone', 'Completa 33 quiz con media 9+', 'quizzes_completed', 33, '🔮'),
  ('Mago Supremo', 'Completa 66 quiz con media 9+', 'quizzes_completed', 66, '⚡'),
  ('Guardiano della Conoscenza', 'Carica 66 appunti di qualità', 'materials_uploaded', 66, '🛡️'),
  ('Sommo Sacerdote', 'Scrivi 666 commenti utili', 'comments_posted', 666, '⛪'),
  ('Re Filosofo', 'Crea 100 discussioni profonde', 'discussions_created', 100, '👑'),

  -- Ultimate Endurance (Legendary dedication)
  ('Studente Instancabile', 'Accedi 365 giorni consecutivi', 'consecutive_days', 365, '🔥'),
  ('Immortale', 'Usa la piattaforma per 5 anni consecutivi', 'total_active_days', 1825, '⚡'),

  -- Legendary Social Impact (Legendary influence)
  ('Maestro Zen', 'Scrivi 1000 commenti utili', 'comments_posted', 1000, '☯️'),
  ('Oracolo Moderno', 'Crea 500 discussioni profonde', 'discussions_created', 500, '🔮'),
  ('Celebrità', 'Ricevi 1000 like sui tuoi contenuti', 'comments_posted', 1000, '🌟'),
  ('Eroe della Comunità', 'Ricevi 100 ringraziamenti speciali', 'comments_posted', 100, '🦸'),

  -- Legendary Quality & Excellence (Legendary mastery)
  ('Genio', 'Risolve problemi complessi velocemente', 'profile_completed', 1, '🧠'),
  ('Innovatore', 'Propone soluzioni creative rivoluzionarie', 'profile_completed', 1, '💡'),
  ('Maestro', 'Insegna ad altri studenti con successo', 'comments_posted', 200, '🎓'),
  ('Guru', 'Diventa punto di riferimento globale', 'comments_posted', 500, '🧘'),
  ('Bibliotecario Capo', 'Carica appunti in tutte le materie esistenti', 'materials_uploaded', 20, '📚'),
  ('Enciclopedista', 'Carica 500 appunti di qualità', 'materials_uploaded', 500, '🌍'),

  -- ===========================================
  -- MYTHICAL BADGES (Extremely rare, special recognition)
  -- ===========================================

  -- Mythical XP Milestones (Mythical progression)
  ('Alchimista Digitale', 'Trasforma conoscenza in saggezza (9999 XP)', 'xp_earned', 9999, '⚗️'),
  ('Leggendario', 'Ottieni 7777 XP', 'xp_earned', 7777, '🌟'),
  ('Essere Supremo', 'Trascendi i limiti umani (99999 XP)', 'xp_earned', 99999, '👼'),

  -- Mythical Time Events (Mythical rarity)
  ('29 Febbraio', 'Accedi in un anno bisestile il 29 febbraio', 'profile_completed', 1, '📅'),
  ('Venerdì 17', 'Accedi un venerdì 17', 'profile_completed', 1, '🍀'),
  ('13 del Mese', 'Accedi un 13 del mese', 'profile_completed', 1, '🕸️'),
  ('Fine Anno', 'Accedi l''ultimo giorno dell''anno', 'profile_completed', 1, '🎆'),
  ('Mezzo Anno', 'Accedi esattamente il 30 giugno', 'profile_completed', 1, '📅'),

  -- Mythical Community Recognition (Mythical status)
  ('Community Leader', 'Diventa moderatore votato dalla comunità', 'profile_completed', 1, '👥'),
  ('Leggenda Vivente', 'Vieni menzionato in 500 commenti', 'comments_posted', 500, '🌟'),
  ('Collezionista Leggendario', 'Ottieni 100 badge diversi', 'profile_completed', 1, '🌟'),
  ('Collezionista Divino', 'Ottieni tutti i badge disponibili', 'profile_completed', 1, '👼'),

  -- Mythical Special Recognition (Admin granted)
  ('Fondatore', 'Sei stato tra i primi 10 utenti', 'profile_completed', 1, '🏗️'),
  ('Beta Tester', 'Hai partecipato al beta testing esclusivo', 'profile_completed', 1, '🧪'),
  ('Designer', 'Hai contribuito al design della piattaforma', 'profile_completed', 1, '🎨'),
  ('Sviluppatore', 'Hai contribuito al codice sorgente', 'profile_completed', 1, '💻'),
  ('Bug Hunter', 'Hai segnalato 10 bug critici', 'comments_posted', 10, '🐛'),
  ('Feedback King', 'Hai fornito 50 suggerimenti implementati', 'comments_posted', 50, '💡'),

  -- Mythical Mystery & Legend (Mythical discovery)
  ('Leggenda Urbana', 'Diventa parte delle leggende della piattaforma', 'profile_completed', 1, '👻'),
  ('Mistico', 'Esperienzi eventi paranormali digitali', 'profile_completed', 1, '👽'),
  ('Viaggiatore Temporale', 'Accedi in date storiche significative', 'profile_completed', 1, '⏰'),
  ('Oracolo', 'Predice eventi futuri correttamente', 'profile_completed', 1, '🔮'),

  -- Mythical Fun & Unique (Mythical creativity)
  ('Meme Lord', 'Crea un meme che diventa virale', 'profile_completed', 1, '😂'),
  ('Artista Digitale', 'Crea appunti con disegni e grafici eccezionali', 'materials_uploaded', 10, '🎨'),
  ('Poeta Moderno', 'Scrivi commenti poetici apprezzati', 'comments_posted', 50, '📝'),
  ('Comico', 'Fai ridere la comunità regolarmente', 'comments_posted', 100, '🤡'),
  ('Motivatore', 'Incoraggia altri studenti con successo', 'comments_posted', 150, '💪'),
  ('Psicologo', 'Aiuta studenti con problemi di motivazione', 'comments_posted', 75, '🧠'),

  -- Mythical Ultimate Achievements (Mythical transcendence)
  ('Eterno', 'Usa la piattaforma per 10 anni consecutivi', 'total_active_days', 3650, '💎'),
  ('Visionario', 'Prevede trend educativi futuri', 'discussions_created', 25, '🔮'),
  ('Pioniere', 'Sperimenta metodi di studio rivoluzionari', 'materials_uploaded', 25, '🚀'),
  ('Esploratore', 'Scopre risorse educative rivoluzionarie', 'materials_uploaded', 50, '🗺️'),
  ('Campione', 'Vinci 50 sfide settimanali', 'profile_completed', 1, '🏆'),
  ('Perfezionista', 'Ottieni sempre il massimo punteggio possibile', 'profile_completed', 1, '💯')

ON CONFLICT DO NOTHING;
