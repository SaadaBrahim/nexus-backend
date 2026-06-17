# Nexus Link Collector - Backend
Il cuore pulsante di **Nexus Link Collector**, un'applicazione Full-Stack per la gestione intelligente dei segnalibri. Questo backend gestisce le comunicazioni con il database Supabase, l'estrazione automatica dei metadati dai siti web e la persistenza dei dati.

## Funzionalità Principali
- **Rest API:** Gestione completa (CRUD) dei link tramite endpoint REST.
- **Scraping Intelligente:** Estrazione automatica del `<title>` dai link salvati tramite `cheerio` e `axios`.
- **Database Scalabile:** Integrazione con **Supabase** per il salvataggio persistente dei dati.
- **Sicurezza:** Gestione delle policy RLS (Row Level Security) per un accesso sicuro ai dati.
- **CORS Enabled:** Configurato per comunicare fluidamente con il frontend.

## Tecnologie Utilizzate
- [Node.js](https://nodejs.org/) - Runtime JavaScript
- [Express](https://expressjs.com/) - Framework web
- [Supabase](https://supabase.com/) - Database PostgreSQL come servizio
- [Axios](https://axios-http.com/) & [Cheerio](https://cheerio.js.org/) - Per lo scraping web

## Configurazione
1. Clona il repository: `git clone [URL_DEL_TUO_REPO]`
2. Installa le dipendenze: `npm install express @supabase/supabase-js cors axios cheerio dotenv`
3. Crea un file `.env` nella root del progetto con le seguenti variabili:
   ```text
   SUPABASE_URL=il_tuo_url_supabase
   SUPABASE_KEY=la_tua_chiave_anon_pubblica
   PORT=3000
Avvia il server: node server.js📡 API EndpointsMetodoEndpointDescrizioneGET/api/postsRecupera tutti i link (con ricerca opzionale)POST/api/postsCrea un nuovo link ed estrae il titolo automaticamentePATCH/api/posts/:id/favoriteAggiorna lo stato "Preferito"DELETE/api/posts/:idElimina un link
---

### Spiegazione del progetto per te
Per spiegare il progetto a qualcuno (o ricordartelo tra 6 mesi), puoi descriverlo così:

> "Il **Nexus Link Collector** è un'architettura **Client-Server** moderna. Il frontend comunica tramite chiamate asincrone (`fetch`) con un server **Node.js/Express**, che funge da mediatore.
>
> 1. **La logica di Business:** Il server non si limita a scrivere sul database, ma 'aggiunge valore' recuperando attivamente il titolo delle pagine web tramite scraping (usando `cheerio`), rendendo l'esperienza utente molto più fluida.
> 2. **L'architettura dei dati:** Abbiamo utilizzato **Supabase (PostgreSQL)**, configurando regole di sicurezza granulari (**RLS**) che garantiscono che ogni operazione di scrittura o lettura rispetti i permessi definiti.
> 3. **Separazione dei compiti:** Il frontend si occupa solo di ciò che l'utente vede (la UI), lasciando al backend il compito critico di validare gli input e gestire la comunicazione con il database in modo sicuro."



[Image of REST API architecture]


Ti piace questa struttura? È pulita, professionale e spiega esattamente cosa fa il tuo codice senza troppi fronzoli. Se vuoi aggiungere altre sezioni (magari come "Roadmap" per le funzioni future), fammi sapere!