import Payment from "../models/PaymentModel.js";
import {
  InpOrderAlreadyConfirmed,
  IpnFailChecksum,
  IpnOrderNotFound,
  IpnSuccess,
  IpnUnknownError,
  parseDate,
  VNPay,
} from "vnpay";
import { ProductCode, VnpLocale, dateFormat } from "vnpay";
import mongoose from "mongoose";
import OrderService from "../services/OrderService.js";
import dayjs from "dayjs";
// Khởi tạo VNPay
const vnpay = new VNPay({
  tmnCode: process.env.VNPAY_TMN_CODE,
  secureSecret: process.env.VNPAY_SECURE_SECRET,
  vnpayHost: process.env.VNPAY_HOST || "https://sandbox.vnpayment.vn",
  testMode: process.env.NODE_ENV !== "production",
});

// Tạo URL thanh toán VNPay
const createPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.ip;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin đơn hàng",
      });
    }

    // Kiểm tra đơn hàng tồn tại và lấy thông tin tổng tiền từ database
    const order = await OrderService.getDetailsOrder(orderId);
    if (!order) {
      return res.status(404).json({
        message: "Đơn hàng không tồn tại",
      });
    }

    // Kiểm tra nếu đơn hàng đã bị hủy
    if (order.status === "Cancelled") {
      return res.status(400).json({
        message: `Đơn hàng đã bị hủy`,
      });
    }

    if (order.payment.status !== "Completed") {
      const paymentUrl = vnpay.buildPaymentUrl({
        vnp_Amount: order.totalPrice, // Lấy tổng tiền từ đơn hàng
        vnp_IpAddr: ipAddr, //Địa chỉ IP của khách hàng thực hiện giao dịch
        vnp_TxnRef: orderId, //Mã đơn hàng ở phía khách hàng
        vnp_OrderInfo: `Thanh toan don hang #${orderId}, so tien: ${order.totalPrice} VND`,
        vnp_OrderType: ProductCode.Books_Newspapers_Magazines,
        vnp_ReturnUrl: `${process.env.SERVER_URL}/api/vnpay/callback`,
        vnp_Locale: VnpLocale.VN,
        vnp_CreateDate: dateFormat(new Date()),
        vnp_ExpireDate: dateFormat(new Date(Date.now() + 15 * 60 * 1000)), // 15 phút
      });

      return res.status(200).json({
        paymentUrl,
      });
    }

    return res.status(400).json({
      message: "Không thể tạo thanh toán VNPay",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi khi tạo thanh toán VNPay:" + error.message,
    });
  }
};

// Xử lý callback từ VNPay (Diễn ra trên trình duyệt người dùng)
const handleCallback = async (req, res) => {
  // Khởi tạo session để đảm bảo transaction
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const verify = vnpay.verifyReturnUrl(req.query);
    if (!verify.isVerified) {
      return res.redirect(
        `${process.env.CLIENT_URL}/my-order`
      );
    }

    // Lấy thông tin giao dịch
		const orderId = verify.vnp_TxnRef;
		const transactionNo = verify.vnp_TransactionNo;
		const payDate = verify.vnp_PayDate;

		// Tìm kiếm thanh toán theo orderId
		const payment = await Payment.findOne({ order: orderId }).session(session);
		if (!payment) {
			await session.abortTransaction();
			session.endSession();
			return res.redirect(`${process.env.CLIENT_URL}/my-order`);
		}

    // Kiểm tra xem giao dịch có thành công không
    if (!verify.isSuccess) {
			payment.status = "Failed";
    } else {
      // Cập nhật trạng thái thanh toán
      payment.status = "Completed";
      payment.transactionId = transactionNo;
      payment.paidAt = dayjs(payDate).utc();
    }

    await payment.save({ session });

    await session.commitTransaction();
    session.endSession();
    return res.redirect(`${process.env.CLIENT_URL}/order-success?orderId=${orderId}`);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.redirect(`${process.env.CLIENT_URL}/my-order`);
  }
};

// Xử lý IPN (Diễn ra giữa server VNPay và server backend)
const handleIPN = async (req, res) => {
  // Khởi tạo session để đảm bảo transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
		// Xác thực chữ ký
		const verify = vnpay.verifyIpnCall(req.query);

		if (!verify.isVerified) {
			await session.abortTransaction();
			session.endSession();
			return res.json(IpnFailChecksum);
		}

		// Lấy thông tin giao dịch
		const orderId = verify.vnp_TxnRef;
		const transactionNo = verify.vnp_TransactionNo;
		const payDate = verify.vnp_PayDate;

		// Tìm kiếm thanh toán theo orderId
		const payment = await Payment.findOne({ order: orderId }).session(session);
		if (!payment) {
			await session.abortTransaction();
			session.endSession();
			return res.json(IpnOrderNotFound);
		}

    // Kiểm tra xem giao dịch có thành công không
    if (!verify.isSuccess) {
			payment.status = "Failed";
    } else {
      // Cập nhật trạng thái thanh toán
      payment.status = "Completed";
      payment.transactionId = transactionNo;
      payment.paidAt = dayjs(payDate).utc();
    }

    await payment.save({ session });

    await session.commitTransaction();
    session.endSession();
    return res.json(IpnSuccess);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json(IpnUnknownError);
  }
};

export default {
  createPayment,
  handleCallback,
  handleIPN,
};
