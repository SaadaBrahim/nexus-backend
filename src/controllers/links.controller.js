const linksService = require('../services/links.service');

async function listLinks(req, res) {
  const result = await linksService.listLinks(req.supabase, req.user.id, req.query);
  res.json(result);
}

async function createLink(req, res) {
  const link = await linksService.createLink(req.supabase, req.user.id, req.body);
  res.status(201).json({ data: link });
}

async function updateLink(req, res) {
  const link = await linksService.updateLink(req.supabase, req.user.id, req.params.id, req.body);
  res.json({ data: link });
}

async function deleteLink(req, res) {
  await linksService.deleteLink(req.supabase, req.user.id, req.params.id);
  res.status(204).send();
}

async function refreshMetadata(req, res) {
  const link = await linksService.refreshMetadata(req.supabase, req.user.id, req.params.id);
  res.json({ data: link });
}

async function replaceLinkTags(req, res) {
  const data = await linksService.replaceLinkTags(
    req.supabase,
    req.user.id,
    req.params.id,
    req.body.tagIds
  );
  res.json({ data });
}

module.exports = {
  listLinks,
  createLink,
  updateLink,
  deleteLink,
  refreshMetadata,
  replaceLinkTags
};
