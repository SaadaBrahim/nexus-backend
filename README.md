# Nexus Link Collector - Backend

Backend Node.js/Express per la gestione intelligente di link e segnalibri, con persistenza su Supabase/PostgreSQL e arricchimento automatico dei metadati.

## Funzionalita attuali

- REST API per CRUD base dei link.
- Estrazione automatica del titolo tramite `axios` e `cheerio`.
- Integrazione con Supabase.
- Frontend statico HTML/CSS/JS.

## Evoluzione in corso

Il progetto sta migrando da prototipo monolitico a piattaforma multiutente sicura:

- Supabase Auth come sistema di autenticazione.
- RLS per isolamento dati per utente.
- Nuove tabelle `profiles`, `workspaces`, `links`, `tags`, `link_tags`.
- Refactoring progressivo verso `routes`, `controllers`, `services`, `middleware`.
- Smart enrichment con Open Graph, descrizione, immagine e favicon.
- Rate limiting, validazione input, paginazione e protezioni SSRF.

## Setup

1. Installa le dipendenze:

   ```bash
   npm install
   ```

2. Copia `.env.example` in `.env` e inserisci le tue chiavi Supabase.

3. Applica le migrazioni SQL in ordine:

   ```text
   supabase/migrations/20260617170000_core_schema.sql
   supabase/migrations/20260617170100_rls_policies.sql
   ```

   La migrazione `20260617170200_optional_legacy_posts_migration.sql` serve solo se vuoi importare i vecchi dati da `public.posts`.

4. Avvia il server attuale:

   ```bash
   node server.js
   ```

## Variabili ambiente

```text
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
CORS_ORIGIN=http://localhost:3000
PORT=3000
```

Nota: `SUPABASE_SERVICE_ROLE_KEY` deve restare solo nel backend. Non va mai esposta nel frontend.

## API attuali

| Metodo | Endpoint | Descrizione |
| --- | --- | --- |
| GET | `/api/posts` | Recupera tutti i link con ricerca opzionale |
| POST | `/api/posts` | Crea un nuovo link ed estrae il titolo automaticamente |
| PATCH | `/api/posts/:id/favorite` | Aggiorna lo stato preferito |
| DELETE | `/api/posts/:id` | Elimina un link |

## Database multiutente

Le nuove migrazioni creano:

- `profiles`: profilo applicativo collegato a `auth.users`.
- `workspaces`: cartelle personali dell'utente.
- `links`: nuova tabella principale che sostituisce progressivamente `posts`.
- `tags`: tag personali.
- `link_tags`: relazione molti-a-molti tra link e tag.

Il modello di sicurezza usa RLS con policy basate su `auth.uid() = user_id`. I vincoli compositi impediscono di associare link, workspace e tag appartenenti a utenti diversi.

Consulta `supabase/README.md` per l'ordine di applicazione e la migrazione legacy opzionale.
