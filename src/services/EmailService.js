const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
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

  let orderHtml = `
  <!DOCTYPE html>
  <html lang="vi">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
      <div style="width: 80%; margin: 0 auto; background-color: #fff; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <h1 style="color: #333;">BKshop</h1>
          <p style="color: #555;">Cảm ơn quý khách đã đặt hàng tại BKshop. Dưới đây là chi tiết đơn hàng của quý khách:</p>
          <h2 style="color: #333;">Thông tin khách hàng</h2>
          <p style="color: #555;"><strong>Họ tên:</strong> ${fullName}</p>
          <p style="color: #555;"><strong>Địa chỉ:</strong> ${address}</p>
          <p style="color: #555;"><strong>Số điện thoại:</strong> ${phone}</p>
          <p style="color: #555;"><strong>Thời gian đặt hàng:</strong> ${formattedDate}</p>
          <h2 style="color: #333;">Chi tiết đơn hàng #${id}</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                  <tr>
                      <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Tên sản phẩm</th>
                      <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Giá</th>
                      <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Số lượng</th>
                      <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Tạm tính</th>
                  </tr>
              </thead>
              <tbody>`;

  orderItems.forEach((item) => {
    orderHtml += `
                  <tr>
                      <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${
                        item.name
                      }</td>
                      <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${item.price.toLocaleString(
                        "vi-VN",
                        { style: "currency", currency: "VND" }
                      )}</td>
                      <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${
                        item.amount
                      }</td>
                      <td style="border: 1px solid #ddd; padding: 8px; text-align: left;color: #CD3238;">${(
                        item.price * item.amount
                      ).toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}</td>
                  </tr>`;
  });

  orderHtml += `
              </tbody>
          </table>
          <p style="color: #555;">Tạm tính: ${itemsPrice.toLocaleString(
            "vi-VN",
            {
              style: "currency",
              currency: "VND",
            }
          )}</p>
          <p style="color: #555;">Phí vận chuyển: ${shippingPrice.toLocaleString(
            "vi-VN",
            { style: "currency", currency: "VND" }
          )}</p>
          <p style="color: #CD3238; font-weight: bold;">Tổng cộng: ${totalPrice.toLocaleString(
            "vi-VN",
            { style: "currency", currency: "VND" }
          )}</p>
          <p style="color: #555;">Cảm ơn quý khách đã mua hàng! Nếu có bất kỳ câu hỏi nào, xin vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi.</p>
      </div>
  </body>
  </html>`;

  await transporter.sendMail({
    from: process.env.MAIL_ACCOUNT, // sender address
    to: email, // list of receivers
    subject: "Bạn đã đặt đơn hàng thành công tại BKshop", // Subject line
    text: "Đặt hàng thành công!", // plain text body
    html: orderHtml, // html body
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
    text: "Đặt hàng thành công!", // plain text body
    html: resetPasswordHtml, // html body
  }

  await transporter.sendMail(mailOptions);
}

module.exports = {
  sendEmailCreateOrder,
  sendEmailResetPassword
};
