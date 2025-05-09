const User = require('../models/User');
const Booking = require('../models/Booking');
const News = require('../models/News');
const Registration = require('../models/Registration');

// Get all analytics data
const getAnalytics = async (req, res) => {
  try {
    // Get counts
    const [userCount, newsCount, bookings, venues] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      News.countDocuments(),
      Booking.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('owner', 'firstName lastName')
        .populate('venueId', 'name'),
      Registration.find()
        .sort({ createdAt: -1 })
        .populate('owner', 'firstName lastName')
    ]);

    // Get monthly bookings data
    const monthlyBookings = await Booking.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Convert to array of 12 months
    const bookingsByMonth = Array(12).fill(0);
    monthlyBookings.forEach(item => {
      bookingsByMonth[item._id - 1] = item.count;
    });

    // Get weekly user registrations
    const weeklyUsers = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 28))
          }
        }
      },
      {
        $group: {
          _id: { $week: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get venue status distribution
    const venueStatusCounts = {
      approved: venues.filter(v => v.status === 'approved').length,
      pending: venues.filter(v => v.status === 'pending').length,
      rejected: venues.filter(v => v.status === 'rejected').length
    };

    // Get venue space preference distribution
    const venueSpaceTypes = venues.reduce((acc, venue) => {
      const type = venue.spacePreference || 'Other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Calculate revenue metrics
    const revenueData = await Booking.aggregate([
      {
        $match: {
          status: 'approved',
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
          average: { $avg: "$totalAmount" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate growth
    const previousMonthRevenue = await Booking.aggregate([
      {
        $match: {
          status: 'approved',
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 2)),
            $lt: new Date(new Date().setMonth(new Date().getMonth() - 1))
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" }
        }
      }
    ]);

    const currentRevenue = revenueData[0]?.total || 0;
    const previousRevenue = previousMonthRevenue[0]?.total || 0;
    const growth = previousRevenue ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    // Calculate average venue capacity
    const totalCapacity = venues.reduce((sum, venue) => sum + (venue.capacity || 0), 0);
    const averageCapacity = venues.length > 0 ? Math.round(totalCapacity / venues.length) : 0;

    res.json({
      counts: {
        users: userCount,
        venues: venues.length,
        news: newsCount,
        averageCapacity
      },
      recentBookings: bookings,
      recentVenues: venues.slice(0, 5).map(venue => ({
        _id: venue._id,
        name: venue.name,
        ownerName: venue.ownerName,
        capacity: venue.capacity,
        status: venue.status,
        spacePreference: venue.spacePreference,
        numberOfHalls: venue.numberOfHalls
      })),
      analytics: {
        bookingsByMonth,
        weeklyUsers: weeklyUsers.map(w => w.count),
        venueStatus: venueStatusCounts,
        venueDistribution: Object.entries(venueSpaceTypes).map(([label, value]) => ({
          label,
          value
        })),
        revenue: {
          total: currentRevenue,
          average: revenueData[0]?.average || 0,
          growth: Math.round(growth * 100) / 100,
          conversion: Math.round((revenueData[0]?.count || 0) / (await Booking.countDocuments()) * 100)
        }
      }
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ 
      message: 'Error fetching analytics data',
      error: error.message 
    });
  }
};

module.exports = {
  getAnalytics
}; 