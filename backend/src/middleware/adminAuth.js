const jwt = require("jsonwebtoken");

// Verifies a short-lived recruiter token instead of a raw admin key.
// The frontend never holds the admin key after login.
const adminAuth = (req, res, next) => {
    const header = req.headers["authorization"];
    const token = header && header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: missing token"
        });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.recruiter = payload;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: invalid or expired token"
        });
    }
};

module.exports = adminAuth;
