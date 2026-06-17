const { extractMetadata } = require('./metadata.service');
const { assertHttpUrl, normalizeUrl } = require('../utils/normalizeUrl');
const { httpError } = require('../utils/httpError');

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function parsePagination(query) {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const pageSize = Math.min(
    Math.max(Number.parseInt(query.pageSize, 10) || DEFAULT_PAGE_SIZE, 1),
    MAX_PAGE_SIZE
  );

  return {
    page,
    pageSize,
    from: (page - 1) * pageSize,
    to: page * pageSize - 1
  };
}

async function listLinks(db, userId, query) {
  const { page, pageSize, from, to } = parsePagination(query);

  let dbQuery = db
    .from('links')
    .select(`
      id,
      url,
      normalized_url,
      title,
      description,
      image_url,
      favicon_url,
      site_name,
      notes,
      is_favorite,
      is_archived,
      created_at,
      updated_at,
      workspace:workspaces(id, name, color, icon),
      link_tags(tag:tags(id, name, slug, color))
    `, { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (query.search && query.search.trim()) {
    dbQuery = dbQuery.ilike('title', `%${query.search.trim()}%`);
  }

  if (query.workspaceId) {
    dbQuery = dbQuery.eq('workspace_id', query.workspaceId);
  }

  if (query.favorite === 'true') {
    dbQuery = dbQuery.eq('is_favorite', true);
  }

  if (query.archived === 'true') {
    dbQuery = dbQuery.eq('is_archived', true);
  } else {
    dbQuery = dbQuery.eq('is_archived', false);
  }

  const { data, count, error } = await dbQuery;

  if (error) {
    throw httpError(500, error.message);
  }

  return {
    data,
    pagination: {
      page,
      pageSize,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize)
    }
  };
}

async function createLink(db, userId, payload) {
  const url = String(payload.url || '').trim();

  if (!assertHttpUrl(url)) {
    throw httpError(400, 'URL non valido. Usa un URL http o https.');
  }

  const normalized = normalizeUrl(url);
  const metadata = await extractMetadata(url);

  const row = {
    user_id: userId,
    workspace_id: payload.workspaceId || null,
    url,
    normalized_url: normalized,
    title: payload.title && payload.title.trim() ? payload.title.trim() : metadata.title,
    description: metadata.description,
    image_url: metadata.image_url,
    favicon_url: metadata.favicon_url,
    site_name: metadata.site_name,
    notes: payload.notes || null,
    is_favorite: Boolean(payload.isFavorite),
    metadata: metadata.metadata || {}
  };

  const { data, error } = await db
    .from('links')
    .insert(row)
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw httpError(409, 'Questo link esiste gia nel tuo account.');
    }

    throw httpError(500, error.message);
  }

  if (Array.isArray(payload.tagIds) && payload.tagIds.length > 0) {
    const tagRows = payload.tagIds.map((tagId) => ({
      link_id: data.id,
      tag_id: tagId,
      user_id: userId
    }));

    const { error: tagError } = await db.from('link_tags').insert(tagRows);

    if (tagError) {
      throw httpError(400, tagError.message);
    }
  }

  return data;
}

async function updateLink(db, userId, id, payload) {
  const update = {};

  if (payload.title !== undefined) update.title = payload.title;
  if (payload.notes !== undefined) update.notes = payload.notes;
  if (payload.workspaceId !== undefined) update.workspace_id = payload.workspaceId;
  if (payload.isFavorite !== undefined) update.is_favorite = Boolean(payload.isFavorite);
  if (payload.isArchived !== undefined) update.is_archived = Boolean(payload.isArchived);

  const { data, error } = await db
    .from('links')
    .update(update)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) {
    throw httpError(500, error.message);
  }

  return data;
}

async function deleteLink(db, userId, id) {
  const { error } = await db
    .from('links')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    throw httpError(500, error.message);
  }
}

async function refreshMetadata(db, userId, id) {
  const { data: link, error: readError } = await db
    .from('links')
    .select('id, url')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (readError) {
    throw httpError(404, 'Link non trovato');
  }

  const metadata = await extractMetadata(link.url);

  const { data, error } = await db
    .from('links')
    .update(metadata)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) {
    throw httpError(500, error.message);
  }

  return data;
}

async function replaceLinkTags(db, userId, id, tagIds) {
  if (!Array.isArray(tagIds) || tagIds.length > 20) {
    throw httpError(400, 'tagIds deve essere un array con massimo 20 elementi.');
  }

  const { data: link, error: readError } = await db
    .from('links')
    .select('id')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (readError || !link) {
    throw httpError(404, 'Link non trovato');
  }

  const { error: deleteError } = await db
    .from('link_tags')
    .delete()
    .eq('link_id', id)
    .eq('user_id', userId);

  if (deleteError) {
    throw httpError(500, deleteError.message);
  }

  if (tagIds.length === 0) {
    return [];
  }

  const rows = tagIds.map((tagId) => ({
    link_id: id,
    tag_id: tagId,
    user_id: userId
  }));

  const { data, error } = await db
    .from('link_tags')
    .insert(rows)
    .select('link_id, tag_id, tag:tags(id, name, slug, color)');

  if (error) {
    throw httpError(400, error.message);
  }

  return data;
}

module.exports = {
  listLinks,
  createLink,
  updateLink,
  deleteLink,
  refreshMetadata,
  replaceLinkTags
};
