const adminAuth = (req, res, next) => {
    const key = req.headers["x-admin-key"];

    if (!key || key !== process.env.ADMIN_KEY) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized: Invalid admin key"
        });
    }

    next();
};

module.exports = adminAuth;