import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import { fileURLToPath } from 'url';

// Tạo __dirname trong ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.MAIL_ACCOUNT,
    pass: process.env.MAIL_PASSWORD,
  },
});

const sendEmailCreateOrder = async (email, order) => {
  const {
    orderItems,
    shippingAddress: { fullName, address, phone },
    itemsPrice,
    shippingPrice,
    totalPrice,
    createdAt,
    _id: id
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
  const formattedDate = date.toLocaleString('vi-VN',options);

  const sourceHtml = fs.readFileSync(path.resolve(__dirname, "../templateEmails/createOrder.html"), { encoding: "utf8" });
  const template = handlebars.compile(sourceHtml);
  const context = {
    fullName: fullName,
    address: address,
    phone: phone,
    formattedDate: formattedDate,
    orderItems: orderItems.map(item => ({
      name: item.name,
      price: item.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
      amount: item.amount,
      subtotal: (item.price * item.amount).toLocaleString("vi-VN", { style: "currency", currency: "VND" })
    })),
    itemsPrice: itemsPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    shippingPrice: shippingPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    totalPrice: totalPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
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

