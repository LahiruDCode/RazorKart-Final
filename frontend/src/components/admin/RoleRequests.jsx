import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Menu from '../common/Menu';
import { generateRoleRequestsPDF } from '../../utils/roleRequestsPdfGenerator';
import './AdminDashboard.css';

const RoleRequests = () => {
  const [roleRequests, setRoleRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRoleRequests();
  }, []);

  const fetchRoleRequests = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/role-requests');
      // Ensure each request has a status property
      const requestsWithStatus = response.data.map(request => ({
        ...request,
        status: request.status || 'Pending'  // Default to 'Pending' if status is missing
      }));
      setRoleRequests(requestsWithStatus);
      setLoading(false);
    } catch (err) {
      setError('Error fetching role requests');
      setLoading(false);
      console.error('Error:', err);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5001/api/role-requests/${id}`, {
        status: newStatus
      });
      fetchRoleRequests(); // Refresh the list
    } catch (err) {
      setError('Error updating status');
      console.error('Error:', err);
    }
  };

  const filteredRequests = filter === 'all' 
    ? roleRequests 
    : roleRequests.filter(request => request.status && request.status.toLowerCase() === filter.toLowerCase());

  const handleDownloadPDF = () => {
    generateRoleRequestsPDF(filteredRequests, 'RazorKart Role Requests Report');
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-layout">
      <Menu />
      <div className="admin-content">
        <div className="admin-header">
          <h1>Role Change Requests</h1>
          <button 
            className="pdf-export-btn" 
            onClick={handleDownloadPDF}
            title="Download as PDF"
          >
            <i className="fas fa-file-pdf"></i> Export PDF
          </button>
        </div>
        
        <div className="content-section">
          <div className="requests-list">
            <div className="request-filters">
              <select 
                className="filter-select"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <table className="requests-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Contact Number</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      No role requests found
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => (
                    <tr key={request._id}>
                      <td>{request.username || 'N/A'}</td>
                      <td>{request.email || 'N/A'}</td>
                      <td>{request.contactNumber || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${(request.status || 'pending').toLowerCase()}`}>
                          {request.status || 'Pending'}
                        </span>
                      </td>
                      <td>
                        {(!request.status || request.status === 'Pending') && (
                          <div className="action-buttons">
                            <button
                              className="action-button approve small"
                              onClick={() => handleStatusUpdate(request._id, 'Approved')}
                            >
                              Approve
                            </button>
                            <button
                              className="action-button reject small"
                              onClick={() => handleStatusUpdate(request._id, 'Rejected')}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleRequests;
