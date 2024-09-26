const checkPermission = (permission) => {
    return (req, res, next) => {
      if (!req.user || !req.user.permissions[permission]) {
        return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
      }
      next();
    };
  };
  
  module.exports = checkPermission;