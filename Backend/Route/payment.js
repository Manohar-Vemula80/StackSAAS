const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");

const Payment = require("../Model/payment");
const User = require("../Model/user");

// 🔥 INIT RAZORPAY
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// 🟢 1. CREATE ORDER
router.post("/create-order", async (req, res) => {
  const { amount, credits } = req.body;

  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const options = {
      amount: amount * 100, // ₹ → paisa
      currency: "INR",
      receipt: "order_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    // 💾 SAVE DB
    await Payment.create({
      user: req.user._id,
      orderId: order.id,
      amount,
      credits,
    });

    res.json({
      orderId: order.id,
      amount,
      key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Order creation failed" });
  }
});


// 🟢 2. VERIFY PAYMENT
router.post("/verify", async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  try {
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      const payment = await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        {
          paymentId: razorpay_payment_id,
          status: "success",
        },
        { returnDocument: "after" }
      );

      if (!payment) {
        return res.status(404).json({ success: false, error: "Payment not found" });
      }

      if (payment.user) {
        await User.findByIdAndUpdate(payment.user, {
          $inc: { credits: payment.credits },
        });
      }

      return res.json({
        success: true,
        credits: payment.credits,
      });
    }

    res.json({ success: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Verification failed" });
  }
});

module.exports = router;