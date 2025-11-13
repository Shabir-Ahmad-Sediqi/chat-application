
import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const mongoUrl = process.env.MONGO_URL;
        if (!mongoUrl) {
            throw new Error("MONGO_URL environment variable is not defined");
        }
        const conn = await mongoose.connect(mongoUrl);
        console.log(`MONGO CONNCECTED ${conn.connection.host}`)
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
        throw err;
    }
}