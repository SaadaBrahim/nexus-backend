const { httpError } = require('../utils/httpError');

async function listWorkspaces(db, userId) {
  const { data, error } = await db
    .from('workspaces')
    .select('id, name, description, color, icon, position, created_at, updated_at')
    .eq('user_id', userId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw httpError(500, error.message);
  return data;
}

async function createWorkspace(db, userId, payload) {
  const name = String(payload.name || '').trim();

  if (name.length < 1 || name.length > 80) {
    throw httpError(400, 'Il nome workspace deve avere tra 1 e 80 caratteri.');
  }

  const row = {
    user_id: userId,
    name,
    description: payload.description || null,
    color: payload.color || null,
    icon: payload.icon || null,
    position: Number.isInteger(payload.position) ? payload.position : 0
  };

  const { data, error } = await db
    .from('workspaces')
    .insert(row)
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') throw httpError(409, 'Workspace gia esistente.');
    throw httpError(500, error.message);
  }

  return data;
}

async function updateWorkspace(db, userId, id, payload) {
  const update = {};

  if (payload.name !== undefined) {
    const name = String(payload.name || '').trim();
    if (name.length < 1 || name.length > 80) {
      throw httpError(400, 'Il nome workspace deve avere tra 1 e 80 caratteri.');
    }
    update.name = name;
  }

  if (payload.description !== undefined) update.description = payload.description;
  if (payload.color !== undefined) update.color = payload.color;
  if (payload.icon !== undefined) update.icon = payload.icon;
  if (payload.position !== undefined) update.position = payload.position;

  const { data, error } = await db
    .from('workspaces')
    .update(update)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) throw httpError(500, error.message);
  return data;
}

async function deleteWorkspace(db, userId, id) {
  const { error } = await db
    .from('workspaces')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw httpError(500, error.message);
}

module.exports = {
  listWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace
};
