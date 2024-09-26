const adminMiddleware = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied. Admin rights required.' });
  }
  // Unlock all permissions for admin users
  req.user.permissions = {
    viewUsers: true,
    editUsers: true,
    deleteUsers: true,
    changeUserRoles: true,
    viewProducts: true,
    addProducts: true,
    editProducts: true,
    deleteProducts: true,
    manageCategories: true,
    viewOrders: true,
    updateOrderStatus: true,
    cancelOrders: true,
    refundOrders: true,
    viewEnquiries: true,
    respondToEnquiries: true,
    deleteEnquiries: true,
    editWebsiteContent: true,
    manageBlogPosts: true,
    viewSalesReports: true,
    viewUserAnalytics: true,
    exportData: true,
    managePaymentGateways: true,
    manageShippingOptions: true,
    setSystemPreferences: true,
    viewSecurityLogs: true,
    manageUserPermissions: true
  };
  next();
};

module.exports = adminMiddleware;

