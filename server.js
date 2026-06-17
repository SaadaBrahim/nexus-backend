require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// GET: Recupera tutti i post
app.get('/api/posts', async (req, res) => {
    const search = req.query.search || ""; 
    let query = supabase.from('posts').select('*').order('created_at', { ascending: false });

    if (search.trim() !== "") {
        query = query.ilike('title', `%${search}%`);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// POST: Crea un post con estrazione automatica del titolo
app.post('/api/posts', async (req, res) => {
    let { title, url, category } = req.body;
    
    if (!url || !url.startsWith('http')) return res.status(400).json({ error: "URL non valido." });

    // Estrazione automatica del titolo se non fornito
    if (!title || title.trim() === "") {
        try {
            const response = await axios.get(url, { timeout: 5000 });
            const $ = cheerio.load(response.data);
            title = $('title').text() || "Senza titolo";
        } catch (e) {
            title = "Link esterno";
        }
    }

    const { data, error } = await supabase.from('posts').insert([{ 
        title, 
        url, 
        category: category || 'Altro', 
        is_favorite: false 
    }]);

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json({ message: "Post creato!", data });
});

// PATCH: Aggiorna lo stato "Preferito" (Stella)
app.patch('/api/posts/:id/favorite', async (req, res) => {
    const { id } = req.params;
    const { is_favorite } = req.body;

    // Aggiungi questo log per vedere cosa invii a Supabase
    console.log("Tentativo update su ID:", id, "con valore:", is_favorite);

    const { data, error } = await supabase
        .from('posts')
        .update({ is_favorite: is_favorite })
        .eq('id', id);

    if (error) {
        // Stampiamo tutto l'oggetto errore
        console.error("ERRORE DETTAGLIATO SUPABASE:", JSON.stringify(error, null, 2));
        return res.status(500).json({ error: error.message });
    }
    
    console.log("Update riuscito!");
    res.json({ success: true });
});

// DELETE: Elimina post
app.delete('/api/posts/:id', async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Post eliminato!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server attivo sulla porta ${PORT}`));