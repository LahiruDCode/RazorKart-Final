const ReplyTemplate = require('../models/ReplyTemplate');

// Get all templates
exports.getAllTemplates = async (req, res) => {
    try {
        const templates = await ReplyTemplate.find().sort({ createdAt: -1 });
        res.json(templates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get template by ID
exports.getTemplate = async (req, res) => {
    try {
        const template = await ReplyTemplate.findById(req.params.id);
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }
        res.json(template);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new template
exports.createTemplate = async (req, res) => {
    try {
        const template = new ReplyTemplate({
            name: req.body.name,
            content: req.body.content,
            category: req.body.category
        });

        const newTemplate = await template.save();
        res.status(201).json(newTemplate);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update template
exports.updateTemplate = async (req, res) => {
    try {
        const template = await ReplyTemplate.findById(req.params.id);
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        if (req.body.name) template.name = req.body.name;
        if (req.body.content) template.content = req.body.content;
        if (req.body.category) template.category = req.body.category;

        const updatedTemplate = await template.save();
        res.json(updatedTemplate);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete template
exports.deleteTemplate = async (req, res) => {
    try {
        const template = await ReplyTemplate.findByIdAndDelete(req.params.id);
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }
        res.json({ message: 'Template deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 