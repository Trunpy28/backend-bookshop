import OrderServices from '../services/OrderService.js';
import CartService from '../services/CartService.js';
import VoucherService from '../services/VoucherService.js';
import UserService from '../services/UserService.js';
import EmailService from '../services/EmailService.js';

const createOrder = async (req, res) => {
    try {
        const { fullName, phone, address, paymentMethod, voucherCode } = req.body;
        const userId = req.user.id;

        if(!paymentMethod || !fullName || !address || !phone) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Cần điền đầy đủ thông tin cho đơn hàng'
            });
        }

        // Lấy thông tin giỏ hàng của người dùng
        const cart = await CartService.getCartByUser(userId);
        
        if(!cart || !cart.cartItems || cart.cartItems.length === 0) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Giỏ hàng trống'
            });
        }

        // Chuyển đổi dữ liệu từ cart sang orderItems
        const orderItems = cart.cartItems.map(item => ({
            productCode: item.product.productCode,
            name: item.product.name,
            images: item.product.images,
            originalPrice: item.product.originalPrice,
            quantity: item.quantity,
            product: item.product._id
        }));

        // Tính tổng giá trị sản phẩm
        const itemsPrice = orderItems.reduce((total, item) => 
            total + (item.originalPrice * item.quantity), 0);

        // Áp dụng voucher nếu có
        let discountPrice = 0;
        if (voucherCode) {
            const voucherResult = await VoucherService.applyVoucher(voucherCode, itemsPrice, userId);
            if (voucherResult.status === 'OK') {
                discountPrice = voucherResult.discountPrice;
            }
        }

        // Truyền dữ liệu cho service xử lý
        const orderData = {
            user: userId,
            orderItems,
            fullName,
            phone,
            address,
            paymentMethod,
            itemsPrice,
            discountPrice,
            voucherCode: voucherCode
        };

        const newOrder = await OrderServices.createOrder(orderData);

        if (newOrder) {
            // Xóa giỏ hàng sau khi đặt hàng thành công
            await CartService.clearCart(userId);
            
            // Lấy email người dùng
            const user = await UserService.findUserById(userId);
            
            // Gửi email xác nhận đơn hàng
            if (user && user.email) {
                EmailService.sendEmailCreateOrder(user.email, newOrder);
            }
        }

        return res.status(200).json({
            status: 'OK',
            order: newOrder
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

const getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        if(!userId){
            return res.status(200).json({
                status: 'ERR',
                message: 'Thiếu userId'
            })
        }
        const respond = await OrderServices.getMyOrders(userId);
        return res.status(200).json(respond);
    } catch (e) {
        return res.status(404).json({
            message: e.message
        })
    }
}

const getDetailsOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.id;

        if(!orderId){
            return res.status(200).json({
                message: 'Thiếu orderId'
            })
        }
        const order = await OrderServices.getDetailsOrder(orderId);
        if((order.user.toString() !== userId) && !req.user.isAdmin){
            return res.status(200).json({
                message: 'Bạn không có quyền truy cập vào đơn hàng này'
            })
        }

        return res.status(200).json({
            data: order
        });
    } catch (e) {
        return res.status(404).json({
            message: e.message
        })
    }
}

const cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.id;
        const cancelReason = req.body.cancelReason;
        if(!orderId){
            return res.status(400).json({
                status: 'ERR',
                message: 'Thiếu orderId'
            })
        }
        
        const message = await OrderServices.cancelOrder(orderId, userId, cancelReason);
        return res.status(200).json({
            status: 'OK',
            message
        });
    } catch (e) {
        return res.status(400).json({
            status: 'ERR',
            message: e.message
        })
    }
}

const deleteOrder = async (req, res) => {
    try {
        const orderId = req.params.id;

        if(!orderId){
            return res.status(200).json({
                status: 'ERR',
                message: 'Thiếu orderId'
            })
        }
        const respond = await OrderServices.deleteOrder(orderId);
        return res.status(200).json(respond);
    } catch (e) {
        return res.status(404).json({
            message: e.message
        })
    }
}

const getPaginatedOrders = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            orderId, 
            fullName, 
            phone, 
            status,
            paymentMethod,
            paymentStatus,
        } = req.query;

        // Chuyển đổi tham số truy vấn
        const options = {
            page,
            limit,
            orderId,
            fullName,
            phone,
            status,
            paymentMethod,
            paymentStatus,
        };

        const result = await OrderServices.getPaginatedOrders(options);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    if (!id) {
      return res.status(404).json({
        status: 'ERR',  
        message: 'Thiếu ID đơn hàng'
      });
    }

    const response = await OrderServices.updateOrderStatus(id, { orderStatus, paymentStatus });
    
    return res.status(200).json(response);
  } catch (e) {
    return res.status(400).json({
      message: e.message
    });
  }
};

export default {
    createOrder,
    getMyOrders,
    getDetailsOrder,
    cancelOrder,
    deleteOrder,
    getPaginatedOrders,
    updateOrderStatus
}