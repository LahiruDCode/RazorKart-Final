const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const { getSellerProducts, addSellerProduct, runProductOwnershipMigration } = require('../controllers/sellerController');
const { protect, authorize } = require('../middleware/auth');

// Get seller's products
router.get('/my-products', protect, authorize('seller', 'admin'), getSellerProducts);

// Add new product as a seller
router.post('/products', protect, authorize('seller', 'admin'), addSellerProduct);

// Get seller overview data
router.get('/overview', async (req, res) => {
    try {
        // Get today's sales and orders
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayOrders = await Order.find({
            createdAt: { $gte: today }
        });

        const todaySales = todayOrders.reduce((acc, order) => acc + order.totalAmount, 0);
        
        // Get active products count
        const activeProducts = await Product.countDocuments({ status: 'active' });
        
        // Calculate revenue growth (comparing with previous day)
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const yesterdayOrders = await Order.find({
            createdAt: { 
                $gte: yesterday,
                $lt: today
            }
        });
        
        const yesterdaySales = yesterdayOrders.reduce((acc, order) => acc + order.totalAmount, 0);
        const revenueGrowth = yesterdaySales ? ((todaySales - yesterdaySales) / yesterdaySales) * 100 : 0;

        // Get recent orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name')
            .populate('items.product', 'name');

        // Get product categories distribution
        const products = await Product.find();
        const categories = products.reduce((acc, product) => {
            acc[product.category] = (acc[product.category] || 0) + 1;
            return acc;
        }, {});

        const categoryData = Object.entries(categories).map(([name, value]) => ({
            name,
            value
        }));

        res.json({
            todaySales,
            todayOrderCount: todayOrders.length,
            activeProducts,
            revenueGrowth,
            recentOrders,
            categoryData
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get performance data
router.get('/performance', async (req, res) => {
    try {
        const timeRange = req.query.timeRange || '6months';
        let startDate = new Date();
        
        switch(timeRange) {
            case '7days':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '30days':
                startDate.setDate(startDate.getDate() - 30);
                break;
            case '6months':
                startDate.setMonth(startDate.getMonth() - 6);
                break;
            case '1year':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
        }

        // Get orders within date range
        const orders = await Order.find({
            createdAt: { $gte: startDate }
        }).sort({ createdAt: 1 });

        // Calculate monthly/daily data
        const salesData = [];
        const dateFormat = timeRange === '7days' ? 'day' : 'month';
        
        let currentDate = new Date(startDate);
        const endDate = new Date();
        
        while (currentDate <= endDate) {
            const periodStart = new Date(currentDate);
            let periodEnd;
            
            if (dateFormat === 'day') {
                periodEnd = new Date(currentDate.setDate(currentDate.getDate() + 1));
            } else {
                periodEnd = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
            }
            
            const periodOrders = orders.filter(order => 
                order.createdAt >= periodStart && order.createdAt < periodEnd
            );
            
            const periodSales = periodOrders.reduce((acc, order) => acc + order.totalAmount, 0);
            const customerCount = new Set(periodOrders.map(order => order.user.toString())).size;
            
            salesData.push({
                period: dateFormat === 'day' ? 
                    periodStart.toLocaleDateString('en-US', { weekday: 'short' }) :
                    periodStart.toLocaleDateString('en-US', { month: 'short' }),
                sales: periodSales,
                orders: periodOrders.length,
                customers: customerCount
            });
            
            currentDate = periodEnd;
        }

        // Calculate totals and growth
        const totalSales = orders.reduce((acc, order) => acc + order.totalAmount, 0);
        const totalOrders = orders.length;
        const totalCustomers = new Set(orders.map(order => order.user.toString())).size;
        
        // Calculate average rating
        const products = await Product.find();
        const avgRating = products.reduce((acc, product) => acc + (product.rating || 0), 0) / products.length;

        res.json({
            salesData,
            stats: {
                totalSales,
                totalOrders,
                totalCustomers,
                avgRating: avgRating.toFixed(1)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get authenticated seller's products using userId - protected route requiring authentication and seller role
router.get('/my-products', protect, authorize('seller', 'admin'), getSellerProducts);

// Admin route to run the product ownership migration - protected admin-only endpoint
router.post('/migrate-product-ownership', protect, authorize('admin'), runProductOwnershipMigration);

module.exports = router;
