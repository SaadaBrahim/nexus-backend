const tagsService = require('../services/tags.service');

async function listTags(req, res) {
  const data = await tagsService.listTags(req.supabase, req.user.id);
  res.json({ data });
}

async function createTag(req, res) {
  const data = await tagsService.createTag(req.supabase, req.user.id, req.body);
  res.status(201).json({ data });
}

async function updateTag(req, res) {
  const data = await tagsService.updateTag(req.supabase, req.user.id, req.params.id, req.body);
  res.json({ data });
}

async function deleteTag(req, res) {
  await tagsService.deleteTag(req.supabase, req.user.id, req.params.id);
  res.status(204).send();
}

module.exports = {
  listTags,
  createTag,
  updateTag,
  deleteTag
};
