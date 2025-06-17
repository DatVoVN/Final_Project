const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
const authRouter = require("./routes/auth");
const candidateRoutes = require("./routes/candidate");
const adminRouter = require("./routes/admin");
const developerRouter = require("./routes/developer");
const blogRouter = require("./routes/blog");
const questionRouter = require("./routes/question");
const postRouter = require("./routes/post");
const cvRoutes = require("./routes/cvRoutes");
const suggestRoutes = require("./routes/suggestRoutes");

const app = express();
dotenv.config();
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));

const corsOptions = {
  origin: "*",
  methods: "GET,POST,PUT,DELETE,PATCH",
  credentials: true,
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// CONNECT MONGODB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}
connectDB();

// ROUTER
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/candidates", candidateRoutes);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/developer", developerRouter);
app.use("/api/v1/blog", blogRouter);
app.use("/api/v1/question", questionRouter);
app.use("/api/v1/post", postRouter);

///chatbot
app.use("/api", require("./routes/chatbot"));
/// suggest
app.use("/api/v1/cv", cvRoutes);
app.use("/api", suggestRoutes);
// app.use("/api/stripe", require("./routes/stripeWebhook"));
app.use("/api/payment", require("./routes/manualPaymentCheck"));
app.use("/api/checkout", require("./routes/checkoutAll"));
app.get("/health", (_, res) => res.send("OK"));
app.use("/api/payment", require("./routes/payment"));
// START SERVER
app.listen(8000, () => {
  console.log("Server running on port 8000");
});
