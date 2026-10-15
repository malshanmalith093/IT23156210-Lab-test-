import dns from "dns";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import itemRoutes from "./routes/itemRoutes.js";

dotenv.config();

// Local only: use Google DNS so MongoDB Atlas (mongodb+srv) can be found
if (!process.env.VERCEL) {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB once and reuse the connection
let connectionPromise = null;
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGO_URI);
  }
  try {
    await connectionPromise;
  } catch (error) {
    connectionPromise = null;
    throw error;
  }
};

// Make sure the database is connected before handling any request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ message: "Database connection error", error: error.message });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "Item Manager API is running..." });
});

app.use("/api/items", itemRoutes);

const PORT = process.env.PORT || 5000;

// Run a normal server locally; on Vercel the exported app is used instead
if (!process.env.VERCEL) {
  connectDB()
    .then(() => {
      console.log("MongoDB connected");
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Database connection error:", error.message);
      process.exit(1);
    });
}

export default app;