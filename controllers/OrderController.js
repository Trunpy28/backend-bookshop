import OrderServices from '../services/OrderService.js';
import CartService from '../services/CartService.js';
import VoucherService from '../services/VoucherService.js';

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
            const voucherResult = await VoucherService.applyVoucher(voucherCode, itemsPrice);
            if (voucherResult.status === 'OK') {
                discountPrice = voucherResult.discountAmount;
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
            discountPrice
        };

        const orderResponse = await OrderServices.createOrder(orderData);

        if (orderResponse.status === 'OK') {
            await CartService.clearCart(userId);
        }

        return res.status(200).json({
            message: 'Tạo đơn hàng thành công!'
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

const getAllOrdersDetails = async (req, res) => {
    try {
        const userId = req.params.id;

        if(!userId){
            return res.status(200).json({
                status: 'ERR',
                message: 'Thiếu userId'
            })
        }
        const respond = await OrderServices.getAllOrdersDetails(userId);
        return res.status(200).json(respond);
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const getDetailsOrder = async (req, res) => {
    try {
        const orderId = req.params.id;

        if(!orderId){
            return res.status(200).json({
                status: 'ERR',
                message: 'Thiếu orderId'
            })
        }
        const respond = await OrderServices.getDetailsOrder(orderId);
        return res.status(200).json(respond);
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const data = req.body;
        if(!orderId){
            return res.status(200).json({
                status: 'ERR',
                message: 'Thiếu productId'
            })
        }
        const respond = await OrderServices.cancelOrder(orderId, data);
        return res.status(200).json(respond);
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const getAllOrder = async (req, res) => {
    try {
        const respond = await OrderServices.getAllOrder();
        return res.status(200).json(respond);
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const updateOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const data = req.body;
        if(!orderId){
            return res.status(200).json({
                status: 'ERR',
                message: 'Thiếu orderId'
            })
        }

        const respond = await OrderServices.updateOrder(orderId, data);
        return res.status(200).json(respond);
    } catch (e) {
        return res.status(404).json({
            message: e
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
            message: e
        })
    }
}

const deleteMany = async (req, res) => {
    try {
        const ids = req.body.ids;

        if(!ids){
            return res.status(200).json({
                status: 'ERR',
                message: 'Thiếu danh sách ids'
            })
        }
        const respond = await OrderServices.deleteMany(ids);
        return res.status(200).json(respond);
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

export default {
    createOrder,
    getAllOrdersDetails,
    getDetailsOrder,
    cancelOrder,
    getAllOrder,
    updateOrder,
    deleteOrder,
    deleteMany
}