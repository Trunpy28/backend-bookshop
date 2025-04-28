import axios from "axios";
import OrderServices from '../services/OrderService.js';
import { Convert } from "easy-currencies";
import mongoose from "mongoose";
import Payment from "../models/PaymentModel.js";

//Chuyển đổi tỷ giá tiền sang USD

const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;

/**
 * Lấy Access Token từ PayPal
*/
const getPayPalAccessToken = async () => {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64");
  
  const response = await axios.post(
    `${PAYPAL_API_BASE}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  
  return response.data.access_token;
};

/**
 * Tạo PayPal order
*/
const createPayment = async (req, res) => {
  try {
    const { amount } = req.body; // Lấy số tiền từ client (mặc định là VND)
    const accessToken = await getPayPalAccessToken();
    
    const amountCurrency = Number.parseInt(amount);

    // Chuyển đổi từ VND sang USD
    const convertedAmount = await Convert(amountCurrency).from("VND").to("USD");

    const orderData = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            value: convertedAmount.toFixed(2), // Làm tròn 2 chữ số thập phân
            currency_code: "USD", // Luôn gửi yêu cầu với USD
          },
        },
      ],
    };

    const response = await axios.post(
      `${PAYPAL_API_BASE}/v2/checkout/orders`,
      orderData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(201).json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Tạo đơn Paypal thất bại" });
  }
};

/**
 * Xác nhận thanh toán (capture order)
 */
const captureOrder = async (req, res) => {
  try {
    const { orderId } = req.params; // Lấy orderId từ URL
    const { paymentId } = req.body;

    if (!orderId ||!paymentId) {
      return res.status(400).json({ message: "Thiếu orderId hoặc paymentId" });
    }
    
    if(!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "orderId không hợp lệ" });
    }

    const accessToken = await getPayPalAccessToken();

    // Lấy chi tiết đơn hàng từ cơ sở dữ liệu
    let order = await OrderServices.getDetailsOrder(orderId);

    // Thực hiện capture thanh toán PayPal
    const captureResponse = await axios.post(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${paymentId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const captureData = captureResponse.data;

    // Kiểm tra trạng thái thanh toán
    switch (captureData.status) {
      case "COMPLETED": {
        // Cập nhật trạng thái thanh toán của đơn hàng
        await Payment.findByIdAndUpdate(order.payment._id, {
          $set: {
            status: "Completed",
            transactionId: captureData.id,
            paidAt: new Date(),
          }
        });

        order = await OrderServices.getDetailsOrder(orderId);

        return res.status(200).json({
          message: "Thanh toán thành công",
          order
        });
      }

      case "DECLINED": {
        await Payment.findByIdAndUpdate(order.payment._id, {
          $set: {
            status: "Failed",
          }
        });

        order = await OrderServices.getDetailsOrder(orderId);

        return res.status(400).json({ message: "Thanh toán bị từ chối, vui lòng thử lại", order });
      }

      case "FAILED": {
        await Payment.findByIdAndUpdate(order.payment._id, {
          $set: {
            status: "Failed",
          }
        });

        order = await OrderServices.getDetailsOrder(orderId);
        return res.status(400).json({ message: "Thanh toán thất bại, vui lòng kiểm tra lại thông tin", order });
      }

      default: {
        await Payment.findByIdAndUpdate(order.payment._id, {
          $set: {
            status: "Failed",
          }
        });

        order = await OrderServices.getDetailsOrder(orderId);
        return res.status(500).json({ message: `Trạng thái không xác định`, order });
      }
    }

  } catch (error) {
    return res.status(500).json({
      error: "Đã xảy ra lỗi khi xử lý thanh toán PayPal",
      details: error?.message || error.response?.data,
    });
  }
};

export default {
  createPayment,
  captureOrder,
};
