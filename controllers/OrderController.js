import OrderServices from '../services/OrderService.js';

const createOrder = async (req, res) => {
    try {
        const {deliveryMethod, paymentMethod, totalPrice, fullName, address, phone} = req.body;
        if(!deliveryMethod || !paymentMethod || totalPrice < 0 || !fullName || !address || !phone) {
            return res.status(200).json({
                status: 'ERR',
                message: 'Cần điền đầy đủ thông tin cho đơn hàng'
            })
        }

        const respond = await OrderServices.createOrder(req.body);
        return res.status(200).json(respond);
    } catch (e) {
        return res.status(404).json({
            message: e
        })
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