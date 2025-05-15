import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../api';
import './InquiryDashboard.css';
import { useAuth } from '../../../context/AuthContext';
import { generateInquiriesPDF } from '../../../utils/inquiryReport';

const InquiryDashboard = () => {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdateError, setStatusUpdateError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const { filterDataByUserRole } = useAuth();

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await API.get('/inquiries');
      
      // Filter inquiries based on user role
      const filteredData = filterDataByUserRole(response.data, 'inquiries');
      setInquiries(filteredData);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching inquiries:', err);
      setError(err.message || 'Failed to fetch inquiries');
      setLoading(false);
    }
  };

  // Calculate stats from current inquiries (using useMemo for performance)
  const inquiryStats = useMemo(() => ({
    totalInquiries: inquiries.length,
    pendingInquiries: inquiries.filter(inq => inq.status === "Pending").length,
    resolvedInquiries: inquiries.filter(inq => inq.status === "Resolved").length,
    rejectedInquiries: inquiries.filter(inq => inq.status === "Rejected").length
  }), [inquiries]);

  const statusOptions = ["Pending", "In Progress", "Resolved", "Rejected"];

  const handleStatusChange = async (inquiryId, newStatus) => {
    setStatusUpdateError(null);
    setUpdatingStatus(inquiryId);
    
    try {
      console.log('Updating status to:', newStatus);
      
      const response = await API.patch(`/inquiries/${inquiryId}/status`, { 
        status: newStatus 
      });

      // Update the inquiries state with the new status
      setInquiries(prevInquiries =>
        prevInquiries.map(inquiry =>
          inquiry._id === inquiryId
            ? { ...inquiry, status: newStatus }
            : inquiry
        )
      );
      console.log('Status updated successfully');
    } catch (err) {
      console.error('Error updating status:', err);
      setStatusUpdateError(`Failed to update status: ${err.response?.data?.message || err.message}`);
      // Revert the select to the original value by re-fetching inquiries
      fetchInquiries();
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleViewDetails = (inquiryId) => {
    navigate(`/inquiry/${inquiryId}`);
  };

  const handleExportPDF = () => {
    generateInquiriesPDF(inquiries, 'RazorKart Inquiry Management Report');
  };

  if (loading) return <div className="dashboard-loading">Loading dashboard data...</div>;
  if (error) return <div className="dashboard-error">Error: {error}</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Inquiry Manager Dashboard</h1>
        <div className="dashboard-actions">
          <button 
            className="export-pdf-btn"
            onClick={handleExportPDF}
          >
            Export PDF
          </button>
          <button 
            className="view-inquiries-btn"
            onClick={() => navigate('/view-inquiries')}
          >
            View Inquiries
          </button>
        </div>
      </div>
      
      {statusUpdateError && (
        <div className="error-message">
          {statusUpdateError}
        </div>
      )}
      
      <div className="stats-grid">
        <div className="stat-card blue">
          <h3>Total Inquiries</h3>
          <p className="stat-number">{inquiryStats.totalInquiries}</p>
        </div>
        
        <div className="stat-card orange">
          <h3>Pending</h3>
          <p className="stat-number">{inquiryStats.pendingInquiries}</p>
        </div>
        
        <div className="stat-card green">
          <h3>Resolved</h3>
          <p className="stat-number">{inquiryStats.resolvedInquiries}</p>
        </div>
        
        <div className="stat-card red">
          <h3>Rejected</h3>
          <p className="stat-number">{inquiryStats.rejectedInquiries}</p>
        </div>
      </div>

      <div className="recent-inquiries">
        <h2>Recent Inquiries</h2>
        <div className="inquiries-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inquiry) => (
                <tr key={inquiry._id}>
                  <td>{new Date(inquiry.createdAt).toLocaleString()}</td>
                  <td>{inquiry.name}</td>
                  <td>{inquiry.subject}</td>
                  <td>
                    <select
                      value={inquiry.status}
                      onChange={(e) => handleStatusChange(inquiry._id, e.target.value)}
                      className={`status-${inquiry.status.toLowerCase().replace(/\s+/g, '-')}`}
                      disabled={updatingStatus === inquiry._id}
                    >
                      {statusOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button 
                      className="view-details-btn"
                      onClick={() => handleViewDetails(inquiry._id)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InquiryDashboard;
