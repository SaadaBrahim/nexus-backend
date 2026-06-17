const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/requireAuth');
const tagsController = require('../controllers/tags.controller');

const router = express.Router();

router.use(requireAuth);

router.get('/', asyncHandler(tagsController.listTags));
router.post('/', asyncHandler(tagsController.createTag));
router.patch('/:id', asyncHandler(tagsController.updateTag));
router.delete('/:id', asyncHandler(tagsController.deleteTag));

module.exports = router;
