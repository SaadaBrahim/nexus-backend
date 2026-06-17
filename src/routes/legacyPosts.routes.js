const express = require('express');
const { supabase } = require('../config/supabase');
const { extractMetadata } = require('../services/metadata.service');
const { assertHttpUrl } = require('../utils/normalizeUrl');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const search = req.query.search || '';
  let query = supabase.from('posts').select('*').order('created_at', { ascending: false });

  if (search.trim() !== '') {
    query = query.ilike('title', `%${search.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json(data);
}));

router.post('/', asyncHandler(async (req, res) => {
  let { title, url, category } = req.body;
  url = String(url || '').trim();

  if (!assertHttpUrl(url)) {
    return res.status(400).json({ error: 'URL non valido.' });
  }

  if (!title || title.trim() === '') {
    const metadata = await extractMetadata(url);
    title = metadata.title || 'Link esterno';
  }

  const { data, error } = await supabase.from('posts').insert([{
    title,
    url,
    category: category || 'Altro',
    is_favorite: false
  }]).select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json({ message: 'Post creato!', data });
}));

router.patch('/:id/favorite', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { is_favorite } = req.body;

  const { error } = await supabase
    .from('posts')
    .update({ is_favorite: Boolean(is_favorite) })
    .eq('id', id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json({ success: true });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('posts').delete().eq('id', id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json({ message: 'Post eliminato!' });
}));

module.exports = router;
