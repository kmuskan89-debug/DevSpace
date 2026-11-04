const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "Authentication required"
        });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({
            message: "Invalid authorization format"
        });
    }

    const token = parts[1];
    if (!token) {
        return res.status(401).json({
            message: "Authentication token missing"
        });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedToken;
        req.userId = decodedToken.userId;

        // Verify user still exists in database
        const user = await userModel.findById(decodedToken.userId).select('name email tokenVersion');
        if (!user) {
            return res.status(401).json({
                message: "User account no longer exists"
            });
        }

        // Token invalidation check (secure logout / session revocation)
        if (decodedToken.tokenVersion !== undefined && user.tokenVersion !== undefined) {
            if (decodedToken.tokenVersion < user.tokenVersion) {
                return res.status(401).json({
                    message: "Session has been invalidated. Please log in again."
                });
            }
        }

        req.currentUser = user;
        next();
    }
    catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

module.exports = authMiddleware;
