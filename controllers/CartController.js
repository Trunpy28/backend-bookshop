import CartService from '../services/CartService.js';

const getCartByUser = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!userId) {
            return res.status(400).json({
                message: 'Không thể xác định người dùng'
            });
        }

        const cart = await CartService.getCartByUser(userId);
        return res.status(200).json({
            status: 'OK',
            message: 'Lấy thông tin giỏ hàng thành công',
            data: cart
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};

const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const productData = req.body;

        if (!userId) {
            return res.status(400).json({
                message: 'Không thể xác định người dùng'
            });
        }

        const updatedCart = await CartService.addToCart(userId, productData);
        return res.status(200).json({
            status: 'OK',
            message: 'Thêm sản phẩm vào giỏ hàng thành công',
            data: updatedCart
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};

const updateCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const updateData = req.body;

        if (!userId) {
            return res.status(400).json({
                message: 'Không thể xác định người dùng'
            });
        }

        const updatedCart = await CartService.updateCartItem(userId, updateData);
        return res.status(200).json({
            status: 'OK',
            message: 'Cập nhật giỏ hàng thành công',
            data: updatedCart
        });
    } catch (error) {
        return res.status(400).json({
            status: 'ERR',
            message: error.message
        });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.productId;

        if (!userId || !productId) {
            return res.status(400).json({
                message: 'Không thể xác định người dùng hoặc sản phẩm'
            });
        }

        const updatedCart = await CartService.removeFromCart(userId, productId);
        return res.status(200).json({
            status: 'OK',
            message: 'Xóa sản phẩm khỏi giỏ hàng thành công',
            data: updatedCart
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};

const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!userId) {
            return res.status(400).json({
                message: 'Không thể xác định người dùng'
            });
        }

        const cart = await CartService.clearCart(userId);
        return res.status(200).json({
            status: 'OK',
            message: 'Xóa giỏ hàng thành công',
            data: cart
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};

export default {
    getCartByUser,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
}; 