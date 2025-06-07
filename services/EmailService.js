import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import { fileURLToPath } from 'url';
import transporter from '../config/emailConfig.js';
import dotenv from 'dotenv';

// Tạo __dirname trong ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const sendEmailCreateOrder = async (email, order) => {
  const {
    orderItems,
    fullName,
    phone,
    address,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    discountPrice,
    totalPrice,
    status,
    createdAt,
    _id
  } = order;

  const date = new Date(createdAt);

  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  };
  const formattedDate = date.toLocaleString('vi-VN', options);

  const sourceHtml = fs.readFileSync(path.resolve(__dirname, "../templateEmails/createOrder.html"), { encoding: "utf8" });
  const template = handlebars.compile(sourceHtml);
  const context = {
    fullName,
    address,
    phone,
    formattedDate,
    orderItems: orderItems.map(item => ({
      name: item.name,
      price: item.originalPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
      amount: item.quantity,
      subtotal: (item.originalPrice * item.quantity).toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
      image: item.images[0]
    })),
    paymentMethod: getPaymentMethodText(paymentMethod),
    status: getStatusText(status),
    itemsPrice: itemsPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    shippingPrice: shippingPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    discountPrice: discountPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    totalPrice: totalPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    orderId: _id
  };
  const orderHtml = template(context);

  await transporter.sendMail({
    from: process.env.MAIL_ACCOUNT,
    to: email,
    subject: "Bạn đã đặt đơn hàng thành công tại BKshop",
    text: "Đặt hàng thành công!",
    html: orderHtml,
  });
};

// Hàm hỗ trợ chuyển đổi phương thức thanh toán
const getPaymentMethodText = (method) => {
  switch (method) {
    case 'COD':
      return 'Thanh toán khi nhận hàng';
    case 'VNPAY':
      return 'Thanh toán qua VNPAY';
    case 'PAYPAL':
      return 'Thanh toán qua PayPal';
    default:
      return 'Chưa xác định';
  }
};

// Hàm hỗ trợ chuyển đổi trạng thái đơn hàng
const getStatusText = (status) => {
  switch (status) {
    case 'Pending':
      return 'Đang chờ xử lý';
    case 'Shipping':
      return 'Đang giao hàng';
    case 'Delivered':
      return 'Đã giao hàng';
    case 'Cancelled':
      return 'Đã hủy';
    default:
      return 'Đang chờ xử lý';
  }
};

const sendEmailResetPassword = async (email, token) => {
  const resetPasswordLink = `${process.env.CLIENT_URL}/account/recovery/reset-password?email=${encodeURIComponent(email)}&verify_token=${token}`;
  const sourceHtml = fs.readFileSync(path.resolve(__dirname, "../templateEmails/resetPassword.html"), { encoding: "utf8" });

  const template = handlebars.compile(sourceHtml);

  const context = {
    otpCode: token,
    resetLink: resetPasswordLink
  }

  const resetPasswordHtml = template(context);

  const mailOptions = {
    from: process.env.MAIL_ACCOUNT, // sender address
    to: email, // list of receivers
    subject: "Đặt lại mật khẩu", // Subject line
    text: "Đặt lại mật khẩu thành công!", // plain text body
    html: resetPasswordHtml, // html body
  }

  await transporter.sendMail(mailOptions);
}

export default {
  sendEmailCreateOrder,
  sendEmailResetPassword
};

