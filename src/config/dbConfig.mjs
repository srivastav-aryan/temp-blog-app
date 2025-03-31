import mongoose from "mongoose";
import appConfig from "./appConfig.mjs";

const connectDataBase = async () => {
   try {
      mongoose.connection.on("connected", () => {
         console.log("MongoDB database connected successfully");
      });

      mongoose.connection.on("error", (err) => {
         console.log(`Error in MongoDB connection: ${err}`);
      });

      await mongoose.connect(appConfig.dbString);
   } catch (error) {
      console.log("Database connection failed", error);
      process.exit(1);
   }
};

export default connectDataBase;
