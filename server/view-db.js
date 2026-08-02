import dotenv from "dotenv";
dotenv.config();
import connectDb from "./config/connectDb.js";
import User from "./models/user.model.js";
import Interview from "./models/interview.model.js";
import Payment from "./models/payment.model.js";

async function showDb() {
  await connectDb();

  console.log("\n================ 👤 USERS TABLE ================");
  const users = await User.find({}).select("_id name email credits createdAt").lean();
  console.table(users);

  console.log("\n================ 📝 INTERVIEWS TABLE ================");
  const interviews = await Interview.find({}).select("_id userId role experience mode finalScore status createdAt").lean();
  console.table(interviews);

  console.log("\n================ 💳 PAYMENTS TABLE ================");
  const payments = await Payment.find({}).select("_id userId planId amount credits status createdAt").lean();
  console.table(payments);

  process.exit(0);
}

showDb().catch(console.error);
