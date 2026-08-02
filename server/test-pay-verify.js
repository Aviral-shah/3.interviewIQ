import connectDb from "./config/connectDb.js";
import User from "./models/user.model.js";
import Payment from "./models/payment.model.js";
import razorpay from "./services/razorpay.service.js";

async function test() {
  await connectDb();

  let user = await User.findOne({});
  if (!user) {
    user = await User.create({ name: 'Test User', email: 'testuser@example.com' });
  }
  console.log('User found:', user.email, 'Current credits:', user.credits);

  const order = await razorpay.orders.create({ amount: 10000, currency: 'INR', receipt: `rec_${Date.now()}` });
  console.log('1. Order created in Razorpay:', order.id);

  const payment = await Payment.create({ userId: user._id, planId: 'basic', amount: 100, credits: 150, razorpayOrderId: order.id });
  console.log('2. Payment record created in DB:', payment._id);

  payment.status = 'paid';
  payment.razorpayPaymentId = `pay_test_${Date.now()}`;
  await payment.save();

  const updatedUser = await User.findByIdAndUpdate(user._id, { $inc: { credits: payment.credits } }, { new: true });
  console.log('3. Credits updated in DB successfully! New credits:', updatedUser.credits);

  process.exit(0);
}

test().then(() => console.log('RAZORPAY BACKEND TEST SUCCESSFUL!')).catch(console.error);
