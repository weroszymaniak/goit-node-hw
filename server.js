import { app } from "./app.js";
import mongoose from "mongoose";
import { config } from "dotenv";

config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Database connection successful");

    app.listen(3000, () => {
      console.log("Server running. Use our API on port: 3000");
    });
  })

  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  });
