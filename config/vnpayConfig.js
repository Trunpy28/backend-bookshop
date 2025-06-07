import { VNPay } from "vnpay";
import dotenv from "dotenv";

dotenv.config();

// Khởi tạo VNPay
const vnpay = new VNPay({
  tmnCode: process.env.VNPAY_TMN_CODE,
  secureSecret: process.env.VNPAY_SECURE_SECRET,
  vnpayHost: process.env.VNPAY_HOST || "https://sandbox.vnpayment.vn",
  testMode: process.env.NODE_ENV !== "production",
});

export default vnpay; 