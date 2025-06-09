import Order from '../models/OrderModel.js';
import Product from '../models/ProductModel.js';
import Payment from '../models/PaymentModel.js';
import mongoose from 'mongoose';
import User from '../models/UserModel.js';

const getDetailsOrder = async (orderId) => {
  try {
    const order = await Order.findById(orderId);

    if (order === null) {
      throw new Error('Đơn hàng không tồn tại!');
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
    throw e;
  }
};

const createOrder = async (orderData) => {
  // Khởi tạo session để đảm bảo transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { user, orderItems, fullName, phone, address, paymentMethod, itemsPrice, discountPrice, voucherCode } = orderData;

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
      voucherCode,
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

    const order = await getDetailsOrder(createdOrder._id);
    return order;
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
    throw e;
  }
};

const cancelOrder = async (orderId, userId, cancelReason) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let order = await Order.findById(orderId).session(session);
    let user = await User.findById(userId).session(session);

    if (order === null) {
      throw new Error("Đơn hàng không tồn tại!");
    }

    if (user.role !== 'admin' && user.id !== order.user.toString()) {
      throw new Error("Bạn không có quyền hủy đơn hàng này!");
    }

    if (order.status === 'Shipping' || order.status === 'Delivered') {
      throw new Error("Không thể hủy được đơn hàng!");
    }

    // Cập nhật trạng thái đơn hàng
    await Order.findByIdAndUpdate(
      orderId,
      {
        status: 'Cancelled',
        cancelledAt: new Date(),
        cancelReason: cancelReason
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

const deleteOrder = async (orderId) => {
  try {
    const checkOrder = await Order.findById(orderId);

    if(checkOrder === null) {
      throw new Error('Đơn hàng không tồn tại!');
    }
    
    if(checkOrder.status === 'Cancelled') {
      await Order.findByIdAndDelete(orderId);
      return {
        message: 'Xóa đơn hàng thành công!'
      };
    }  
  } catch (e) {
    throw e;
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
        //Join với bảng payments để lấy thông tin thanh toán
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'order',
          as: 'payment'
        }
      },
      // Phân tách mảng payment thành từng phần tử(Vì chỉ có 1 phần tử nên sẽ là 1 object chứ không phải mảng)
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
    const countResult = await Order.aggregate([...countPipeline, { $count: 'total' }]);   //{ "total": <số document> }
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
    const order = await Order.findById(id).session(session);
    const payment = await Payment.findOne({order: id}).session(session);

    if(order === null) {
      return {
        message: 'Đơn hàng không tồn tại!'
      };
    }

    // Cập nhật trạng thái đơn hàng nếu có
    if (data.orderStatus) {
      if(order.status === 'Cancelled') {
        return {
          message: 'Đơn hàng đã bị hủy. Không thể cập nhật trạng thái!'
        }
      }

      if(data.orderStatus === 'Delivered') {
        order.deliveredAt = new Date();

        if(payment.paymentMethod === 'COD' && payment.status !== 'Completed') {
          payment.status = 'Completed';
          payment.paidAt = new Date();
          await payment.save({
            session
          });
        }
      }
      else {
        order.deliveredAt = null;
      }

      if(data.orderStatus === 'Shipping') {
        order.deliveryAt = new Date();
      }
      else {
        order.deliveryAt = null;
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

        order.cancelledAt = new Date();
      }
      else {
        order.cancelledAt = null;
      }

      order.status = data.orderStatus;
      await order.save({
        new: true,
        session
      });
    }

    // Cập nhật trạng thái thanh toán nếu có
    if (data.paymentStatus) {
      if(data.paymentStatus === 'Completed') {
        payment.status = data.paymentStatus;
        payment.paidAt = new Date();
      } else {
        //Nếu thanh toán online và đã thanh toán thành công thì không được phép cập nhật lại
        if(payment.paymentMethod !== 'COD' && payment.status == 'Completed') {
          throw new Error('Đơn hàng đã thanh toán trực tuyến. Không thể cập nhật trạng thái thanh toán!');
        }

        payment.paidAt = null;
        payment.status = data.paymentStatus;
      }
      
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
