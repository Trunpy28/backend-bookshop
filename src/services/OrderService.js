const Order = require("../models/OrderProduct");
const Product = require('../models/ProductModel');

//Cần xử lý lỗi
const createOrder = (newOrder) => {
    return new Promise(async (resolve, reject) => {
        const {orderItems, paymentMethod,deliveryMethod,itemsPrice,shippingPrice,totalPrice, fullName, address, phone, user} = newOrder;
        try {
            let invalidQuantity = 0;
            const promise = orderItems.forEach(async (orderItem) => {
                const productData = await Product.findOneAndUpdate(
                    {
                        _id: orderItem.product,
                        countInStock: {
                            $gte: orderItem.amount
                        }
                    },
                    {
                        $inc: {
                            countInStock: -orderItem.amount,
                            selled: +orderItem.amount
                        }
                    },
                    {
                        new: true
                    }
                )
                if(productData) {}
            })
            const createdOrder = await Order.create({
                orderItems,
                shippingAddress: {
                    fullName,
                    address,
                    phone
                },
                deliveryMethod,
                paymentMethod,
                itemsPrice,
                shippingPrice,
                totalPrice,
                user,
            });
            if (createdOrder){
                resolve({
                    status: 'OK',
                    message: 'Tạo đơn hàng thành công!',
                    data: createdOrder
                })
            }
        }catch (e) {
            reject(e);
        }
    })
}

const getAllOrdersDetails = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const orders = await Order.find({
                user: id
            }).sort({ createdAt: 'desc'});

            if(orders === null) {
                resolve({
                    status: 'OK',
                    message: 'Lấy thông tin các đơn hàng thất bại!'
                })
            }
            
            resolve({
                status: 'OK',
                message: 'Lấy thông tin các đơn hàng thành công!',
                data: orders
            })
        }catch (e) {
            reject(e);
        }
    })
}

const getDetailsOrder = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const order = await Order.findById(id);

            if(order === null) {
                resolve({
                    status: 'OK',
                    message: 'Đơn hàng không tồn tại!'
                })
            }
            
            resolve({
                status: 'OK',
                message: 'Lấy thông tin đơn hàng thành công!',
                data: order
            })
        }catch (e) {
            reject(e);
        }
    })
}

const cancelOrder = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const order = await Order.findById(id);

            if(order === null || order.isDelivery || order.isPaid) {
                resolve({
                    status: 'ERR',
                    message: 'Sản phẩm không tồn tại!'
                })
            }

            if(order.isDelivery || order.isPaid) {
                resolve({
                    status: 'ERR',
                    message: 'Không thể hủy được đơn hàng!'
                })
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

module.exports = {
    createOrder,
    getAllOrdersDetails,
    getDetailsOrder,
    cancelOrder,
}