require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Inizializziamo Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Rotta di test: verifica connessione al database
app.get('/test-db', async (req, res) => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Connessione al database riuscita!", data });
});

// Endpoint per creare un nuovo post (Bookmark)
app.post('/api/posts', async (req, res) => {
    const { title, url } = req.body; // Rimosso user_id

    const { data, error } = await supabase
        .from('posts')
        .insert([{ title, url }]); // Inviamo solo titolo e URL

    if (error) {
        console.error("Errore da Supabase:", error);
        return res.status(500).json({ error: error.message });
    }
    res.status(201).json({ message: "Post creato con successo!", data });
});

// Endpoint per ottenere tutti i post (per il feed)
app.get('/api/posts', async (req, res) => {
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false }); // Ordina dai più recenti

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.delete('/api/posts/:id', async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id); // Cancella solo il post con questo ID

    if (error) {
        console.error("Errore eliminazione:", error);
        return res.status(500).json({ error: error.message });
    }

    res.json({ message: "Post eliminato con successo!", data });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server attivo sulla porta ${PORT}`);
});