const multer = require("multer");

// Keep the file in memory (not on disk) — we only need it long enough
// to extract text, then we store the text, not the file itself.
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== "application/pdf") {
            return cb(new Error("Only PDF resumes are supported right now"));
        }
        cb(null, true);
    }
});

module.exports = upload;
