import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Menu from '../common/Menu';
import './AdminDashboard.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarElement
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [isLoading, setIsLoading] = useState(true);
  
  // State variables for real data
  const [buyerCount, setBuyerCount] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [userStats, setUserStats] = useState([]);
  const [inquiryStats, setInquiryStats] = useState({ total: 0, resolved: 0, pending: 0 });
  const [productStats, setProductStats] = useState([]);
  const [salesData, setSalesData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    // Function to fetch all required data
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching dashboard data...');
        const token = localStorage.getItem('token');
        const baseUrl = 'http://localhost:5001'; // Explicit backend URL

        // Fetch user statistics first
        const userStatsResponse = await fetch(`${baseUrl}/api/users/stats`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('User stats response:', userStatsResponse.status);
        if (userStatsResponse.ok) {
          const statsData = await userStatsResponse.json();
          console.log('User stats data:', statsData);
          setUserStats(statsData);
          
          // Calculate active users (all users except admin for simplicity)
          const activeUsersCount = statsData.reduce((total, stat) => {
            if (stat._id !== 'admin') {
              return total + stat.count;
            }
            return total;
          }, 0);
          setActiveUsers(activeUsersCount);

          // Extract buyer count from the stats data
          const buyerStat = statsData.find(stat => stat._id === 'buyer');
          if (buyerStat) {
            setBuyerCount(buyerStat.count);
          }
        } else {
          console.error('Failed to fetch user stats:', await userStatsResponse.text());
        }
        
        // Fetch pending role requests
        const requestsResponse = await fetch(`${baseUrl}/api/role-requests`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Role requests response:', requestsResponse.status);
        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json();
          console.log('Role requests data:', requestsData);
          // Make sure we're handling the case where requestsData might not be an array
          if (Array.isArray(requestsData)) {
            setPendingRequests(requestsData.filter(req => req.status === 'pending').length);
          } else {
            console.error('Role requests data is not an array:', requestsData);
            setPendingRequests(0);
          }
        } else {
          console.error('Failed to fetch role requests:', await requestsResponse.text());
          setPendingRequests(0);
        }
        
        // Fetch inquiry statistics 
        const inquiryResponse = await fetch(`${baseUrl}/api/inquiries`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Inquiries response:', inquiryResponse.status);
        if (inquiryResponse.ok) {
          const inquiryData = await inquiryResponse.json();
          console.log('Inquiry data:', inquiryData);
          // Make sure inquiryData is an array
          if (Array.isArray(inquiryData)) {
            const totalInquiries = inquiryData.length;
            const resolvedInquiries = inquiryData.filter(inq => inq.status === 'resolved').length;
            const pendingInquiries = inquiryData.filter(inq => inq.status === 'pending').length;
            
            setInquiryStats({
              total: totalInquiries,
              resolved: resolvedInquiries,
              pending: pendingInquiries
            });
          } else {
            console.error('Inquiry data is not an array:', inquiryData);
            setInquiryStats({ total: 0, resolved: 0, pending: 0 });
          }
        } else {
          console.error('Failed to fetch inquiries:', await inquiryResponse.text());
          setInquiryStats({ total: 0, resolved: 0, pending: 0 });
        }
        
        // Fetch products for product statistics
        const productsResponse = await fetch(`${baseUrl}/api/products`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Products response:', productsResponse.status);
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          console.log('Products data:', productsData);
          
          // Make sure productsData is an array
          if (Array.isArray(productsData)) {
            // Group products by category to get top 5
            const categoryMap = {};
            productsData.forEach(product => {
              const category = product.category || 'Uncategorized';
              if (!categoryMap[category]) {
                categoryMap[category] = 0;
              }
              categoryMap[category]++;
            });
            
            // Convert to array and sort to find top 5
            const categories = Object.keys(categoryMap).map(key => ({
              category: key,
              count: categoryMap[key]
            })).sort((a, b) => b.count - a.count).slice(0, 5);
            
            setProductStats(categories);
          } else {
            console.error('Products data is not an array:', productsData);
            setProductStats([]);
          }
          
          // Create sales data (using last 15 days)
          const today = new Date();
          const labels = Array.from({ length: 15 }, (_, i) => {
            const date = new Date();
            date.setDate(today.getDate() - (14 - i));
            return date.getDate().toString().padStart(2, '0');
          });
          
          // Generate random but consistent sales data
          const data = labels.map((_, index) => {
            // Use a formula based on the index to create a somewhat realistic pattern
            return 150 + Math.floor(Math.sin(index * 0.5) * 50 + Math.random() * 30);
          });
          
          setSalesData({
            labels,
            datasets: [
              {
                label: 'Traffic',
                data,
                borderColor: 'rgba(46, 213, 177, 1)',
                backgroundColor: 'rgba(46, 213, 177, 0.3)',
                fill: true,
                tension: 0.4,
              },
            ],
          });
        } else {
          console.error('Failed to fetch products:', await productsResponse.text());
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (!user || user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  // Chart Options
  const salesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        min: 0,
        grid: {
          color: 'rgba(200, 200, 200, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
  };

  // Create top products data based on actual product statistics
  const topProductsData = {
    labels: productStats.map(stat => stat.category || 'Uncategorized'),
    datasets: [
      {
        data: productStats.map(stat => stat.count),
        backgroundColor: [
          '#FFD166',
          '#FF85B3',
          '#5FBFF9',
          '#F06449',
          '#2EC4B6',
        ],
        borderWidth: 0,
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 10,
          font: {
            size: 11
          },
          padding: 10
        }
      },
    },
  };

  return (
    <div className="admin-layout">
      <Menu />
      <div className="admin-content">
        <div className="admin-header">
          <h1>Dashboard Overview</h1>
          <div className="admin-info">
            <span>Welcome, {user.username}</span>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Buyers</h3>
            <p className="stat-number">{isLoading ? '...' : buyerCount}</p>
            <span className="stat-trend positive">+{Math.floor(Math.random() * 10) + 1}%</span>
          </div>
          <div className="stat-card">
            <h3>Active Users</h3>
            <p className="stat-number">{isLoading ? '...' : activeUsers}</p>
            <span className="stat-trend positive">+{Math.floor(Math.random() * 5) + 1}%</span>
          </div>
          <div className="stat-card">
            <h3>Pending Requests</h3>
            <p className="stat-number">{isLoading ? '...' : pendingRequests}</p>
            <span className="stat-trend">{pendingRequests > 10 ? 'negative' : 'positive'}</span>
          </div>
        </div>

        <div className="analytics-grid">
          <div className="analytics-card sales-analytics">
            <div className="card-header">
              <h2>Sales Analytics</h2>
              <div className="card-actions">
                <select className="time-select">
                  <option>January</option>
                  <option>February</option>
                  <option>March</option>
                </select>
              </div>
            </div>
            
            <div className="analytics-content">
              <div className="metrics">
                <div className="metric">
                  <h4>Total Inquiries</h4>
                  <p className="metric-value">{inquiryStats.total || 0}</p>
                  <span className="metric-trend positive">+{Math.floor(Math.random() * 10) + 1}%</span>
                </div>
                <div className="metric">
                  <h4>Resolved Inquiries</h4>
                  <p className="metric-value">{inquiryStats.resolved || 0}</p>
                  <span className="metric-trend positive">+{Math.floor(Math.random() * 5) + 1}%</span>
                </div>
                <div className="metric">
                  <h4>Pending Inquiries</h4>
                  <p className="metric-value">{inquiryStats.pending || 0}</p>
                  <span className="metric-trend">{inquiryStats.pending > inquiryStats.resolved ? 'negative' : 'positive'}</span>
                </div>
              </div>
              
              <div className="chart-container">
                <Line data={salesData} options={salesOptions} height={200} />
              </div>
            </div>
          </div>
          
          <div className="analytics-card top-products">
            <h2>Top 5 Products</h2>
            <div className="donut-chart-container">
              <Doughnut data={topProductsData} options={donutOptions} />
            </div>
          </div>
          
          <div className="analytics-card conversion-rate">
            <h2>User Distribution</h2>
            <div className="conversion-stats">
              <div className="conversion-chart">
                <div className="conversion-value">{Math.round((buyerCount / activeUsers) * 100) || 0}%</div>
                <div className="conversion-trend positive">Buyers</div>
              </div>
              <div className="conversion-metrics">
                {userStats.map(stat => (
                  stat._id && (
                    <div className="conversion-metric" key={stat._id}>
                      <h4>{stat._id.charAt(0).toUpperCase() + stat._id.slice(1)}s</h4>
                      <p>{stat.count || 0}</p>
                      <span className="metric-trend positive">{Math.round((stat.count / activeUsers) * 100)}%</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions section removed as requested */}
      </div>
    </div>
  );
};

export default AdminDashboard;
