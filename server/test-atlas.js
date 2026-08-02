import connectDb from "./config/connectDb.js";
import User from "./models/user.model.js";

async function testAtlas() {
  console.log("Connecting to MongoDB Atlas...");
  await connectDb();
  const count = await User.countDocuments();
  console.log("ATLAS CONNECTED SUCCESSFULLY! User count in Cloud MongoDB Atlas:", count);
  process.exit(0);
}

testAtlas().catch((err) => {
  console.error("Atlas Connection Error:", err);
  process.exit(1);
});
