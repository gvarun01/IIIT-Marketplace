import mongoose from "mongoose";
import { DB_NAME} from "../constants.js";
export const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log(`\nMongoDB connected successfully to host: ${connectionInstance.connection.host}\n`);
    } catch (error) {
        console.log(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
}

export default connectDB;