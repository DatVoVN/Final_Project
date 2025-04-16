const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth");
const app = express();
const candidateRoutes = require("./routes/candidate");
const path = require("path");
const adminRouter = require("./routes/admin");
const developerRouter = require("./routes/developer");
// MIDDLEWARE
app.use(cors());
app.use(cookieParser());
app.use(express.json());
dotenv.config();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// CONNECT MONGODB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}
connectDB();
// ROUTER
// Sử dụng với khi đăng nhập và đăng kí
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/candidates", candidateRoutes);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/developer", developerRouter);
// START SERVER
app.listen(8000, () => {
  console.log("Server running on port 8000");
});
