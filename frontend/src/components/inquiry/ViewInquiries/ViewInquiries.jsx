import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ViewInquiries.css';
import API from '../../../api';
import { useAuth } from '../../../context/AuthContext';

const ViewInquiries = () => {
    const [inquiries, setInquiries] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [searchTerm, setSearchTerm] = useState('');
    const [searchBy, setSearchBy] = useState('all');
    const [filteredInquiries, setFilteredInquiries] = useState([]);
    const itemsPerPage = 10;
    const navigate = useNavigate();
    const [forwardingTo, setForwardingTo] = useState(null);
    const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
    const [selectedInquiryId, setSelectedInquiryId] = useState(null);
    const { filterDataByUserRole } = useAuth();

    const forwardOptions = [
        { id: 1, role: 'Admin', email: 'admin@razorkart.com' },
        { id: 2, role: 'Seller Account Manager', email: 'seller.manager@razorkart.com' },
        { id: 3, role: 'Delivery Manager', email: 'delivery.manager@razorkart.com' },
        { id: 4, role: 'Customer Support Lead', email: 'support.lead@razorkart.com' },
        { id: 5, role: 'Technical Team Lead', email: 'tech.lead@razorkart.com' }
    ];

    useEffect(() => {
        const fetchInquiries = async () => {
            try {
                setLoading(true);
                const response = await API.get('/inquiries');
                
                // Apply role-based filtering to the inquiries
                const filteredData = filterDataByUserRole(response.data, 'inquiries');
                
                setInquiries(filteredData);
                setFilteredInquiries(filteredData);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
                toast.error('Failed to fetch inquiries');
            }
        };

        fetchInquiries();
    }, [filterDataByUserRole]);

    useEffect(() => {
        filterInquiries();
    }, [searchTerm, searchBy, inquiries]);

    const filterInquiries = () => {
        if (!searchTerm) {
            setFilteredInquiries(inquiries);
            return;
        }

        const searchTermLower = searchTerm.toLowerCase();
        const filtered = inquiries.filter(inquiry => {
            const date = new Date(inquiry.createdAt).toLocaleDateString();
            
            switch (searchBy) {
                case 'name':
                    return inquiry.name.toLowerCase().includes(searchTermLower);
                case 'subject':
                    return inquiry.subject.toLowerCase().includes(searchTermLower);
                case 'date':
                    return date.includes(searchTerm);
                case 'all':
                default:
                    return (
                        inquiry.name.toLowerCase().includes(searchTermLower) ||
                        inquiry.subject.toLowerCase().includes(searchTermLower) ||
                        date.includes(searchTerm)
                    );
            }
        });
        
        setFilteredInquiries(filtered);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchByChange = (e) => {
        setSearchBy(e.target.value);
    };

    const handleSort = (key) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const getSortIcon = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
        }
        return '';
    };

    const handleStatusChange = async (inquiryId, newStatus) => {
        setUpdatingStatus(inquiryId);
        try {
            const response = await API.patch(`/inquiries/${inquiryId}/status`, {
                status: newStatus
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            const updatedInquiry = await response.json();
            setInquiries(inquiries.map(inq => 
                inq._id === inquiryId ? updatedInquiry : inq
            ));

            toast.success('Status updated successfully!', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (err) {
            toast.error('Failed to update status', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setUpdatingStatus(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return '#FF9300';
            case 'In Progress':
                return '#FF6600';
            case 'Resolved':
                return '#28a745';
            case 'Rejected':
                return '#dc3545';
            default:
                return '#FF9300';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleAddInquiry = () => {
        navigate('/inquiry/new');
    };

    if (loading) return <div className="loading">Loading inquiries...</div>;
    if (error) return <div className="error">{error}</div>;

    const sortedInquiries = [...filteredInquiries].sort((a, b) => {
        if (sortConfig.key === 'createdAt') {
            return sortConfig.direction === 'asc'
                ? new Date(a.createdAt) - new Date(b.createdAt)
                : new Date(b.createdAt) - new Date(a.createdAt);
        }
        if (sortConfig.key === 'status') {
            return sortConfig.direction === 'asc'
                ? a.status.localeCompare(b.status)
                : b.status.localeCompare(a.status);
        }
        return 0;
    });

    const indexOfLastInquiry = currentPage * itemsPerPage;
    const indexOfFirstInquiry = indexOfLastInquiry - itemsPerPage;
    const currentInquiries = sortedInquiries.slice(indexOfFirstInquiry, indexOfLastInquiry);
    const totalPages = Math.ceil(sortedInquiries.length / itemsPerPage);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo(0, 0);
    };

    return (
        <div className="view-inquiries-container">
            <ToastContainer />
            <div className="view-inquiries-header">
                <h2>Inquiries</h2>
            </div>
            
            <div className="search-container">
                <div className="search-wrapper">
                    <input
                        type="text"
                        placeholder="Search inquiries..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                    <select
                        value={searchBy}
                        onChange={handleSearchByChange}
                        className="search-select"
                    >
                        <option value="all">All Fields</option>
                        <option value="name">Name</option>
                        <option value="subject">Subject</option>
                        <option value="date">Date</option>
                    </select>
                </div>
                <div className="search-info">
                    {filteredInquiries.length} {filteredInquiries.length === 1 ? 'inquiry' : 'inquiries'} found
                </div>
            </div>

            <div className="table-container">
                <table className="inquiries-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('createdAt')} className="sortable">
                                Date {getSortIcon('createdAt')}
                            </th>
                            <th>Name</th>
                            <th>Subject</th>
                            <th onClick={() => handleSort('status')} className="sortable">
                                Status {getSortIcon('status')}
                            </th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentInquiries.map((inquiry) => (
                            <tr key={inquiry._id}>
                                <td>{formatDate(inquiry.createdAt)}</td>
                                <td>{inquiry.name}</td>
                                <td>{inquiry.subject}</td>
                                <td>
                                    <div className="status-cell">
                                        <select
                                            value={inquiry.status || 'Pending'}
                                            onChange={(e) => handleStatusChange(inquiry._id, e.target.value)}
                                            className="status-select"
                                            style={{
                                                backgroundColor: getStatusColor(inquiry.status),
                                                opacity: updatingStatus === inquiry._id ? 0.7 : 1
                                            }}
                                            disabled={updatingStatus === inquiry._id}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Resolved">Resolved</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                        {updatingStatus === inquiry._id && (
                                            <div className="status-spinner"></div>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <Link
                                            to={`/inquiry/${inquiry._id}`}
                                            className="more-details-btn"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pagination">
                <button 
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                >
                    &lt; Prev
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => paginate(index + 1)}
                        className={`pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
                    >
                        {index + 1}
                    </button>
                ))}
                
                <button 
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                >
                    Next &gt;
                </button>
            </div>

            <div className="pagination-info">
                Showing {indexOfFirstInquiry + 1} to {Math.min(indexOfLastInquiry, sortedInquiries.length)} of {sortedInquiries.length} inquiries
            </div>
        </div>
    );
};

export default ViewInquiries; 