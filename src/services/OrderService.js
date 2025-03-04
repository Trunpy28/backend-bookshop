const Order = require("../models/OrderProduct");
const Product = require("../models/ProductModel");
const EmailService = require("./EmailService");

const createOrder = (newOrder) => {
  return new Promise(async (resolve, reject) => {
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
      const result = await Promise.all(promises)

      if (invalidProducts.length > 0) {
        resolve({
          status: "ERR",
          message: `Các sản phẩm ${invalidProducts.join(",")} không đủ số lượng trong kho!`,
        });
        return;
      }
      else{
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
          resolve({
            status: "OK",
            message: "Tạo đơn hàng thành công!",
            data: createdOrder,
          });
          await EmailService.sendEmailCreateOrder(email, createdOrder);
        }
      }
    } catch (e) {
      console.log(e.message);
      reject(e.message);
    }
  });
};

const getAllOrdersDetails = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const orders = await Order.find({
        user: id,
      }).sort({ createdAt: "desc" });

      if (orders === null) {
        resolve({
          status: "ERR",
          message: "Lấy thông tin các đơn hàng thất bại!",
        });
        return;
      }

      resolve({
        status: "OK",
        message: "Lấy thông tin các đơn hàng thành công!",
        data: orders,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getDetailsOrder = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const order = await Order.findById(id);

      if (order === null) {
        resolve({
          status: "ERR",
          message: "Đơn hàng không tồn tại!",
        });
        return;
      }

      resolve({
        status: "OK",
        message: "Lấy thông tin đơn hàng thành công!",
        data: order,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const cancelOrder = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let order = await Order.findById(id);
      if (order === null) {
        resolve({
          status: "ERR",
          message: "Đơn hàng không tồn tại!",
        });
      }

      if (order.isDelivery || order.isPaid) {
        resolve({
          status: "ERR",
          message: "Không thể hủy được đơn hàng!",
        });
        return;
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
      
      resolve({
        status: "OK",
        message: "Hủy đơn hàng thành công!",
        data: order,
      });
    } catch (e) {
      reject(e.message);
    }
  });
};

const getAllOrder = () => {
  return new Promise(async (resolve, reject) => {
      try {
          const allOrder = await Order.find().sort({ createdAt: 'desc'});
          
          resolve({
              status: 'OK',
              message: 'Lấy thông tin các đơn hàng thành công!',
              data: allOrder
          })
      }catch (e) {
          reject(e);
      }
  })
}

const updateOrder = (id,data) => {
  return new Promise(async (resolve, reject) => {
      try {
          const checkOrder = await Order.findById(id);

          if(checkOrder === null) {
              resolve({
                  status: 'ERR',
                  message: 'Đơn hàng không tồn tại!'
              })
              return;
          }
          
          const updatedOrder = await Order.findByIdAndUpdate(id,data,{new: true});
          
          resolve({
              status: 'OK',
              message: 'Cập nhật thành công!',
              data: updatedOrder
          })
      }catch (e) {
          reject(e);
      }
  })
}

const deleteOrder = (id) => {
  return new Promise(async (resolve, reject) => {
      try {
          const checkOrder = await Order.findById(id);

          if(checkOrder === null) {
              resolve({
                  status: 'OK',
                  message: 'Đơn hàng không tồn tại!'
              })
              return;
          }
          
          await Order.findByIdAndDelete(id);
          
          resolve({
              status: 'OK',
              message: 'Xóa đơn hàng thành công!'
          })
      }catch (e) {
          reject(e);
      }
  })
}

const deleteMany = (ids) => {
  return new Promise(async (resolve, reject) => {
      try {
          await Order.deleteMany({_id:{$in:ids}});
          
          resolve({
              status: 'OK',
              message: 'Xóa các đơn hàng thành công!'
          })
      }catch (e) {
          reject(e);
      }
  })
}

module.exports = {
  createOrder,
  getAllOrdersDetails,
  getDetailsOrder,
  cancelOrder,
  getAllOrder,
  updateOrder,
  deleteOrder,
  deleteMany,
};
