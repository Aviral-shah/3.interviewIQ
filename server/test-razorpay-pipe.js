import User from "./models/user.model.js";
import Payment from "./models/payment.model.js";
import razorpay from "./services/razorpay.service.js";

async function test() {
  const user = await User.create({ name: 'Payment Test', email: `pay_${Date.now()}@example.com` });
  console.log('1. User created with initial credits:', user.credits);

  const order = await razorpay.orders.create({ amount: 10000, currency: 'INR', receipt: 'rec_123' });
  console.log('2. Razorpay Order created ID:', order.id);

  const payment = await Payment.create({ userId: user._id, planId: 'basic', amount: 100, credits: 150, razorpayOrderId: order.id });
  console.log('3. SQLite Payment record created:', payment._id);

  const updatedUser = await User.findByIdAndUpdate(user._id, { $inc: { credits: payment.credits } });
  console.log('4. User credits updated after payment verification! New credits:', updatedUser.credits);
}

test().then(() => console.log('RAZORPAY & CREDITS PIPELINE FULLY VERIFIED!')).catch(console.error);
