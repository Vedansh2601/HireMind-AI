const jwt = require("jsonwebtoken");

// RECRUITER LOGIN
// The admin key is checked once, here, on the server.
// It never gets shipped to the browser bundle.
const login = (req, res) => {
    const { adminKey } = req.body;

    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
        return res.status(401).json({
            success: false,
            message: "Invalid admin key"
        });
    }

    const token = jwt.sign(
        { role: "recruiter" },
        process.env.JWT_SECRET,
        { expiresIn: "12h" }
    );

    res.json({
        success: true,
        token
    });
};

module.exports = { login };
