import Order from '../models/OrderProduct.js';
import Product from '../models/ProductModel.js';
import EmailService from './EmailService.js';

const createOrder = async (newOrder) => {
  const {
    orderItems,
    paymentMethod, 
    deliveryMethod,
    itemsPrice,
    shippingPrice,
    totalPrice,
    fullName,
    address,
    phone,
    user,
    email
  } = newOrder;

  try {
    const invalidProducts = [];
    const promises = orderItems.map(async (orderItem) => {
      const productData = await Product.findOneAndUpdate(
        {
          _id: orderItem.product,
          countInStock: {
            $gte: orderItem.amount,
          },
        },
        {
          $inc: {
            countInStock: -orderItem.amount,
            selled: +orderItem.amount,
          },
        },
        {
          new: true,
        }
      );
      if (productData === null) {
        invalidProducts.push(orderItem.name);
      }
      return orderItem.name;
    });
    const result = await Promise.all(promises);

    if (invalidProducts.length > 0) {
      return {
        status: "ERR",
        message: `Các sản phẩm ${invalidProducts.join(",")} không đủ số lượng trong kho!`,
      };
    }

    const createdOrder = await Order.create({
      orderItems,
      shippingAddress: {
        fullName,
        address,
        phone,
      },
      deliveryMethod,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      user,
    });

    if (createdOrder) {
      await EmailService.sendEmailCreateOrder(email, createdOrder);
      return {
        status: "OK",
        message: "Tạo đơn hàng thành công!",
        data: createdOrder,
      };
    }
  } catch (e) {
    console.log(e.message);
    throw new Error(e.message);
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

const deleteMany = async (ids) => {
  try {
    await Order.deleteMany({_id: {$in: ids}});
    
    return {
      status: 'OK',
      message: 'Xóa các đơn hàng thành công!'
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
  deleteMany,
};
