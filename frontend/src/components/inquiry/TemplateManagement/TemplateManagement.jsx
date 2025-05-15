import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faSave, faTimes, faSearch } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './TemplateManagement.css';
import API from '../../../api';
import { useAuth } from '../../../context/AuthContext';

const TemplateManagement = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        content: '',
        category: 'General'
    });
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const response = await API.get('/reply-templates');
            // Axios returns data directly in the response object
            setTemplates(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching templates:', err);
            setError(err.response?.data?.message || 'Failed to fetch templates');
            setLoading(false);
            toast.error('Failed to fetch templates');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let response;
            
            if (editingTemplate) {
                // Update existing template
                response = await API.put(`/reply-templates/${editingTemplate._id}`, formData);
            } else {
                // Create new template
                response = await API.post('/reply-templates', formData);
            }

            // Axios returns the data directly
            const savedTemplate = response.data;
            
            if (editingTemplate) {
                setTemplates(templates.map(t => 
                    t._id === savedTemplate._id ? savedTemplate : t
                ));
                toast.success('Template updated successfully');
            } else {
                setTemplates([...templates, savedTemplate]);
                toast.success('Template created successfully');
            }

            resetForm();
        } catch (err) {
            console.error('Error saving template:', err);
            toast.error(err.response?.data?.message || 'Failed to save template');
        }
    };

    const handleDelete = async (templateId) => {
        if (window.confirm('Are you sure you want to delete this template?')) {
            try {
                await API.delete(`/reply-templates/${templateId}`);
                
                // Update UI by filtering out the deleted template
                setTemplates(templates.filter(t => t._id !== templateId));
                toast.success('Template deleted successfully');
            } catch (err) {
                console.error('Error deleting template:', err);
                toast.error(err.response?.data?.message || 'Failed to delete template');
            }
        }
    };

    const handleEdit = (template) => {
        setEditingTemplate(template);
        setFormData({
            name: template.name,
            content: template.content,
            category: template.category
        });
        setShowForm(true);
        window.scrollTo(0, 0);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            content: '',
            category: 'General'
        });
        setEditingTemplate(null);
        setShowForm(false);
    };

    const handleBack = () => {
        const returnId = sessionStorage.getItem('returnToInquiry');
        if (returnId) {
            sessionStorage.removeItem('returnToInquiry');
            navigate(`/inquiry/${returnId}`);
        } else {
            navigate('/view-inquiries');
        }
    };

    if (loading) return <div className="loading">Loading templates...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="template-management-container">
            <ToastContainer />
            <div className="template-header">
                <h2>Reply Templates</h2>
                <div className="header-actions">
                    <button onClick={handleBack} className="back-btn">
                        Back
                    </button>
                    {!showForm && (
                        <button onClick={() => setShowForm(true)} className="add-template-btn">
                            Add New Template
                        </button>
                    )}
                </div>
            </div>

            {showForm && (
                <div className="template-form">
                    <h3>{editingTemplate ? 'Edit Template' : 'Add New Template'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                required
                            >
                                <option value="General">General</option>
                                <option value="Technical">Technical</option>
                                <option value="Billing">Billing</option>
                                <option value="Support">Support</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Content</label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({...formData, content: e.target.value})}
                                required
                                rows={6}
                            />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="save-btn">
                                {editingTemplate ? 'Update Template' : 'Save Template'}
                            </button>
                            <button type="button" onClick={resetForm} className="cancel-btn">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="templates-grid">
                {templates.map((template) => (
                    <div key={template._id} className="template-card">
                        <div className="template-card-header">
                            <h3>{template.name}</h3>
                            <span className="template-category">{template.category}</span>
                        </div>
                        <p className="template-content">{template.content}</p>
                        <div className="template-actions">
                            <button onClick={() => handleEdit(template)} className="edit-btn">
                                Edit
                            </button>
                            <button onClick={() => handleDelete(template._id)} className="delete-btn">
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TemplateManagement; 