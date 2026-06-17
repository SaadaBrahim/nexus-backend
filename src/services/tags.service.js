const { httpError } = require('../utils/httpError');
const { slugify } = require('../utils/slugify');

async function listTags(db, userId) {
  const { data, error } = await db
    .from('tags')
    .select('id, name, slug, color, created_at')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) throw httpError(500, error.message);
  return data;
}

async function createTag(db, userId, payload) {
  const name = String(payload.name || '').trim();
  const slug = slugify(payload.slug || name);

  if (name.length < 1 || name.length > 50) {
    throw httpError(400, 'Il nome tag deve avere tra 1 e 50 caratteri.');
  }

  if (!slug) {
    throw httpError(400, 'Slug tag non valido.');
  }

  const { data, error } = await db
    .from('tags')
    .insert({
      user_id: userId,
      name,
      slug,
      color: payload.color || null
    })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') throw httpError(409, 'Tag gia esistente.');
    throw httpError(500, error.message);
  }

  return data;
}

async function updateTag(db, userId, id, payload) {
  const update = {};

  if (payload.name !== undefined) {
    const name = String(payload.name || '').trim();
    if (name.length < 1 || name.length > 50) {
      throw httpError(400, 'Il nome tag deve avere tra 1 e 50 caratteri.');
    }
    update.name = name;
    update.slug = slugify(payload.slug || name);
  }

  if (payload.slug !== undefined && payload.name === undefined) {
    update.slug = slugify(payload.slug);
  }

  if (payload.color !== undefined) update.color = payload.color;

  const { data, error } = await db
    .from('tags')
    .update(update)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) throw httpError(500, error.message);
  return data;
}

async function deleteTag(db, userId, id) {
  const { error } = await db
    .from('tags')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw httpError(500, error.message);
}

module.exports = {
  listTags,
  createTag,
  updateTag,
  deleteTag
};
