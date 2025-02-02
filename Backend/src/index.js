import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

// Load environment variables
dotenv.config({
  path: "../.env",
});

// Connect to MongoDB and start the server
connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log(`Server error: ${error.message}`);
      process.exit(1);
    });

    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  });
