require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

const jobRoutes = require("./routes/jobRoutes");

app.use("/api", jobRoutes);

const candidateRoutes = require("./routes/candidateRoutes");
const applicationRoutes = require("./routes/applicationRoutes");

app.use("/api", candidateRoutes);
app.use("/api", applicationRoutes);

app.get("/", (req, res) => {
    res.send("HireMind Backend Running 🚀");
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});