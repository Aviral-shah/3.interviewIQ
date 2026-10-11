import mongoose from "mongoose";
import dns from "dns";

// Set custom DNS servers to resolve MongoDB Atlas SRV records
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("DataBase Connected (MongoDB)");
    } catch (error) {
            console.log(`DataBase Error: ${error.message}`);
    }
}

export default connectDb;