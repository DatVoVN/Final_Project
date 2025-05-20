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
const blogRouter = require("./routes/blog");
const questionRouter = require("./routes/question");
const postRouter = require("./routes/post");
const cvRoutes = require("./routes/cvRoutes");
const jobAnalysisRoutes = require("./routes/jobAnalysis");
const matchRoutes = require("./routes/match");
const corsOptions = {
  origin: "*",
  methods: "GET,POST,PUT,DELETE,PATCH",
  credentials: true,
};
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));
// MIDDLEWARE
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
dotenv.config();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// CONNECT MONGODB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDB connected");
    console.log(mongoose.models);
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
app.use("/api/v1/blog", blogRouter);
app.use("/api/v1/question", questionRouter);
app.use("/api/v1/post", postRouter);
app.use("/api/v1/cv", cvRoutes);
app.use("/api/v1/job-analysis", jobAnalysisRoutes);
app.use("/api/v1/match", matchRoutes);
/// THANH TOÁN STRIPE
app.use("/api/stripe", require("./routes/stripeWebhook"));
app.use("/api/checkout", require("./routes/checkout"));
app.post("/health", (_, res) => res.send("OK"));
// START SERVER
app.listen(8000, () => {
  console.log("Server running on port 8000");
});
