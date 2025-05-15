import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './InquiryDetails.css';
import API from '../../../api';
import { useAuth } from '../../../context/AuthContext';
import TemplateManagement from '../TemplateManagement/TemplateManagement';

const InquiryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInquiry, setEditedInquiry] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchInquiryDetails();
    fetchTemplates();
  }, [id]);

  useEffect(() => {
    if (inquiry) {
      setEditedInquiry({ ...inquiry });
    }
  }, [inquiry]);

  const fetchInquiryDetails = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/inquiries/${id}`);
      setInquiry(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      toast.error('Failed to fetch inquiry details');
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await API.get('/reply-templates');
      setTemplates(response.data);
    } catch (err) {
      console.error('Error fetching templates:', err);
      toast.error('Failed to fetch reply templates');
    }
  };

  const handleTemplateSelect = (templateId) => {
    const template = templates.find(t => t._id === templateId);
    if (template) {
      setReplyText(template.content);
      setSelectedTemplate(templateId);
      setShowTemplateModal(false);
    }
  };

  const handleDelete = async () => {
    // Show confirmation toast
    toast.info(
      <div className="delete-confirm-toast">
        <p>Are you sure you want to delete this inquiry?</p>
        <div className="toast-buttons">
          <button onClick={() => confirmDelete()} className="confirm-btn">
            Yes, Delete
          </button>
          <button onClick={() => toast.dismiss()} className="cancel-btn">
            Cancel
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
        className: "confirm-toast"
      }
    );
  };

  const confirmDelete = async () => {
    try {
      const response = await API.delete(`/inquiries/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to delete inquiry');
      }
      
      // Show success message with animation and navigate to view inquiries
      toast.success('Inquiry deleted successfully!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        onClose: () => navigate('/view-inquiries')
      });
    } catch (err) {
      toast.error(err.message || 'Error deleting inquiry', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleReject = async () => {
    setUpdatingStatus(true);
    try {
      const response = await API.patch(`/inquiries/${id}/status`, {
        status: 'Rejected'
      });

      if (!response.ok) {
        throw new Error('Failed to reject inquiry');
      }

      const updatedInquiry = await response.json();
      setInquiry(updatedInquiry);
      toast.success('Inquiry rejected successfully');
    } catch (error) {
      console.error('Error rejecting inquiry:', error);
      toast.error('Failed to reject inquiry');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleForward = async () => {
    setUpdatingStatus(true);
    try {
      const response = await API.post(`/inquiries/${id}/forward`, {
        forwardTo: 'admin@razorkart.com',
        role: 'Admin'
      });

      if (!response.ok) {
        throw new Error('Failed to forward inquiry');
      }

      toast.success('Inquiry forwarded to Admin successfully');
    } catch (error) {
      console.error('Error forwarding inquiry:', error);
      toast.error('Failed to forward inquiry');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    setSendingReply(true);
    try {
      const response = await API.post(`/inquiries/${id}/reply`, {
        message: replyText,
        respondedBy: currentUser ? currentUser.username : 'Customer Service'
      });

      if (!response.ok) {
        throw new Error('Failed to send reply');
      }

      const updatedInquiry = await response.json();
      setInquiry(updatedInquiry);
      setReplyText('');
      toast.success('Reply sent successfully');
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };


  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedInquiry({ ...inquiry });
  };

  const handleSaveEdit = async () => {
    try {
      const response = await API.put(`/inquiries/${id}`, editedInquiry);

      if (!response.ok) {
        throw new Error('Failed to update inquiry');
      }

      const updatedInquiry = await response.json();
      setInquiry(updatedInquiry);
      setIsEditing(false);
      toast.success('Inquiry updated successfully');
    } catch (error) {
      console.error('Error updating inquiry:', error);
      toast.error('Failed to update inquiry');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedInquiry(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) return <div className="loading">Loading inquiry details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!inquiry) return <div className="error">Inquiry not found</div>;

  return (
    <div className="inquiry-details-container">
      <ToastContainer />
      <div className="inquiry-details-header">
        <h2>Inquiry Details</h2>
        <div className="action-buttons">
          <button
            onClick={() => navigate('/view-inquiries')}
            className="back-btn"
          >
            Back to List
          </button>
          {!isEditing && (
            <>
              <button
                onClick={handleEdit}
                className="edit-btn"
              >
                Edit Inquiry
              </button>
              <button
                onClick={handleReject}
                className="reject-btn"
                disabled={updatingStatus || inquiry.status === 'Rejected'}
              >
                Reject Inquiry
              </button>
              <button
                onClick={handleForward}
                className="forward-btn"
                disabled={updatingStatus}
              >
                Forward to Admin
              </button>
            </>
          )}
        </div>
      </div>
      <div className="inquiry-details-content">
        {isEditing ? (
          // Edit form
          <div className="edit-form">
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={editedInquiry.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={editedInquiry.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Contact Number:</label>
              <input
                type="text"
                name="contactNumber"
                value={editedInquiry.contactNumber}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Subject:</label>
              <input
                type="text"
                name="subject"
                value={editedInquiry.subject}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Message:</label>
              <textarea
                name="message"
                value={editedInquiry.message}
                onChange={handleInputChange}
                rows="4"
              />
            </div>
            <div className="edit-actions">
              <button className="save-btn" onClick={handleSaveEdit}>
                Save Changes
              </button>
              <button className="cancel-btn" onClick={handleCancelEdit}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          // Display mode
          <>
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <span className={`status-badge status-${inquiry.status?.toLowerCase() || 'pending'}`}>
                {inquiry.status || 'Pending'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Name:</span>
              <span>{inquiry.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span>{inquiry.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Contact Number:</span>
              <span>{inquiry.contactNumber}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Subject:</span>
              <span>{inquiry.subject}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Message:</span>
              <p className="message-content">{inquiry.message}</p>
            </div>
            <div className="detail-row">
              <span className="detail-label">Submitted On:</span>
              <span>{new Date(inquiry.createdAt).toLocaleString()}</span>
            </div>
          </>
        )}
      </div>

      {/* Reply Section */}
      <div className="reply-section">
        <div className="reply-header">
          <h3>Reply to Inquiry</h3>
        </div>
        <div className="reply-box">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your reply here..."
            rows={4}
            className="reply-input"
          />
          <div className="reply-actions">
            <button className="use-template-btn" onClick={() => setShowTemplateModal(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
                <path d="M14 17H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
              Use Template
            </button>
            <button 
              onClick={handleReply}
              className="send-reply-btn"
              disabled={sendingReply || !replyText.trim()}
            >
              {sendingReply ? 'Sending...' : 'Send Reply'}
            </button>
          </div>
        </div>

        {/* Template Selection Modal */}
        {showTemplateModal && (
          <div className="modal-overlay">
            <div className="template-modal">
              <h3>Select Reply Template</h3>
              <div className="template-list">
                {templates.map((template) => (
                  <div 
                    key={template._id} 
                    className="template-item"
                    onClick={() => handleTemplateSelect(template._id)}
                  >
                    <h4>{template.name}</h4>
                    <span className="template-category">{template.category}</span>
                    <p>{template.content.substring(0, 100)}...</p>
                  </div>
                ))}
              </div>
              <button 
                className="cancel-btn"
                onClick={() => setShowTemplateModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Reply History */}
        {inquiry.replies && inquiry.replies.length > 0 && (
          <div className="reply-history">
            <h4>Communication History</h4>
            {inquiry.replies.map((reply, index) => (
              <div key={index} className="reply-item">
                <div className="reply-header">
                  <span className="reply-author">{reply.respondedBy}</span>
                  <span className="reply-time">
                    {new Date(reply.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="reply-message">{reply.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="button-group">
        <button className="delete-button" onClick={handleDelete}>
          Delete Inquiry
        </button>
      </div>
    </div>
  );
};

export default InquiryDetails;