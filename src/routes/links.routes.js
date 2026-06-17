const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/requireAuth');
const { basicRateLimit } = require('../middleware/basicRateLimit');
const linksController = require('../controllers/links.controller');

const router = express.Router();
const enrichmentLimiter = basicRateLimit({ windowMs: 60 * 1000, max: 10 });

router.use(requireAuth);

router.get('/', asyncHandler(linksController.listLinks));
router.post('/', enrichmentLimiter, asyncHandler(linksController.createLink));
router.patch('/:id', asyncHandler(linksController.updateLink));
router.delete('/:id', asyncHandler(linksController.deleteLink));
router.put('/:id/tags', asyncHandler(linksController.replaceLinkTags));
router.post('/:id/refresh-metadata', enrichmentLimiter, asyncHandler(linksController.refreshMetadata));

module.exports = router;
