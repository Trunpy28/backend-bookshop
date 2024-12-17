const axios = require("axios");
const OrderServices = require('../services/OrderService');
const { Convert } = require("easy-currencies");
const { default: mongoose } = require("mongoose");

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
const createOrder = async (req, res) => {
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
    const orderFindResult = await OrderServices.getDetailsOrder(orderId);

    if (orderFindResult.status === "ERR") {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng trong hệ thống" });
    }

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
      case "COMPLETED":
        // Cập nhật trạng thái thanh toán của đơn hàng
        const updateResult = await OrderServices.updateOrder(orderId, {
          isPaid: true,
          paidAt: new Date(),
        });

        if (updateResult.status === "ERR") {
          return res.status(500).json({ message: "Cập nhật trạng thái thanh toán thất bại" });
        }

        return res.status(200).json({
          message: "Thanh toán thành công và đơn hàng đã được cập nhật",
          order: updateResult.data,
        });

      case "PENDING":
        return res.status(202).json({ message: "Thanh toán đang được xử lý, vui lòng chờ" });

      case "DECLINED":
        return res.status(400).json({ message: "Thanh toán bị từ chối, vui lòng thử lại" });

      case "FAILED":
        return res.status(400).json({ message: "Thanh toán thất bại, vui lòng kiểm tra lại thông tin" });

      default:
        return res.status(500).json({ message: `Trạng thái không xác định: ${captureData.status}` });
    }
  } catch (error) {
    console.error(error.response?.data || error.message);
    return res.status(500).json({
      error: "Đã xảy ra lỗi khi xử lý thanh toán PayPal",
      details: error.response?.data || error.message,
    });
  }
};

module.exports = {
  createOrder,
  captureOrder,
};
