const express = require('express');
const router = express.Router();
const replyTemplateController = require('../controllers/replyTemplateController');

// Get all templates
router.get('/', replyTemplateController.getAllTemplates);

// Create a new template
router.post('/', replyTemplateController.createTemplate);

// Get a single template
router.get('/:id', replyTemplateController.getTemplate);

// Update a template
router.put('/:id', replyTemplateController.updateTemplate);

// Delete a template
router.delete('/:id', replyTemplateController.deleteTemplate);

module.exports = router; 