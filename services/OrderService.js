import Order from '../models/OrderModel.js';
import Product from '../models/ProductModel.js';
import Payment from '../models/PaymentModel.js';
import mongoose from 'mongoose';

const createOrder = async (orderData) => {
  // Khởi tạo session để đảm bảo transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { user, orderItems, fullName, phone, address, paymentMethod, itemsPrice, discountPrice } = orderData;

    // Tính phí vận chuyển dựa trên tổng giá trị đơn hàng
    let shippingPrice = 0;
    if (itemsPrice > 0 && itemsPrice < 200000) {
      shippingPrice = 25000;
    } else if (itemsPrice >= 200000 && itemsPrice < 500000) {
      shippingPrice = 10000;
    }

    // Tính tổng giá trị cuối cùng
    const totalPrice = itemsPrice + shippingPrice - discountPrice;

    // Kiểm tra số lượng sản phẩm trong kho
    const invalidProducts = [];
    for (const orderItem of orderItems) {
      const product = await Product.findById(orderItem.product).session(session);
      if (!product || product.countInStock < orderItem.quantity) {
        invalidProducts.push(orderItem.name);
      }
    }

    if (invalidProducts.length > 0) {
      await session.abortTransaction();
      session.endSession();
      throw new Error(`Các sản phẩm ${invalidProducts.join(", ")} không đủ số lượng trong kho!`);
    }

    // Cập nhật số lượng sản phẩm
    for (const orderItem of orderItems) {
      await Product.findByIdAndUpdate(
        orderItem.product,
        {
          $inc: {
            countInStock: -orderItem.quantity,
            selled: +orderItem.quantity
          }
        },
        { session }
      );
    }

    const orderObject = {
      user,
      orderItems,
      fullName,
      phone,
      address,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      discountPrice,
      totalPrice,
      status: 'Pending'
    };

    const [createdOrder] = await Order.create([orderObject], { session });

    await Payment.create([{
      order: createdOrder._id,
      amount: totalPrice,
      paymentMethod,
      status: 'Pending'
    }], { session });

    await session.commitTransaction();
    session.endSession();

    return {
      status: "OK",
      data: createdOrder
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new Error(`Không thể tạo đơn hàng: ${error.message}`);
  }
};

const getAllOrdersDetails = async (id) => {
  try {
    const orders = await Order.find({
      user: id,
    }).sort({ createdAt: "desc" });

    if (orders === null) {
      return {
        status: "ERR",
        message: "Lấy thông tin các đơn hàng thất bại!",
      };
    }

    return {
      status: "OK", 
      message: "Lấy thông tin các đơn hàng thành công!",
      data: orders,
    };
  } catch (e) {
    throw new Error(e);
  }
};

const getDetailsOrder = async (id) => {
  try {
    const order = await Order.findById(id);

    if (order === null) {
      return {
        status: "ERR",
        message: "Đơn hàng không tồn tại!",
      };
    }

    return {
      status: "OK",
      message: "Lấy thông tin đơn hàng thành công!",
      data: order,
    };
  } catch (e) {
    throw new Error(e);
  }
};

const cancelOrder = async (id, data) => {
  try {
    let order = await Order.findById(id);
    if (order === null) {
      return {
        status: "ERR",
        message: "Đơn hàng không tồn tại!",
      };
    }

    if (order.isDelivery || order.isPaid) {
      return {
        status: "ERR",
        message: "Không thể hủy được đơn hàng!",
      };
    }

    order = await Order.findByIdAndUpdate(
      id,
      {
        isCancelled: true,
      },
      {
        new: true,
      }
    );

    const promises = data.map(async (orderItem) => {
      const productData = await Product.findOneAndUpdate(
        {
          _id: orderItem.product,
        },
        {
          $inc: {
            countInStock: +orderItem.amount,
            selled: -orderItem.amount,
          },
        },
        {
          new: true,
        }
      );
      return productData;
    });
    const result = await Promise.all(promises);
    
    return {
      status: "OK",
      message: "Hủy đơn hàng thành công!",
      data: order,
    };
  } catch (e) {
    throw new Error(e.message);
  }
};

const getAllOrder = async () => {
  try {
    const allOrder = await Order.find().sort({ createdAt: 'desc'});
    
    return {
      status: 'OK',
      message: 'Lấy thông tin các đơn hàng thành công!',
      data: allOrder
    };
  } catch (e) {
    throw new Error(e);
  }
};

const updateOrder = async (id, data) => {
  try {
    const checkOrder = await Order.findById(id);

    if(checkOrder === null) {
      return {
        status: 'ERR',
        message: 'Đơn hàng không tồn tại!'
      };
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(id, data, {new: true});
    
    return {
      status: 'OK',
      message: 'Cập nhật thành công!',
      data: updatedOrder
    };
  } catch (e) {
    throw new Error(e);
  }
};

const deleteOrder = async (id) => {
  try {
    const checkOrder = await Order.findById(id);

    if(checkOrder === null) {
      return {
        status: 'OK',
        message: 'Đơn hàng không tồn tại!'
      };
    }
    
    await Order.findByIdAndDelete(id);
    
    return {
      status: 'OK',
      message: 'Xóa đơn hàng thành công!'
    };
  } catch (e) {
    throw new Error(e);
  }
};

export default{
  createOrder,
  getAllOrdersDetails,
  getDetailsOrder,
  cancelOrder,
  getAllOrder,
  updateOrder,
  deleteOrder,
};
