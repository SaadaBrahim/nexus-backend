const workspacesService = require('../services/workspaces.service');

async function listWorkspaces(req, res) {
  const data = await workspacesService.listWorkspaces(req.supabase, req.user.id);
  res.json({ data });
}

async function createWorkspace(req, res) {
  const data = await workspacesService.createWorkspace(req.supabase, req.user.id, req.body);
  res.status(201).json({ data });
}

async function updateWorkspace(req, res) {
  const data = await workspacesService.updateWorkspace(req.supabase, req.user.id, req.params.id, req.body);
  res.json({ data });
}

async function deleteWorkspace(req, res) {
  await workspacesService.deleteWorkspace(req.supabase, req.user.id, req.params.id);
  res.status(204).send();
}

module.exports = {
  listWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace
};
