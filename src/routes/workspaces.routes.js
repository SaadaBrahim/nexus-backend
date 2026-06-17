const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/requireAuth');
const workspacesController = require('../controllers/workspaces.controller');

const router = express.Router();

router.use(requireAuth);

router.get('/', asyncHandler(workspacesController.listWorkspaces));
router.post('/', asyncHandler(workspacesController.createWorkspace));
router.patch('/:id', asyncHandler(workspacesController.updateWorkspace));
router.delete('/:id', asyncHandler(workspacesController.deleteWorkspace));

module.exports = router;
