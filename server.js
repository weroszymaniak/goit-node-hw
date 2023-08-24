import { app } from "./app.js";
import mongoose from "mongoose";
// import { config } from "dotenv";

// config();

const MONGODB_URI =
  "mongodb+srv://weronikaszymaniak:qUdZSdGWtJJG3OgX@hw03-mongodb.rxu1mbs.mongodb.net/db-contacts?retryWrites=true&w=majority";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Database connection successful");

    app.listen(3000, () => {
      console.log("Server running. Use our API on port: 3000");
    });
  })

  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    console.error(error.stack);
    process.exit(1);
  });
