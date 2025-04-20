import Order from '../models/OrderModel.js';
import Product from '../models/ProductModel.js';
import Payment from '../models/PaymentModel.js';
import mongoose from 'mongoose';
import User from '../models/UserModel.js';

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

    return createdOrder;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new Error(`Không thể tạo đơn hàng: ${error.message}`);
  }
};

const getMyOrders = async (userId) => {
  try {
    const myOrders = await Order.find({
      user: userId,
    }).sort({ createdAt: "desc" });

    return myOrders;
  } catch (e) {
    throw new Error(e);
  }
};

const getDetailsOrder = async (orderId) => {
  try {
    const order = await Order.findById(orderId);

    if (order === null) {
      return {
        status: "ERR",
        message: "Đơn hàng không tồn tại!",
      };
    }

    // Lấy thông tin thanh toán
    const payment = await Payment.findOne({ order: orderId });

    // Kết hợp thông tin đơn hàng và thanh toán
    const orderWithPayment = {
      ...order.toObject(),
      payment: payment ? payment.toObject() : null
    };

    return orderWithPayment;
  } catch (e) {
    throw new Error(e);
  }
};

const cancelOrder = async (orderId, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let order = await Order.findById(orderId).session(session);
    let user = await User.findById(userId).session(session);

    if (order === null) {
      await session.abortTransaction();
      session.endSession();
      throw new Error("Đơn hàng không tồn tại!");
    }

    if (user.role !== 'admin' && user.id !== order.user.toString()) {
      await session.abortTransaction();
      session.endSession();
      throw new Error("Bạn không có quyền hủy đơn hàng này!");
    }

    if (order.status === 'Shipping' || order.status === 'Delivered') {
      await session.abortTransaction();
      session.endSession();
      throw new Error("Không thể hủy được đơn hàng!");
    }

    // Cập nhật trạng thái đơn hàng
    await Order.findByIdAndUpdate(
      orderId,
      {
        status: 'Cancelled',
        cancelledAt: new Date()
      },
      {
        new: true,
        session
      }
    );

    // Cập nhật lại số lượng sản phẩm trong kho
    for (const orderItem of order.orderItems) {
      await Product.findOneAndUpdate(
        {
          _id: orderItem.product,
        },
        {
          $inc: {
            countInStock: +orderItem.quantity,
            selled: -orderItem.quantity,
          },
        },
        {
          new: true,
          session
        }
      );
    }

    await session.commitTransaction();
    session.endSession();
    
    return "Hủy đơn hàng thành công!";
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    throw e;
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
    
    if(checkOrder.status === 'Cancelled') {
      await Order.findByIdAndDelete(id);
      return {
        status: 'OK',
        message: 'Xóa đơn hàng thành công!'
      };
    }

    return {
      status: 'ERR',
      message: 'Không thể xóa đơn hàng đã được giao!'
    };
    
  } catch (e) {
    throw new Error(e);
  }
};

const getPaginatedOrders = async (options) => {
  try {
    let { 
      page = 1, 
      limit = 10, 
      orderId, 
      fullName, 
      phone, 
      status,
      paymentMethod,
      paymentStatus
    } = options;
    
    page = Number.parseInt(page);
    limit = Number.parseInt (limit);

    const query = {};
    
    // Tìm theo mã đơn hàng
    if (orderId) {
      query.$expr = {
        $regexMatch: {
          input: { $toString: "$_id" },
          regex: orderId,
          options: "i"
        }
      };
    }
    
    // Tìm theo tên người đặt
    if (fullName) {
      query.fullName = { $regex: fullName, $options: 'i' };
    }

    // Tìm theo số điện thoại
    if (phone) {
      query.phone = { $regex: phone, $options: 'i' };
    }

    // Lọc theo trạng thái đơn hàng (luôn là mảng)
    if (status && status.length > 0) {
      query.status = { $in: status };
    }

    // Tạo pipeline aggregation để kết hợp với Payment
    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'order',
          as: 'payment'
        }
      },
      { $unwind: { path: '$payment', preserveNullAndEmptyArrays: true } }
    ];

    // Lọc theo phương thức thanh toán (luôn là mảng)
    if (paymentMethod && paymentMethod.length > 0) {
      pipeline.push({
        $match: { 'payment.paymentMethod': { $in: paymentMethod } }
      });
    }

    // Lọc theo trạng thái thanh toán (luôn là mảng)
    if (paymentStatus && paymentStatus.length > 0) {
      pipeline.push({
        $match: { 'payment.status': { $in: paymentStatus } }
      });
    }

    // Không lấy orderItems
    pipeline.push({
      $project: {
          orderItems: 0
        }
    });

    // Đếm tổng số bản ghi trước khi phân trang
    const countPipeline = [...pipeline];
    const countResult = await Order.aggregate([...countPipeline, { $count: 'total' }]);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Thêm sắp xếp và phân trang vào pipeline chính
    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    );

    // Thực hiện truy vấn dữ liệu
    const data = await Order.aggregate(pipeline);

    return {
      data,
      pagination: {
        total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit) || 0
      }
    };
  } catch (error) {
    throw new Error(`Không thể lấy danh sách đơn hàng: ${error.message}`);
  }
};

const updateOrderStatus = async (id, data) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(id);
    const payment = await Payment.findOne({order: id});

    if(order === null) {
      return {
        message: 'Đơn hàng không tồn tại!'
      };
    }

    // Cập nhật trạng thái đơn hàng nếu có
    if (data.orderStatus) {
      if(data.orderStatus === 'Delivered' && payment.paymentMethod === 'COD' && payment.status !== 'Completed') {
        payment.status = 'Completed';
        payment.paymentAt = new Date();
        await payment.save({
          session
        });
      }
      
      if(data.orderStatus === 'Cancelled') {
        for(const orderItem of order.orderItems) {
          await Product.findOneAndUpdate(
            {
              _id: orderItem.product
            },
            {
              $inc: {
                countInStock: +orderItem.quantity,
                selled: -orderItem.quantity
              }
            },
            {
              session
            }
          );
        }
        
        order.status = data.orderStatus;
        await order.save({
          session
        });
      }
    }

    // Cập nhật trạng thái thanh toán nếu có
    if (data.paymentStatus) {
      payment.status = data.paymentStatus;
      await payment.save({
        session
      });
    }

    await session.commitTransaction();
    session.endSession();

    return {
      message: 'Cập nhật trạng thái thành công!'
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export default{
  createOrder,
  getMyOrders,
  getDetailsOrder,
  cancelOrder,
  deleteOrder,
  getPaginatedOrders,
  updateOrderStatus
};
