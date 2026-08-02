import mongoose from "mongoose";
import dns from "dns";

// Set custom DNS servers to resolve MongoDB Atlas SRV records
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL, { serverSelectionTimeoutMS: 3000 });
        console.log("DataBase Connected (MongoDB Atlas)");
    } catch (error) {
        try {
            await mongoose.connect("mongodb://127.0.0.1:27017/interviewIQ");
            console.log("DataBase Connected ");
        } catch (localErr) {
            console.log(`DataBase Error: ${error.message}`);
        }
    }
}

export default connectDb;